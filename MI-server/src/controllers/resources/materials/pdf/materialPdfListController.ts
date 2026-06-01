// src/controllers/resources/materials/pdf/materialPdfListController.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { materialPdfListService } from '../../../../services/resources/materials/pdf/materialPdfListService'
import { httpResponse, httpError } from '../../../../utils/http'
import { StatusCode } from '../../../../utils/statusCode'
import { logger } from '../../../../lib/logger'

const ctx = 'materialPdfListController'

/**
 * GET /mis/me
 *
 * Retorna todos os materiais instrucionais enviados pelo usuário autenticado,
 * ordenados do mais recente para o mais antigo.
 *
 * Middlewares aplicados na rota:
 *   preHandler: [authenticate]
 */
export async function materialPdfListController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  logger.info(`IN - ${ctx}`)

  try {
    const materials = await materialPdfListService(request.user.sub)
    httpResponse({ reply, statusCode: StatusCode.OK, data: materials, context: ctx })
  } catch (error) {
    httpError({ error, context: ctx })
  }
}
