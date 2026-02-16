import { useState } from "react"
import { Vote, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type TipoVoto = "Proprio" | "Emergencial" | "Congenito" | "Contratual"

export type PesoVoto = "Leve" | "Medio" | "Pesado" | "Extremo"

export interface VotoRestricao {
  id: string
  /** Nome do personagem/jogador dono do voto */
  dono: string
  tipo: TipoVoto
  /** Peso do voto (Livro v2.5 — Cap. 14) */
  peso?: PesoVoto
  beneficio: string
  maleficio: string
  ativo: boolean
}

const LABEL_TIPO: Record<TipoVoto, string> = {
  Proprio: "Próprio",
  Emergencial: "Emergencial",
  Congenito: "Congênito",
  Contratual: "Contratual",
}

const LABEL_PESO: Record<PesoVoto, string> = {
  Leve: "Leve",
  Medio: "Médio",
  Pesado: "Pesado",
  Extremo: "Extremo",
}

interface ControleVotosProps {
  votos?: VotoRestricao[]
  onVotosChange?: (votos: VotoRestricao[]) => void
  /** Membros da party para escolher dono do voto (nome exibido no dropdown) */
  membros?: { id: string; nome: string }[]
  className?: string
}

const VOTOS_INICIAIS: VotoRestricao[] = []

export function ControleVotos({
  votos: votosProp = VOTOS_INICIAIS,
  onVotosChange,
  membros = [],
  className,
}: ControleVotosProps) {
  const [expandido, setExpandido] = useState(true)
  const [votosInternos, setVotosInternos] = useState<VotoRestricao[]>(VOTOS_INICIAIS)

  const controlandoExternamente = onVotosChange != null
  const votos = controlandoExternamente ? votosProp : votosInternos
  const setVotos = controlandoExternamente ? onVotosChange : setVotosInternos

  const adicionar = () => {
    const donoPadrao = membros.length > 0 ? membros[0].nome : ""
    const novo: VotoRestricao = {
      id: crypto.randomUUID(),
      dono: donoPadrao,
      tipo: "Proprio",
      peso: undefined,
      beneficio: "",
      maleficio: "",
      ativo: true,
    }
    setVotos([...votos, novo])
    setExpandido(true)
  }

  const atualizar = (id: string, patch: Partial<VotoRestricao>) => {
    setVotos(votos.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const remover = (id: string) => {
    setVotos(votos.filter((v) => v.id !== id))
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-slate-700/80 bg-slate-900/50 p-3",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="mb-2 flex w-full items-center justify-between gap-2 text-left"
      >
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          <Vote className="h-4 w-4" />
          Votos de restrição
        </h3>
        <span className="text-xs text-slate-500">
          {votos.filter((v) => v.ativo).length} ativo(s) — Peso: Leve / Médio / Pesado / Extremo (Cap. 14)
        </span>
      </button>

      {expandido && (
        <>
          <div className="mb-2 space-y-2 overflow-y-auto">
            <p className="mb-1 text-[10px] text-slate-500">
              Livro v2.5 — Cap. 14: efeitos por peso (Leve, Médio, Pesado, Extremo). Defina benefício e malefício conforme o livro.
            </p>
            {votos.length === 0 && (
              <p className="text-xs text-slate-500">
                Nenhum voto registrado. Adicione para listar benefício e malefício mecânico.
              </p>
            )}
            {votos.map((v) => {
              const dono = v.dono ?? ""
              return (
              <div
                key={v.id}
                className="rounded border border-slate-700/60 bg-slate-800/40 p-2 text-xs"
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 shrink-0">Dono:</span>
                    <Input
                      value={dono}
                      onChange={(e) =>
                        atualizar(v.id, { dono: e.target.value })
                      }
                      placeholder="Nome do personagem"
                      list={membros.length > 0 ? `voto-dono-${v.id}` : undefined}
                      className="h-7 w-36 shrink-0 border-slate-600 bg-slate-800/80 text-slate-200"
                    />
                    {membros.length > 0 && (
                      <datalist id={`voto-dono-${v.id}`}>
                        {membros.map((m) => (
                          <option key={m.id} value={m.nome} />
                        ))}
                      </datalist>
                    )}
                  </div>
                  <select
                    value={v.tipo}
                    onChange={(e) =>
                      atualizar(v.id, {
                        tipo: e.target.value as TipoVoto,
                      })
                    }
                    className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[var(--color-neon-purple)]"
                  >
                    {(["Proprio", "Emergencial", "Congenito", "Contratual"] as const).map(
                      (t) => (
                        <option key={t} value={t}>
                          {LABEL_TIPO[t]}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    value={v.peso ?? ""}
                    onChange={(e) =>
                      atualizar(v.id, {
                        peso: e.target.value ? (e.target.value as PesoVoto) : undefined,
                      })
                    }
                    title="Peso do voto (Cap. 14)"
                    className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-slate-300"
                  >
                    <option value="">Peso</option>
                    {(["Leve", "Medio", "Pesado", "Extremo"] as const).map(
                      (p) => (
                        <option key={p} value={p}>
                          {LABEL_PESO[p]}
                        </option>
                      )
                    )}
                  </select>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={v.ativo}
                      onChange={(e) =>
                        atualizar(v.id, { ativo: e.target.checked })
                      }
                      className="rounded border-slate-600"
                    />
                    Ativo
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-rose-400"
                    onClick={() => remover(v.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">Benefício: </span>
                    <Input
                      value={v.beneficio}
                      onChange={(e) =>
                        atualizar(v.id, { beneficio: e.target.value })
                      }
                      placeholder="Ex: +1 PE por nível"
                      className="h-7 border-slate-600 bg-slate-800/80 text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500">Malefício: </span>
                    <Input
                      value={v.maleficio}
                      onChange={(e) =>
                        atualizar(v.id, { maleficio: e.target.value })
                      }
                      placeholder="Ex: Não pode usar X"
                      className="h-7 border-slate-600 bg-slate-800/80 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )
            })}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={adicionar}
            className="h-8 w-full border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar voto
          </Button>
        </>
      )}
    </div>
  )
}
