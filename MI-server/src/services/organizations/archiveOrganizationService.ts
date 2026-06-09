// src/services/organizations/archiveOrganizationService.ts
import type { OrganizationDTO } from '../../@types/organizations'
import { findOrgById, archiveOrg } from '../../repositories/organizations/orgRepository'
import { findMembership } from '../../repositories/organizations/orgMembersRepository'
import { validateRequest } from '../../utils/validateRequest'
import { z } from 'zod'
import { ERRORS, buildError } from '../../lib/errors/errors'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { StatusCode } from '../../utils/statusCode'
import { logger } from '../../lib/logger'

const archiveOrganizationSchema = z.object({
  orgId:             z.string().uuid(),
  requestingUserId:  z.string().uuid(),
})

export async function archiveOrganizationService(input: unknown): Promise<OrganizationDTO> {
  logger.info('IN - archiveOrganizationService')

  const { orgId, requestingUserId } = validateRequest(input, archiveOrganizationSchema)

  const org = await findOrgById(orgId)
  if (!org) throw new GeneralErrorResponse(StatusCode.NOT_FOUND, buildError(ERRORS.ORG.ORG_NOT_FOUND))
  if (org.status === 'ARCHIVED') throw new GeneralErrorResponse(StatusCode.BAD_REQUEST, buildError(ERRORS.ORG.ORG_ARCHIVED))

  const membership = await findMembership(orgId, requestingUserId)
  if (membership?.role !== 'ADMIN') throw new GeneralErrorResponse(StatusCode.FORBIDDEN, buildError(ERRORS.ORG.ORG_NOT_STAFF))

  const archived = await archiveOrg(orgId)

  logger.info('OUT - archiveOrganizationService')
  return archived
}
