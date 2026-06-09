// src/repositories/resources/materials/pdf/materialPdfUploadRepository.ts
import { prisma } from '../../../../database/prisma'
import type { IUploadedMI } from '../../../../@types/resources/materials/pdf'

// Campos retornados em todas as queries — nunca expõe campos internos
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

interface CreateMaterialPdfInput {
  title:            string
  originalFileName: string
  storageKey:       string
  mimeType:         string
  sizeBytes:        number
  uploadedById:     string
}

export async function createMaterialPdf(input: CreateMaterialPdfInput): Promise<IUploadedMI> {
  return prisma.materialInstrucional.create({
    data: {
      title:            input.title,
      originalFileName: input.originalFileName,
      storageKey:       input.storageKey,
      mimeType:         input.mimeType,
      sizeBytes:        input.sizeBytes,
      uploadedById:     input.uploadedById,
    },
    select: MI_SELECT,
  })
}
