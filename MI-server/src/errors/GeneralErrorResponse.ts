// src/errors/GeneralErrorResponse.ts

/** Parâmetros aceitos pelo construtor — produzidos por buildError() */
export interface ErrorParams {
  message: string
  statusCode: number
  code: string
}

export class GeneralErrorResponse extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor({ message, statusCode = 400, code = 'BAD_REQUEST' }: ErrorParams) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'GeneralErrorResponse'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
