// src/pages/LoginPage.tsx
import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Loader2, BookOpen } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { BrandingPanel } from '../components/auth/BrandingPanel'
import { useLogin } from '../features/auth/hooks/useLogin'
import { getApiErrorMessage, getApiErrorCode } from '../lib/apiError'

// ── Mapeamento de codes → mensagens de UX mais amigáveis ──────────────────────

const UI_ERROR_MESSAGES: Partial<Record<string, string>> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
  ACCOUNT_SUSPENDED: 'Esta conta foi suspensa. Entre em contato com o suporte.',
  EMAIL_NOT_VERIFIED:
    'Seu e-mail institucional ainda não foi verificado. Aguarde a confirmação antes de acessar.',
}

function resolveErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error)
  if (code && UI_ERROR_MESSAGES[code]) return UI_ERROR_MESSAGES[code]!
  return getApiErrorMessage(error)
}

// ── LoginPage ──────────────────────────────────────────────────────────────────

export function LoginPage() {
  const { mutate: login, isPending, error, reset } = useLogin()
  const location = useLocation()
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    reset() // limpa erro anterior antes de nova tentativa
    login({ email: email.trim(), password })
  }

  const errorMessage = error ? resolveErrorMessage(error) : null

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />

      {/* ── Painel do formulário ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">

          {/* Logo mobile (visível apenas em telas pequenas) */}
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="bg-indigo-700 rounded-xl p-2">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">MI</p>
              <p className="text-gray-400 text-xs">Materiais Instrucionais · UFPB</p>
            </div>
          </div>

          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="text-gray-500 text-sm mt-1">
              Entre com sua conta institucional ou pessoal
            </p>
          </div>

          {/* Alerta de sucesso (vindo do cadastro) */}
          {successMessage && (
            <div
              role="status"
              className="mb-5 flex gap-2.5 p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"
            >
              <span className="shrink-0 mt-px">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Alerta de erro */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              <span className="shrink-0 mt-px">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           disabled:bg-gray-100 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                         bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                         disabled:bg-indigo-300 disabled:cursor-not-allowed
                         text-white text-sm font-semibold
                         transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Rodapé do painel */}
          <p className="mt-8 text-center text-xs text-gray-400">
            Não tem conta?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
