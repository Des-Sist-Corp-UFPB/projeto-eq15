// src/routes/organizations/organizationsRoutes.ts
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { createOrganizationController } from '../../controllers/organizations/createOrganizationController'

export async function organizationsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status:    'ok',
    module:    'organizations',
    timestamp: new Date().toISOString(),
  }))

  /**
   * POST /organizations
   * Cria uma nova organização. Exclusivo para PROFESSOR e ADMIN.
   */
  app.post(
    '/',
    { preHandler: [authenticate] },
    createOrganizationController,
  )
}
