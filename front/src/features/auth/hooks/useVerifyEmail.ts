// src/features/auth/hooks/useVerifyEmail.ts
import { useQuery } from '@tanstack/react-query'
import { verifyEmailRequest } from '../api/authApi'

export function useVerifyEmail(token: string | null) {
  return useQuery({
    queryKey: ['verify-email', token],
    queryFn:  () => verifyEmailRequest(token!),
    enabled:  !!token,
    retry:    false,
    staleTime: Infinity,
  })
}
