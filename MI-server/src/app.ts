// src/app.ts
import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyMultipart from '@fastify/multipart'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from '@fastify/type-provider-zod'
import { env } from './env'
import { errorHandler } from './errors/errorHandler'
import { authRoutes } from './routes/auth/authRoutes'
import { usersRoutes } from './routes/users/usersRoutes'
import { misRoutes } from './routes/mis/misRoutes'

export function buildApp() {
  const app = fastify({
    logger:
      env.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
          }
        : env.NODE_ENV === 'test'
          ? false
          : true,
  }).withTypeProvider<ZodTypeProvider>()

  // ── Compiladores Zod ─────────────────────────────────────────────────────────
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // ── Plugins globais ──────────────────────────────────────────────────────────
  app.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  })

  app.register(fastifyCookie)

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
  })

  app.register(fastifyRateLimit, {
    global: false,
    // Configuração por rota via { config: { rateLimit: { max, timeWindow } } }
  })

  // Plugin de multipart/form-data (upload de arquivos)
  // O limite de tamanho por arquivo é definido aqui; rotas específicas podem
  // sobrescrever o bodyLimit do Fastify via opção de rota.
  app.register(fastifyMultipart, {
    limits: {
      files:    1,                                             // máx. 1 arquivo por request
      fileSize: env.MI_MAX_FILE_SIZE_MB * 1024 * 1024,        // limite em bytes
      fields:   5,                                             // máx. 5 campos de texto
    },
  })

  // ── Rota raiz de health ──────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    service: 'MI-server',
    timestamp: new Date().toISOString(),
  }))

  // ── Rotas de domínio ─────────────────────────────────────────────────────────
  app.register(authRoutes, { prefix: '/auth' })
  app.register(usersRoutes, { prefix: '/users' })
  app.register(misRoutes, { prefix: '/mis' })

  // ── Handler global de erros ──────────────────────────────────────────────────
  app.setErrorHandler(errorHandler)

  return app
}
