// src/services/users/usersService.ts
import { type Role } from '@prisma/client'
import { type AppLogger } from '../../@types/common'
import { type CreatedUserDTO } from '../../@types/users'
import { type CreateUserInput } from '../../schemas/users/usersSchema'
import {
  findUserByEmail,
  createUser,
} from '../../repositories/users/usersRepository'
import { createAuditLog } from '../../repositories/audit/auditRepository'
import { hashPassword } from '../../utils/hash'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'

const INSTITUTIONAL_DOMAIN = '@dcx.ufpb.br'

export async function createUserService(
  input: CreateUserInput,
  log: AppLogger,
): Promise<CreatedUserDTO> {
  const { name, email, password } = input

  // Nunca loga a senha — apenas dados não-sensíveis
  log.info({ name, email }, 'createUserService — iniciado')

  // RF01/RF02 — e-mail único
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new GeneralErrorResponse(
      'E-mail já cadastrado.',
      409,
      'EMAIL_ALREADY_EXISTS',
    )
  }

  // RF02 — detecção de domínio institucional
  const isInstitutional = email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)
  const role: Role = isInstitutional ? 'INSTITUTIONALIZED' : 'COMMON'

  // RF01 — acesso imediato para COMMON; INSTITUTIONALIZED aguarda verificação
  const emailVerified = !isInstitutional

  // RNF01 — hash da senha antes de persistir
  const passwordHash = await hashPassword(password)

  const user = await createUser({ name, email, passwordHash, role, emailVerified })

  // RNF05 — registro de auditoria imutável no banco
  await createAuditLog({
    actorId: user.id,
    actorRole: user.role,
    targetId: user.id,
    action: 'USER_REGISTERED',
    metadata: { email, role },
  })

  // Nunca retorna o hash da senha
  const { passwordHash: _removed, ...safeUser } = user

  log.info(
    { userId: safeUser.id, role: safeUser.role, emailVerified: safeUser.emailVerified },
    'createUserService — concluído',
  )

  return safeUser
}
