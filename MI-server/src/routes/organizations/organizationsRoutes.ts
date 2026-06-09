// src/routes/organizations/organizationsRoutes.ts
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { createOrganizationController }     from '../../controllers/organizations/createOrganizationController'
import { updateOrganizationController }     from '../../controllers/organizations/updateOrganizationController'
import { archiveOrganizationController }    from '../../controllers/organizations/archiveOrganizationController'
import { listMyOrganizationsController }    from '../../controllers/organizations/listMyOrganizationsController'
import { listOrgMembersController }         from '../../controllers/organizations/listOrgMembersController'
import { removeMemberController }           from '../../controllers/organizations/removeMemberController'
import { leaveOrganizationController }      from '../../controllers/organizations/leaveOrganizationController'
import { inviteUserController }             from '../../controllers/organizations/inviteUserController'
import { cancelInviteController }           from '../../controllers/organizations/cancelInviteController'
import { listMyInvitesController }          from '../../controllers/organizations/listMyInvitesController'
import { respondInviteController }          from '../../controllers/organizations/respondInviteController'
import { pendingInviteCountController }     from '../../controllers/organizations/pendingInviteCountController'
import { listOrgMaterialsController }       from '../../controllers/organizations/listOrgMaterialsController'

export async function organizationsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status:    'ok',
    module:    'organizations',
    timestamp: new Date().toISOString(),
  }))

  // ── Organizations CRUD ───────────────────────────────────────────────────────

  /** POST /organizations — cria organização (PROFESSOR, ADMIN) */
  app.post('/', { preHandler: [authenticate] }, createOrganizationController)

  /** GET /organizations/mine — lista organizações do usuário autenticado */
  app.get('/mine', { preHandler: [authenticate] }, listMyOrganizationsController)

  /** PUT /organizations/:orgId — edita nome/descrição (ADMIN da org) */
  app.put('/:orgId', { preHandler: [authenticate] }, updateOrganizationController)

  /** DELETE /organizations/:orgId — arquiva organização (ADMIN da org) */
  app.delete('/:orgId', { preHandler: [authenticate] }, archiveOrganizationController)

  // ── Members ──────────────────────────────────────────────────────────────────

  /** GET /organizations/:orgId/members — lista membros (qualquer membro da org) */
  app.get('/:orgId/members', { preHandler: [authenticate] }, listOrgMembersController)

  /** DELETE /organizations/:orgId/members/:userId — remove membro (ADMIN da org) */
  app.delete('/:orgId/members/:userId', { preHandler: [authenticate] }, removeMemberController)

  /** DELETE /organizations/:orgId/leave — usuário sai da organização */
  app.delete('/:orgId/leave', { preHandler: [authenticate] }, leaveOrganizationController)

  // ── Invites ──────────────────────────────────────────────────────────────────

  /** POST /organizations/:orgId/invites — convida usuário por e-mail (ADMIN/PROFESSOR da org) */
  app.post('/:orgId/invites', { preHandler: [authenticate] }, inviteUserController)

  /** DELETE /organizations/invites/:inviteId — cancela convite pendente (staff da org) */
  app.delete('/invites/:inviteId', { preHandler: [authenticate] }, cancelInviteController)

  /** GET /organizations/invites/mine — lista convites recebidos pelo usuário */
  app.get('/invites/mine', { preHandler: [authenticate] }, listMyInvitesController)

  /** GET /organizations/invites/pending-count — contagem de convites pendentes (para bell) */
  app.get('/invites/pending-count', { preHandler: [authenticate] }, pendingInviteCountController)

  /** PATCH /organizations/invites/:inviteId/respond — aceitar ou rejeitar convite */
  app.patch('/invites/:inviteId/respond', { preHandler: [authenticate] }, respondInviteController)

  // ── Materials ────────────────────────────────────────────────────────────────

  /** GET /organizations/:orgId/materials — lista MIs aprovados da organização (membros) */
  app.get('/:orgId/materials', { preHandler: [authenticate] }, listOrgMaterialsController)
}
