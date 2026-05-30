// src/features/auth/api/authApi.ts
import { api } from '../../../lib/api'
import type { LoginPayload, LoginResponse } from '../../../types/auth'

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}

export async function verifyEmailRequest(token: string): Promise<{ message: string }> {
  const { data } = await api.get<{ message: string }>('/auth/verify-email', { params: { token } })
  return data
}
