// src/pages/HomePage.tsx
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Materiais Instrucionais
        </h1>
        <p className="text-gray-500">
          Bem-vindo, {user?.name ?? 'usuário'} —{' '}
          <span className="font-medium">{user?.role}</span>
        </p>
      </div>
    </main>
  )
}
