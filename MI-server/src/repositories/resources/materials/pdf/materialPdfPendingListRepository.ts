// src/repositories/resources/materials/pdf/materialPdfPendingListRepository.ts
import { prisma } from '../../../../database/prisma'
import type { PendingMaterialDTO } from '../../../../@types/resources/materials/pdf'

export async function findPendingMaterials(): Promise<PendingMaterialDTO[]> {
  return prisma.materialInstrucional.findMany({
    where:   { status: 'PENDING_REVIEW' },
    select: {
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
      uploadedBy: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}
