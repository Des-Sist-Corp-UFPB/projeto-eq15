#!/bin/sh
set -e

# ── Fallbacks para quando o servidor não tem ~/app/.env configurado ────────────
# Infraestrutura do professor (valores fixos do projeto eq15)
[ -z "$DATABASE_URL"          ] && DATABASE_URL="postgresql://eq15:63by1XpT9qZliNdQiB3Z@postgres:5432/eq15"
[ -z "$MINIO_ACCESS_KEY"      ] && MINIO_ACCESS_KEY="eq15"
[ -z "$MINIO_SECRET_KEY"      ] && MINIO_SECRET_KEY="jnR1KLVogOewyJis2oU0Yrg4"
[ -z "$MINIO_ENDPOINT"        ] && MINIO_ENDPOINT="minio"
[ -z "$MINIO_PORT"            ] && MINIO_PORT="9000"
[ -z "$MINIO_USE_SSL"         ] && MINIO_USE_SSL="false"
[ -z "$MINIO_BUCKET"          ] && MINIO_BUCKET="eq15"
[ -z "$MINIO_REGION"          ] && MINIO_REGION="us-east-1"
[ -z "$MINIO_PUBLIC_ENDPOINT" ] && MINIO_PUBLIC_ENDPOINT="s3.dsc.rodrigor.com"
[ -z "$MINIO_PUBLIC_USE_SSL"  ] && MINIO_PUBLIC_USE_SSL="true"
[ -z "$APP_URL"               ] && APP_URL="https://eq15.dsc.rodrigor.com"

# ATENÇÃO: defina estes três em ~/app/.env no servidor com valores reais e seguros
[ -z "$JWT_SECRET"      ] && JWT_SECRET="default-insecure-jwt-secret-troque-no-servidor"
[ -z "$ADMIN_EMAIL"     ] && ADMIN_EMAIL="e976c9b666e640a28e59495904f6a24b@dcx.ufpb.br"
[ -z "$ADMIN_PASSWORD"  ] && ADMIN_PASSWORD="56c57894-9f5d-48e1-ab40-734efeb0e7af"

export DATABASE_URL MINIO_ACCESS_KEY MINIO_SECRET_KEY MINIO_ENDPOINT MINIO_PORT \
       MINIO_USE_SSL MINIO_BUCKET MINIO_REGION MINIO_PUBLIC_ENDPOINT MINIO_PUBLIC_USE_SSL \
       APP_URL JWT_SECRET ADMIN_EMAIL ADMIN_PASSWORD

# Escreve .env temporário para o prisma.config.ts encontrar DATABASE_URL
printf 'DATABASE_URL=%s\n' "$DATABASE_URL" > /api/.env

# Aplica migrations pendentes (idempotente — seguro rodar a cada inicialização)
npx prisma migrate deploy

# Cria o admin inicial se ainda não existir (idempotente)
node /api/dist/seed.js

rm -f /api/.env

# Inicia Nginx em background (frontend na porta 80)
nginx &

# Node vira o processo principal (API na porta 3333)
exec node /api/dist/server.js
