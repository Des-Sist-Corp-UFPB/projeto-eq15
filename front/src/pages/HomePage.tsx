// src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  UploadCloud,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import type { Role } from '../types/auth'

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  COMMON:           'Usuário',
  INSTITUTIONALIZED: 'Institucionalizado',
  PROFESSOR:        'Professor',
  ADMIN:            'Administrador',
}

function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

interface TopbarProps {
  userName: string
  userRole: Role
  onLogout: () => void
}

function Topbar({ userName, userRole, onLogout }: TopbarProps) {
  return (
    <header className="bg-indigo-700 text-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-xl p-2">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">MI</p>
            <p className="text-indigo-200 text-xs">Materiais Instrucionais · UFPB</p>
          </div>
        </div>

        {/* Usuário + toggle + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-indigo-200 text-xs">{getRoleLabel(userRole)}</p>
          </div>
          <ThemeToggle className="text-indigo-200 hover:text-white hover:bg-white/10 focus:ring-white/50 focus:ring-offset-indigo-700" />
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

interface DashboardCardProps {
  icon: React.ElementType
  title: string
  description: string
  onClick?: () => void
  disabled?: boolean
}

function DashboardCard({ icon: Icon, title, description, onClick, disabled = false }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group w-full text-left bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6
                 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-950
                 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Ícone */}
          <div className="shrink-0 bg-indigo-50 dark:bg-indigo-950 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 rounded-xl p-3 transition-colors">
            <Icon size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>

          {/* Texto */}
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Seta */}
        <ChevronRight
          size={18}
          className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors"
        />
      </div>
    </button>
  )
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export function HomePage() {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  const cards = [
    {
      icon:        UploadCloud,
      title:       'Upload de Material',
      description: 'Envie um novo material instrucional em PDF para análise e publicação.',
      onClick:     () => navigate('/upload'),
    },
    {
      icon:        FileText,
      title:       'Meus Materiais',
      description: 'Consulte e gerencie os materiais que você já enviou à plataforma.',
      onClick:     () => navigate('/materials'),
    },
    {
      icon:        User,
      title:       'Meu Perfil',
      description: 'Visualize e edite suas informações pessoais e acadêmicas.',
      onClick:     () => navigate('/profile'),
    },
    {
      icon:        Settings,
      title:       'Configurações',
      description: 'Ajuste preferências de notificações e privacidade da sua conta.',
      onClick:     () => navigate('/settings'),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Topbar
        userName={user?.name ?? ''}
        userRole={user?.role ?? 'COMMON'}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Saudação */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'usuário'}.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              O que você gostaria de fazer hoje?
            </p>
          </div>

          {/* Badge de perfil */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              Perfil: {getRoleLabel(user?.role ?? 'COMMON')}
            </span>
          </div>

          {/* Grade de cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>

          {/* Rodapé */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">
            Campus IV · UFPB — Rio Tinto / Mamanguape
          </p>
        </div>
      </main>
    </div>
  )
}
