// src/lib/errors/errorMessages.ts
// Mensagens de erro centralizadas com suporte a pt-BR, en-US e es

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
  | 'INVALID_VERIFICATION_TOKEN'
  // ── Upload / MI ───────────────────────────────────────────────────────────
  | 'UPLOAD_NOT_ALLOWED'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'MI_NOT_FOUND'
  | 'MI_NOT_OWNED_BY_USER'
  | 'MI_NOT_PENDING'
  // ── Organizações ──────────────────────────────────────────────────────────
  | 'ORG_NOT_FOUND'
  | 'ORG_ARCHIVED'
  | 'ORG_NOT_MEMBER'
  | 'ORG_ALREADY_MEMBER'
  | 'ORG_NOT_STAFF'
  | 'INVITE_NOT_FOUND'
  | 'INVITE_NOT_PENDING'
  | 'INVITE_ALREADY_PENDING'
  | 'INVITE_ONLY_INSTITUTIONAL'
  // ── Genéricos ─────────────────────────────────────────────────────────────
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'MISSING_ID'
  | 'INVALID_ID_FORMAT'

export const errorMessages: Record<Language, Record<ErrorMessageKey, string>> = {
  'pt-BR': {
    EMAIL_ALREADY_EXISTS:     'E-mail já cadastrado.',
    USER_NOT_FOUND:           'Usuário não encontrado.',
    INVALID_CREDENTIALS:      'Credenciais inválidas.',
    UNAUTHORIZED:             'Token inválido ou expirado.',
    FORBIDDEN:                'Você não tem permissão para realizar esta ação.',
    ACCOUNT_SUSPENDED:        'Conta suspensa. Entre em contato com o suporte.',
    EMAIL_NOT_VERIFIED:       'E-mail institucional ainda não verificado. Aguarde a confirmação.',
    INVALID_VERIFICATION_TOKEN: 'Link de verificação inválido ou expirado.',
    UPLOAD_NOT_ALLOWED:       'Seu perfil não possui permissão para realizar uploads.',
    INVALID_FILE_TYPE:        'Apenas arquivos PDF são aceitos.',
    FILE_TOO_LARGE:           'O arquivo excede o tamanho máximo permitido.',
    UPLOAD_FAILED:            'Falha ao armazenar o arquivo. Tente novamente.',
    MI_NOT_FOUND:             'Material instrucional não encontrado.',
    MI_NOT_OWNED_BY_USER:     'Este material não pertence ao usuário solicitante.',
    MI_NOT_PENDING:           'Este material não está pendente de revisão.',
    ORG_NOT_FOUND:            'Organização não encontrada.',
    ORG_ARCHIVED:             'Esta organização está arquivada.',
    ORG_NOT_MEMBER:           'Você não é membro desta organização.',
    ORG_ALREADY_MEMBER:       'Usuário já é membro desta organização.',
    ORG_NOT_STAFF:            'Você não tem permissão de staff nesta organização.',
    INVITE_NOT_FOUND:         'Convite não encontrado.',
    INVITE_NOT_PENDING:       'Este convite não está mais pendente.',
    INVITE_ALREADY_PENDING:   'Já existe um convite pendente para este usuário nesta organização.',
    INVITE_ONLY_INSTITUTIONAL: 'Apenas usuários com e-mail @dcx.ufpb.br podem receber convites.',
    BAD_REQUEST:              'Requisição inválida.',
    INTERNAL_ERROR:           'Erro interno do servidor.',
    MISSING_ID:               'O identificador é obrigatório.',
    INVALID_ID_FORMAT:        'O identificador informado está em formato inválido. Esperado: UUID v4.',
  },

  'en-US': {
    EMAIL_ALREADY_EXISTS:     'Email already registered.',
    USER_NOT_FOUND:           'User not found.',
    INVALID_CREDENTIALS:      'Invalid credentials.',
    UNAUTHORIZED:             'Invalid or expired token.',
    FORBIDDEN:                'You do not have permission to perform this action.',
    ACCOUNT_SUSPENDED:        'Account suspended. Please contact support.',
    EMAIL_NOT_VERIFIED:       'Institutional email not yet verified. Please wait for confirmation.',
    INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification link.',
    UPLOAD_NOT_ALLOWED:       'Your profile does not have upload permission.',
    INVALID_FILE_TYPE:        'Only PDF files are accepted.',
    FILE_TOO_LARGE:           'The file exceeds the maximum allowed size.',
    UPLOAD_FAILED:            'Failed to store the file. Please try again.',
    MI_NOT_FOUND:             'Instructional material not found.',
    MI_NOT_OWNED_BY_USER:     'This material does not belong to the requesting user.',
    MI_NOT_PENDING:           'This material is not pending review.',
    ORG_NOT_FOUND:            'Organization not found.',
    ORG_ARCHIVED:             'This organization is archived.',
    ORG_NOT_MEMBER:           'You are not a member of this organization.',
    ORG_ALREADY_MEMBER:       'User is already a member of this organization.',
    ORG_NOT_STAFF:            'You do not have staff permissions in this organization.',
    INVITE_NOT_FOUND:         'Invite not found.',
    INVITE_NOT_PENDING:       'This invite is no longer pending.',
    INVITE_ALREADY_PENDING:   'A pending invite already exists for this user in this organization.',
    INVITE_ONLY_INSTITUTIONAL: 'Only users with @dcx.ufpb.br email can receive invites.',
    BAD_REQUEST:              'Bad request.',
    INTERNAL_ERROR:           'Internal server error.',
    MISSING_ID:               'The identifier is required.',
    INVALID_ID_FORMAT:        'The provided identifier has an invalid format. Expected: UUID v4.',
  },

  es: {
    EMAIL_ALREADY_EXISTS:     'El correo electrónico ya está registrado.',
    USER_NOT_FOUND:           'Usuario no encontrado.',
    INVALID_CREDENTIALS:      'Credenciales inválidas.',
    UNAUTHORIZED:             'Token inválido o expirado.',
    FORBIDDEN:                'No tienes permiso para realizar esta acción.',
    ACCOUNT_SUSPENDED:        'Cuenta suspendida. Contacta con el soporte.',
    EMAIL_NOT_VERIFIED:       'Correo institucional aún no verificado. Espera la confirmación.',
    INVALID_VERIFICATION_TOKEN: 'Enlace de verificación inválido o expirado.',
    UPLOAD_NOT_ALLOWED:       'Tu perfil no tiene permiso para subir archivos.',
    INVALID_FILE_TYPE:        'Solo se aceptan archivos PDF.',
    FILE_TOO_LARGE:           'El archivo supera el tamaño máximo permitido.',
    UPLOAD_FAILED:            'Error al almacenar el archivo. Inténtalo de nuevo.',
    MI_NOT_FOUND:             'Material instruccional no encontrado.',
    MI_NOT_OWNED_BY_USER:     'Este material no pertenece al usuario solicitante.',
    MI_NOT_PENDING:           'Este material no está pendiente de revisión.',
    ORG_NOT_FOUND:            'Organización no encontrada.',
    ORG_ARCHIVED:             'Esta organización está archivada.',
    ORG_NOT_MEMBER:           'No eres miembro de esta organización.',
    ORG_ALREADY_MEMBER:       'El usuario ya es miembro de esta organización.',
    ORG_NOT_STAFF:            'No tienes permisos de staff en esta organización.',
    INVITE_NOT_FOUND:         'Invitación no encontrada.',
    INVITE_NOT_PENDING:       'Esta invitación ya no está pendiente.',
    INVITE_ALREADY_PENDING:   'Ya existe una invitación pendiente para este usuario en esta organización.',
    INVITE_ONLY_INSTITUTIONAL: 'Solo usuarios con correo @dcx.ufpb.br pueden recibir invitaciones.',
    BAD_REQUEST:              'Solicitud no válida.',
    INTERNAL_ERROR:           'Error interno del servidor.',
    MISSING_ID:               'El identificador es obligatorio.',
    INVALID_ID_FORMAT:        'El identificador proporcionado tiene un formato inválido. Se esperaba: UUID v4.',
  },
}
