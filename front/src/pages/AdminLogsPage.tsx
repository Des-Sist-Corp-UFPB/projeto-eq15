// src/pages/AdminLogsPage.tsx
import { useState } from 'react'
import {
  ScrollText,
  AlertCircle, RefreshCw, Loader2, ChevronDown, ChevronRight, Search, X,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useInspectionLogs } from '../features/logs/hooks/useInspectionLogs'
import { getApiErrorMessage } from '../lib/apiError'
import type { LogLevel, LogDirection, InspectionLog } from '../features/logs/api/logsApi'

// ── Estilos por nível e direção ───────────────────────────────────────────────

const LEVEL_STYLE: Record<LogLevel, string> = {
  DEBUG: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  INFO:  'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  WARN:  'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  ERROR: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

const DIRECTION_STYLE: Record<LogDirection, string> = {
  IN:    'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  OUT:   'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  ERROR: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(iso))
}

// ── LogRow ────────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: InspectionLog }) {
  const [expanded, setExpanded] = useState(false)
  const hasPayload = log.payload !== null && log.payload !== undefined

  return (
    <div className={[
      'rounded-xl border transition-colors',
      log.level === 'ERROR'
        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30'
        : log.level === 'WARN'
          ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
    ].join(' ')}>

      {/* Linha principal */}
      <div className="flex items-start gap-3 px-4 py-3">

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-mono font-bold ${LEVEL_STYLE[log.level]}`}>
            {log.level}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-mono ${DIRECTION_STYLE[log.direction]}`}>
            {log.direction}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {log.context}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            req: {log.requestId}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(log.createdAt)}
          </p>
        </div>

        {/* Toggle payload */}
        {hasPayload && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="shrink-0 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400
                       hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1.5 py-1"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            payload
          </button>
        )}
      </div>

      {/* Payload JSON expandido */}
      {expanded && hasPayload && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <pre className="text-xs font-mono text-gray-700 dark:text-gray-300
                          bg-gray-50 dark:bg-gray-950 rounded-lg p-3
                          overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── AdminLogsPage ─────────────────────────────────────────────────────────────

const LEVELS:     (LogLevel | '')[]     = ['', 'DEBUG', 'INFO', 'WARN', 'ERROR']
const DIRECTIONS: (LogDirection | '')[] = ['', 'IN', 'OUT', 'ERROR']

export function AdminLogsPage() {
  const [level,     setLevel]     = useState<LogLevel | ''>('')
  const [direction, setDirection] = useState<LogDirection | ''>('')
  const [context,   setContext]   = useState('')
  const [requestId, setRequestId] = useState('')
  const [page,      setPage]      = useState(1)

  const params = {
    level:     level     || undefined,
    direction: direction || undefined,
    context:   context   || undefined,
    requestId: requestId || undefined,
    page,
    perPage: 50,
  }

  const { data, isLoading, isError, error, refetch } = useInspectionLogs(params)

  function handleFilter() {
    setPage(1)
  }

  function handleClear() {
    setLevel('')
    setDirection('')
    setContext('')
    setRequestId('')
    setPage(1)
  }

  const logs  = data?.logs  ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 50)
  const hasFilters = level || direction || context || requestId

  return (
    <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Cabeçalho */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ScrollText size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Logs de Inspeção
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rastreio de ciclo de vida das requisições HTTP da plataforma.
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex flex-wrap gap-3">

              {/* Nível */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nível</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as LogLevel | '')}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                             text-sm text-gray-900 dark:text-gray-100 px-3 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l}>{l || 'Todos'}</option>
                  ))}
                </select>
              </div>

              {/* Direção */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Direção</label>
                <select
                  value={direction}
                  onChange={e => setDirection(e.target.value as LogDirection | '')}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                             text-sm text-gray-900 dark:text-gray-100 px-3 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DIRECTIONS.map(d => (
                    <option key={d} value={d}>{d || 'Todas'}</option>
                  ))}
                </select>
              </div>

              {/* Context */}
              <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Context</label>
                <input
                  type="text"
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="ex: createUserController"
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                             text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                             px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Request ID */}
              <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Request ID</label>
                <input
                  type="text"
                  value={requestId}
                  onChange={e => setRequestId(e.target.value)}
                  placeholder="ex: req-1"
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                             text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                             px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Botões de filtro */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleFilter(); refetch() }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700
                           text-white px-3 py-1.5 text-sm font-medium transition-colors
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Search size={14} /> Filtrar
              </button>
              {hasFilters && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 text-sm transition-colors"
                >
                  <X size={14} /> Limpar
                </button>
              )}
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 text-sm transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
            </div>
          )}

          {/* Erro */}
          {isError && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="rounded-full bg-red-50 dark:bg-red-950 p-4">
                <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Falha ao carregar os logs
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getApiErrorMessage(error)}</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={14} /> Tentar novamente
              </button>
            </div>
          )}

          {/* Logs */}
          {!isLoading && !isError && (
            <div className="space-y-4">

              {/* Contador + paginação */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {total === 0
                    ? 'Nenhum log encontrado'
                    : `${total} ${total === 1 ? 'log encontrado' : 'logs encontrados'} — página ${page} de ${Math.max(1, totalPages)}`}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                                 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs disabled:opacity-40 transition-colors
                                 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {page}/{totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                                 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs disabled:opacity-40 transition-colors
                                 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>

              {/* Lista de logs */}
              {logs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <ScrollText size={32} className="text-gray-300 dark:text-gray-700" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhum log encontrado para os filtros aplicados.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => <LogRow key={log.id} log={log} />)}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Campus IV · UFPB — Rio Tinto / Mamanguape
          </p>
        </div>
    </AppShell>
  )
}
