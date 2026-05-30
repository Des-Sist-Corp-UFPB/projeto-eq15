// src/pages/VerifyEmailSentPage.tsx
import { useState, type FormEvent } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { useVerifyEmail } from '../features/auth/hooks/useVerifyEmail'
import { getApiErrorMessage } from '../lib/apiError'

// ── Estados pós-verificação ───────────────────────────────────────────────────

function SuccessState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="bg-green-50 rounded-full p-4">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <div>
        <p className="font-bold text-gray-900 text-lg">E-mail verificado!</p>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
          Sua conta institucional foi ativada com sucesso.
        </p>
      </div>
      <Link
        to="/login"
        className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                   bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                   text-white text-sm font-semibold transition-colors
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Ir para o login
      </Link>
    </div>
  )
}

// ── VerifyEmailSentPage ───────────────────────────────────────────────────────

export function VerifyEmailSentPage() {
  const location = useLocation()
  const email    = (location.state as { email?: string } | null)?.email

  const [code, setCode] = useState('')

  const { mutate: verify, isPending, isSuccess, isError, error, reset } = useVerifyEmail()

  if (!email) return <Navigate to="/register" replace />

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (code.trim().length !== 6) return
    reset()
    verify(code.trim())
  }

  function handleCodeChange(value: string) {
    // Aceita apenas dígitos, max 6 caracteres
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setCode(digits)
    if (isError) reset()
  }

  const errorMessage = isError ? getApiErrorMessage(error) : null

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
          {isSuccess ? <SuccessState /> : (
            <div className="flex flex-col items-center gap-5 text-center">

              <div className="bg-indigo-50 rounded-full p-4">
                <Mail size={28} className="text-indigo-600" />
              </div>

              <div>
                <p className="font-bold text-gray-900 text-lg">Verifique seu e-mail</p>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  Enviamos um código de 6 dígitos para{' '}
                  <span className="font-medium text-gray-700 break-all">{email}</span>.
                </p>
              </div>

              {/* Formulário do código */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-left">
                    Código de verificação
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    disabled={isPending}
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-lg border text-center text-2xl font-bold tracking-[0.5em]
                                text-gray-900 placeholder-gray-300 transition
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                disabled:bg-gray-100 disabled:cursor-not-allowed
                                ${isError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errorMessage && (
                    <p role="alert" className="text-xs text-red-600 text-left">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                             bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                             disabled:bg-indigo-300 disabled:cursor-not-allowed
                             text-white text-sm font-semibold transition-colors
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verificando…
                    </>
                  ) : (
                    'Confirmar código'
                  )}
                </button>
              </form>

              <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 text-xs text-left space-y-1">
                <p className="font-semibold">Não recebeu o código?</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-600">
                  <li>Verifique a pasta de spam.</li>
                  <li>O código expira em 24 horas.</li>
                </ul>
              </div>

              <Link to="/login" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                Voltar para o login
              </Link>

            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Campus IV · UFPB — Rio Tinto / Mamanguape
        </p>
      </div>
    </div>
  )
}
