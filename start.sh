#!/bin/sh
set -e

# Aplica migrations pendentes (idempotente — seguro rodar a cada inicialização)
npx prisma migrate deploy

# Inicia Nginx em background (frontend na porta 80)
nginx &

# Node vira o processo principal (API na porta 3333)
exec node /api/dist/server.js
