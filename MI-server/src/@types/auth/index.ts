// src/@types/auth/index.ts
import type { Role } from '@prisma/client'

/** Dados públicos do usuário autenticado — nunca contém passwordHash */
export interface AuthUserDTO {
  id: string
  name: string
  email: string
  role: Role
  canUpload: boolean
}

/** Resposta de POST /auth/login */
export interface LoginResponseDTO {
  accessToken: string
  user: AuthUserDTO
}

/** Resposta de POST /auth/refresh */
export interface RefreshResponseDTO {
  accessToken: string
}
