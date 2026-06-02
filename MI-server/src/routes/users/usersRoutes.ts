// src/routes/users/usersRoutes.ts
import type { FastifyInstance } from 'fastify'
import { CreateUserSchema } from '../../schemas/users/usersSchema'
import { createUserController } from '../../controllers/users/usersController'
import { setUserAsProfessorController } from '../../controllers/users/setUserAsProfessorController'
import { authenticate } from '../../middlewares/authenticate'

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

  /**
   * PATCH /users/:id/set-professor
   * Promove um usuário para PROFESSOR. Exclusivo para ADMIN.
   */
  app.patch(
    '/:id/set-professor',
    { preHandler: [authenticate] },
    setUserAsProfessorController,
  )
}
