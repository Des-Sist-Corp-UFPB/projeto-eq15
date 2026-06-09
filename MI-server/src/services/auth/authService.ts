// src/services/auth/authService.ts
import { type IAuthUser } from '../../@types/auth'
import { type LoginRequest } from '../../schemas/auth/authSchema'
import { findUserByEmail, findUserById } from '../../repositories/users/usersRepository'
import {
  findRefreshToken,
  deleteRefreshToken,
} from '../../repositories/auth/authRepository'
import { createAuditLog } from '../../repositories/audit/auditRepository'
import { comparePassword } from '../../utils/hash'
import { ERRORS, buildError } from '../../lib/errors/errors'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { StatusCode } from '../../utils/statusCode'
import { logger } from '../../lib/logger'

// ── loginService ───────────────────────────────────────────────────────────────

/**
 * Valida as credenciais do usuário e retorna seus dados públicos.
 * Intencionalmente usa a mesma mensagem para "usuário não encontrado"
 * e "senha incorreta" para não revelar quais e-mails existem no sistema.
 */
export async function loginService(input: LoginRequest): Promise<IAuthUser> {
  logger.info('IN - loginService')

  const { email, password } = input

  const user = await findUserByEmail(email)
  if (!user) throw new GeneralErrorResponse(StatusCode.UNAUTHORIZED, buildError(ERRORS.USER.INVALID_CREDENTIALS))

  const passwordMatch = await comparePassword(password, user.passwordHash)
  if (!passwordMatch) throw new GeneralErrorResponse(StatusCode.UNAUTHORIZED, buildError(ERRORS.USER.INVALID_CREDENTIALS))

  if (user.suspended) throw new GeneralErrorResponse(StatusCode.FORBIDDEN, buildError(ERRORS.AUTH.ACCOUNT_SUSPENDED))

  if (!user.emailVerified) throw new GeneralErrorResponse(StatusCode.FORBIDDEN, buildError(ERRORS.AUTH.EMAIL_NOT_VERIFIED))

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
export async function refreshTokenService(token: string): Promise<IAuthUser> {
  logger.info('IN - refreshTokenService')

  const stored = await findRefreshToken(token)
  if (!stored) throw new GeneralErrorResponse(StatusCode.UNAUTHORIZED, buildError(ERRORS.AUTH.UNAUTHORIZED))

  if (stored.expiresAt < new Date()) {
    await deleteRefreshToken(token)
    throw new GeneralErrorResponse(StatusCode.UNAUTHORIZED, buildError(ERRORS.AUTH.UNAUTHORIZED))
  }

  const user = await findUserById(stored.userId)
  if (!user || user.suspended) throw new GeneralErrorResponse(StatusCode.UNAUTHORIZED, buildError(ERRORS.AUTH.UNAUTHORIZED))

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
