import type { PartyMember, Condicao } from "@/types/mestre"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

const CONDICOES_DISPONIVEIS: Condicao[] = [
  "Atordoado",
  "Sangramento",
  "Vontade Quebrada",
  "Enfraquecido",
  "Cego",
  "Surdo",
  "Paralisado",
  "Petrificado",
]

interface PainelCondicoesProps {
  membros: PartyMember[]
  onAddCondicao: (membroId: string, condicao: Condicao) => void
  onRemoveCondicao: (membroId: string, condicao: string) => void
}

export function PainelCondicoes({
  membros,
  onAddCondicao,
  onRemoveCondicao,
}: PainelCondicoesProps) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
        <AlertTriangle className="h-4 w-4" />
        Painel de Condições
      </h3>

      <div className="space-y-4 overflow-y-auto">
        {membros.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-3"
          >
            <div className="mb-2 text-sm font-medium text-slate-200">
              {m.nome}
            </div>
            <div className="flex flex-wrap gap-1">
              {CONDICOES_DISPONIVEIS.map((c) => {
                const ativo = m.condicoes.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      ativo ? onRemoveCondicao(m.id, c) : onAddCondicao(m.id, c)
                    }
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                      ativo
                        ? "bg-amber-500/30 text-amber-400 ring-1 ring-amber-500/50"
                        : "bg-slate-700/50 text-slate-500 hover:bg-slate-600/50 hover:text-slate-400"
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
