import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Maldicao } from "@/types/mestre"
import { FichaMaldicaoModal } from "@/components/mestre/FichaMaldicaoModal"
import { Ghost, Plus, Minus, Swords, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const MALDICOES_PREDEFINIDAS = [
  { nome: "Maldição 4º Grau", pv: 20, grau: "4º" },
  { nome: "Maldição 3º Grau", pv: 35, grau: "3º" },
  { nome: "Maldição 2º Grau", pv: 55, grau: "2º" },
  { nome: "Maldição 1º Grau", pv: 80, grau: "1º" },
  { nome: "Maldição Especial", pv: 120, grau: "Especial" },
]

interface QuickBestiaryProps {
  maldicoes: Maldicao[]
  onMaldicoesChange: (m: Maldicao[]) => void
  onAddToIniciativa: (m: Maldicao) => void
  onDano: (m: Maldicao, dano: number) => void
}

export function QuickBestiary({
  maldicoes,
  onMaldicoesChange,
  onAddToIniciativa,
  onDano,
}: QuickBestiaryProps) {
  const [novaNome, setNovaNome] = useState("")
  const [novaPV, setNovaPV] = useState(30)
  const [maldicaoFichaAberta, setMaldicaoFichaAberta] = useState<Maldicao | null>(null)

  const addMaldicao = (nome: string, pv: number, grau?: string) => {
    const id = crypto.randomUUID()
    onMaldicoesChange([
      ...maldicoes,
      { id, nome, pvAtual: pv, pvMax: pv, grau },
    ])
    setNovaNome("")
    setNovaPV(30)
  }

  const removeMaldicao = (id: string) => {
    onMaldicoesChange(maldicoes.filter((m) => m.id !== id))
  }

  const salvarFichaMaldicao = (m: Maldicao) => {
    onMaldicoesChange(
      maldicoes.map((mal) => (mal.id === m.id ? m : mal))
    )
    setMaldicaoFichaAberta(null)
  }

  const danoRapido = [5, 10, 15, 20, 25]

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
        <Ghost className="h-4 w-4" />
        Quick Bestiary
      </h3>

      <div className="mb-3 flex flex-wrap gap-2">
        {MALDICOES_PREDEFINIDAS.map((m) => (
          <button
            key={m.nome}
            type="button"
            onClick={() => addMaldicao(m.nome, m.pv, m.grau)}
            className="rounded border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-[var(--color-accent-purple)]/50 hover:bg-[var(--color-accent-purple)]/10 hover:text-[var(--color-neon-purple)]"
          >
            + {m.nome}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        <Input
          placeholder="Nome custom"
          value={novaNome}
          onChange={(e) => setNovaNome(e.target.value)}
          className="h-8 flex-1 border-slate-600 bg-slate-800/80 text-sm"
        />
        <Input
          type="number"
          min={1}
          value={novaPV}
          onChange={(e) => setNovaPV(parseInt(e.target.value) || 1)}
          className="h-8 w-16 border-slate-600 bg-slate-800/80 text-center text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => addMaldicao(novaNome || "Maldição", novaPV)}
          className="h-8 border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/20"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {maldicoes.filter((m) => !m.origemBestiario).map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-lg border border-slate-700/80 bg-slate-800/50 p-2",
              m.pvAtual <= 0 && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Ghost className="h-4 w-4 shrink-0 text-red-400" />
                <span className="truncate text-sm font-medium">{m.nome}</span>
                {m.grau && (
                  <span className="shrink-0 text-xs text-slate-500">{m.grau}</span>
                )}
                {(m.ataques?.length ?? 0) > 0 || (m.feiticos?.length ?? 0) > 0 ? (
                  <span className="shrink-0 rounded bg-[var(--color-accent-purple)]/20 px-1 text-[10px] text-[var(--color-neon-purple)]">
                    Ficha
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setMaldicaoFichaAberta(m)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-600 hover:text-[var(--color-neon-purple)]"
                  title="Editar ficha (ataques e feitiços)"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onAddToIniciativa(m)}
                  className="rounded p-0.5 text-slate-400 hover:bg-[var(--color-accent-purple)]/20 hover:text-[var(--color-neon-purple)]"
                  title="Adicionar à iniciativa"
                >
                  <Swords className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeMaldicao(m.id)}
                  className="rounded p-0.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-red-400">
                {Math.max(0, m.pvAtual)}/{m.pvMax} PV
              </span>
              <div className="flex gap-0.5">
                {danoRapido.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDano(m, d)}
                    className="rounded border border-red-900/60 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    -{d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {maldicaoFichaAberta && (
        <FichaMaldicaoModal
          maldicao={maldicaoFichaAberta}
          isOpen={true}
          onClose={() => setMaldicaoFichaAberta(null)}
          onSave={salvarFichaMaldicao}
        />
      )}
    </div>
  )
}
