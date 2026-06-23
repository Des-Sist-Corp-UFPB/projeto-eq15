// src/@types/resources/materials/pdf/index.ts
import type { MIStatus } from '@prisma/client'

/** Payload interno passado do controller para o service */
export interface UploadMIInput {
  title: string
  buffer: Buffer
  originalFileName: string
  mimeType: string
  uploadedById: string
  organizationIds?: string[]
}

/** URL pré-assinada para visualização temporária */
export interface IMaterialPresignedUrl {
  url: string
  expiresInSeconds: number
}

/** Material pendente — inclui dados do autor para exibição no painel do professor */
export interface IPendingMaterial {
  id: string
  title: string
  originalFileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  status: MIStatus
  uploadedById: string
  uploadedBy: { name: string; email: string }
  organizations: { organization: { id: string; name: string } }[]
  createdAt: Date
  updatedAt: Date
}

/** Resposta do endpoint de chat RAG com IA */
export interface IMaterialChatResponse {
  answer:     string
  chunksUsed: number
}

/** Material Instrucional — nunca expõe campos internos desnecessários */
export interface IUploadedMI {
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
