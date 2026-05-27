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
  | 'ACCOUNT_SUSPENDED'
  | 'EMAIL_NOT_VERIFIED'
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
    ACCOUNT_SUSPENDED: 'Conta suspensa. Entre em contato com o suporte.',
    EMAIL_NOT_VERIFIED: 'E-mail institucional ainda não verificado. Aguarde a confirmação.',
    BAD_REQUEST: 'Requisição inválida.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
  },

  'en-US': {
    EMAIL_ALREADY_EXISTS: 'Email already registered.',
    USER_NOT_FOUND: 'User not found.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    UNAUTHORIZED: 'Invalid or expired token.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    ACCOUNT_SUSPENDED: 'Account suspended. Please contact support.',
    EMAIL_NOT_VERIFIED: 'Institutional email not yet verified. Please wait for confirmation.',
    BAD_REQUEST: 'Bad request.',
    INTERNAL_ERROR: 'Internal server error.',
  },

  es: {
    EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    INVALID_CREDENTIALS: 'Credenciales inválidas.',
    UNAUTHORIZED: 'Token inválido o expirado.',
    FORBIDDEN: 'No tienes permiso para realizar esta acción.',
    ACCOUNT_SUSPENDED: 'Cuenta suspendida. Contacta con el soporte.',
    EMAIL_NOT_VERIFIED: 'Correo institucional aún no verificado. Espera la confirmación.',
    BAD_REQUEST: 'Solicitud no válida.',
    INTERNAL_ERROR: 'Error interno del servidor.',
  },
}
