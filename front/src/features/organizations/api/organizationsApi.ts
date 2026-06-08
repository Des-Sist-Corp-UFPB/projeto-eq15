// src/features/organizations/api/organizationsApi.ts
import { api } from '../../../lib/api'

export interface CreateOrganizationInput {
  name:        string
  description?: string
}

export interface OrganizationDTO {
  id:          string
  name:        string
  description: string | null
  createdById: string
  createdAt:   string
  updatedAt:   string
}

export async function createOrganizationRequest(
  input: CreateOrganizationInput,
): Promise<OrganizationDTO> {
  const { data } = await api.post<OrganizationDTO>('/organizations', input)
  return data
}
