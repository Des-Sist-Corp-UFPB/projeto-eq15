// src/routes/mis/misRoutes.ts
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { requireUploadPermission } from '../../middlewares/requireUploadPermission'
import { uploadMIController } from '../../controllers/mis/misController'
import { env } from '../../env'

export async function misRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    module: 'mis',
    timestamp: new Date().toISOString(),
  }))

  /**
   * RF-MI01 — POST /mis
   * Upload de um Material Instrucional (PDF).
   *
   * Permissão: apenas usuários com canUpload = true.
   * Body   : multipart/form-data { file: File (PDF), title?: string }
   * Resposta: 201 + UploadedMIDTO
   */
  app.post(
    '/',
    {
      // Aumenta o bodyLimit para esta rota para acomodar arquivos grandes
      bodyLimit: env.MI_MAX_FILE_SIZE_MB * 1024 * 1024,
      preHandler: [authenticate, requireUploadPermission],
    },
    uploadMIController,
  )
}
