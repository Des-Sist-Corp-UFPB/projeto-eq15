// src/repositories/resources/materials/pdf/materialPdfListByUserRepository.ts
import { prisma } from '../../../../database/prisma'
import type { UploadedMIDTO } from '../../../../@types/resources/materials/pdf'

const MI_SELECT = {
  id:               true,
  title:            true,
  originalFileName: true,
  storageKey:       true,
  mimeType:         true,
  sizeBytes:        true,
  habilidadesBncc:  true,
  status:           true,
  uploadedById:     true,
  createdAt:        true,
  updatedAt:        true,
} as const

export async function findMaterialsByUserId(userId: string): Promise<UploadedMIDTO[]> {
  return prisma.materialInstrucional.findMany({
    where:   { uploadedById: userId },
    select:  MI_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}
