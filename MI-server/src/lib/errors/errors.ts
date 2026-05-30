// src/lib/errors/errors.ts
// Catálogo central de erros da aplicação.
//
// Uso:
//   throw new GeneralErrorResponse(buildError(ERRORS.USER.INVALID_CREDENTIALS))
//   throw new GeneralErrorResponse(buildError(ERRORS.AUTH.UNAUTHORIZED, 'en-US'))
//   throw new GeneralErrorResponse(buildError(ERRORS.GENERAL.BAD_REQUEST))

import { type ErrorParams } from '../../errors/GeneralErrorResponse'
import { errorMessages, type ErrorMessageKey, type Language } from './errorMessages'

// ── Status codes ───────────────────────────────────────────────────────────────

const ERROR_STATUS_CODES: Record<ErrorMessageKey, number> = {
  // Usuários
  EMAIL_ALREADY_EXISTS: 409,
  USER_NOT_FOUND:       404,
  INVALID_CREDENTIALS:  401,
  // Auth
  UNAUTHORIZED:         401,
  FORBIDDEN:            403,
  ACCOUNT_SUSPENDED:    403,
  EMAIL_NOT_VERIFIED:   403,
  // Upload / Resources
  UPLOAD_NOT_ALLOWED:   403,
  INVALID_FILE_TYPE:    415,
  FILE_TOO_LARGE:       413,
  UPLOAD_FAILED:        500,
  MI_NOT_FOUND:         404,
  // Genéricos
  BAD_REQUEST:          400,
  INTERNAL_ERROR:       500,
}

// ── buildError ─────────────────────────────────────────────────────────────────

/**
 * Constrói os parâmetros para `new GeneralErrorResponse(...)`.
 * Centraliza a resolução de mensagem (i18n) e status HTTP.
 *
 * @param code   - Chave do erro (use as constantes de `ERRORS`)
 * @param lang   - Idioma da mensagem (padrão: 'pt-BR')
 *
 * @example
 *   throw new GeneralErrorResponse(buildError(ERRORS.USER.INVALID_CREDENTIALS))
 *   throw new GeneralErrorResponse(buildError(ERRORS.AUTH.UNAUTHORIZED, 'en-US'))
 */
export function buildError(code: ErrorMessageKey, lang: Language = 'pt-BR'): ErrorParams {
  return {
    message:    errorMessages[lang][code],
    statusCode: ERROR_STATUS_CODES[code],
    code,
  }
}

// ── ERRORS — códigos organizados por domínio ───────────────────────────────────

export const ERRORS = {
  USER: {
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    USER_NOT_FOUND:       'USER_NOT_FOUND',
    INVALID_CREDENTIALS:  'INVALID_CREDENTIALS',
  },
  AUTH: {
    UNAUTHORIZED:         'UNAUTHORIZED',
    FORBIDDEN:            'FORBIDDEN',
    ACCOUNT_SUSPENDED:    'ACCOUNT_SUSPENDED',
    EMAIL_NOT_VERIFIED:   'EMAIL_NOT_VERIFIED',
  },
  ERRORS_RESOURCES: {
    UPLOAD_NOT_ALLOWED:   'UPLOAD_NOT_ALLOWED',
    INVALID_FILE_TYPE:    'INVALID_FILE_TYPE',
    FILE_TOO_LARGE:       'FILE_TOO_LARGE',
    UPLOAD_FAILED:        'UPLOAD_FAILED',
    MI_NOT_FOUND:         'MI_NOT_FOUND',
  },
  GENERAL: {
    BAD_REQUEST:          'BAD_REQUEST',
    INTERNAL_ERROR:       'INTERNAL_ERROR',
  },
} as const satisfies Record<string, Record<string, ErrorMessageKey>>
