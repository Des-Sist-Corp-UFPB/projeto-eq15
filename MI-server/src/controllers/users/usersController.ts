// src/controllers/users/usersController.ts
import type { FastifyReply, FastifyRequest } from 'fastify'
import { type CreateUserInput } from '../../schemas/users/usersSchema'
import { createUserService } from '../../services/users/usersService'

export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
): Promise<void> {
  const log = request.log

  // ── Início da requisição ──────────────────────────────────────────────────────
  log.info(
    { method: request.method, url: request.url, body: { name: request.body.name, email: request.body.email } },
    'createUserController — requisição recebida',
  )

  try {
    const user = await createUserService(request.body, log)

    // ── Fim da requisição com sucesso ─────────────────────────────────────────
    log.info(
      { statusCode: 201, userId: user.id, role: user.role },
      'createUserController — resposta enviada',
    )

    reply.status(201).send(user)
  } catch (error) {
    // ── Erro durante a requisição — loga e repassa ao errorHandler global ─────
    log.error(
      { method: request.method, url: request.url, error },
      'createUserController — erro durante a requisição',
    )

    throw error
  }
}
