// src/repositories/inspectionLog/inspectionLogRepository.ts
import { type InspectionLogDirection, type InspectionLogLevel, type Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma'

export interface CreateInspectionLogParams {
  requestId: string
  level?: InspectionLogLevel
  context: string
  direction: InspectionLogDirection
  payload?: Record<string, unknown>
}

export async function createInspectionLog(
  params: CreateInspectionLogParams,
): Promise<void> {
  await prisma.inspectionLog.create({
    data: {
      requestId: params.requestId,
      level: params.level ?? 'INFO',
      context: params.context,
      direction: params.direction,
      payload: params.payload as Prisma.InputJsonValue | undefined,
    },
  })
}
