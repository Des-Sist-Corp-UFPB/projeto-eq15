// src/controllers/users/setUserAsProfessorController.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { setUserAsProfessorService } from '../../services/users/setUserAsProfessorService'
import { authorizeByRole } from '../../utils/authorizeByRole'
import { ADMIN } from '../../constants/roles'
import { httpResponse, httpError } from '../../utils/http'
import { StatusCode } from '../../utils/statusCode'
import { logger } from '../../lib/logger'

const ctx = 'setUserAsProfessorController'

/**
 * PATCH /users/:id/set-professor
 *
 * Promove um usuário para o cargo de PROFESSOR.
 * Exclusivo para ADMIN. Não é permitido alterar o cargo de outro ADMIN.
 *
 * Middlewares: [authenticate]
 */
export async function setUserAsProfessorController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  logger.info(`IN - ${ctx}`)

  try {
    authorizeByRole(request.user.role, [ADMIN])

    const { id } = request.params as { id: string }

    const user = await setUserAsProfessorService({
      targetUserId:     id,
      requestingAdminId: request.user.sub,
    })

    httpResponse({ reply, statusCode: StatusCode.OK, data: user, context: ctx })
  } catch (error) {
    httpError({ error, context: ctx })
  }
}
