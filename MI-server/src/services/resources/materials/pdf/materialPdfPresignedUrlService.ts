// src/services/resources/materials/pdf/materialPdfPresignedUrlService.ts
import type { MaterialPresignedUrlDTO, UploadedMIDTO } from '../../../../@types/resources/materials/pdf'
import { findMaterialById } from '../../../../repositories/resources/materials/pdf/materialPdfViewRepository'
import { minioPublicClient, MINIO_BUCKET } from '../../../../lib/minio'
import { validateRequest } from '../../../../utils/validateRequest'
import { materialPdfPresignedUrlSchema } from '../../../../schemas/resources/materials/pdf/materialPdfPresignedUrlSchema'
import { ERRORS, buildError } from '../../../../lib/errors/errors'
import { GeneralErrorResponse } from '../../../../errors/GeneralErrorResponse'
import { StatusCode } from '../../../../utils/statusCode'
import { logger } from '../../../../lib/logger'

const PRESIGNED_URL_EXPIRY_SECONDS = 3600 // 1 hora

// ── Validação interna ─────────────────────────────────────────────────────────

function validateMaterialExists(
  material: UploadedMIDTO | null,
): asserts material is UploadedMIDTO {
  if (!material) {
    throw new GeneralErrorResponse(StatusCode.NOT_FOUND, buildError(ERRORS.ERRORS_RESOURCES.MI_NOT_FOUND))
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Gera uma URL pré-assinada (1h) para leitura direta do PDF no MinIO.
 *
 * O service é genérico: não impõe nenhuma política de acesso por si só.
 * O chamador deve passar `accessPolicy` para aplicar a regra específica do fluxo.
 *
 * @example — dono do material
 *   materialPdfPresignedUrlService({ materialId }, (m) => {
 *     if (m.uploadedById !== userId) throw new GeneralErrorResponse(403, ...)
 *   })
 *
 * @example — material público (APPROVED)
 *   materialPdfPresignedUrlService({ materialId }, (m) => {
 *     if (m.status !== 'APPROVED') throw new GeneralErrorResponse(403, ...)
 *   })
 *
 * @example — sem restrição (admin)
 *   materialPdfPresignedUrlService({ materialId })
 */
export async function materialPdfPresignedUrlService(
  input: unknown,
  accessPolicy?: (material: UploadedMIDTO) => void,
): Promise<MaterialPresignedUrlDTO> {
  logger.info('IN - materialPdfPresignedUrlService')

  const { materialId } = validateRequest(input, materialPdfPresignedUrlSchema)

  const material = await findMaterialById(materialId)

  validateMaterialExists(material)

  accessPolicy?.(material)

  const url = await minioPublicClient.presignedGetObject(
    MINIO_BUCKET,
    material.storageKey,
    PRESIGNED_URL_EXPIRY_SECONDS,
  )

  logger.info('OUT - materialPdfPresignedUrlService')

  return { url, expiresInSeconds: PRESIGNED_URL_EXPIRY_SECONDS }
}
