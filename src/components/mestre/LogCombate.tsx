import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LogEntry, InitiativeEntry } from "@/types/mestre"
import { MessageSquare, Dices, Swords } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogCombateProps {
  log: LogEntry[]
  onRolagem: (entry: Omit<LogEntry, "id" | "timestamp">) => void
  /** Se definido, permite aplicar o resultado da última rolagem de dano a um alvo */
  entradas?: InitiativeEntry[]
  onAplicarDano?: (alvo: InitiativeEntry, valor: number) => void
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function tipoIcone(tipo: LogEntry["tipo"]) {
  switch (tipo) {
    case "rolagem":
      return "🎲"
    case "dano":
      return "⚔"
    case "cura":
      return "💚"
    case "condicao":
      return "⚠"
    default:
      return "📋"
  }
}

function tipoCor(tipo: LogEntry["tipo"]) {
  switch (tipo) {
    case "rolagem":
      return "text-amber-400"
    case "dano":
      return "text-red-400"
    case "cura":
      return "text-emerald-400"
    case "condicao":
      return "text-amber-400"
    default:
      return "text-slate-400"
  }
}

function extrairTotalRolagem(texto: string): number | null {
  const match = texto.match(/=\s*(-?\d+)\s*$/)
  return match ? parseInt(match[1], 10) : null
}

export function LogCombate({ log, onRolagem, entradas = [], onAplicarDano }: LogCombateProps) {
  const [dadoInput, setDadoInput] = useState("")
  const [alvoAplicarId, setAlvoAplicarId] = useState("")
  const ultimaRolagem = log.length > 0 && log[log.length - 1].tipo === "rolagem" ? log[log.length - 1] : null
  const totalAplicar = ultimaRolagem ? extrairTotalRolagem(ultimaRolagem.texto) : null
  const podeAplicarDano = totalAplicar != null && totalAplicar >= 0 && entradas.length > 0 && onAplicarDano && alvoAplicarId
  const alvoAplicar = entradas.find((e) => e.id === alvoAplicarId)

  const handleRolar = () => {
    const match = dadoInput.match(/(\d+)d(\d+)([+-]\d+)?/i)
    if (match) {
      const qtd = parseInt(match[1], 10)
      const faces = parseInt(match[2], 10)
      const mod = match[3] ? parseInt(match[3], 10) : 0
      let total = 0
      const rolls: number[] = []
      for (let i = 0; i < qtd; i++) {
        const r = Math.floor(Math.random() * faces) + 1
        rolls.push(r)
        total += r
      }
      total += mod
      const texto =
        mod !== 0
          ? `${qtd}d${faces}${mod >= 0 ? "+" : ""}${mod}: [${rolls.join(", ")}] = ${total}`
          : `${qtd}d${faces}: [${rolls.join(", ")}] = ${total}`
      onRolagem({ tipo: "rolagem", texto })
      setDadoInput("")
    } else if (dadoInput.trim()) {
      onRolagem({ tipo: "rolagem", texto: dadoInput })
      setDadoInput("")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
        <MessageSquare className="h-4 w-4" />
        Log de Combate
      </h3>

      <div className="mb-3 flex gap-2">
        <Input
          placeholder="Ex: 2d6+3, 1d20"
          value={dadoInput}
          onChange={(e) => setDadoInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRolar()}
          className="h-8 flex-1 border-slate-600 bg-slate-800/80 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleRolar}
          className="h-8 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
        >
          <Dices className="h-4 w-4" />
          Rolagem
        </Button>
      </div>

      {totalAplicar != null && totalAplicar >= 0 && entradas.length > 0 && onAplicarDano && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-slate-700/80 bg-slate-800/40 p-2">
          <span className="text-xs text-slate-400">Aplicar resultado como dano:</span>
          <select
            value={alvoAplicarId}
            onChange={(e) => setAlvoAplicarId(e.target.value)}
            className="h-8 rounded border border-slate-600 bg-slate-800 px-2 text-xs text-slate-200"
          >
            <option value="">Selecione o alvo</option>
            {entradas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome} — {e.pvAtual ?? 0}/{e.pvMax ?? 0} PV
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => alvoAplicar && onAplicarDano(alvoAplicar, totalAplicar!)}
            disabled={!podeAplicarDano}
            className="h-8 border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            <Swords className="mr-1 h-3.5 w-3.5" />
            Aplicar {totalAplicar} PV
          </Button>
        </div>
      )}

      <div className="min-h-0 max-h-96 flex-1 space-y-1 overflow-y-auto overflow-x-hidden rounded border border-slate-700/80 bg-black/30 p-2 font-mono text-xs">
        {log.length === 0 && (
          <div className="py-4 text-center text-slate-500">
            Nenhum registro ainda
          </div>
        )}
        {[...log].reverse().map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-2 rounded px-2 py-1",
              "hover:bg-slate-800/30"
            )}
          >
            <span className="shrink-0 text-slate-600">
              {formatTime(entry.timestamp)}
            </span>
            <span className={cn("shrink-0", tipoCor(entry.tipo))}>
              {tipoIcone(entry.tipo)}
            </span>
            <span className="min-w-0 flex-1 break-words text-slate-300">
              {entry.texto}
            </span>
            {entry.alvo && (
              <span className="shrink-0 text-slate-500">→ {entry.alvo}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
