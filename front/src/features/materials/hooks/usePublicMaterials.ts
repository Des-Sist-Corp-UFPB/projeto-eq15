// src/features/materials/hooks/usePublicMaterials.ts
import { useQuery } from '@tanstack/react-query'
import { listPublicMaterialsRequest } from '../api/materialsApi'

export function usePublicMaterials(page = 1) {
  return useQuery({
    queryKey: ['public-materials', page],
    queryFn:  () => listPublicMaterialsRequest({ page, perPage: 25 }),
  })
}
