// src/repositories/organizations/orgMembersRepository.ts
import { type OrgMemberRole } from '@prisma/client'
import { prisma } from '../../database/prisma'
import type { OrgMemberDTO } from '../../@types/organizations'

export async function findMembership(
  organizationId: string,
  userId: string,
): Promise<{ id: string; role: OrgMemberRole } | null> {
  return prisma.organizationMember.findUnique({
    where:  { organizationId_userId: { organizationId, userId } },
    select: { id: true, role: true },
  })
}

export async function addMember(params: {
  organizationId: string
  userId:         string
  role:           OrgMemberRole
}): Promise<void> {
  await prisma.organizationMember.create({
    data: {
      organizationId: params.organizationId,
      userId:         params.userId,
      role:           params.role,
    },
  })
}

export async function removeMember(
  organizationId: string,
  userId: string,
): Promise<void> {
  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId, userId } },
  })
}

export async function listMembers(organizationId: string): Promise<OrgMemberDTO[]> {
  const rows = await prisma.organizationMember.findMany({
    where:   { organizationId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { joinedAt: 'asc' },
  })

  return rows.map(r => ({
    id:             r.id,
    organizationId: r.organizationId,
    userId:         r.userId,
    role:           r.role,
    joinedAt:       r.joinedAt,
    user:           r.user,
  }))
}
