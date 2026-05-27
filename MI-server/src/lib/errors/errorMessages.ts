// src/lib/errors/errorMessages.ts
// Mensagens de erro centralizadas com suporte a pt-BR, en-US e es
// Para adicionar um novo erro: adicionar a chave aqui e em errors.ts

export type Language = 'pt-BR' | 'en-US' | 'es'

export type ErrorMessageKey =
  // ── Usuários ──────────────────────────────────────────────────────────────
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  // ── Auth ──────────────────────────────────────────────────────────────────
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  // ── Genéricos ─────────────────────────────────────────────────────────────
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'

export const errorMessages: Record<Language, Record<ErrorMessageKey, string>> = {
  'pt-BR': {
    EMAIL_ALREADY_EXISTS: 'E-mail já cadastrado.',
    USER_NOT_FOUND: 'Usuário não encontrado.',
    INVALID_CREDENTIALS: 'Credenciais inválidas.',
    UNAUTHORIZED: 'Token inválido ou expirado.',
    FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
    BAD_REQUEST: 'Requisição inválida.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
  },

  'en-US': {
    EMAIL_ALREADY_EXISTS: 'Email already registered.',
    USER_NOT_FOUND: 'User not found.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    UNAUTHORIZED: 'Invalid or expired token.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    BAD_REQUEST: 'Bad request.',
    INTERNAL_ERROR: 'Internal server error.',
  },

  es: {
    EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    INVALID_CREDENTIALS: 'Credenciales inválidas.',
    UNAUTHORIZED: 'Token inválido o expirado.',
    FORBIDDEN: 'No tienes permiso para realizar esta acción.',
    BAD_REQUEST: 'Solicitud no válida.',
    INTERNAL_ERROR: 'Error interno del servidor.',
  },
}
