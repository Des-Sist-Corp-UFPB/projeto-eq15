// src/repositories/resources/materials/pdf/materialPdfViewRepository.ts
import { prisma } from '../../../../database/prisma'
import type { IUploadedMI } from '../../../../@types/resources/materials/pdf'

const MI_SELECT = {
  id:               true,
  title:            true,
  originalFileName: true,
  storageKey:       true,
  mimeType:         true,
  sizeBytes:        true,
  status:           true,
  uploadedById:     true,
  createdAt:        true,
  updatedAt:        true,
} as const

export async function findMaterialById(id: string): Promise<IUploadedMI | null> {
  return prisma.materialInstrucional.findUnique({
    where:  { id },
    select: MI_SELECT,
  })
}
