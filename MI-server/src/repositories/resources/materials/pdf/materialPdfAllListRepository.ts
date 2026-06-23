// src/repositories/resources/materials/pdf/materialPdfAllListRepository.ts
import { type MIStatus } from '@prisma/client'
import { prisma } from '../../../../database/prisma'
import type { IPendingMaterial } from '../../../../@types/resources/materials/pdf'

export interface AllMaterialsParams {
  status?:  MIStatus
  page:     number
  perPage:  number
}

export interface AllMaterialsResult {
  materials: IPendingMaterial[]
  total:     number
  page:      number
  perPage:   number
}

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
  uploadedBy: {
    select: { name: true, email: true },
  },
  organizations: {
    select: {
      organization: {
        select: { id: true, name: true },
      },
    },
  },
} as const

export async function findAllMaterials(
  params: AllMaterialsParams,
): Promise<AllMaterialsResult> {
  const { status, page, perPage } = params

  const where = status ? { status } : {}

  const [materials, total] = await prisma.$transaction([
    prisma.materialInstrucional.findMany({
      where,
      select:  MI_SELECT,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.materialInstrucional.count({ where }),
  ])

  return { materials, total, page, perPage }
}
