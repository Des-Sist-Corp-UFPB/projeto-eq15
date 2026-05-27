// __tests__/unit/users/usersService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AppLogger } from '../../../src/@types/common'

// ── Mocks — declarados antes dos imports do módulo testado ─────────────────────
vi.mock('../../../src/repositories/users/usersRepository', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

vi.mock('../../../src/repositories/audit/auditRepository', () => ({
  createAuditLog: vi.fn(),
}))

vi.mock('../../../src/utils/hash', () => ({
  hashPassword: vi.fn(),
}))

import { createUserService } from '../../../src/services/users/usersService'
import {
  findUserByEmail,
  createUser,
} from '../../../src/repositories/users/usersRepository'
import { createAuditLog } from '../../../src/repositories/audit/auditRepository'
import { hashPassword } from '../../../src/utils/hash'
import { GeneralErrorResponse } from '../../../src/errors/GeneralErrorResponse'

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMockLogger(): AppLogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

function makeMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-uuid-123',
    name: 'João Silva',
    email: 'joao@example.com',
    passwordHash: 'hashed_password',
    role: 'COMMON' as const,
    canUpload: false,
    emailVerified: true,
    suspended: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    refreshTokens: [],
    auditLogs: [],
    ...overrides,
  }
}

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()

  vi.mocked(findUserByEmail).mockResolvedValue(null)
  vi.mocked(hashPassword).mockResolvedValue('hashed_password')
  vi.mocked(createUser).mockResolvedValue(makeMockUser())
  vi.mocked(createAuditLog).mockResolvedValue(undefined)
})

// ── Testes ─────────────────────────────────────────────────────────────────────

describe('createUserService', () => {
  describe('cadastro de usuário COMMON (RF01)', () => {
    it('deve criar usuário com role COMMON para e-mail não-institucional', async () => {
      const log = makeMockLogger()

      const result = await createUserService(
        { name: 'João Silva', email: 'joao@example.com', password: 'senha123' },
        log,
      )

      expect(result.role).toBe('COMMON')
      expect(vi.mocked(createUser)).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'COMMON' }),
      )
    })

    it('deve definir emailVerified como true para usuário COMMON', async () => {
      const log = makeMockLogger()

      const result = await createUserService(
        { name: 'João', email: 'joao@gmail.com', password: 'senha123' },
        log,
      )

      expect(result.emailVerified).toBe(true)
      expect(vi.mocked(createUser)).toHaveBeenCalledWith(
        expect.objectContaining({ emailVerified: true }),
      )
    })
  })

  describe('cadastro de usuário INSTITUTIONALIZED (RF02)', () => {
    it('deve criar usuário com role INSTITUTIONALIZED para e-mail @dcx.ufpb.br', async () => {
      const mockInstitutionalUser = makeMockUser({
        email: 'aluno@dcx.ufpb.br',
        role: 'INSTITUTIONALIZED',
        emailVerified: false,
      })
      vi.mocked(createUser).mockResolvedValue(mockInstitutionalUser)

      const log = makeMockLogger()

      const result = await createUserService(
        { name: 'Aluno UFPB', email: 'aluno@dcx.ufpb.br', password: 'senha123' },
        log,
      )

      expect(result.role).toBe('INSTITUTIONALIZED')
      expect(vi.mocked(createUser)).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'INSTITUTIONALIZED',
          emailVerified: false,
        }),
      )
    })

    it('deve definir emailVerified como false para usuário institucional', async () => {
      const mockInstitutionalUser = makeMockUser({
        email: 'aluno@dcx.ufpb.br',
        role: 'INSTITUTIONALIZED',
        emailVerified: false,
      })
      vi.mocked(createUser).mockResolvedValue(mockInstitutionalUser)

      const log = makeMockLogger()

      const result = await createUserService(
        { name: 'Aluno', email: 'aluno@dcx.ufpb.br', password: 'senha123' },
        log,
      )

      expect(result.emailVerified).toBe(false)
    })

    it('deve detectar domínio institucional case-insensitive', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'Aluno', email: 'aluno@DCX.UFPB.BR', password: 'senha123' },
        log,
      )

      expect(vi.mocked(createUser)).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'INSTITUTIONALIZED' }),
      )
    })
  })

  describe('segurança (RNF01)', () => {
    it('nunca deve retornar passwordHash na resposta', async () => {
      const log = makeMockLogger()

      const result = await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      )

      expect(result).not.toHaveProperty('passwordHash')
    })

    it('deve chamar hashPassword antes de criar o usuário (RNF01)', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'minha_senha' },
        log,
      )

      expect(vi.mocked(hashPassword)).toHaveBeenCalledWith('minha_senha')
      expect(vi.mocked(createUser)).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed_password' }),
      )
    })
  })

  describe('unicidade de e-mail', () => {
    it('deve lançar GeneralErrorResponse 409 quando e-mail já existe', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(makeMockUser())

      const log = makeMockLogger()

      await expect(
        createUserService(
          { name: 'João', email: 'joao@example.com', password: 'senha123' },
          log,
        ),
      ).rejects.toThrow(GeneralErrorResponse)
    })

    it('deve retornar statusCode 409 e code EMAIL_ALREADY_EXISTS', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(makeMockUser())

      const log = makeMockLogger()

      const error = await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      ).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(GeneralErrorResponse)
      expect((error as GeneralErrorResponse).statusCode).toBe(409)
      expect((error as GeneralErrorResponse).code).toBe('EMAIL_ALREADY_EXISTS')
    })

    it('não deve chamar createUser quando e-mail já existe', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(makeMockUser())

      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      ).catch(() => {})

      expect(vi.mocked(createUser)).not.toHaveBeenCalled()
    })
  })

  describe('auditoria (RNF05)', () => {
    it('deve registrar AuditLog após criar o usuário', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      )

      expect(vi.mocked(createAuditLog)).toHaveBeenCalledOnce()
      expect(vi.mocked(createAuditLog)).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'user-uuid-123',
          targetId: 'user-uuid-123',
          action: 'USER_REGISTERED',
        }),
      )
    })

    it('não deve chamar createAuditLog quando e-mail já existe', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(makeMockUser())

      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      ).catch(() => {})

      expect(vi.mocked(createAuditLog)).not.toHaveBeenCalled()
    })
  })

  describe('logging do ciclo de vida', () => {
    it('deve chamar log.info ao iniciar o service', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      )

      expect(log.info).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'joao@example.com', name: 'João' }),
        'createUserService — iniciado',
      )
    })

    it('deve chamar log.info ao concluir o service com userId e role', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha123' },
        log,
      )

      expect(log.info).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-uuid-123', role: 'COMMON' }),
        'createUserService — concluído',
      )
    })

    it('log.info de início não deve conter a senha', async () => {
      const log = makeMockLogger()

      await createUserService(
        { name: 'João', email: 'joao@example.com', password: 'senha_secreta' },
        log,
      )

      const firstCall = vi.mocked(log.info).mock.calls[0]
      const loggedObj = firstCall[0] as Record<string, unknown>
      expect(loggedObj).not.toHaveProperty('password')
      expect(loggedObj).not.toHaveProperty('passwordHash')
    })
  })
})
