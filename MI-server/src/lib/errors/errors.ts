// src/lib/errors/errors.ts
// Catálogo central de erros da aplicação.
// Uso: throw ERRORS.EMAIL_ALREADY_EXISTS.toError()
//       throw ERRORS.USER_NOT_FOUND.toError('en-US')

import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import {
  errorMessages,
  type ErrorMessageKey,
  type Language,
} from './errorMessages'

interface ErrorDefinition {
  readonly code: ErrorMessageKey
  readonly statusCode: number
  /** Retorna a mensagem traduzida para o idioma escolhido (padrão: pt-BR) */
  message(lang?: Language): string
  /** Cria um GeneralErrorResponse pronto para ser lançado */
  toError(lang?: Language): GeneralErrorResponse
}

function makeError(code: ErrorMessageKey, statusCode: number): ErrorDefinition {
  return {
    code,
    statusCode,
    message(lang: Language = 'pt-BR'): string {
      return errorMessages[lang][code]
    },
    toError(lang: Language = 'pt-BR'): GeneralErrorResponse {
      return new GeneralErrorResponse(errorMessages[lang][code], statusCode, code)
    },
  }
}

export const ERRORS = {
  // ── Usuários ──────────────────────────────────────────────────────────────
  EMAIL_ALREADY_EXISTS: makeError('EMAIL_ALREADY_EXISTS', 409),
  USER_NOT_FOUND:       makeError('USER_NOT_FOUND', 404),
  INVALID_CREDENTIALS:  makeError('INVALID_CREDENTIALS', 401),

  // ── Auth ──────────────────────────────────────────────────────────────────
  UNAUTHORIZED:         makeError('UNAUTHORIZED', 401),
  FORBIDDEN:            makeError('FORBIDDEN', 403),
  ACCOUNT_SUSPENDED:    makeError('ACCOUNT_SUSPENDED', 403),
  EMAIL_NOT_VERIFIED:   makeError('EMAIL_NOT_VERIFIED', 403),

  // ── Genéricos ─────────────────────────────────────────────────────────────
  BAD_REQUEST:          makeError('BAD_REQUEST', 400),
  INTERNAL_ERROR:       makeError('INTERNAL_ERROR', 500),
} as const satisfies Record<string, ErrorDefinition>
