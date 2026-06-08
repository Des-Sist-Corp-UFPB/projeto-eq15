// src/@types/organizations/index.ts

export interface OrganizationDTO {
  id:          string
  name:        string
  description: string | null
  createdById: string
  createdAt:   Date
  updatedAt:   Date
}
