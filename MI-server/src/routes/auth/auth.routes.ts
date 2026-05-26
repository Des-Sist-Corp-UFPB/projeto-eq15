// src/routes/auth/auth.routes.ts
import type { FastifyInstance } from 'fastify'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    module: 'auth',
    timestamp: new Date().toISOString(),
  }))
}
