// src/pages/VerifyEmailSentPage.tsx
import { Link, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, Mail } from 'lucide-react'

export function VerifyEmailSentPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  // Se alguém acessar a rota diretamente sem o state, manda para o cadastro
  if (!email) return <Navigate to="/register" replace />

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
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center gap-5 text-center">

          <div className="bg-indigo-50 rounded-full p-4">
            <Mail size={32} className="text-indigo-600" />
          </div>

          <div>
            <p className="font-bold text-gray-900 text-lg">Verifique seu e-mail</p>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Enviamos um link de confirmação para{' '}
              <span className="font-medium text-gray-700 break-all">{email}</span>.
              <br className="hidden sm:block" />
              <span className="block mt-2">
                Clique no link para ativar sua conta institucional.
              </span>
            </p>
          </div>

          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-700 text-xs text-left space-y-1">
            <p className="font-semibold">Não recebeu o e-mail?</p>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-600">
              <li>Verifique a pasta de spam.</li>
              <li>Certifique-se de que o endereço está correto.</li>
              <li>O link expira em 24 horas.</li>
            </ul>
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                       border border-gray-300 hover:bg-gray-50
                       text-gray-700 text-sm font-semibold transition-colors
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Voltar para o login
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Campus IV · UFPB — Rio Tinto / Mamanguape
        </p>
      </div>
    </div>
  )
}
