// src/components/auth/BrandingPanel.tsx
import { BookOpen, GraduationCap, Users, Search } from 'lucide-react'

export function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] bg-indigo-700 flex-col justify-between p-12 text-white select-none">
      {/* Topo — logotipo */}
      <div className="flex items-center gap-3">
        <div className="bg-white/10 rounded-xl p-2.5">
          <BookOpen size={24} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">MI</p>
          <p className="text-indigo-200 text-xs">Materiais Instrucionais</p>
        </div>
      </div>

      {/* Centro — headline */}
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold leading-tight">
          Acervo acadêmico
          <br />
          ao alcance de todos.
        </h1>
        <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
          Plataforma de gestão e disseminação de materiais instrucionais do
          Campus IV da UFPB, com curadoria docente e busca semântica por IA.
        </p>

        <ul className="space-y-3 pt-2">
          {[
            { icon: GraduationCap, label: 'Aprovação e curadoria por professores' },
            { icon: Search,        label: 'Busca semântica por conteúdo' },
            { icon: Users,         label: 'Acesso para toda a comunidade acadêmica' },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-indigo-100">
              <div className="shrink-0 bg-white/10 rounded-lg p-1.5">
                <Icon size={14} />
              </div>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé */}
      <p className="text-indigo-300 text-xs">
        Campus IV · UFPB — Rio Tinto / Mamanguape
      </p>
    </div>
  )
}
