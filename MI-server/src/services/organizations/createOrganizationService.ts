// src/services/organizations/createOrganizationService.ts
import type { OrganizationDTO } from '../../@types/organizations'
import { createOrganization } from '../../repositories/organizations/createOrganizationRepository'
import { createAuditLog } from '../../repositories/audit/auditRepository'
import { validateRequest } from '../../utils/validateRequest'
import { createOrganizationSchema } from '../../schemas/organizations/createOrganizationSchema'
import { logger } from '../../lib/logger'

export async function createOrganizationService(input: unknown): Promise<OrganizationDTO> {
  logger.info('IN - createOrganizationService')

  const { name, description, createdById } = validateRequest(input, createOrganizationSchema)

  const org = await createOrganization({ name, description, createdById })

  await createAuditLog({
    actorId:  createdById,
    targetId: org.id,
    action:   'ORGANIZATION_CREATED',
    metadata: { name: org.name },
  })

  logger.info('OUT - createOrganizationService')

  return org
}
