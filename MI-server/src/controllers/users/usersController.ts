// src/controllers/users/usersController.ts
import type { FastifyRequest } from 'fastify'
import { type CreateUserInput } from '../../schemas/users/usersSchema'
import { createUserService } from '../../services/users/usersService'
import { createInspectionLog } from '../../repositories/inspectionLog/inspectionLogRepository'
import { httpResponse, httpError } from '../../utils/http'
import { logger } from '../../lib/logger'

export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: Parameters<typeof httpResponse>[0]['reply'],
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

    await httpResponse({
      reply,
      statusCode: 201,
      data: user,
      ...ctx,
      logPayload: { userId: user.id, role: user.role },
    })
  } catch (error) {
    await httpError({ error, ...ctx })
  }
}
