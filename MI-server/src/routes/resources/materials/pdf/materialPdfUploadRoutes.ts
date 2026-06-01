// src/routes/resources/materials/pdf/materialPdfUploadRoutes.ts
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../../../middlewares/authenticate'
import { requireUploadPermission } from '../../../../middlewares/requireUploadPermission'
import { materialPdfUploadController } from '../../../../controllers/resources/materials/pdf/materialPdfUploadController'
import { materialPdfListController } from '../../../../controllers/resources/materials/pdf/materialPdfListController'
import { env } from '../../../../env'

export async function materialPdfUploadRoutes(app: FastifyInstance): Promise<void> {
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
      bodyLimit: env.MI_MAX_FILE_SIZE_MB * 1024 * 1024,
      preHandler: [authenticate, requireUploadPermission],
    },
    materialPdfUploadController,
  )

  /**
   * RF-MI02 — GET /mis/me
   * Lista todos os materiais instrucionais enviados pelo usuário autenticado.
   *
   * Permissão: qualquer usuário autenticado.
   * Resposta : 200 + UploadedMIDTO[]  (ordem: mais recente primeiro)
   */
  app.get(
    '/me',
    { preHandler: [authenticate] },
    materialPdfListController,
  )
}
