import 'dotenv/config'
import { Worker, type Job } from 'bullmq'
import OpenAI from 'openai'
import { randomUUID } from 'node:crypto'
import { minioClient, MINIO_BUCKET } from '../lib/minio'
import { getQdrant, QDRANT_COLLECTION, ensureQdrantCollection } from '../lib/qdrant'
import { prisma } from '../database/prisma'
import { env } from '../env'
import { logger } from '../lib/logger'
import type { VectorizePdfJob } from '../lib/queue'

// pdf-parse v2 usa exports CJS internos; require evita conflito de tipos
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>

const CHUNK_SIZE    = 1000
const CHUNK_OVERLAP = 200
const EMBED_BATCH   = 100

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

// ── Helpers ────────────────────────────────────────────────────────────────────

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push(text.slice(start, end).trim())
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks.filter(c => c.length > 50)
}

async function downloadPdfBuffer(storageKey: string): Promise<Buffer> {
  const stream = await minioClient.getObject(MINIO_BUCKET, storageKey)
  const parts: Buffer[] = []
  for await (const chunk of stream) {
    parts.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(parts)
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// ── Job processor ──────────────────────────────────────────────────────────────

async function processJob(job: Job<VectorizePdfJob>): Promise<void> {
  const { materialId, storageKey } = job.data
  logger.info({ materialId }, 'IN - vectorizeWorker')

  await prisma.materialInstrucional.update({
    where: { id: materialId },
    data:  { vectorStatus: 'PROCESSING' },
  })

  try {
    const pdfBuffer = await downloadPdfBuffer(storageKey)
    const { text }  = await pdfParse(pdfBuffer)

    if (!text?.trim()) {
      logger.warn({ materialId }, 'PDF has no extractable text — skipping')
      await prisma.materialInstrucional.update({
        where: { id: materialId },
        data:  { vectorStatus: 'FAILED' },
      })
      return
    }

    const chunks = chunkText(text)
    logger.info({ materialId, chunkCount: chunks.length }, 'PDF chunked')

    const qdrant = await getQdrant()

    // Remove pontos antigos para esse material (re-upload)
    await qdrant.delete(QDRANT_COLLECTION, {
      filter: { must: [{ key: 'materialId', match: { value: materialId } }] },
    })

    // Embeddings e upsert em batches
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch      = chunks.slice(i, i + EMBED_BATCH)
      const embeddings = await embedBatch(batch)

      await qdrant.upsert(QDRANT_COLLECTION, {
        wait:   true,
        points: batch.map((chunkText, j) => ({
          id:      randomUUID(),
          vector:  embeddings[j],
          payload: { materialId, chunkIndex: i + j, text: chunkText },
        })),
      })
    }

    await prisma.materialInstrucional.update({
      where: { id: materialId },
      data:  { vectorStatus: 'DONE' },
    })

    logger.info({ materialId, chunkCount: chunks.length }, 'OUT - vectorizeWorker')
  } catch (err) {
    await prisma.materialInstrucional.update({
      where: { id: materialId },
      data:  { vectorStatus: 'FAILED' },
    }).catch(() => {})
    throw err
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await ensureQdrantCollection()
  logger.info('Qdrant collection ready')

  const worker = new Worker<VectorizePdfJob>('vectorize-pdf', processJob, {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
    concurrency: 2,
  })

  worker.on('completed', job =>
    logger.info({ jobId: job.id, materialId: job.data.materialId }, 'vectorize job completed'),
  )
  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, materialId: job?.data.materialId, err }, 'vectorize job failed'),
  )

  logger.info('Vectorize worker running...')
}

main().catch(err => {
  logger.error(err, 'Worker startup failed')
  process.exit(1)
})
