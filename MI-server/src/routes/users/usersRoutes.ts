// src/routes/users/usersRoutes.ts
import type { FastifyInstance } from 'fastify'
import { CreateUserSchema } from '../../schemas/users/usersSchema'
import { createUserController } from '../../controllers/users/usersController'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    module: 'users',
    timestamp: new Date().toISOString(),
  }))

  // RF01/RF02 — POST /users — Cadastro de usuário
  app.post(
    '/',
    {
      schema: {
        body: CreateUserSchema,
      },
    },
    createUserController,
  )
}
