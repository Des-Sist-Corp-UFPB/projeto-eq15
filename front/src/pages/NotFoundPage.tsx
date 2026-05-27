// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <p className="text-6xl font-extrabold text-gray-200">404</p>
        <h1 className="text-2xl font-semibold text-gray-700">
          Página não encontrada
        </h1>
        <Link
          to="/"
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
