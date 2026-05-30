// src/app/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { HomePage } from '../pages/HomePage'
import { VerifyEmailSentPage } from '../pages/VerifyEmailSentPage'
import { NotFoundPage } from '../pages/NotFoundPage'

// ── Guards ─────────────────────────────────────────────────────────────────────

/** Redireciona para "/" se o usuário já estiver autenticado */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

/** Redireciona para "/login" se o usuário não estiver autenticado */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// ── Rotas ──────────────────────────────────────────────────────────────────────

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas — redirecionam para / se já autenticado */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        {/* Verificação de e-mail — acessível sem autenticação */}
        <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
