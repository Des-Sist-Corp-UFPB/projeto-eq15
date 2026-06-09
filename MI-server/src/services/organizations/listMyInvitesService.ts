// src/services/organizations/listMyInvitesService.ts
import type { OrgInviteDTO } from '../../@types/organizations'
import { listMyInvites } from '../../repositories/organizations/orgInvitesRepository'
import { validateRequest } from '../../utils/validateRequest'
import { z } from 'zod'
import { logger } from '../../lib/logger'

const listMyInvitesSchema = z.object({
  userId: z.string().uuid(),
})

export async function listMyInvitesService(input: unknown): Promise<OrgInviteDTO[]> {
  logger.info('IN - listMyInvitesService')

  const { userId } = validateRequest(input, listMyInvitesSchema)
  const invites = await listMyInvites(userId)

  logger.info('OUT - listMyInvitesService')
  return invites
}
