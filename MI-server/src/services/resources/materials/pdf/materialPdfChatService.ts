// src/services/resources/materials/pdf/materialPdfChatService.ts
import { validateRequest } from '../../../../utils/validateRequest'
import { materialPdfChatSchema } from '../../../../schemas/resources/materials/pdf/materialPdfChatSchema'
import { findMaterialForChat } from '../../../../repositories/resources/materials/pdf/materialPdfChatRepository'
import { createInspectionLog } from '../../../../repositories/inspectionLog/inspectionLogRepository'
import { getQdrant, QDRANT_COLLECTION } from '../../../../lib/qdrant'
import { openai } from '../../../../lib/openai'
import { ERRORS, buildError } from '../../../../lib/errors/errors'
import { GeneralErrorResponse } from '../../../../errors/GeneralErrorResponse'
import { StatusCode } from '../../../../utils/statusCode'
import { logger } from '../../../../lib/logger'
import type { IMaterialChatResponse, ITokenUsage } from '../../../../@types/resources/materials/pdf'
import type { MaterialForChat } from '../../../../repositories/resources/materials/pdf/materialPdfChatRepository'

// ── Configurações ─────────────────────────────────────────────────────────────

const TOP_K       = 5
const MIN_SCORE   = 0.3
const EMBED_MODEL = 'text-embedding-3-small'
const CHAT_MODEL  = 'gpt-4o-mini'
const MAX_TOKENS  = 1024
const SVC_CTX     = 'materialPdfChatService'

const SYSTEM_PROMPT = `Você é um assistente pedagógico especializado em materiais instrucionais acadêmicos.
Responda SEMPRE em português brasileiro com base EXCLUSIVAMENTE no contexto fornecido abaixo.
Se a resposta não estiver no contexto, informe educadamente que não encontrou essa informação no documento.
Seja claro, objetivo e didático.`

// ── Tipo auxiliar para resultado de busca no Qdrant ───────────────────────────

interface QdrantScoredPoint {
  score:    number
  payload?: Record<string, unknown>
}

interface EmbedResult {
  vector:          number[]
  embeddingTokens: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchAndValidateMaterial(materialId: string): Promise<MaterialForChat> {
  const material = await findMaterialForChat(materialId)

  if (!material) {
    throw new GeneralErrorResponse(StatusCode.NOT_FOUND, buildError(ERRORS.ERRORS_RESOURCES.MI_NOT_FOUND))
  }
  if (material.status !== 'APPROVED') {
    throw new GeneralErrorResponse(StatusCode.BAD_REQUEST, buildError(ERRORS.ERRORS_RESOURCES.MI_NOT_APPROVED))
  }
  if (material.vectorStatus !== 'DONE') {
    throw new GeneralErrorResponse(StatusCode.BAD_REQUEST, buildError(ERRORS.ERRORS_RESOURCES.MI_NOT_VECTORIZED))
  }

  return material
}

async function embedQuestion(question: string): Promise<EmbedResult> {
  const response = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: question,
  })
  return {
    vector:          response.data[0].embedding,
    embeddingTokens: response.usage.prompt_tokens,
  }
}

async function searchRelevantChunks(
  materialId: string,
  queryVector: number[],
): Promise<QdrantScoredPoint[]> {
  const qdrant = await getQdrant()
  return qdrant.search(QDRANT_COLLECTION, {
    vector:       queryVector,
    limit:        TOP_K,
    filter:       { must: [{ key: 'materialId', match: { value: materialId } }] },
    with_payload: true,
  })
}

