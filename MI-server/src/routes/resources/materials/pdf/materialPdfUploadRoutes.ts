// src/routes/resources/materials/pdf/materialPdfUploadRoutes.ts
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../../../middlewares/authenticate'
import { requireUploadPermission } from '../../../../middlewares/requireUploadPermission'
import { materialPdfUploadController } from '../../../../controllers/resources/materials/pdf/materialPdfUploadController'
import { materialPdfListByUserController } from '../../../../controllers/resources/materials/pdf/materialPdfListByUserController'
import { materialPdfPresignedUrlController } from '../../../../controllers/resources/materials/pdf/materialPdfPresignedUrlController'
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
   * Permissão: INSTITUTIONALIZED, PROFESSOR, ADMIN.
   * Resposta : 200 + UploadedMIDTO[]  (ordem: mais recente primeiro)
   */
  app.get(
    '/me',
    { preHandler: [authenticate] },
    materialPdfListByUserController,
  )

  /**
   * RF-MI03 — GET /mis/:id/presigned-url
   * Gera URL temporária (1h) para visualização direta do PDF no MinIO.
   *
   * Permissão: INSTITUTIONALIZED, PROFESSOR, ADMIN — apenas dono do material.
   * Resposta : 200 + MaterialPresignedUrlDTO
   */
  app.get(
    '/:id/presigned-url',
    { preHandler: [authenticate] },
    materialPdfPresignedUrlController,
  )
}
