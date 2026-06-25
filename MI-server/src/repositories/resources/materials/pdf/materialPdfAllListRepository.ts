// src/repositories/resources/materials/pdf/materialPdfAllListRepository.ts
import { Prisma, type MIStatus } from '@prisma/client'
import { prisma } from '../../../../database/prisma'
import type { PendingMaterialDTO } from '../../../../@types/resources/materials/pdf'

export interface AllMaterialsParams {
  status?:  MIStatus
  /** Filtra materiais que possuam QUALQUER uma destas habilidades (hasSome) */
  habilidades?: string[]
  /** Inclui também materiais sem nenhuma habilidade (lista vazia) */
  includeSemHabilidade?: boolean
  page:     number
  perPage:  number
}

export interface AllMaterialsResult {
  materials: PendingMaterialDTO[]
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
  habilidadesBncc:  true,
  status:           true,
  uploadedById:     true,
  createdAt:        true,
  updatedAt:        true,
  uploadedBy: {
    select: { name: true, email: true },
  },
} as const

export async function findAllMaterials(
  params: AllMaterialsParams,
): Promise<AllMaterialsResult> {
  const { status, habilidades, includeSemHabilidade, page, perPage } = params

  const where: Prisma.MaterialInstrucionalWhereInput = {}
  if (status) where.status = status

  // Filtro de habilidades: união entre "tem alguma das selecionadas" e "sem habilidade"
  const habilidadeConditions: Prisma.MaterialInstrucionalWhereInput[] = []
  if (habilidades && habilidades.length > 0) {
    habilidadeConditions.push({ habilidadesBncc: { hasSome: habilidades } })
  }
  if (includeSemHabilidade) {
    habilidadeConditions.push({ habilidadesBncc: { isEmpty: true } })
  }
  if (habilidadeConditions.length === 1) {
    Object.assign(where, habilidadeConditions[0])
  } else if (habilidadeConditions.length > 1) {
    where.OR = habilidadeConditions
  }

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
