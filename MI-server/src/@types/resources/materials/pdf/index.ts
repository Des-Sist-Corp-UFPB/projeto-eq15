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

/** DTO de resposta da URL pré-assinada para visualização temporária */
export interface MaterialPresignedUrlDTO {
  url: string
  expiresInSeconds: number
}

/** DTO de material pendente — inclui dados do autor para exibição no painel do professor */
export interface PendingMaterialDTO {
  id: string
  title: string
  originalFileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  status: MIStatus
  uploadedById: string
  uploadedBy: { name: string; email: string }
  createdAt: Date
  updatedAt: Date
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
