# Relatório de Avaliação — EQ15 (DSC)

| | |
|---|---|
| **Data** | 2026-06-25 |
| **Repositório** | https://github.com/des-sist-corp-ufpb/projeto-eq15 |
| **Aplicação** | https://eq15.dsc.rodrigor.com |
| **Período de atividade** | 2026-06-25 → 2026-06-25 |
| **Total de commits** (sem merges) | 2 |
| **Integrantes** | Ryan Pereira De Souza (@ryanpsouzaa) |

---

## 1. Tecnologias

- Stack não identificada automaticamente

---

## 2. Análise Funcional

### Endpoints REST

Não detectados automaticamente.

### Entidades / Tabelas (10 encontradas)

- `User (via migration.sql)`
- `RefreshToken (via migration.sql)`
- `AuditLog (via migration.sql)`
- `MaterialInstrucional (via migration.sql)`
- `InspectionLog (via migration.sql)`
- `Organization (via migration.sql)`
- `OrganizationMember (via migration.sql)`
- `OrganizationInvite (via migration.sql)`
- `MaterialInstrucionalOrganization (via migration.sql)`
- `EmailVerificationToken (via migration.sql)`

---

## 3. Análise Arquitetural

| Aspecto | Status | Observação |
|---------|--------|-----------|
| Arquitetura em camadas | ❌ | controller=❌  service=❌  repository=❌ |
| Testes automatizados | ❌ | 0 arquivo(s) de teste |
| Migrations versionadas | ❌ | não encontradas |
| Logging | ❌ | não detectado |
| Autenticação / Segurança | ❌ | não detectado |
| DTOs / Separação de dados | ❌ | não detectado |
| Tratamento global de exceções | ❌ | não detectado |
| Documentação de API (OpenAPI) | ❌ | não detectado |
| Variáveis de ambiente | ❌ | não detectado |
| Dockerfile / docker-compose | ✅ | presente |

---

## 4. Contribuição por Usuário

### Resumo

| Usuário | Commits | % commits | Linhas adicionadas | Linhas no código atual | % código atual |
|---------|---------|-----------|-------------------|----------------------|----------------|
| Ryan Pereira De Souza (@ryanpsouzaa) | 2 | 100% | 32.022 | 19.402 | 100% |

### Contribuição por Camada

| Camada | Total linhas | Ryan Pereira De Souza (@ryanpsouzaa) |
|--------|-------------|---------|
| Controller | 4.684 | 100% |
| Frontend | 940 | 100% |
| Migration | 251 | 100% |
| Repository | 510 | 100% |
| Service | 4.156 | 100% |

---

## 5. Contribuição por Funcionalidade

Baseado em `git blame` nos arquivos de controller e service.

