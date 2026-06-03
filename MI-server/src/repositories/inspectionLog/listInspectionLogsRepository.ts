// src/repositories/inspectionLog/listInspectionLogsRepository.ts
import { type InspectionLogLevel, type InspectionLogDirection, type Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma'

export interface InspectionLogDTO {
  id: string
  requestId: string
  level: InspectionLogLevel
  context: string
  direction: InspectionLogDirection
  payload: Prisma.JsonValue
  createdAt: Date
}

export interface ListInspectionLogsParams {
  level?:     InspectionLogLevel
  direction?: InspectionLogDirection
  context?:   string
  requestId?: string
  page:       number
  perPage:    number
}

export interface ListInspectionLogsResult {
  logs:    InspectionLogDTO[]
  total:   number
  page:    number
  perPage: number
}

const LOG_SELECT = {
  id:        true,
  requestId: true,
  level:     true,
  context:   true,
  direction: true,
  payload:   true,
  createdAt: true,
} as const

export async function findInspectionLogs(
  params: ListInspectionLogsParams,
): Promise<ListInspectionLogsResult> {
  const { level, direction, context, requestId, page, perPage } = params

  const where: Prisma.InspectionLogWhereInput = {}

  if (level)     where.level     = level
  if (direction) where.direction = direction
  if (requestId) where.requestId = requestId
  if (context)   where.context   = { contains: context, mode: 'insensitive' }

  const [logs, total] = await prisma.$transaction([
    prisma.inspectionLog.findMany({
      where,
      select:  LOG_SELECT,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.inspectionLog.count({ where }),
  ])

  return { logs, total, page, perPage }
}
