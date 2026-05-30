// src/env.ts
import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z
    .string()
    .min(8, 'ADMIN_PASSWORD must have at least 8 characters'),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_BLOCK_DURATION_SECONDS: z.coerce.number().default(900),

  // ── MinIO ──────────────────────────────────────────────────────────────────
  MINIO_ENDPOINT:   z.string().min(1).default('localhost'),
  MINIO_PORT:       z.coerce.number().default(9000),
  MINIO_USE_SSL:    z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_BUCKET:     z.string().min(1).default('materiais-instrucionais'),

  // ── Upload ─────────────────────────────────────────────────────────────────
  MI_MAX_FILE_SIZE_MB: z.coerce.number().default(50),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:')
  console.error(_env.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = _env.data
export type Env = typeof env
