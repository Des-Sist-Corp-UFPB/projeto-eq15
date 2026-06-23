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
  organizationId?: string
}

export async function uploadMaterialRequest(payload: UploadMaterialPayload): Promise<UploadedMI> {
  const formData = new FormData()
  formData.append('file', payload.file)
  if (payload.title?.trim()) {
    formData.append('title', payload.title.trim())
  }

  const url = payload.organizationId
    ? `/organizations/${payload.organizationId}/mis`
    : '/mis'

  const { data } = await api.post<UploadedMI>(url, formData, {
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

// ── Fluxo de revisão docente ──────────────────────────────────────────────────

export interface PendingMaterial {
  id: string
  title: string
  originalFileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  status: MIStatus
  uploadedById: string
  uploadedBy: { name: string; email: string }
  createdAt: string
  updatedAt: string
}

export type ReviewDecision = 'APPROVED' | 'REJECTED'

export interface AllMaterialsResponse {
  materials: PendingMaterial[]
  total:     number
  page:      number
  perPage:   number
}

export async function listPublicMaterialsRequest(params?: {
  page?:    number
  perPage?: number
}): Promise<AllMaterialsResponse> {
  const query = new URLSearchParams()
  if (params?.page)    query.append('page',    String(params.page))
  if (params?.perPage) query.append('perPage', String(params.perPage))
  const { data } = await api.get<AllMaterialsResponse>(`/mis/public?${query}`)
  return data
}

export async function getPublicPresignedUrlRequest(
  materialId: string,
): Promise<{ url: string; expiresInSeconds: number }> {
  const { data } = await api.get<{ url: string; expiresInSeconds: number }>(
    `/mis/${materialId}/public-presigned-url`,
  )
  return data
}

export async function listAllMaterialsRequest(params?: {
  status?:  MIStatus
  page?:    number
  perPage?: number
}): Promise<AllMaterialsResponse> {
  const query = new URLSearchParams()
  if (params?.status)  query.append('status',  params.status)
  if (params?.page)    query.append('page',    String(params.page))
  if (params?.perPage) query.append('perPage', String(params.perPage))
  const { data } = await api.get<AllMaterialsResponse>(`/mis/all?${query}`)
  return data
}

export async function listPendingMaterialsRequest(): Promise<PendingMaterial[]> {
  const { data } = await api.get<PendingMaterial[]>('/mis/pending')
  return data
}

export async function getReviewPresignedUrlRequest(materialId: string): Promise<{ url: string; expiresInSeconds: number }> {
  const { data } = await api.get<{ url: string; expiresInSeconds: number }>(`/mis/${materialId}/review-presigned-url`)
  return data
}

export async function reviewMaterialRequest(
  materialId: string,
  decision: ReviewDecision,
): Promise<UploadedMI> {
  const { data } = await api.patch<UploadedMI>(`/mis/${materialId}/review`, { decision })
  return data
}
