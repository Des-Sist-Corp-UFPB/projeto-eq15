// src/features/materials/hooks/usePublicMaterials.ts
import { useQuery } from '@tanstack/react-query'
import { listPublicMaterialsRequest } from '../api/materialsApi'

interface PublicMaterialsFilters {
  habilidades?:   string[]
  semHabilidade?: boolean
}

export function usePublicMaterials(page = 1, filters: PublicMaterialsFilters = {}) {
  const { habilidades = [], semHabilidade = false } = filters
  return useQuery({
    queryKey: ['public-materials', page, habilidades, semHabilidade],
    queryFn:  () => listPublicMaterialsRequest({ page, perPage: 25, habilidades, semHabilidade }),
  })
}
