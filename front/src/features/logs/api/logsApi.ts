// src/features/logs/api/logsApi.ts
import { api } from '../../../lib/api'

export type LogLevel     = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
export type LogDirection = 'IN' | 'OUT' | 'ERROR'

export interface InspectionLog {
  id:        string
  requestId: string
  level:     LogLevel
  context:   string
  direction: LogDirection
  payload:   unknown
  createdAt: string
}

export interface ListLogsResponse {
  logs:    InspectionLog[]
  total:   number
  page:    number
  perPage: number
}

export async function listInspectionLogsRequest(params?: {
  level?:     LogLevel
  direction?: LogDirection
  context?:   string
  requestId?: string
  page?:      number
  perPage?:   number
}): Promise<ListLogsResponse> {
  const query = new URLSearchParams()
  if (params?.level)     query.append('level',     params.level)
  if (params?.direction) query.append('direction', params.direction)
  if (params?.context)   query.append('context',   params.context)
  if (params?.requestId) query.append('requestId', params.requestId)
  if (params?.page)      query.append('page',      String(params.page))
  if (params?.perPage)   query.append('perPage',   String(params.perPage))
  const { data } = await api.get<ListLogsResponse>(`/logs?${query}`)
  return data
}
