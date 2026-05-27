// src/utils/http.ts
// Utilitários HTTP para controllers.
// Encapsulam o log de console (pino), o registro de InspectionLog e o envio da resposta.

import type { FastifyReply } from 'fastify'
import { logger } from '../lib/logger'
import { createInspectionLog } from '../repositories/inspectionLog/inspectionLogRepository'
import { GeneralErrorResponse } from '../errors/GeneralErrorResponse'

// ── Contexto compartilhado entre as duas funções ───────────────────────────────

interface HttpContext {
  /** ID único da requisição — gerado automaticamente pelo Fastify */
  requestId: string
  /** Nome da função/handler para rastreio nos logs */
  context: string
}

// ── httpResponse ───────────────────────────────────────────────────────────────

interface HttpResponseOptions<T> extends HttpContext {
  reply: FastifyReply
  statusCode: number
  data: T
  /** Campos adicionais gravados no InspectionLog OUT (nunca incluir dados sensíveis) */
  logPayload?: Record<string, unknown>
}

/**
 * Finaliza a requisição com sucesso:
 * 1. Loga OUT no console
 * 2. Grava InspectionLog direction=OUT no banco
 * 3. Envia a resposta HTTP
 */
export async function httpResponse<T>({
  reply,
  statusCode,
  data,
  requestId,
  context,
  logPayload,
}: HttpResponseOptions<T>): Promise<void> {
  logger.info(`OUT - ${context}`)

  await createInspectionLog({
    requestId,
    level: 'INFO',
    context,
    direction: 'OUT',
    payload: { statusCode, ...logPayload },
  }).catch((err) => logger.error({ err }, `${context}: inspectionLog OUT write failed`))

  reply.status(statusCode).send(data)
}

// ── httpError ─────────────────────────────────────────────────────────────────

interface HttpErrorOptions extends HttpContext {
  error: unknown
}

/**
 * Trata um erro na requisição:
 * 1. Loga ERROR no console
 * 2. Grava InspectionLog direction=ERROR no banco
 * 3. Re-lança o erro para o errorHandler global do Fastify
 */
export async function httpError({
  error,
  requestId,
  context,
}: HttpErrorOptions): Promise<never> {
  logger.error({ error }, `ERROR - ${context}`)

  await createInspectionLog({
    requestId,
    level: 'ERROR',
    context,
    direction: 'ERROR',
    payload: {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof GeneralErrorResponse ? error.code : 'INTERNAL_ERROR',
    },
  }).catch((err) => logger.error({ err }, `${context}: inspectionLog ERROR write failed`))

  throw error
}
