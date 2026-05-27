// src/errors/errorHandler.ts
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { GeneralErrorResponse } from './GeneralErrorResponse'

export function errorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.status(422).send({
      status: 'error',
      message: 'Validation error',
      issues: error.flatten().fieldErrors,
    })
    return
  }

  if (error instanceof GeneralErrorResponse) {
    reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
      code: error.code,
    })
    return
  }

  console.error(error)
  reply.status(500).send({
    status: 'error',
    message: 'Internal server error',
  })
}
