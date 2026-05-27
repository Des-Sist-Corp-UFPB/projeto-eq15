// vitest.unit.config.ts — apenas testes unitários (sem DB, sem globalSetup)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/unit/**/*.test.ts'],
    // Sem globalSetup — testes unitários não precisam de banco de dados
    env: {
      NODE_ENV: 'test',
      BCRYPT_SALT_ROUNDS: '4',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['src/server.ts'],
    },
  },
})
