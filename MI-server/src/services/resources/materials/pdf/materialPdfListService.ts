// src/services/resources/materials/pdf/materialPdfListService.ts
import type { UploadedMIDTO } from '../../../../@types/resources/materials/pdf'
import { findMaterialsByUserId } from '../../../../repositories/resources/materials/pdf/materialPdfListRepository'
import { logger } from '../../../../lib/logger'

export async function materialPdfListService(userId: string): Promise<UploadedMIDTO[]> {
  logger.info('IN - materialPdfListService')
  const materials = await findMaterialsByUserId(userId)
  logger.info('OUT - materialPdfListService')
  return materials
}
