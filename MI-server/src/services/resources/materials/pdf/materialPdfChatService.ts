// src/services/resources/materials/pdf/materialPdfChatService.ts
import { validateRequest } from '../../../../utils/validateRequest'
import { materialPdfChatSchema } from '../../../../schemas/resources/materials/pdf/materialPdfChatSchema'
import { findMaterialForChat } from '../../../../repositories/resources/materials/pdf/materialPdfChatRepository'
import { getQdrant, QDRANT_COLLECTION } from '../../../../lib/qdrant'
import { openai } from '../../../../lib/openai'
import { ERRORS, buildError } from '../../../../lib/errors/errors'
import { GeneralErrorResponse } from '../../../../errors/GeneralErrorResponse'
import { StatusCode } from '../../../../utils/statusCode'
import { logger } from '../../../../lib/logger'
import type { IMaterialChatResponse } from '../../../../@types/resources/materials/pdf'

const TOP_K         = 5
const EMBED_MODEL   = 'text-embedding-3-small'
const CHAT_MODEL    = 'gpt-4o-mini'
const MAX_TOKENS    = 1024

const SYSTEM_PROMPT = `Você é um assistente pedagógico especializado em materiais instrucionais acadêmicos.
Responda SEMPRE em português brasileiro com base EXCLUSIVAMENTE no contexto fornecido abaixo.
Se a resposta não estiver no contexto, informe educadamente que não encontrou essa informação no documento.
Seja claro, objetivo e didático.`

export async function materialPdfChatService(input: unknown): Promise<IMaterialChatResponse> {
  logger.info('IN - materialPdfChatService')

  const { materialId, question, userId } = validateRequest(input, materialPdfChatSchema)
  logger.info({ materialId, userId }, 'materialPdfChatService: input validated')

  // 1. Verificar material
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

  // 2. Embedding da pergunta
  const embeddingResponse = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: question,
  })
  const queryVector = embeddingResponse.data[0].embedding
  logger.info({ materialId }, 'materialPdfChatService: question embedded')

  // 3. Busca semântica no Qdrant — apenas chunks deste material
  const qdrant  = await getQdrant()
  const results = await qdrant.search(QDRANT_COLLECTION, {
    vector:       queryVector,
    limit:        TOP_K,
    filter:       { must: [{ key: 'materialId', match: { value: materialId } }] },
    with_payload: true,
  })

  const chunks = results
    .filter(r => r.score > 0.3)
    .map(r => String(r.payload?.text ?? ''))
    .filter(t => t.length > 0)

  logger.info({ materialId, chunksFound: chunks.length }, 'materialPdfChatService: qdrant search done')

  if (chunks.length === 0) {
    return {
      answer:     'Não encontrei trechos relevantes no documento para responder a sua pergunta. Tente reformular ou faça uma pergunta diferente.',
      chunksUsed: 0,
    }
  }

  // 4. Montar contexto e chamar o modelo
  const context = chunks.map((c, i) => `[Trecho ${i + 1}]\n${c}`).join('\n\n')

  const completion = await openai.chat.completions.create({
    model:      CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: 'system',    content: SYSTEM_PROMPT },
      { role: 'user',      content: `Contexto do documento:\n\n${context}\n\n---\n\nPergunta: ${question}` },
    ],
  })

  const answer = completion.choices[0]?.message?.content?.trim() ?? ''
  logger.info({ materialId, chunksUsed: chunks.length }, 'OUT - materialPdfChatService')

  return { answer, chunksUsed: chunks.length }
}
