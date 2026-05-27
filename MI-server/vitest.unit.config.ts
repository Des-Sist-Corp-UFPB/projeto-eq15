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
      // Vars exigidas pelo env.ts — valores fictícios seguros para testes unitários
      // (nenhum teste unitário faz chamadas reais a banco ou JWT)
      DATABASE_URL: 'postgresql://unit-test:unit-test@localhost:5432/unit_test',
      JWT_SECRET: 'unit-test-secret-key-at-least-32-chars',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      ADMIN_EMAIL: 'admin@unit-test.com',
      ADMIN_PASSWORD: 'unit-test-admin-password',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['src/server.ts'],
    },
  },
})
