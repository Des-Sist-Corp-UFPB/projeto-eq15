#!/bin/sh
set -e

# Se DATABASE_URL chegar vazia (compose file antigo no servidor sem fallback),
# usa o valor padrão do banco do professor
if [ -z "$DATABASE_URL" ]; then
  DATABASE_URL="postgresql://eq15:63by1XpT9qZliNdQiB3Z@postgres:5432/eq15"
fi
export DATABASE_URL

# Garante que prisma.config.ts encontra DATABASE_URL mesmo sem .env no container
printf 'DATABASE_URL=%s\n' "$DATABASE_URL" > /api/.env

# Aplica migrations pendentes (idempotente — seguro rodar a cada inicialização)
npx prisma migrate deploy

rm -f /api/.env

# Inicia Nginx em background (frontend na porta 80)
nginx &

# Node vira o processo principal (API na porta 3333)
exec node /api/dist/server.js
