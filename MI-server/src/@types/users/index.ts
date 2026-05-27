// src/@types/users/index.ts
import type { Role } from '@prisma/client'

/** Resposta segura de usuário — nunca contém passwordHash */
export interface CreatedUserDTO {
  id: string
  name: string
  email: string
  role: Role
  canUpload: boolean
  emailVerified: boolean
  suspended: boolean
  createdAt: Date
  updatedAt: Date
}
