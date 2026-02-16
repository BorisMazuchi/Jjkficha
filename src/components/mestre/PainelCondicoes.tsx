import { useState } from "react"
import type { PartyMember, Condicao } from "@/types/mestre"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

/** Condições customizadas são armazenadas como "Outro: Nome" */
function ehOutro(condicao: string): boolean {
  return condicao.startsWith("Outro:")
}

interface PainelCondicoesProps {
  membros: PartyMember[]
  onAddCondicao: (membroId: string, condicao: string) => void
  onRemoveCondicao: (membroId: string, condicao: string) => void
}

export function PainelCondicoes({
  membros,
  onAddCondicao,
  onRemoveCondicao,
}: PainelCondicoesProps) {
  const [outroMembroId, setOutroMembroId] = useState<string | null>(null)
  const [outroNome, setOutroNome] = useState("")

  const aplicarOutro = (membroId: string) => {
    const nome = outroNome.trim()
    if (nome) {
      onAddCondicao(membroId, `Outro: ${nome}`)
      setOutroNome("")
      setOutroMembroId(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
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
              <button
                type="button"
                onClick={() => setOutroMembroId(m.id)}
                className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-600/50 hover:text-slate-400"
              >
                Outro
              </button>
            </div>
            {outroMembroId === m.id && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={outroNome}
                  onChange={(e) => setOutroNome(e.target.value)}
                  placeholder="Nome da condição"
                  className="h-8 flex-1 border-slate-600 bg-slate-800 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") aplicarOutro(m.id)
                    if (e.key === "Escape") {
                      setOutroMembroId(null)
                      setOutroNome("")
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 bg-[var(--color-accent-red)] hover:opacity-90"
                  onClick={() => aplicarOutro(m.id)}
                >
                  Aplicar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    setOutroMembroId(null)
                    setOutroNome("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
            {m.condicoes.filter(ehOutro).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.condicoes.filter(ehOutro).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onRemoveCondicao(m.id, c)}
                    className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400 ring-1 ring-amber-500/50 hover:bg-amber-500/30"
                  >
                    {c.replace(/^Outro: /, "")} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
