// src/controllers/resources/materials/pdf/materialPdfChatController.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { materialPdfChatService } from '../../../../services/resources/materials/pdf/materialPdfChatService'
import { httpResponse, httpError } from '../../../../utils/http'
import { StatusCode } from '../../../../utils/statusCode'
import { logger } from '../../../../lib/logger'
import type { MaterialPdfChatRequest } from '../../../../schemas/resources/materials/pdf/materialPdfChatSchema'

const ctx = 'materialPdfChatController'

/**
 * POST /mis/:id/chat
 * Envia uma pergunta sobre o conteúdo de um MI aprovado e vetorizado.
 * Resposta gerada via RAG: Qdrant (busca semântica) + OpenAI (geração).
 * Permissão: qualquer usuário autenticado.
 * Middlewares: [authenticate]
 */
export async function materialPdfChatController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  logger.info(`IN - ${ctx}`)

  try {
    const { id }      = request.params as { id: string }
    const { question } = request.body as MaterialPdfChatRequest

    const result = await materialPdfChatService({
      materialId: id,
      question,
      userId: request.user.sub,
    })

    httpResponse({ reply, statusCode: StatusCode.OK, data: result, context: ctx })
  } catch (error) {
    httpError({ error, context: ctx })
  }
}
