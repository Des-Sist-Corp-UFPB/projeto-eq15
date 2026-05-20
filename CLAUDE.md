# Memória do Projeto — DSC/UFPB

## Identidade do Projeto
- **Nome**: Materiais Instrucionais (nome a definir posteriormente) — Projeto para disciplina de DSC (desenvolvimento de sistemas corporativos)
- **Disciplina**: Desenvolvimento de Sistemas Corporativos
- **Professor**: Rodrigo Rebouças
- **Instituição**: Universidade Federal da Paraíba — Campus IV

## Stack Técnica
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Linguagem | Java | 21 |
| Framework | Spring Boot | 3.4.5 |
| Build | Maven | 3.9+ |
| Banco | PostgreSQL | 16 |
| Migrations | Flyway | 11.x |
| Segurança | Spring Security | 6.x |
| Testes | JUnit 5 + Testcontainers | - |

> **Arquitetura**: Back-end REST API desacoplado. O front-end em React consome a API.

## Estrutura de Pacotes
```
com.materiais.instrucionais.demo
├── config/          # Configurações Spring (Security, Web, etc.)
├── controller/      # Controllers REST (@RestController)
├── domain/          # Entidades JPA (mapeamento objeto-relacional)
├── dto/             # Data Transfer Objects (Records Java)
├── exception/       # Exceções de domínio
├── repository/      # Interfaces Spring Data JPA
└── service/         # Lógica de negócio (@Transactional)
```

## Comandos Essenciais

### Desenvolvimento
```bash
# Subir ambiente completo (banco + app + adminer)
docker compose -f docker/docker-compose.dev.yml up

# Só o banco (para rodar a app localmente com mvn)
docker compose -f docker/docker-compose.dev.yml up postgres adminer

# Rodar aplicação local (perfil dev)
mvn spring-boot:run

# Rodar testes (requer Docker para Testcontainers)
mvn test
```

### Build e Verificações
```bash
# Build sem testes
mvn clean package -DskipTests

# Build com testes
mvn clean verify

# SAST: SpotBugs + FindSecBugs + OWASP Dependency Check
mvn verify -Psecurity

# Verificar dependências desatualizadas
mvn versions:display-dependency-updates -Pversions

# Trivy local (scan filesystem)
docker compose -f docker/docker-compose.dev.yml --profile scan up trivy

# Trivy scan da imagem (depois de fazer o build)
docker build -f docker/Dockerfile -t materiais-instrucionais:latest .
docker run --rm aquasec/trivy image materiais-instrucionais:latest
```

### Produção
```bash
# Build imagem de produção
docker build -f docker/Dockerfile -t materiais-instrucionais:latest .

# Subir produção (requer .env configurado)
docker compose -f docker/docker-compose.prod.yml up -d
```

## Acesso Local
- **API**: http://localhost:8080
- **Adminer (DB UI)**: http://localhost:8888
- **Health Check**: http://localhost:8080/actuator/health

## Decisões Arquiteturais

### Por que REST API desacoplada em vez de Thymeleaf?
O front-end em React consome a API via HTTP. Essa separação permite evolução independente de front e back, times distintos e melhor escalabilidade.

### Por que Flyway para migrations?
Controle versionado do schema do banco. Cada alteração no banco deve ser uma migration nova (nunca editar migrations já aplicadas). Garante rastreabilidade e reversibilidade.

### Por que perfil 'security' separado?
SpotBugs e OWASP Dependency-Check são lentos. Separar em perfil permite que o build do dia-a-dia seja rápido, rodando segurança no CI.

## Convenções de Código
- Nomes em português no domínio (entidades, métodos de negócio)
- Endpoints REST em português
- Comentários em português
- Commits no padrão Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Records Java para DTOs (imutáveis por padrão)
- `@Transactional(readOnly = true)` em métodos de consulta

## Ferramentas de Segurança
| Ferramenta | Escopo | Comando |
|------------|--------|---------|
| SpotBugs + FindSecBugs | SAST bytecode Java | `mvn verify -Psecurity` |
| Semgrep | SAST código-fonte | `semgrep --config=auto src/` |
| Trivy (fs) | Vulnerabilidades em libs | docker compose `--profile scan` |
| Trivy (image) | Vulnerabilidades na imagem Docker | `trivy image materiais-instrucionais:latest` |
| OWASP Dependency-Check | CVEs em dependências | `mvn verify -Psecurity` |

# AI Agents Context

## Projeto
Back-end REST API Spring Boot para disciplina universitária. Java 21, Spring Boot 3.4.5, PostgreSQL. Front-end React desacoplado.

## Pacote base
`com.materiais.instrucionais`

## Padrões importantes
- DTOs são Records Java imutáveis
- Service layer com `@Transactional`
- Controllers são `@RestController` (retornam JSON)
- Projeto é um back-end REST API consumido por front-end React
- Migrations de banco via Flyway em `src/main/resources/db/migration/`
- Variáveis de ambiente para configuração de produção (`.env`)
- NUNCA commitar `.env` ou senhas

## Comandos rápidos
```bash
mvn spring-boot:run                    # rodar local
mvn test                               # testes (requer Docker)
mvn verify -Psecurity                  # SAST + CVE check
docker compose -f docker/docker-compose.dev.yml up  # ambiente completo
```
