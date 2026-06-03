// src/features/logs/hooks/useInspectionLogs.ts
import { useQuery } from '@tanstack/react-query'
import { listInspectionLogsRequest, type LogLevel, type LogDirection } from '../api/logsApi'

interface UseInspectionLogsParams {
  level?:     LogLevel
  direction?: LogDirection
  context?:   string
  requestId?: string
  page?:      number
  perPage?:   number
}

export function useInspectionLogs(params?: UseInspectionLogsParams) {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn:  () => listInspectionLogsRequest(params),
  })
}
