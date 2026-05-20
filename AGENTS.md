# AI Agents Context

> Este arquivo fornece contexto para ferramentas de IA (Cursor, GitHub Copilot, etc.)
> Para Claude Code, veja CLAUDE.md (mais completo).

## Projeto
Back-end REST API Spring Boot para disciplina universitária. Java 21, Spring Boot 3.4.5, PostgreSQL. Front-end React desacoplado.

## Pacote base
`com.materiais.instrucionais`

## Padrões importantes
- DTOs são Records Java imutáveis
- Service layer com `@Transactional`
- Controllers são `@RestController` (retornam JSON para front-end React)
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

Leia `docs/ARCHITECTURE.md` para detalhes arquiteturais.
