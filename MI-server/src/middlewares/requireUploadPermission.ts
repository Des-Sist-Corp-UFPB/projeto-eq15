// src/middlewares/requireUploadPermission.ts
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ERRORS, buildError } from '../lib/errors/errors'
import { GeneralErrorResponse } from '../errors/GeneralErrorResponse'

/**
 * Garante que o usuário autenticado possua a flag `canUpload = true`.
 * Deve ser usado APÓS o middleware `authenticate`.
 *
 * Lança 403 UPLOAD_NOT_ALLOWED se a permissão não for concedida.
 */
export async function requireUploadPermission(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user.canUpload) {
    throw new GeneralErrorResponse(buildError(ERRORS.ERRORS_RESOURCES.UPLOAD_NOT_ALLOWED))
  }
}
