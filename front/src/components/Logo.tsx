// src/components/Logo.tsx
// Logotipo da Computeca — wordmark com a marca em duas cores + ícone.
import { Library } from 'lucide-react'

interface LogoProps {
  /** Esconde o subtítulo (uso em barras compactas) */
  compact?: boolean
  className?: string
}

export function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #16bcc6 0%, #2f80ed 100%)' }}
        aria-hidden
      >
        <Library size={20} />
      </div>
      <div className="leading-none">
        <div className="text-xl font-black tracking-tight">
          <span style={{ color: 'var(--color-brand-teal)' }}>Comput</span>
          <span style={{ color: 'var(--color-brand-coral)' }}>eca</span>
        </div>
        {!compact && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
            Acervo de MIs · UFPB
          </p>
        )}
      </div>
    </div>
  )
}
