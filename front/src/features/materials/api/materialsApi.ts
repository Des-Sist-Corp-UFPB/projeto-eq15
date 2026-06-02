// src/features/materials/api/materialsApi.ts
import { api } from '../../../lib/api'

export type MIStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

export interface UploadedMI {
  id: string
  title: string
  originalFileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  status: MIStatus
  uploadedById: string
  createdAt: string
  updatedAt: string
}

export interface UploadMaterialPayload {
  file: File
  title?: string
}

export async function uploadMaterialRequest(payload: UploadMaterialPayload): Promise<UploadedMI> {
  const formData = new FormData()
  formData.append('file', payload.file)
  if (payload.title?.trim()) {
    formData.append('title', payload.title.trim())
  }

  const { data } = await api.post<UploadedMI>('/mis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listMyMaterialsRequest(): Promise<UploadedMI[]> {
  const { data } = await api.get<UploadedMI[]>('/mis/me')
  return data
}

export async function getMaterialPresignedUrlRequest(materialId: string): Promise<{ url: string; expiresInSeconds: number }> {
  const { data } = await api.get<{ url: string; expiresInSeconds: number }>(`/mis/${materialId}/presigned-url`)
  return data
}
