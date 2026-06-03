// src/services/resources/materials/pdf/materialPdfPendingListService.ts
import type { PendingMaterialDTO } from '../../../../@types/resources/materials/pdf'
import { findPendingMaterials } from '../../../../repositories/resources/materials/pdf/materialPdfPendingListRepository'
import { logger } from '../../../../lib/logger'

export async function materialPdfPendingListService(): Promise<PendingMaterialDTO[]> {
  logger.info('IN - materialPdfPendingListService')
  const materials = await findPendingMaterials()
  logger.info('OUT - materialPdfPendingListService')
  return materials
}
