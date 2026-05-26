// prisma.config.ts — Prisma 7 datasource configuration
import { defineConfig } from 'prisma/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter(env) {
      const pool = new pg.Pool({
        connectionString: env['DATABASE_URL'] as string,
      })
      return new PrismaPg(pool)
    },
  },
})
