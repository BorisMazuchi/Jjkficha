import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { InitiativeEntry } from "@/types/mestre"
import { GripVertical, User, Ghost, Trash2, Dices, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InitiativeTrackerProps {
  entradas: InitiativeEntry[]
  turnoAtual: number
  onReorder: (entradas: InitiativeEntry[]) => void
  onTurnoChange: (index: number) => void
  onRemove?: (id: string) => void
  onSurpresaChange?: (id: string, surpresa: boolean) => void
  onRolarIniciativa?: () => void
}

export function InitiativeTracker({
  entradas,
  turnoAtual,
  onReorder,
  onTurnoChange,
  onRemove,
  onSurpresaChange,
  onRolarIniciativa,
}: InitiativeTrackerProps) {
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [dragged, setDragged] = useState<number | null>(null)
  const [imagemFalhou, setImagemFalhou] = useState<Set<string>>(new Set())
  const onImagemErro = useCallback((url: string) => {
    setImagemFalhou((prev) => new Set(prev).add(url))
  }, [])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragged(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
    e.dataTransfer.setData("application/json", JSON.stringify(entradas[index]))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }

  const handleDragLeave = () => setDragOver(null)

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10)
    setDragOver(null)
    setDragged(null)
    if (fromIndex === toIndex || isNaN(fromIndex)) return
    const novo = [...entradas]
    const [removido] = novo.splice(fromIndex, 1)
    novo.splice(toIndex, 0, removido)
    onReorder(novo)
    const novoTurno = fromIndex < toIndex
      ? (turnoAtual === fromIndex ? toIndex - 1 : turnoAtual > fromIndex && turnoAtual <= toIndex ? turnoAtual - 1 : turnoAtual)
      : (turnoAtual === fromIndex ? toIndex : turnoAtual >= toIndex && turnoAtual < fromIndex ? turnoAtual + 1 : turnoAtual)
    onTurnoChange(Math.max(0, Math.min(novoTurno, novo.length - 1)))
  }

  const handleDragEnd = () => {
    setDragged(null)
    setDragOver(null)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="section-title">
          Rastreador de Iniciativa
        </h3>
        {onRolarIniciativa && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
            onClick={onRolarIniciativa}
          >
            <Dices className="mr-1 h-4 w-4" />
            Rolar iniciativa
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {entradas.map((e, i) => (
          <div
            key={e.id}
            draggable
            onDragStart={(ev) => handleDragStart(ev, i)}
            onDragOver={(ev) => handleDragOver(ev, i)}
            onDragLeave={handleDragLeave}
            onDrop={(ev) => handleDrop(ev, i)}
            onDragEnd={handleDragEnd}
            onClick={() => onTurnoChange(i)}
            className={cn(
              "flex cursor-grab items-center gap-2 rounded-lg border px-2 py-2 transition-all active:cursor-grabbing",
              turnoAtual === i
                ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple)]/20 shadow-lg shadow-[var(--color-accent-purple)]/20"
                : "border-slate-700/80 bg-slate-800/50 hover:border-slate-600",
              dragOver === i && "border-amber-500 bg-amber-500/10",
              dragged === i && "opacity-50"
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="text-lg font-bold text-slate-400">
              {i + 1}.
            </span>
            {e.imagemUrl && !imagemFalhou.has(e.imagemUrl) ? (
              <img
                src={e.imagemUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-600 object-cover"
                onError={() => onImagemErro(e.imagemUrl!)}
              />
            ) : e.tipo === "jogador" ? (
              <User className="h-5 w-5 shrink-0 text-[var(--color-neon-purple)]" />
            ) : (
              <Ghost className="h-5 w-5 shrink-0 text-red-400" />
            )}
            <span className="min-w-0 flex-1 truncate font-medium">
              {e.nome}
            </span>
            {onSurpresaChange && (
              <button
                type="button"
                onClick={(ev) => { ev.stopPropagation(); onSurpresaChange(e.id, !e.surpresa) }}
                className={cn(
                  "shrink-0 rounded p-0.5",
                  e.surpresa ? "bg-amber-500/40 text-amber-300" : "text-slate-500 hover:bg-slate-600/50"
                )}
                title={e.surpresa ? "Surpresa (não age no 1º round)" : "Marcar surpresa"}
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            )}
            {e.pvMax != null && (
              <span className="text-xs text-slate-500">
                {e.pvAtual ?? 0}/{e.pvMax}
              </span>
            )}
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 shrink-0 p-0 text-slate-400 hover:text-rose-400"
                onClick={(ev) => {
                  ev.stopPropagation()
                  onRemove(e.id)
                }}
                title="Remover da iniciativa"
                aria-label={`Remover ${e.nome} da iniciativa`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onTurnoChange(turnoAtual >= entradas.length - 1 ? 0 : turnoAtual + 1)
        }
        className="mt-2 rounded border border-[var(--color-accent-purple)]/50 bg-[var(--color-accent-purple)]/10 px-3 py-1 text-sm text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/20"
      >
        Próximo turno →
      </button>
    </div>
  )
}
