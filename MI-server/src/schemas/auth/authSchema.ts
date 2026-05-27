// src/schemas/auth/authSchema.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export const PasswordResetConfirmSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must have at least 8 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>
export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>
