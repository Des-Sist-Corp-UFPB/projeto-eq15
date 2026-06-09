// src/schemas/organizations/respondInviteSchema.ts
import { z } from 'zod'

export const respondInviteSchema = z.object({
  inviteId: z.string().uuid(),
  userId:   z.string().uuid(),
  action:   z.enum(['ACCEPT', 'REJECT']),
})

export type RespondInviteInput = z.infer<typeof respondInviteSchema>
