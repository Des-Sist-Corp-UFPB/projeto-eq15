// src/controllers/users/usersController.ts
import type { FastifyReply, FastifyRequest } from 'fastify'
import { type CreateUserInput } from '../../schemas/users/usersSchema'
import { createUserService } from '../../services/users/usersService'
import { createInspectionLog } from '../../repositories/inspectionLog/inspectionLogRepository'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { logger } from '../../lib/logger'

export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
): Promise<void> {
  const requestId = request.id

  // ── IN ────────────────────────────────────────────────────────────────────────
  logger.info('IN - createUserController')

  // Registra os dados que chegaram na requisição (sem senha)
  await createInspectionLog({
    requestId,
    level: 'INFO',
    context: 'createUserController',
    direction: 'IN',
    payload: {
      method: request.method,
      url: request.url,
      body: { name: request.body.name, email: request.body.email },
    },
  }).catch((err) => logger.error({ err }, 'inspectionLog IN: write failed'))

  try {
    const user = await createUserService(request.body)

    // ── OUT ───────────────────────────────────────────────────────────────────
    logger.info('OUT - createUserController')

    await createInspectionLog({
      requestId,
      level: 'INFO',
      context: 'createUserController',
      direction: 'OUT',
      payload: { statusCode: 201, userId: user.id, role: user.role },
    }).catch((err) => logger.error({ err }, 'inspectionLog OUT: write failed'))

    reply.status(201).send(user)
  } catch (error) {
    // ── ERROR — captura, registra e repassa ao errorHandler global ────────────
    logger.error({ error }, 'ERROR - createUserController')

    await createInspectionLog({
      requestId,
      level: 'ERROR',
      context: 'createUserController',
      direction: 'ERROR',
      payload: {
        error: error instanceof Error ? error.message : String(error),
        code: error instanceof GeneralErrorResponse ? error.code : 'INTERNAL_ERROR',
      },
    }).catch((err) => logger.error({ err }, 'inspectionLog ERROR: write failed'))

    throw error
  }
}
