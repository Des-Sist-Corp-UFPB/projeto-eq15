# Repositório de Materiais Instrucionais — UFPB Campus IV

Plataforma web para centralizar e disponibilizar materiais instrucionais de computação produzidos na **Universidade Federal da Paraíba — Campus IV**.

**Disciplina**: Desenvolvimento de Sistemas Corporativos | **Professor**: Rodrigo Rebouças | **UFPB — Campus IV**

---

## Sobre o Projeto

O sistema permite que professores e alunos da UFPB Campus IV publiquem e acessem materiais didáticos de computação — slides, apostilas e documentos — em um único lugar, de forma pública e organizada.

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21 + Spring Boot 3.4.5 |
| Frontend | React (JavaScript) |
| Banco | PostgreSQL 16 |
| Migrações | Flyway 11 |
| Segurança | Spring Security 6 |
| Build (back) | Maven 3.9 |
| Build (front) | Node.js / npm |
| CI/CD | GitHub Actions |

---

## Estrutura do Monorepo

```
projeto-eq15/
├── backend/                     # API Spring Boot
│   ├── src/main/java/br/ufpb/dsc/
│   │   ├── config/              # Configurações (Security, CORS, etc.)
│   │   ├── controller/          # Controllers REST
│   │   ├── domain/              # Entidades JPA
│   │   ├── dto/                 # Data Transfer Objects (Records)
│   │   ├── exception/           # Exceções de domínio
│   │   ├── repository/          # Interfaces Spring Data JPA
│   │   └── service/             # Lógica de negócio
│   ├── src/main/resources/
│   │   └── db/migration/        # Scripts Flyway (V1__, V2__, ...)
│   ├── docker/                  # Dockerfiles + docker-compose
│   └── pom.xml
├── frontend/                    # Aplicação React
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas da aplicação
│   │   └── services/            # Chamadas à API
│   └── package.json
└── .github/workflows/           # Pipelines CI/CD
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|------------|---------------|---------|
| Java (Temurin) | 21 | https://adoptium.net/temurin/releases/?version=21 |
| Maven | 3.9 | https://maven.apache.org/download.cgi |
| Node.js | 20 LTS | https://nodejs.org |
| Docker Desktop | 27+ | https://www.docker.com/products/docker-desktop/ |

**Verificar instalações:**
```bash
java -version   # deve mostrar 21.x.x
mvn -version    # deve mostrar 3.9.x
node -v         # deve mostrar v20.x.x
npm -v
docker -v       # deve mostrar 27.x.x
```

---

## Guia de Instalação

### 1. Clone o repositório

```bash
git clone <URL-DO-REPOSITÓRIO>
cd projeto-eq15
```

### 2. Suba o banco de dados

O PostgreSQL roda via Docker. Com o Docker Desktop em execução:

```bash
docker compose -f backend/docker/docker-compose.dev.yml up postgres adminer
```

### 3. Rode o backend

Em outro terminal:

```bash
cd backend
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

### 4. Rode o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou porta indicada pelo Vite).

---

## Acessos locais

| O que | Endereço |
|-------|----------|
| Frontend | http://localhost:5173 |
| API (backend) | http://localhost:8080/api |
| Adminer (banco) | http://localhost:8888 |
| Health check | http://localhost:8080/actuator/health |

---

## Rodando com Docker (tudo junto)

Para subir toda a stack de uma vez:

```bash
docker compose -f backend/docker/docker-compose.dev.yml up --build
```

---

## Testes

```bash
# Backend (requer Docker em execução — usa Testcontainers)
cd backend
mvn test

# Com relatório de cobertura (JaCoCo)
mvn verify
# Relatório: abra target/site/jacoco/index.html no browser
```

---

## Análise de Segurança

```bash
# SpotBugs + FindSecBugs + OWASP Dependency Check
cd backend
mvn verify -Psecurity

# Trivy: scan de vulnerabilidades no filesystem
docker compose -f backend/docker/docker-compose.dev.yml --profile scan up trivy
```

---

## CI/CD (GitHub Actions)

O pipeline em `.github/workflows/` executa automaticamente a cada `push` na branch `main`:

1. Testes do backend + análise SAST
2. Build da imagem Docker
3. Deploy no servidor da disciplina

### Secrets necessários no repositório GitHub

| Secret | Como obter |
|--------|-----------|
| `SSH_DEPLOY_KEY` | Disponível em https://gd.dsc.rodrigor.com (fornecida pelo professor) |
| `NVD_API_KEY` | Gratuito em https://nvd.nist.gov/developers/request-an-api-key |

Para adicionar: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

> Sem `NVD_API_KEY`, o OWASP Dependency Check pode demorar muito no CI. Configure assim que possível.

---

## Solução de Problemas

### "Port 8080 already in use"
```bash
# Windows (PowerShell)
netstat -ano | findstr :8080
taskkill /PID <número-do-pid> /F

# macOS / Linux
lsof -ti:8080 | xargs kill
```

### "Cannot connect to the Docker daemon"
O Docker Desktop não está em execução. Abra e aguarde inicializar.

### "Connection refused" ao banco de dados
O container PostgreSQL ainda não subiu. Verifique:
```bash
docker compose -f backend/docker/docker-compose.dev.yml ps
# "mercado-postgres-dev" deve estar com status "healthy"
```

### Flyway: "Found non-empty schema(s) with no schema history table"
```bash
docker compose -f backend/docker/docker-compose.dev.yml down -v
docker compose -f backend/docker/docker-compose.dev.yml up postgres
```

### Erro de compilação Java
```bash
mvn -version
# "Java version:" deve mostrar 21.x.x
# Se não mostrar, configure JAVA_HOME apontando para o Java 21
```

---

## Convenções

- Commits no padrão **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`
- Nomes de entidades e endpoints em português
- Nunca editar migrations Flyway já aplicadas — sempre criar uma nova (`V2__`, `V3__`, ...)
- Records Java para DTOs
- `@Transactional(readOnly = true)` em métodos de consulta

Veja `docs/CONVENTIONS.md` para detalhes completos.
