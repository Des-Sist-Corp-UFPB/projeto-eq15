// src/lib/logger.ts
// Logger de console global usando pino diretamente (independente do Fastify)
import pino from 'pino'

const env = process.env.NODE_ENV ?? 'development'

export const logger = pino({
  level: env === 'test' ? 'silent' : env === 'production' ? 'info' : 'debug',

  transport:
    env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})
