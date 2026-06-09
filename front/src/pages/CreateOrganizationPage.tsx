// src/pages/CreateOrganizationPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, LogOut, ArrowLeft, FolderPlus, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { useCreateOrganization } from '../features/organizations/hooks/useCreateOrganization'
import { getApiErrorMessage } from '../lib/apiError'

// ── Topbar ────────────────────────────────────────────────────────────────────

interface TopbarProps { userName: string; onBack: () => void; onLogout: () => void }

function Topbar({ userName, onBack, onLogout }: TopbarProps) {
  return (
    <header className="bg-indigo-700 text-white px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Voltar"
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1">
            <ArrowLeft size={16} /><span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-xl p-2"><BookOpen size={18} /></div>
            <div>
              <p className="font-bold text-sm leading-tight">MI</p>
              <p className="text-indigo-200 text-xs">Organizações · UFPB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-sm font-medium">{userName}</p>
          <ThemeToggle className="text-indigo-200 hover:text-white hover:bg-white/10 focus:ring-white/50 focus:ring-offset-indigo-700" />
          <button onClick={onLogout} aria-label="Sair"
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1">
            <LogOut size={16} /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}

// ── CreateOrganizationPage ────────────────────────────────────────────────────

export function CreateOrganizationPage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()

  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')

  const { mutate, isPending, isError, error, isSuccess, data } = useCreateOrganization()

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      { onSuccess: () => { setName(''); setDescription('') } },
    )
  }

  const nameError    = name.trim().length > 0 && name.trim().length < 2
  const canSubmit    = name.trim().length >= 2 && name.trim().length <= 100 && !isPending

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Topbar
        userName={user?.name ?? ''}
        onBack={() => navigate('/')}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Cabeçalho */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderPlus size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Nova Organização
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crie um projeto para agrupar materiais instrucionais e convidar alunos.
            </p>
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"
          >
            {/* Nome */}
            <div className="space-y-1.5">
              <label
                htmlFor="org-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={100}
                placeholder="ex: Projeto de Cálculo I"
                disabled={isPending}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  nameError
                    ? 'border-red-400 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600',
                ].join(' ')}
              />
              <div className="flex items-center justify-between">
                {nameError ? (
                  <p className="text-xs text-red-500">Mínimo de 2 caracteres.</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {name.length}/100
                </p>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label
                htmlFor="org-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descrição <span className="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <textarea
                id="org-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Descreva o objetivo desta organização..."
                disabled={isPending}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm resize-none',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Erro da API */}
            {isError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {getApiErrorMessage(error)}
                </p>
              </div>
            )}

            {/* Sucesso */}
            {isSuccess && data && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Organização <span className="font-semibold">"{data.name}"</span> criada com sucesso!
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={isPending}
                className="rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                           text-white px-4 py-2 text-sm font-medium transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isPending ? (
                  <><Loader2 size={15} className="animate-spin" /> Criando...</>
                ) : (
                  <><FolderPlus size={15} /> Criar organização</>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Campus IV · UFPB — Rio Tinto / Mamanguape
          </p>
        </div>
      </main>
    </div>
  )
}
