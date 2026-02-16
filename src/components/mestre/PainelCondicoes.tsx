import { useState } from "react"
import type { PartyMember } from "@/types/mestre"
import {
  CONDICOES_POR_GRUPO,
  ehCondicaoOutro,
  type GrupoCondicao,
} from "@/lib/condicoesRegras"
import { cn } from "@/lib/utils"
import { AlertTriangle, ChevronDown, ChevronRight, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
  const [grupoAberto, setGrupoAberto] = useState<Record<string, GrupoCondicao | null>>({})

  const toggleGrupo = (membroId: string, grupo: GrupoCondicao) => {
    setGrupoAberto((prev) => ({
      ...prev,
      [membroId]: prev[membroId] === grupo ? null : grupo,
    }))
  }

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
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
        <AlertTriangle className="h-4 w-4" />
        Painel de Condições
      </h3>
      <p className="mb-3 text-[10px] text-slate-500">
        <BookOpen className="mr-0.5 inline h-3 w-3" />
        Livro v2.5 — Cap. 12, p.317–319
      </p>

      <div className="space-y-4 overflow-y-auto">
        {membros.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-3"
          >
            <div className="mb-2 text-sm font-medium text-slate-200">
              {m.nome}
            </div>

            {(Object.keys(CONDICOES_POR_GRUPO) as GrupoCondicao[]).map((grupo) => {
              const condicoes = CONDICOES_POR_GRUPO[grupo]
              const aberto = grupoAberto[m.id] === grupo
              return (
                <div key={grupo} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleGrupo(m.id, grupo)}
                    className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                  >
                    {aberto ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {grupo}
                  </button>
                  {aberto && (
                    <div className="ml-2 mt-1 flex flex-wrap gap-1 border-l border-slate-700/80 pl-2">
                      {condicoes.map((c) => {
                        const ativo = m.condicoes.includes(c.nome)
                        return (
                          <button
                            key={c.nome}
                            type="button"
                            title={`${c.descricao} (Livro ${c.pagina})`}
                            onClick={() =>
                              ativo
                                ? onRemoveCondicao(m.id, c.nome)
                                : onAddCondicao(m.id, c.nome)
                            }
                            className={cn(
                              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                              ativo
                                ? "bg-amber-500/30 text-amber-400 ring-1 ring-amber-500/50"
                                : "bg-slate-700/50 text-slate-500 hover:bg-slate-600/50 hover:text-slate-400"
                            )}
                          >
                            {c.nome}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-2 flex flex-wrap gap-1">
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
            {m.condicoes.filter(ehCondicaoOutro).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.condicoes.filter(ehCondicaoOutro).map((c) => (
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
