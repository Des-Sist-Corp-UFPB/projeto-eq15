// src/repositories/resources/materials/pdf/materialPdfViewRepository.ts
import { prisma } from '../../../../database/prisma'
import type { PendingMaterialDTO, UploadedMIDTO } from '../../../../@types/resources/materials/pdf'

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

export async function findMaterialById(id: string): Promise<UploadedMIDTO | null> {
  return prisma.materialInstrucional.findUnique({
    where:  { id },
    select: MI_SELECT,
  })
}

// Inclui os dados do autor — usado na tela de detalhe de um material específico
export async function findMaterialDetailById(id: string): Promise<PendingMaterialDTO | null> {
  return prisma.materialInstrucional.findUnique({
    where:  { id },
    select: {
      ...MI_SELECT,
      uploadedBy: {
        select: { name: true, email: true },
      },
    },
  })
}
