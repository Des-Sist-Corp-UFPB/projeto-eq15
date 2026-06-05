# ── Stage 1: Build da API ─────────────────────────────────────────────────────
FROM node:22-alpine AS api-builder
WORKDIR /api

COPY MI-server/package*.json ./
COPY MI-server/prisma ./prisma/
COPY MI-server/prisma.config.ts ./
RUN npm ci
RUN npx prisma generate

COPY MI-server/ .
RUN npm run build

# ── Stage 2: Build do frontend ────────────────────────────────────────────────
FROM node:20-alpine AS web-builder
WORKDIR /web

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY front/package*.json ./
RUN npm ci

COPY front/ .
RUN npm run build

# ── Stage 3: Produção ─────────────────────────────────────────────────────────
FROM node:22-alpine AS production
ENV NODE_ENV=production

# ── MinIO — credenciais do servidor do professor para o projeto eq15 ───────────
ENV MINIO_ENDPOINT=minio
ENV MINIO_PORT=9000
ENV MINIO_USE_SSL=false
ENV MINIO_ACCESS_KEY=eq15
ENV MINIO_SECRET_KEY=jnR1KLVogOewyJis2oU0Yrg4
ENV MINIO_BUCKET=eq15
ENV MINIO_REGION=us-east-1
# Endpoint público: usado apenas para gerar URLs pré-assinadas acessíveis pelo browser
ENV MINIO_PUBLIC_ENDPOINT=s3.dsc.rodrigor.com
ENV MINIO_PUBLIC_USE_SSL=true

# ── Defaults mínimos — sobrescrever no servidor com valores reais ──────────────
ENV DATABASE_URL=postgresql://eq15:63by1XpT9qZliNdQiB3Z@postgres:5432/eq15
ENV JWT_SECRET=placeholder-configure-no-servidor-com-valor-real
ENV ADMIN_EMAIL=admin@dcx.ufpb.br
ENV ADMIN_PASSWORD=placeholder123456
ENV APP_URL=https://eq15.dsc.rodrigor.com

RUN apk add --no-cache nginx

WORKDIR /api

# Dependências de produção da API + client do Prisma
COPY MI-server/package*.json ./
COPY MI-server/prisma ./prisma/
COPY MI-server/prisma.config.ts ./
RUN npm ci --omit=dev && npx prisma generate

# Artefatos compilados da API
COPY --from=api-builder /api/dist ./dist

# Frontend estático servido pelo Nginx na porta 80
COPY --from=web-builder /web/dist /usr/share/nginx/html
# Alpine nginx usa http.d/, não conf.d/
RUN mkdir -p /etc/nginx/http.d
COPY front/nginx.conf /etc/nginx/http.d/default.conf

# Script de inicialização dos dois processos
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
