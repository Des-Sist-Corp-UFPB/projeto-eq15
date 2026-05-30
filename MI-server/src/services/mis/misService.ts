// src/services/mis/misService.ts
import { randomUUID } from 'node:crypto'
import { minioClient, MINIO_BUCKET } from '../../lib/minio'
import { findUserById } from '../../repositories/users/usersRepository'
import { createMI } from '../../repositories/mis/misRepository'
import { ERRORS, buildError } from '../../lib/errors/errors'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { env } from '../../env'
import type { UploadMIInput, UploadedMIDTO } from '../../@types/mis'

// ── Constantes de validação ────────────────────────────────────────────────────

/** Magic bytes do PDF: %PDF (0x25 0x50 0x44 0x46) */
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46])

const ALLOWED_MIME_TYPE = 'application/pdf'

function maxFileSizeBytes(): number {
  return env.MI_MAX_FILE_SIZE_MB * 1024 * 1024
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Sanitiza o nome do usuário para ser usado como parte da chave MinIO.
 * Remove acentos, substitui espaços e caracteres especiais por hífen.
 *
 * Exemplos:
 *   "João Silva"  → "joao-silva"
 *   "Prof. María" → "prof--maria"  (normalizado → "prof-maria" after trim)
 */
function sanitizeForStorageKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos (acentos)
    .replace(/[^a-z0-9]/g, '-')      // não-alfanumérico → hífen
    .replace(/-+/g, '-')             // múltiplos hífens consecutivos → um
    .replace(/^-|-$/g, '')           // trim hífens nas extremidades
}

/**
 * Valida que o buffer é um PDF legítimo:
 *  1. Verifica os magic bytes (%PDF) — defesa contra MIME spoofing
 *  2. Verifica que o tamanho não excede o limite configurado
 */
function validatePDFBuffer(buffer: Buffer): void {
  if (buffer.length > maxFileSizeBytes()) {
    throw new GeneralErrorResponse(buildError(ERRORS.MI.FILE_TOO_LARGE))
  }

  const magic = buffer.subarray(0, 4)
  if (!magic.equals(PDF_MAGIC)) {
    throw new GeneralErrorResponse(buildError(ERRORS.MI.INVALID_FILE_TYPE))
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Fluxo completo de upload de um Material Instrucional:
 *  1. Busca o nome do usuário no banco (para compor a chave MinIO)
 *  2. Valida o buffer (magic bytes + tamanho)
 *  3. Gera a chave do objeto: {nome-sanitizado}_{userId}_{uuid}.pdf
 *  4. Faz upload do buffer para o MinIO
 *  5. Persiste os metadados no banco
 *  6. Retorna o DTO do MI criado
 */
export async function uploadMIService(input: UploadMIInput): Promise<UploadedMIDTO> {
  const { title, buffer, originalFileName, mimeType, uploadedById } = input

  // 1. Validação de MIME type (client-side header)
  if (mimeType !== ALLOWED_MIME_TYPE) {
    throw new GeneralErrorResponse(buildError(ERRORS.MI.INVALID_FILE_TYPE))
  }

  // 2. Buscar nome do uploader para compor a chave MinIO
  const uploader = await findUserById(uploadedById)
  if (!uploader) {
    // Edge case: usuário autenticado mas removido do banco entre a autenticação e o upload
    throw new GeneralErrorResponse(buildError(ERRORS.GENERAL.INTERNAL_ERROR))
  }

  // 3. Validar conteúdo do buffer (magic bytes + tamanho)
  validatePDFBuffer(buffer)

  // 4. Gerar chave do objeto no MinIO:  {nome}_{id}_{uuid}.pdf
  const sanitizedName = sanitizeForStorageKey(uploader.name)
  const storageKey = `${sanitizedName}_${uploadedById}_${randomUUID()}.pdf`

  // 5. Upload para o MinIO
  try {
    await minioClient.putObject(
      MINIO_BUCKET,
      storageKey,
      buffer,
      buffer.length,
      { 'Content-Type': ALLOWED_MIME_TYPE },
    )
  } catch (cause) {
    // Isola erros de infraestrutura MinIO para não vazar detalhes internos
    throw new GeneralErrorResponse(buildError(ERRORS.MI.UPLOAD_FAILED))
  }

  // 6. Persistir metadados no banco
  const mi = await createMI({
    title,
    originalFileName,
    storageKey,
    mimeType,
    sizeBytes: buffer.length,
    uploadedById,
  })

  return mi
}
