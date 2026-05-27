# Plataforma de Gestão de Materiais Instrucionais (MI) — Campus IV UFPB

> Sistema de curadoria, gestão e disseminação de Materiais Instrucionais para a comunidade acadêmica do Campus IV da UFPB, com enriquecimento de conteúdo via Inteligência Artificial.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura e Infraestrutura](#3-arquitetura-e-infraestrutura)
4. [Perfis e Permissões](#4-perfis-e-permissões)
5. [Inteligência Pedagógica e IA](#5-inteligência-pedagógica-e-ia)
6. [Gestão e Auditoria](#6-gestão-e-auditoria)
7. [Como Executar — Desenvolvimento](#7-como-executar--desenvolvimento)
8. [Como Executar — Produção](#8-como-executar--produção)
9. [CI/CD](#9-cicd)

---

## 1. Visão Geral

Esta plataforma centraliza, gerencia e dissemina **Materiais Instrucionais (MIs)** produzidos no **Campus IV da UFPB**. O sistema atende professores e toda a comunidade acadêmica, oferecendo:

- Curadoria pedagógica estruturada com fluxo de aprovação docente
- Busca semântica por significado e contexto nos documentos
- Enriquecimento automático de conteúdo via Inteligência Artificial
- Controle granular de acesso por perfil de usuário

---

## 2. Stack Tecnológica

| Camada              | Tecnologia                           |
| :------------------ | :----------------------------------- |
| **Frontend**        | React 19 + Vite + TypeScript         |
| **Backend / API**   | Node.js + Fastify + TypeScript       |
| **ORM**             | Prisma                               |
| **Banco de dados**  | PostgreSQL 16                        |
| **Filas / Jobs**    | BullMQ + Redis 7                     |
| **Busca Semântica** | Qdrant (Vector Database) — planejado |
| **Armazenamento**   | MinIO (dev) / AWS S3 (prod) — planejado |
| **Conteinerização** | Docker + Docker Compose              |
| **CI/CD**           | GitHub Actions + GHCR                |
| **Proxy (frontend)**| Nginx                                |

---

## 3. Arquitetura e Infraestrutura

```
Internet
  └── Nginx (porta 80)   ← Serve o React SPA
  └── API Fastify (porta 3333)
        ├── PostgreSQL (externo, porta 8115 em produção)
        └── Redis (interno via Docker)
```

- **Processamento Assíncrono:** Tarefas pesadas (tradução, vetorização, OCR) são delegadas a **Background Jobs** gerenciados com **BullMQ + Redis**, mantendo a API responsiva.
- **Busca Semântica (planejado):** **Qdrant** realizará indexação vetorial dos documentos, habilitando buscas por significado e contexto.
- **Armazenamento de arquivos (planejado):** **MinIO** no desenvolvimento com transição transparente para **AWS S3** em produção.

---

## 4. Perfis e Permissões

| Perfil                 | Permissões                                                                           |
| :--------------------- | :----------------------------------------------------------------------------------- |
| **Não Logado**         | Consulta e visualização de materiais públicos apenas.                                |
| **Usuário Logado**     | Consultas, favoritos, coleções personalizadas e interação com recursos de IA.        |
| **Institucionalizado** | Submissão de MIs para o fluxo de aprovação docente.                                  |
| **Professor / Admin**  | Upload direto, aprovação de submissões de terceiros e gestão completa de permissões. |

---

## 5. Inteligência Pedagógica e IA

- **Análise BNCC Computação:** Identificação automática das habilidades da BNCC de Computação contempladas pelo material.
- **Tradução Multilíngue:** Geração automatizada de resumos em **Inglês** e **Espanhol**, preservando a integridade técnica.
- **Observabilidade de IA:** Rastreio detalhado de consumo de tokens por usuário e por operação.
- **Modularidade:** Painel administrativo para habilitar ou desabilitar funcionalidades de IA sem redeploy.

---

## 6. Gestão e Auditoria

- **Fluxo de Aprovação Docente:** Revisão obrigatória por professores para todo material submetido por perfis institucionalizados.
- **Auditabilidade Total:** Logs completos — quem enviou, quem aprovou, quando e o que foi alterado.
- **Métricas de Engajamento:** Dashboard com estatísticas de consumo, termos mais buscados e ranking de MIs mais acessados.

---

## 7. Como Executar — Desenvolvimento

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Backend (MI-server)

```bash
cd MI-server

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores

# Subir PostgreSQL e Redis via Docker
docker compose up db redis -d

# Executar migrations e seed
npm run db:migrate
npm run db:seed

# Iniciar servidor em modo desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3333`.

### Frontend (front)

```bash
cd front

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite VITE_API_URL com o endereço da API

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## 8. Como Executar — Produção

O deploy é realizado automaticamente via GitHub Actions (ver seção CI/CD), mas também pode ser executado manualmente.

### Pré-requisitos no servidor

- Docker e Docker Compose instalados
- PostgreSQL rodando na porta `8115` com banco `eq15`

### Arquivo de ambiente

Crie `/opt/eq15/.env` no servidor com as seguintes variáveis:

```env
DATABASE_URL=postgresql://usuario:senha@host.docker.internal:8115/eq15
JWT_SECRET=segredo_forte_aqui
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
ADMIN_EMAIL=admin@dcx.ufpb.br
ADMIN_PASSWORD=senha_segura_aqui
LOGIN_MAX_ATTEMPTS=5
LOGIN_BLOCK_DURATION_SECONDS=900
API_IMAGE=ghcr.io/SEU_ORG/projeto-eq15-api:latest
WEB_IMAGE=ghcr.io/SEU_ORG/projeto-eq15-web:latest
```

### Subir os serviços

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

---

## 9. CI/CD

O pipeline é configurado em `.github/workflows/deploy.yml` e dispara automaticamente a cada push na branch `main`.

### Etapas

```
push → main
  ├── Job build
  │     ├── Build imagem da API  → push para GHCR
  │     └── Build imagem do Web  → push para GHCR
  └── Job deploy
        ├── Copia docker-compose.prod.yml para o servidor via SCP
        ├── SSH: cria .env, pull das imagens, docker compose up -d
        └── SSH: npx prisma migrate deploy
```

### Secrets necessários no GitHub

Cadastre em **Settings → Secrets and variables → Actions**:

| Secret            | Descrição                                                                 |
| :---------------- | :------------------------------------------------------------------------ |
| `SSH_DEPLOY_KEY`  | Chave SSH privada para acesso ao servidor                                 |
| `DEPLOY_HOST`     | IP ou hostname do servidor                                                |
| `DEPLOY_USER`     | Usuário SSH (ex: `ubuntu`)                                                |
| `DB_URL`          | URL completa do PostgreSQL: `postgresql://user:senha@host.docker.internal:8115/eq15` |
| `DB_USERNAME`     | Usuário do banco de dados                                                 |
| `DB_PASSWORD`     | Senha do banco de dados                                                   |
| `JWT_SECRET`      | Segredo forte para geração de tokens JWT                                  |
| `ADMIN_EMAIL`     | E-mail do usuário administrador inicial                                   |
| `ADMIN_PASSWORD`  | Senha do usuário administrador inicial                                    |
| `VITE_API_URL`    | URL da API acessível pelo browser (ex: `http://IP_DO_SERVIDOR:3333`)     |