function extractValidChunks(results: QdrantScoredPoint[]): string[] {
  return results
    .filter(r => r.score > MIN_SCORE)
    .map(r => String(r.payload?.text ?? ''))
    .filter(t => t.length > 0)
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function materialPdfChatService(input: unknown): Promise<IMaterialChatResponse> {
  logger.info('IN - materialPdfChatService')

  const { materialId, question, userId } = validateRequest(input, materialPdfChatSchema)

  // ── 1. Valida material ────────────────────────────────────────────────────
  const material = await fetchAndValidateMaterial(materialId)

  await createInspectionLog({
    correlationId: userId,
    context:       SVC_CTX,
    direction:     'SERVER_TO_CLIENT',
    tag:           'AI_RAG',
    payload: [
      {
        title:   'Material validado para chat',
        content: {
          materialId,
          status:       material.status,
          vectorStatus: material.vectorStatus,
        },
      },
    ],
  }).catch((err) => logger.error({ err }, `${SVC_CTX}: inspectionLog material-validated write failed`))

  // ── 2. Embedding da pergunta ──────────────────────────────────────────────
  const { vector: queryVector, embeddingTokens } = await embedQuestion(question)

  await createInspectionLog({
    correlationId: userId,
    context:       SVC_CTX,
    direction:     'SERVER_TO_CLIENT',
    tag:           'AI_RAG',
    payload: [
      {
        title:   'OpenAI - Embedding da pergunta',
        content: {
          model:           EMBED_MODEL,
          embeddingTokens,
          questionLength:  question.length,
        },
      },
    ],
  }).catch((err) => logger.error({ err }, `${SVC_CTX}: inspectionLog embedding write failed`))

  // ── 3. Busca semântica no Qdrant ──────────────────────────────────────────
  const results = await searchRelevantChunks(materialId, queryVector)
  const chunks  = extractValidChunks(results)

  await createInspectionLog({
    correlationId: userId,
    context:       SVC_CTX,
    direction:     'SERVER_TO_CLIENT',
    tag:           'AI_RAG',
    payload: [
      {
        title:   'Qdrant - Busca semântica',
        content: {
          materialId,
          topK:              TOP_K,
          minScore:          MIN_SCORE,
          totalFound:        results.length,
          chunksAfterFilter: chunks.length,
          scores:            results.map(r => r.score),
        },
      },
    ],
  }).catch((err) => logger.error({ err }, `${SVC_CTX}: inspectionLog qdrant-search write failed`))

  // Sem chunks relevantes — retorno antecipado sem chamar o modelo
  if (chunks.length === 0) {
    await createInspectionLog({
      correlationId: userId,
      context:       SVC_CTX,
      direction:     'SERVER_TO_CLIENT',
      payload: [
        {
          title:   'Resposta - Sem trechos relevantes',
          content: { materialId, embeddingTokens, promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        },
      ],
    }).catch((err) => logger.error({ err }, `${SVC_CTX}: inspectionLog no-chunks write failed`))

    logger.info({ materialId }, 'OUT - materialPdfChatService: no relevant chunks found')
    return {
      answer:     'Não encontrei trechos relevantes no documento para responder a sua pergunta. Tente reformular ou faça uma pergunta diferente.',
      chunksUsed: 0,
      tokenUsage: { embeddingTokens, promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    }
  }

  // ── 4. Geração da resposta com o modelo de chat ───────────────────────────
  const context    = chunks.map((c, i) => `[Trecho ${i + 1}]\n${c}`).join('\n\n')
  const completion = await openai.chat.completions.create({
    model:      CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: `Contexto do documento:\n\n${context}\n\n---\n\nPergunta: ${question}` },
    ],
  })

  const answer: string = completion.choices[0]?.message?.content?.trim() ?? ''

  const tokenUsage: ITokenUsage = {
    embeddingTokens,
    promptTokens:     completion.usage?.prompt_tokens     ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens:      completion.usage?.total_tokens      ?? 0,
  }

  await createInspectionLog({
    correlationId: userId,
    context:       SVC_CTX,
    direction:     'SERVER_TO_CLIENT',
    tag:           'AI_RAG',
    payload: [
      {
        title:   'OpenAI - Geração de resposta',
        content: {
          model:            CHAT_MODEL,
          chunksUsed:       chunks.length,
          embeddingTokens:  tokenUsage.embeddingTokens,
          promptTokens:     tokenUsage.promptTokens,
          completionTokens: tokenUsage.completionTokens,
          totalTokens:      tokenUsage.totalTokens,
        },
      },
    ],
  }).catch((err) => logger.error({ err }, `${SVC_CTX}: inspectionLog completion write failed`))

  logger.info({ materialId, chunksUsed: chunks.length, tokenUsage }, 'OUT - materialPdfChatService')

  return { answer, chunksUsed: chunks.length, tokenUsage }
}
