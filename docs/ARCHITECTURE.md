# Arquitetura do Sistema

## Visão Geral

```
Front-end
  │
  ▼
Controller (Spring MVC)
  │  Recebe requests HTTP, valida DTOs, delega ao Service
  ▼
Service (@Transactional)
  │  Lógica de negócio, orquestra operações
  ▼
Repository (Spring Data JPA)
  │  Abstração do banco, queries automáticas
  ▼
PostgreSQL
```

## Flyway: Gerenciamento de Schema

```
V1__criar_tabela_produto.sql  ← aplicado na 1ª inicialização
V2__adicionar_campo_xxx.sql   ← aplicado quando adicionado (NÃO editar V1!)
```

**Regra de ouro**: Nunca edite uma migration já aplicada. Crie sempre uma nova.

## Camadas

### Controller
- Recebe requisição HTTP
- Valida DTO com `@Valid`
- Chama Service
- NÃO contém lógica de negócio

### Service
- Anotado com `@Service` e `@Transactional`
- Contém toda a lógica de negócio
- Lança exceções de domínio
- Usa Repository para persistência

### Repository
- Interface que estende `JpaRepository`
- Queries derivadas do nome do método (Spring Data)
- Para queries complexas: `@Query` com JPQL

### Domain (Entidade)
- Classe JPA mapeada para tabela do banco
- NÃO deve conter lógica de negócio complexa
- `@PrePersist`/`@PreUpdate` para auditorias automáticas
