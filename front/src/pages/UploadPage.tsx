// src/pages/UploadPage.tsx
import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUploadMaterial } from '../features/materials/hooks/useUploadMaterial'
import { getApiErrorCode, getApiErrorMessage } from '../lib/apiError'
import type { Role } from '../types/auth'
import type { UploadedMI } from '../features/materials/api/materialsApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  COMMON:            'Usuário',
  INSTITUTIONALIZED: 'Institucionalizado',
  PROFESSOR:         'Professor',
  ADMIN:             'Administrador',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function friendlyError(error: unknown): string {
  const code = getApiErrorCode(error)
  if (code === 'UPLOAD_NOT_ALLOWED') return 'Você não tem permissão para fazer upload de materiais.'
  if (code === 'INVALID_FILE_TYPE')  return 'O arquivo enviado não é um PDF válido.'
  if (code === 'FILE_TOO_LARGE')     return 'O arquivo excede o tamanho máximo permitido (50 MB).'
  return getApiErrorMessage(error)
}

// ── Topbar ────────────────────────────────────────────────────────────────────

interface TopbarProps {
  userName: string
  userRole: Role
  onBack: () => void
  onLogout: () => void
}

function Topbar({ userName, userRole, onBack, onLogout }: TopbarProps) {
  return (
    <header className="bg-indigo-700 text-white px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="w-px h-5 bg-white/20" />

          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-xl p-2">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">MI</p>
              <p className="text-indigo-200 text-xs">Materiais Instrucionais · UFPB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-indigo-200 text-xs">{ROLE_LABELS[userRole]}</p>
          </div>
          <button
            onClick={onLogout}
            aria-label="Sair da conta"
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Dropzone ──────────────────────────────────────────────────────────────────

interface DropzoneProps {
  file: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  disabled?: boolean
}

function Dropzone({ file, onFileSelect, onFileRemove, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const dropped = e.dataTransfer.files[0]
      if (dropped) onFileSelect(dropped)
    },
    [disabled, onFileSelect],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) onFileSelect(picked)
    e.target.value = ''
  }

  if (file) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 bg-indigo-100 rounded-lg p-2">
            <FileText size={20} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)}</p>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onFileRemove}
            aria-label="Remover arquivo"
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-red-300 rounded-lg p-1"
          >
            <X size={18} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      aria-label="Área de upload — clique ou arraste um PDF"
      className={[
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50'
          : isDragging
            ? 'cursor-copy border-indigo-400 bg-indigo-50'
            : 'cursor-pointer border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40',
      ].join(' ')}
    >
      <div className={`rounded-full p-4 ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
        <UploadCloud size={28} className={isDragging ? 'text-indigo-500' : 'text-gray-400'} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">
          {isDragging ? 'Solte o arquivo aqui' : 'Arraste um PDF ou clique para selecionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Somente PDF · máximo 50 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  )
}

// ── SuccessState ──────────────────────────────────────────────────────────────

interface SuccessStateProps {
  material: UploadedMI
  onUploadAnother: () => void
  onGoHome: () => void
}

function SuccessState({ material, onUploadAnother, onGoHome }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="rounded-full bg-green-100 p-5">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Material enviado com sucesso!</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          <span className="font-medium text-gray-700">{material.title}</span> foi enviado e aguarda
          revisão de um professor antes de ser publicado.
        </p>
      </div>
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 w-full text-left space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Arquivo</span>
          <span className="text-gray-700 font-medium truncate ml-4 max-w-[60%] text-right">
            {material.originalFileName}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Tamanho</span>
          <span className="text-gray-700 font-medium">{formatBytes(material.sizeBytes)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Aguardando revisão
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onUploadAnother}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium
                     text-gray-700 hover:bg-gray-50 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Enviar outro material
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white
                     hover:bg-indigo-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ir para o início
        </button>
      </div>
    </div>
  )
}

// ── UploadPage ────────────────────────────────────────────────────────────────

export function UploadPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  const { mutate, isPending, isSuccess, data: uploadedMaterial, error, reset } = useUploadMaterial()

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  function handleFileSelect(selected: File) {
    setFile(selected)
    if (!title.trim()) {
      setTitle(selected.name.replace(/\.pdf$/i, ''))
    }
  }

  function handleFileRemove() {
    setFile(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    mutate({ file, title: title.trim() || undefined })
  }

  function handleUploadAnother() {
    setFile(null)
    setTitle('')
    reset()
  }

  const ROLES_WITH_UPLOAD = new Set(['INSTITUTIONALIZED', 'PROFESSOR', 'ADMIN'])
  const canUpload = (user?.role && ROLES_WITH_UPLOAD.has(user.role)) || (user?.canUpload ?? false)
  const isUploading = isPending

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar
        userName={user?.name ?? ''}
        userRole={user?.role ?? 'COMMON'}
        onBack={() => navigate('/')}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Cabeçalho da página */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Upload de Material</h1>
            <p className="text-sm text-gray-500">
              Envie um material instrucional em PDF para análise e publicação.
            </p>
          </div>

          {/* Sem permissão de upload */}
          {!canUpload && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-amber-800">
                  Permissão de upload não habilitada
                </p>
                <p className="text-xs text-amber-700">
                  Sua conta ainda não tem permissão para enviar materiais. Entre em contato com um
                  administrador ou professor para solicitar acesso.
                </p>
              </div>
            </div>
          )}

          {/* Card principal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

            {/* Estado de sucesso */}
            {isSuccess && uploadedMaterial && (
              <SuccessState
                material={uploadedMaterial}
                onUploadAnother={handleUploadAnother}
                onGoHome={() => navigate('/')}
              />
            )}

            {/* Formulário de upload */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Dropzone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Arquivo PDF <span className="text-red-500">*</span>
                  </label>
                  <Dropzone
                    file={file}
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    disabled={isUploading || !canUpload}
                  />
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label htmlFor="mi-title" className="block text-sm font-medium text-gray-700">
                    Título
                    <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="mi-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nome do material instrucional"
                    maxLength={255}
                    disabled={isUploading || !canUpload}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900
                               placeholder:text-gray-400
                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                               disabled:bg-gray-50 disabled:cursor-not-allowed
                               transition-colors"
                  />
                  <p className="text-xs text-gray-400">
                    Se não preenchido, o nome do arquivo será usado como título.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{friendlyError(error)}</p>
                  </div>
                )}

                {/* Botão de envio */}
                <button
                  type="submit"
                  disabled={!file || isUploading || !canUpload}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3
                             text-sm font-semibold text-white
                             hover:bg-indigo-700 active:bg-indigo-800
                             disabled:opacity-50 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                             transition-colors"
                >
                  {isUploading ? (
                    <>
                      <span
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                        aria-hidden
                      />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      Enviar Material
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            Campus IV · UFPB — Rio Tinto / Mamanguape
          </p>
        </div>
      </main>
    </div>
  )
}