| Arquivo | Total linhas | Ryan Pereira De Souza (@ryanpsouzaa) |
|---------|-------------|---------|
| `authService.test.ts` | 384 | 100% |
| `authController.test.ts` | 379 | 100% |
| `materialPdfChatService.ts` | 310 | 100% |
| `inviteUserService.test.ts` | 304 | 100% |
| `respondInviteService.test.ts` | 284 | 100% |
| `usersService.test.ts` | 282 | 100% |
| `setUserAsProfessorService.test.ts` | 270 | 100% |
| `setUserAsProfessorController.test.ts` | 268 | 100% |
| `removeMemberService.test.ts` | 234 | 100% |
| `createOrganizationService.test.ts` | 222 | 100% |
| `createOrganizationController.test.ts` | 217 | 100% |
| `usersController.test.ts` | 215 | 100% |
| `updateOrganizationService.test.ts` | 208 | 100% |
| `Router.tsx` | 195 | 100% |
| `cancelInviteService.test.ts` | 180 | 100% |
| `listOrgMembersService.test.ts` | 179 | 100% |
| `archiveOrganizationService.test.ts` | 169 | 100% |
| `leaveOrganizationService.test.ts` | 166 | 100% |
| `listUsersController.test.ts` | 151 | 100% |
| `listUsersService.test.ts` | 151 | 100% |
| `ResourceCard.tsx` | 151 | 100% |
| `materialPdfUploadRoutes.ts` | 139 | 100% |
| `emailVerificationService.ts` | 135 | 100% |
| `authController.ts` | 125 | 100% |
| `materialPdfUploadService.ts` | 121 | 100% |
| `listMyOrganizationsService.test.ts` | 121 | 100% |
| `materialPdfChatController.ts` | 105 | 100% |
| `listMyInvitesService.test.ts` | 104 | 100% |
| `materialPdfUploadController.ts` | 103 | 100% |
| `authService.ts` | 97 | 100% |
| `setUserAsProfessorController.ts` | 89 | 100% |
| `createOrganizationController.ts` | 89 | 100% |
| `pendingInviteCountService.test.ts` | 89 | 100% |
| `uploadOrgMaterialController.ts` | 87 | 100% |
| `archiveOrganizationController.ts` | 85 | 100% |
| `usersService.ts` | 81 | 100% |
| `organizationsRoutes.ts` | 76 | 100% |
| `usersController.ts` | 75 | 100% |
| `updateOrganizationController.ts` | 69 | 100% |
| `materialPdfPresignedUrlService.ts` | 68 | 100% |
| `inviteUserController.ts` | 64 | 100% |
| `respondInviteController.ts` | 64 | 100% |
| `index.ts` | 63 | 100% |
| `removeMemberController.ts` | 63 | 100% |
| `listOrgMaterialsController.ts` | 62 | 100% |
| `listOrgMembersController.ts` | 62 | 100% |
| `materialPdfAllListRepository.ts` | 61 | 100% |
| `cancelInviteController.ts` | 59 | 100% |
| `leaveOrganizationController.ts` | 59 | 100% |
| `listMyInvitesController.ts` | 57 | 100% |
| `listMyOrganizationsController.ts` | 56 | 100% |
| `inviteUserService.ts` | 52 | 100% |
| `materialPdfPendingListRepository.ts` | 51 | 100% |
| `materialPdfPresignedUrlController.ts` | 50 | 100% |
| `materialPdfReviewController.ts` | 47 | 100% |
| `respondInviteService.ts` | 46 | 100% |
| `materialPdfReviewService.ts` | 46 | 100% |
| `usersRoutes.ts` | 46 | 100% |
| `setUserAsProfessorService.ts` | 45 | 100% |
| `materialPdfListByUserController.ts` | 44 | 100% |
| `materialPdfPublicPresignedUrlController.ts` | 43 | 100% |
| `materialPdfUploadRepository.ts` | 40 | 100% |
| `materialPdfPendingListController.ts` | 40 | 100% |
| `removeMemberService.ts` | 39 | 100% |
| `materialPdfReviewPresignedUrlController.ts` | 38 | 100% |
| `createOrganizationService.ts` | 36 | 100% |
| `materialPdfAllListController.ts` | 36 | 100% |
| `emailVerificationController.ts` | 36 | 100% |
| `listInspectionLogsController.ts` | 35 | 100% |
| `listUsersController.ts` | 35 | 100% |
| `authRoutes.ts` | 35 | 100% |
| `cancelInviteService.ts` | 34 | 100% |
| `leaveOrganizationService.ts` | 34 | 100% |
| `listOrgMaterialsService.ts` | 33 | 100% |
| `listOrgMembersService.ts` | 33 | 100% |
| `updateOrganizationService.ts` | 30 | 100% |
| `materialPdfPublicListController.ts` | 30 | 100% |
| `archiveOrganizationService.ts` | 27 | 100% |
| `materialPdfReviewRepository.ts` | 27 | 100% |
| `materialPdfListByUserRepository.ts` | 24 | 100% |
| `materialPdfViewRepository.ts` | 23 | 100% |
| `pendingInviteCountController.ts` | 22 | 100% |
| `logsRoutes.ts` | 22 | 100% |
| `listMyInvitesService.ts` | 21 | 100% |
| `listMyOrganizationsService.ts` | 20 | 100% |
| `pendingInviteCountService.ts` | 20 | 100% |
| `materialPdfListByUserService.ts` | 20 | 100% |
| `materialPdfAllListService.ts` | 19 | 100% |
| `materialPdfPublicListService.ts` | 18 | 100% |
| `materialPdfReviewSchema.ts` | 16 | 100% |
| `materialPdfChatRepository.ts` | 16 | 100% |
| `materialPdfChatSchema.ts` | 14 | 100% |
| `materialPdfPendingListService.ts` | 14 | 100% |
| `listInspectionLogsService.ts` | 13 | 100% |
| `listUsersService.ts` | 13 | 100% |
| `materialPdfPresignedUrlSchema.ts` | 10 | 100% |

---

*Relatório gerado automaticamente em 2026-06-25.*
*Os dados de contribuição são baseados em `git log --numstat` (linhas adicionadas) e `git blame` (linhas no código atual), excluindo commits de merge.*