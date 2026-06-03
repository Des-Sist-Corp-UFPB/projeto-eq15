// __tests__/unit/users/usersController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CreateUserInput } from '../../../src/schemas/users/usersSchema'
import type { CreatedUserDTO } from '../../../src/@types/users'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../../src/services/users/usersService', () => ({
  createUserService: vi.fn(),
}))

vi.mock('../../../src/repositories/inspectionLog/inspectionLogRepository', () => ({
  createInspectionLog: vi.fn(),
}))

vi.mock('../../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { createUserController } from '../../../src/controllers/users/usersController'
import { createUserService } from '../../../src/services/users/usersService'
import { createInspectionLog } from '../../../src/repositories/inspectionLog/inspectionLogRepository'
import { logger } from '../../../src/lib/logger'
import { GeneralErrorResponse } from '../../../src/errors/GeneralErrorResponse'
import { ERRORS, buildError } from '../../../src/lib/errors/errors'

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMockRequest(
  bodyOverrides: Partial<CreateUserInput> = {},
): FastifyRequest<{ Body: CreateUserInput }> {
  return {
    id: 'req-test-abc123',
    method: 'POST',
    url: '/users',
    body: {
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'senha123',
      ...bodyOverrides,
    },
  } as unknown as FastifyRequest<{ Body: CreateUserInput }>
}

function makeMockReply(): FastifyReply {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply
}

function makeCreatedUser(overrides: Partial<CreatedUserDTO> = {}): CreatedUserDTO {
  return {
    id: 'user-uuid-456',
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'COMMON',
    canUpload: false,
    emailVerified: true,
    suspended: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createInspectionLog).mockResolvedValue(undefined)
  vi.mocked(createUserService).mockResolvedValue(makeCreatedUser())
})

// ── Testes ─────────────────────────────────────────────────────────────────────

describe('createUserController', () => {
  describe('fluxo de sucesso', () => {
    it('deve chamar createUserService com o body da requisição', async () => {
      const request = makeMockRequest()
      const reply = makeMockReply()

      await createUserController(request, reply)

      expect(vi.mocked(createUserService)).toHaveBeenCalledWith(request.body)
    })

    it('deve responder com status 201 em caso de sucesso', async () => {
      const request = makeMockRequest()
      const reply = makeMockReply()

      await createUserController(request, reply)

      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-uuid-456' }))
    })
  })

  describe('logging de console (pino)', () => {
    it('deve logar "IN - createUserController" ao receber a requisição', async () => {
      await createUserController(makeMockRequest(), makeMockReply())

      expect(vi.mocked(logger.info)).toHaveBeenCalledWith('IN - createUserController')
    })

    it('deve logar "OUT - createUserController" após responder com sucesso', async () => {
      await createUserController(makeMockRequest(), makeMockReply())

      expect(vi.mocked(logger.info)).toHaveBeenCalledWith('OUT - createUserController')
    })

    it('deve logar IN antes de OUT', async () => {
      await createUserController(makeMockRequest(), makeMockReply())

      const calls = vi.mocked(logger.info).mock.calls.map((c) => c[0])
      expect(calls.indexOf('IN - createUserController')).toBeLessThan(
        calls.indexOf('OUT - createUserController'),
      )
    })

    it('deve logar "ERROR - createUserController" quando o service lança erro', async () => {
      vi.mocked(createUserService).mockRejectedValue(
        new GeneralErrorResponse(buildError(ERRORS.USER.EMAIL_ALREADY_EXISTS)),
      )

      await createUserController(makeMockRequest(), makeMockReply()).catch(() => {})

      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(GeneralErrorResponse) }),
        'ERROR - createUserController',
      )
    })
  })

  describe('InspectionLog — rastreio em banco', () => {
    it('deve criar InspectionLog IN com requestId e dados não-sensíveis da requisição', async () => {
      const request = makeMockRequest()
      await createUserController(request, makeMockReply())

      expect(vi.mocked(createInspectionLog)).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-test-abc123',
          direction: 'IN',
          context: 'createUserController',
          level: 'INFO',
        }),
      )
    })

    it('InspectionLog IN não deve conter a senha no payload', async () => {
      const request = makeMockRequest({ password: 'senha_super_secreta' })
      await createUserController(request, makeMockReply())

      const inCall = vi.mocked(createInspectionLog).mock.calls.find(
        ([params]) => params.direction === 'IN',
      )
      expect(inCall).toBeDefined()
      const payload = JSON.stringify(inCall![0].payload)
      expect(payload).not.toContain('senha_super_secreta')
    })

    it('deve criar InspectionLog OUT com statusCode e userId em caso de sucesso', async () => {
      await createUserController(makeMockRequest(), makeMockReply())

      expect(vi.mocked(createInspectionLog)).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-test-abc123',
          direction: 'OUT',
          context: 'createUserController',
          level: 'INFO',
          payload: expect.objectContaining({ statusCode: 201, userId: 'user-uuid-456' }),
        }),
      )
    })

    it('deve criar InspectionLog ERROR com mensagem e code em caso de falha', async () => {
      vi.mocked(createUserService).mockRejectedValue(
        new GeneralErrorResponse(buildError(ERRORS.USER.EMAIL_ALREADY_EXISTS)),
      )

      await createUserController(makeMockRequest(), makeMockReply()).catch(() => {})

      expect(vi.mocked(createInspectionLog)).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-test-abc123',
          direction: 'ERROR',
          level: 'ERROR',
          context: 'createUserController',
          payload: expect.objectContaining({
            error: 'E-mail já cadastrado.',
            code: 'EMAIL_ALREADY_EXISTS',
          }),
        }),
      )
    })

    it('deve re-lançar o erro após registrar o InspectionLog ERROR', async () => {
      const thrownError = new GeneralErrorResponse(buildError(ERRORS.USER.EMAIL_ALREADY_EXISTS))
      vi.mocked(createUserService).mockRejectedValue(thrownError)

      await expect(
        createUserController(makeMockRequest(), makeMockReply()),
      ).rejects.toThrow(thrownError)
    })

    it('deve criar InspectionLog IN mesmo quando o service falha', async () => {
      vi.mocked(createUserService).mockRejectedValue(new Error('Unexpected'))

      await createUserController(makeMockRequest(), makeMockReply()).catch(() => {})

      const inCalls = vi.mocked(createInspectionLog).mock.calls.filter(
        ([params]) => params.direction === 'IN',
      )
      expect(inCalls).toHaveLength(1)
    })
  })
})
