// src/services/resources/materials/pdf/materialPdfUploadService.ts
import { randomUUID } from 'node:crypto'
import { minioClient, MINIO_BUCKET } from '../../../../lib/minio'
import { findUserById } from '../../../../repositories/users/usersRepository'
import { createMaterialPdf } from '../../../../repositories/resources/materials/pdf/materialPdfUploadRepository'
import { findMembership } from '../../../../repositories/organizations/orgMembersRepository'
import { linkMaterialToOrgs } from '../../../../repositories/organizations/orgRepository'
import { ERRORS, buildError } from '../../../../lib/errors/errors'
import { GeneralErrorResponse } from '../../../../errors/GeneralErrorResponse'
import { StatusCode } from '../../../../utils/statusCode'
import { env } from '../../../../env'
import type { UploadMIInput, IUploadedMI } from '../../../../@types/resources/materials/pdf'

// ── Constantes de validação ────────────────────────────────────────────────────

/** Magic bytes do PDF: %PDF (0x25 0x50 0x44 0x46) */
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46])

const ALLOWED_MIME_TYPE = 'application/pdf'

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Fluxo completo de upload de um Material Instrucional em PDF:
 *  1. Busca o nome do usuário no banco (para compor a chave MinIO)
 *  2. Valida o buffer (magic bytes + tamanho)
 *  3. Gera a chave do objeto: {nome-sanitizado}_{userId}_{uuid}.pdf
 *  4. Faz upload do buffer para o MinIO
 *  5. Persiste os metadados no banco
 *  6. Retorna o DTO do material criado
 */
export async function materialPdfUploadService(input: UploadMIInput): Promise<IUploadedMI> {
  const { title, buffer, originalFileName, mimeType, uploadedById, organizationIds = [] } = input

  if (mimeType !== ALLOWED_MIME_TYPE) {
    throw new GeneralErrorResponse(StatusCode.UNSUPPORTED_MEDIA_TYPE, buildError(ERRORS.ERRORS_RESOURCES.INVALID_FILE_TYPE))
  }

  const uploader = await findUserById(uploadedById)
  if (!uploader) {
    throw new GeneralErrorResponse(StatusCode.INTERNAL_SERVER_ERROR, buildError(ERRORS.GENERAL.INTERNAL_ERROR))
  }

  validatePDFBuffer(buffer)

  const sanitizedName = sanitizeForStorageKey(uploader.name)
  const storageKey = `${sanitizedName}_${uploadedById}_${randomUUID()}.pdf`

  try {
    await minioClient.putObject(
      MINIO_BUCKET,
      storageKey,
      buffer,
      buffer.length,
      { 'Content-Type': ALLOWED_MIME_TYPE },
    )
  } catch (cause) {
    throw new GeneralErrorResponse(StatusCode.INTERNAL_SERVER_ERROR, buildError(ERRORS.ERRORS_RESOURCES.UPLOAD_FAILED))
  }

  // Validate uploader is a member of each specified org before linking
  if (organizationIds.length > 0) {
    for (const orgId of organizationIds) {
      const membership = await findMembership(orgId, uploadedById)
      if (!membership) {
        throw new GeneralErrorResponse(StatusCode.FORBIDDEN, buildError(ERRORS.ORG.ORG_NOT_MEMBER))
      }
    }
  }

  const mi = await createMaterialPdf({
    title,
    originalFileName,
    storageKey,
    mimeType,
    sizeBytes: buffer.length,
    uploadedById,
  })

  if (organizationIds.length > 0) {
    await linkMaterialToOrgs(mi.id, organizationIds)
  }

  return mi
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function maxFileSizeBytes(): number {
  return env.MI_MAX_FILE_SIZE_MB * 1024 * 1024
}

/**
 * Sanitiza o nome do usuário para ser usado como parte da chave MinIO.
 * Remove acentos, substitui espaços e caracteres especiais por hífen.
 */
function sanitizeForStorageKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Valida que o buffer é um PDF legítimo:
 *  1. Verifica os magic bytes (%PDF) — defesa contra MIME spoofing
 *  2. Verifica que o tamanho não excede o limite configurado
 */
function validatePDFBuffer(buffer: Buffer): void {
  if (buffer.length > maxFileSizeBytes()) {
    throw new GeneralErrorResponse(StatusCode.PAYLOAD_TOO_LARGE, buildError(ERRORS.ERRORS_RESOURCES.FILE_TOO_LARGE))
  }

  const magic = buffer.subarray(0, 4)
  if (!magic.equals(PDF_MAGIC)) {
    throw new GeneralErrorResponse(StatusCode.UNSUPPORTED_MEDIA_TYPE, buildError(ERRORS.ERRORS_RESOURCES.INVALID_FILE_TYPE))
  }
}
