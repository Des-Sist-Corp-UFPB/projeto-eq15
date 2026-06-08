// src/features/organizations/hooks/useCreateOrganization.ts
import { useMutation } from '@tanstack/react-query'
import {
  createOrganizationRequest,
  type CreateOrganizationInput,
  type OrganizationDTO,
} from '../api/organizationsApi'

export function useCreateOrganization() {
  return useMutation<OrganizationDTO, Error, CreateOrganizationInput>({
    mutationFn: createOrganizationRequest,
  })
}
