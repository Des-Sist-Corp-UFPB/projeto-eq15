// src/pages/VerifyEmailPage.tsx
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useVerifyEmail } from '../features/auth/hooks/useVerifyEmail'
import { getApiErrorMessage } from '../lib/apiError'

// ── Estados visuais ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-indigo-50 rounded-full p-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-lg">Verificando seu e-mail…</p>
        <p className="text-gray-500 text-sm mt-1">Aguarde um momento.</p>
      </div>
    </div>
  )
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-green-50 rounded-full p-4">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-lg">E-mail verificado!</p>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
          Sua conta institucional foi ativada com sucesso.
          <br />
          Faça login para começar a usar a plataforma.
        </p>
      </div>
      <Link
        to="/login"
        className="mt-2 w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                   bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                   text-white text-sm font-semibold transition-colors
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Ir para o login
      </Link>
    </div>
  )
}

interface ErrorStateProps {
  message: string
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-red-50 rounded-full p-4">
        <XCircle size={32} className="text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-lg">Link inválido ou expirado</p>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{message}</p>
      </div>
      <Link
        to="/login"
        className="mt-2 w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                   border border-gray-300 hover:bg-gray-50
                   text-gray-700 text-sm font-semibold transition-colors
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Voltar para o login
      </Link>
    </div>
  )
}

function NoTokenState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-red-50 rounded-full p-4">
        <XCircle size={32} className="text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-lg">Link inválido</p>
        <p className="text-gray-500 text-sm mt-1">
          Nenhum token de verificação encontrado. Use o link enviado para o seu e-mail.
        </p>
      </div>
      <Link
        to="/login"
        className="mt-2 w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                   border border-gray-300 hover:bg-gray-50
                   text-gray-700 text-sm font-semibold transition-colors
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Voltar para o login
      </Link>
    </div>
  )
}

// ── VerifyEmailPage ───────────────────────────────────────────────────────────

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { isLoading, isSuccess, isError, error } = useVerifyEmail(token)

  function renderContent() {
    if (!token)      return <NoTokenState />
    if (isLoading)   return <LoadingState />
    if (isSuccess)   return <SuccessState />
    if (isError)     return <ErrorState message={getApiErrorMessage(error)} />
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="bg-indigo-700 rounded-xl p-2">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">MI</p>
            <p className="text-gray-400 text-xs">Materiais Instrucionais · UFPB</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {renderContent()}
        </div>

        {/* Rodapé */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Campus IV · UFPB — Rio Tinto / Mamanguape
        </p>
      </div>
    </div>
  )
}
