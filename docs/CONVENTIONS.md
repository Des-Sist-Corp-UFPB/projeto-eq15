# Convenções do Projeto

## Estrutura de Migrations Flyway

```
V{número}__{descrição_com_underscores}.sql
V1__criar_tabela_produto.sql
V2__adicionar_indice_preco.sql
V3__criar_tabela_categoria.sql
```

- Nunca editar uma migration já commitada
- Descrição em português, snake_case
- Incrementar o número sequencialmente

## Conventional Commits

```
feat: adicionar filtro por categoria de produto
fix: corrigir cálculo de desconto no preço
docs: atualizar README com instruções de deploy
refactor: extrair validação de preço para método privado
test: adicionar teste de integração para ProdutoService
chore: atualizar dependências do pom.xml
```

## Nomenclatura Java

| Elemento | Convenção | Exemplo |
|---|---|---|
| Package | lowercase | `br.ufpb.dsc.mercado.service` |
| Classe | PascalCase | `ProdutoService` |
| Método | camelCase | `buscarPorId()` |
| Constante | UPPER_SNAKE | `MAX_NOME_LENGTH` |
| Variável | camelCase | `produtoForm` |

## Validação

- DTOs usam Bean Validation (`@NotBlank`, `@Size`, etc.)
- Controller usa `@Valid` e `BindingResult`
- Erros de validação retornam fragment com mensagens Bootstrap

## Segurança — Boas Práticas

- Nunca concatenar strings em queries JPA (use parâmetros nomeados)
- Variáveis sensíveis em `.env` (nunca hardcoded)
