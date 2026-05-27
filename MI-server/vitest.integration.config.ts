// vitest.integration.config.ts — apenas testes de integração (requer PostgreSQL no ar)
// Variáveis de ambiente carregadas automaticamente de .env.test (ver .env.test.example)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './__tests__/setup.ts',
    include: ['__tests__/integration/**/*.test.ts'],
  },
})
