// src/@types/resources/materials/pdf/index.ts
import type { MIStatus } from '@prisma/client'

/** Payload interno passado do controller para o service */
export interface UploadMIInput {
  title: string
  buffer: Buffer
  originalFileName: string
  mimeType: string
  uploadedById: string
}

/** DTO de resposta — nunca expõe campos internos desnecessários */
export interface UploadedMIDTO {
  id: string
  title: string
  originalFileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  status: MIStatus
  uploadedById: string
  createdAt: Date
  updatedAt: Date
}
