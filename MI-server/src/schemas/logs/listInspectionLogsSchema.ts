// src/schemas/logs/listInspectionLogsSchema.ts
import { z } from 'zod'

export const listInspectionLogsSchema = z.object({
  level:     z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).optional(),
  direction: z.enum(['IN', 'OUT', 'ERROR']).optional(),
  context:   z.string().optional(),
  requestId: z.string().optional(),
  page:      z.coerce.number().min(1).default(1),
  perPage:   z.coerce.number().min(1).max(100).default(50),
})

export type ListInspectionLogsQuery = z.infer<typeof listInspectionLogsSchema>
