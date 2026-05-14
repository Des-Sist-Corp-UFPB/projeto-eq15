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
7. [Como Executar](#7-como-executar)

---

## 1. Visão Geral

Esta plataforma centraliza, gerencia e dissemina **Materiais Instrucionais (MIs)** produzidos no **Campus IV da UFPB**. O sistema atende professores e toda a comunidade acadêmica, oferecendo:

- Curadoria pedagógica estruturada com fluxo de aprovação docente
- Busca semântica por significado e contexto nos documentos
- Enriquecimento automático de conteúdo via Inteligência Artificial
- Controle granular de acesso por perfil de usuário

---

## 2. Stack Tecnológica

| Camada              | Tecnologia                  |
| :------------------ | :-------------------------- |
| **Frontend**        | React                       |
| **Backend / API**   | Spring Boot (Java)          |
| **Armazenamento**   | MinIO (dev) / AWS S3 (prod) |
| **Busca Semântica** | Qdrant (Vector Database)    |
| **Filas / Jobs**    | Redis                       |
| **Conteinerização** | Docker / Docker Compose     |

---

## 3. Arquitetura e Infraestrutura

O projeto adota uma arquitetura moderna e escalável, projetada para alta disponibilidade:

- **Armazenamento Híbrido:** Persistência de arquivos em **MinIO** no ambiente de desenvolvimento, com transição transparente para **AWS S3** em produção — sem alterações no código da aplicação.
- **Motor de Busca Semântica:** **Qdrant** realiza indexação vetorial dos documentos, habilitando buscas por significado e contexto, além de leitura profunda de PDFs.
- **Processamento Assíncrono:** Tarefas pesadas (tradução, vetorização, OCR) são delegadas a **Background Jobs** gerenciados com **Redis**, mantendo a API Spring Boot estável e responsiva.

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

A plataforma integra capacidades de IA para suporte pedagógico e operacional:

- **Análise BNCC Computação:** Identificação automática das habilidades da BNCC de Computação contempladas pelo material, a partir da leitura do PDF.
- **Tradução Multilíngue:** Geração automatizada de resumos dos MIs em **Inglês** e **Espanhol**, preservando a integridade do conteúdo técnico.
- **Observabilidade de IA:** Rastreio detalhado de consumo de tokens por usuário e por operação, para controle rigoroso de custos.
- **Modularidade:** Painel administrativo para habilitar ou desabilitar funcionalidades de IA globalmente, sem necessidade de redeploy.

---

## 6. Gestão e Auditoria

Foco na integridade e transparência dos processos acadêmicos:

- **Fluxo de Aprovação Docente:** Revisão obrigatória por professores para garantir a qualidade de todo material submetido por perfis institucionalizados.
- **Auditabilidade Total:** Registro de logs completos — quem enviou, quem aprovou, quando e o que foi alterado — assegurando a rastreabilidade acadêmica.
- **Métricas de Engajamento:** Dashboard administrativo com estatísticas de consumo, termos de busca mais frequentes e ranking dos MIs mais acessados.

---

## 7. Como Executar

> Pré-requisitos: **Docker** e **Docker Compose** instalados.

```bash
# a definir
```

A documentação detalhada de variáveis de ambiente e configuração de cada serviço será disponibilizada conforme o desenvolvimento avança.

---

1. Visão Geral
   Sistema de gestão e disseminação de Materiais Instrucionais (MIs) produzidos pelo Campus IV da UFPB, para todos os professores, focado na curadoria acadêmica e no enriquecimento de conteúdos via Inteligência Artificial.
2. Arquitetura e Infraestrutura
   Armazenamento Híbrido: Persistência de arquivos em MinIO (Desenvolvimento) com transição transparente para AWS S3 (Produção).
   Motor de Busca Semântica: Utilização do Qdrant para indexação vetorial, permitindo buscas por significado e contexto, além de leitura profunda de documentos.
   Orquestração e Deploy: Ambiente totalmente conteinerizado com Docker e roteamento/proxy reverso via Nginx.
   Processamento Assíncrono: Gerenciamento de tarefas pesadas (tradução, vetorização, OCR) via Background Jobs (BullMQ/Redis) para garantir a estabilidade da API Fastify.
3. Matriz de Acessos e Perfis

4. Inteligência Pedagógica e IA
   Motor de Tradução Multilíngue: Tradução de resumos de MIs para Inglês e Espanhol, mantendo a integridade do conteúdo técnico.
   Observabilidade de IA: Rastreio detalhado de consumo de tokens por usuário e por operação para controle de custos.
   Modularidade: Capacidade de habilitar ou desabilitar funções globalmente via painel administrativo.
5. Gestão e Auditoria
   Fluxo de Aprovação Docente: Garantia de qualidade através da revisão obrigatória de professores para submissões institucionais.
   Auditabilidade Total: Registro de logs (quem subiu, quem aprovou, quando foi alterado) para assegurar a integridade acadêmica.
   Métricas de Engajamento: Dashboard administrativo com estatísticas de consumo, buscas mais frequentes e MIs mais acessados.
