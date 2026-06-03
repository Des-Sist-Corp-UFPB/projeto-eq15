// src/services/resources/materials/pdf/materialPdfPublicListService.ts
import { z } from 'zod'
import { findAllMaterials, type AllMaterialsResult } from '../../../../repositories/resources/materials/pdf/materialPdfAllListRepository'
import { validateRequest } from '../../../../utils/validateRequest'
import { logger } from '../../../../lib/logger'

const publicListQuerySchema = z.object({
  page:    z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(25),
})

export async function materialPdfPublicListService(input: unknown): Promise<AllMaterialsResult> {
  logger.info('IN - materialPdfPublicListService')
  const { page, perPage } = validateRequest(input, publicListQuerySchema)
  const result = await findAllMaterials({ status: 'APPROVED', page, perPage })
  logger.info('OUT - materialPdfPublicListService')
  return result
}
