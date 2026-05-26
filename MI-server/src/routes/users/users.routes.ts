// src/routes/users/users.routes.ts
import type { FastifyInstance } from 'fastify'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    module: 'users',
    timestamp: new Date().toISOString(),
  }))
}
