// src/features/users/api/usersApi.ts
import { api } from '../../../lib/api'
import type { RegisterPayload, CreatedUser } from '../../../types/users'

export async function registerRequest(payload: RegisterPayload): Promise<CreatedUser> {
  const { data } = await api.post<CreatedUser>('/users', payload)
  return data
}
