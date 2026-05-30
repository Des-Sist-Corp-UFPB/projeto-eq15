// src/controllers/mis/misController.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { uploadMIService } from '../../services/mis/misService'
import { httpResponse, httpError } from '../../utils/http'
import { ERRORS, buildError } from '../../lib/errors/errors'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { logger } from '../../lib/logger'

/**
 * POST /mis
 *
 * Aceita `multipart/form-data` com:
 *   - file  : arquivo PDF (obrigatório, campo "file")
 *   - title : título do material (opcional — padrão: nome do arquivo sem extensão)
 *
 * Middlewares aplicados na rota:
 *   preHandler: [authenticate, requireUploadPermission]
 */
export async function uploadMIController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const ctx = 'uploadMIController'
  logger.info(`IN - ${ctx}`)

  try {
    // ── Parsear o multipart ──────────────────────────────────────────────────
    let title:            string | undefined
    let fileBuffer:       Buffer | null = null
    let originalFileName: string | null = null
    let mimeType:         string | null = null

    for await (const part of request.parts()) {
      if (part.type === 'field') {
        if (part.fieldname === 'title') {
          title = String(part.value).trim()
        }
      } else {
        // type === 'file'
        if (part.fieldname === 'file') {
          originalFileName = part.filename
          mimeType         = part.mimetype

          // Coleta o stream em memória — limite de tamanho aplicado pelo plugin
          const chunks: Buffer[] = []
          for await (const chunk of part.file) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          fileBuffer = Buffer.concat(chunks)
        } else {
          // Consome partes de arquivo inesperadas para não bloquear o stream
          part.file.resume()
        }
      }
    }

    // ── Validações de presença ───────────────────────────────────────────────
    if (!fileBuffer || !originalFileName || !mimeType) {
      throw new GeneralErrorResponse(buildError(ERRORS.MI.INVALID_FILE_TYPE))
    }

    // Título padrão: nome do arquivo sem a extensão .pdf
    const resolvedTitle = title?.length
      ? title
      : originalFileName.replace(/\.pdf$/i, '').trim() || originalFileName

    // ── Delegar ao service ───────────────────────────────────────────────────
    const mi = await uploadMIService({
      title:            resolvedTitle,
      buffer:           fileBuffer,
      originalFileName,
      mimeType,
      uploadedById:     request.user.sub,
    })

    httpResponse({ reply, statusCode: 201, data: mi, context: ctx })
  } catch (error) {
    httpError({ error, context: ctx })
  }
}
