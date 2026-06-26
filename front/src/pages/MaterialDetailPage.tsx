// src/pages/MaterialDetailPage.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, ExternalLink, AlertCircle, RefreshCw, Loader2,
  Clock, CheckCircle2, XCircle, User, HardDrive, Calendar, Sparkles,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { HabilidadesBncc } from '../components/HabilidadesBncc'
import { useAuth } from '../context/AuthContext'
import { canUseAiChat } from '../lib/permissions'
import { useMaterial } from '../features/materials/hooks/useMaterial'
import {
  getReviewPresignedUrlRequest,
  getPublicPresignedUrlRequest,
  getMaterialPresignedUrlRequest,
} from '../features/materials/api/materialsApi'
import { getApiErrorMessage } from '../lib/apiError'
import type { MIStatus, PendingMaterial } from '../features/materials/api/materialsApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const STATUS_CONFIG: Record<MIStatus, { label: string; icon: React.ElementType; classes: string }> = {
  PENDING_REVIEW: {
    label:   'Aguardando revisão',
    icon:    Clock,
    classes: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  APPROVED: {
    label:   'Aprovado',
    icon:    CheckCircle2,
    classes: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  REJECTED: {
    label:   'Rejeitado',
    icon:    XCircle,
    classes: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  },
}

function StatusBadge({ status }: { status: MIStatus }) {
  const { label, icon: Icon, classes } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      <Icon size={11} />{label}
    </span>
  )
}

// ── Conteúdo ──────────────────────────────────────────────────────────────────

function DetailContent({ material }: { material: PendingMaterial }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpening, setIsOpening] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)

  async function handleOpenPdf() {
    setIsOpening(true)
    setViewError(null)
    try {
      const isStaff = user?.role === 'PROFESSOR' || user?.role === 'ADMIN'
      const request = isStaff
        ? getReviewPresignedUrlRequest(material.id)
        : material.status === 'APPROVED'
          ? getPublicPresignedUrlRequest(material.id)
          : getMaterialPresignedUrlRequest(material.id)
      const { url } = await request
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setViewError(getApiErrorMessage(err))
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Cabeçalho do material */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 bg-indigo-50 dark:bg-indigo-950 rounded-xl p-3.5">
          <FileText size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-start gap-2 justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {material.title}
            </h1>
            <StatusBadge status={material.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
            {material.originalFileName}
          </p>
        </div>
      </div>

      {/* Metadados */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <User size={15} className="shrink-0 text-gray-400" />
          <div className="min-w-0">
            <dt className="text-xs text-gray-400 dark:text-gray-500">Autor</dt>
            <dd className="text-gray-700 dark:text-gray-300 truncate">
              {material.uploadedBy.name} · {material.uploadedBy.email}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive size={15} className="shrink-0 text-gray-400" />
          <div>
            <dt className="text-xs text-gray-400 dark:text-gray-500">Tamanho</dt>
            <dd className="text-gray-700 dark:text-gray-300">{formatBytes(material.sizeBytes)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={15} className="shrink-0 text-gray-400" />
          <div>
            <dt className="text-xs text-gray-400 dark:text-gray-500">Enviado em</dt>
            <dd className="text-gray-700 dark:text-gray-300">{formatDate(material.createdAt)}</dd>
          </div>
        </div>
        {material.updatedAt !== material.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="shrink-0 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400 dark:text-gray-500">Atualizado em</dt>
              <dd className="text-gray-700 dark:text-gray-300">{formatDate(material.updatedAt)}</dd>
            </div>
          </div>
        )}
      </dl>

      {/* Habilidades BNCC */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
        {material.habilidadesBncc.length > 0 ? (
          <HabilidadesBncc habilidades={material.habilidadesBncc} max={0} withLabel />
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Nenhuma habilidade BNCC associada a este material.
          </p>
        )}
      </div>

      {/* Erro ao abrir */}
      {viewError && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={12} />{viewError}
        </p>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleOpenPdf}
          disabled={isOpening}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5
                     text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                     transition-colors"
        >
          {isOpening ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
          {isOpening ? 'Abrindo…' : 'Abrir PDF'}
        </button>

        {/* Conversar com IA — somente usuários institucionais e material aprovado */}
        {canUseAiChat(user) && material.status === 'APPROVED' && (
          <button
            onClick={() => navigate(`/materials/${material.id}/chat`, { state: { material } })}
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800
                       bg-indigo-50 dark:bg-indigo-950 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300
                       hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Sparkles size={15} />
            Conversar com IA
          </button>
        )}
      </div>
    </div>
  )
}

// ── MaterialDetailPage ──────────────────────────────────────────────────────────

export function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: material, isLoading, isError, error, refetch } = useMaterial(id)

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                     hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="rounded-full bg-red-50 dark:bg-red-950 p-4">
              <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Não foi possível carregar o material
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getApiErrorMessage(error)}</p>
            </div>
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

        {!isLoading && !isError && material && <DetailContent material={material} />}
      </div>
    </AppShell>
  )
}
