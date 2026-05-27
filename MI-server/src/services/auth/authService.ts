// src/services/auth/authService.ts
import { type AuthUserDTO } from '../../@types/auth'
import { type LoginInput } from '../../schemas/auth/authSchema'
import { findUserByEmail, findUserById } from '../../repositories/users/usersRepository'
import {
  findRefreshToken,
  deleteRefreshToken,
} from '../../repositories/auth/authRepository'
import { createAuditLog } from '../../repositories/audit/auditRepository'
import { comparePassword } from '../../utils/hash'
import { ERRORS } from '../../lib/errors/errors'
import { logger } from '../../lib/logger'

// ── loginService ───────────────────────────────────────────────────────────────

/**
 * Valida as credenciais do usuário e retorna seus dados públicos.
 * Intencionalmente usa a mesma mensagem para "usuário não encontrado"
 * e "senha incorreta" para não revelar quais e-mails existem no sistema.
 */
export async function loginService(input: LoginInput): Promise<AuthUserDTO> {
  logger.info('IN - loginService')

  const { email, password } = input

  const user = await findUserByEmail(email)
  if (!user) throw ERRORS.INVALID_CREDENTIALS.toError()

  const passwordMatch = await comparePassword(password, user.passwordHash)
  if (!passwordMatch) throw ERRORS.INVALID_CREDENTIALS.toError()

  if (user.suspended) throw ERRORS.ACCOUNT_SUSPENDED.toError()

  if (!user.emailVerified) throw ERRORS.EMAIL_NOT_VERIFIED.toError()

  await createAuditLog({
    actorId: user.id,
    actorRole: user.role,
    targetId: user.id,
    action: 'USER_LOGGED_IN',
    metadata: { email, role: user.role },
  })

  logger.info('OUT - loginService')

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    canUpload: user.canUpload,
  }
}

// ── refreshTokenService ────────────────────────────────────────────────────────

/**
 * Valida um refresh token e retorna os dados do usuário associado.
 * Tokens expirados são deletados do banco antes de lançar o erro.
 */
export async function refreshTokenService(token: string): Promise<AuthUserDTO> {
  logger.info('IN - refreshTokenService')

  const stored = await findRefreshToken(token)
  if (!stored) throw ERRORS.UNAUTHORIZED.toError()

  if (stored.expiresAt < new Date()) {
    await deleteRefreshToken(token)
    throw ERRORS.UNAUTHORIZED.toError()
  }

  const user = await findUserById(stored.userId)
  if (!user || user.suspended) throw ERRORS.UNAUTHORIZED.toError()

  logger.info('OUT - refreshTokenService')

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    canUpload: user.canUpload,
  }
}

// ── logoutService ──────────────────────────────────────────────────────────────

/**
 * Remove o refresh token do banco, invalidando a sessão no servidor.
 */
export async function logoutService(token: string): Promise<void> {
  logger.info('IN - logoutService')
  await deleteRefreshToken(token)
  logger.info('OUT - logoutService')
}
