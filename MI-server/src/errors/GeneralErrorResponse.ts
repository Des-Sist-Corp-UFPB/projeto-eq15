// src/errors/GeneralErrorResponse.ts
export class GeneralErrorResponse extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'GeneralErrorResponse'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
