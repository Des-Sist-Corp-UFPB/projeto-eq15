// src/controllers/users/usersController.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { type CreateUserInput } from '../../schemas/users/usersSchema'
import { createUserService } from '../../services/users/usersService'
import { createInspectionLog } from '../../repositories/inspectionLog/inspectionLogRepository'
import { httpResponse, httpError } from '../../utils/http'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { logger } from '../../lib/logger'

export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
): Promise<void> {
  const ctx = { requestId: request.id, context: 'createUserController' }

  // ── IN ────────────────────────────────────────────────────────────────────────
  logger.info('IN - createUserController')

  await createInspectionLog({
    ...ctx,
    level: 'INFO',
    direction: 'IN',
    payload: {
      method: request.method,
      url: request.url,
      body: { name: request.body.name, email: request.body.email },
    },
  }).catch((err) => logger.error({ err }, `${ctx.context}: inspectionLog IN write failed`))

  try {
    const user = await createUserService(request.body)

    // ── OUT ────────────────────────────────────────────────────────────────────
    await createInspectionLog({
      ...ctx,
      level: 'INFO',
      direction: 'OUT',
      payload: { statusCode: 201, userId: user.id, role: user.role },
    }).catch((err) => logger.error({ err }, `${ctx.context}: inspectionLog OUT write failed`))

    httpResponse({ reply, statusCode: 201, data: user, context: ctx.context })
  } catch (error) {
    // ── ERROR ──────────────────────────────────────────────────────────────────
    await createInspectionLog({
      ...ctx,
      level: 'ERROR',
      direction: 'ERROR',
      payload: {
        error: error instanceof Error ? error.message : String(error),
        code: error instanceof GeneralErrorResponse ? error.code : 'INTERNAL_ERROR',
      },
    }).catch((err) => logger.error({ err }, `${ctx.context}: inspectionLog ERROR write failed`))

    httpError({ error, context: ctx.context })
  }
}
