import { useState } from "react"
import { X, Moon, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { rolarExpressao } from "@/lib/dados"
import type { PartyMember, LogEntry } from "@/types/mestre"
import { cn } from "@/lib/utils"

interface DescansoModalProps {
  isOpen: boolean
  onClose: () => void
  membros: PartyMember[]
  onUpdateMembro: (id: string, dados: Partial<PartyMember>) => void
  addLog?: (entry: Omit<LogEntry, "id" | "timestamp">) => void
}

type TipoDescanso = "curto" | "longo"

/** Dados de vida padrão quando não definidos na ficha (ex.: nível 2 → "2d10") */
function dadosVidaPadrao(m: PartyMember): string {
  if (m.dadosVida?.trim()) return m.dadosVida.trim()
  const nivel = Math.max(1, m.nivel ?? 1)
  return `${nivel}d10`
}

export function DescansoModal({
  isOpen,
  onClose,
  membros,
  onUpdateMembro,
  addLog,
}: DescansoModalProps) {
  const [tipo, setTipo] = useState<TipoDescanso>("curto")

  if (!isOpen) return null

  const aplicarDescansoLongo = () => {
    membros.forEach((m) => {
      const exAtual = m.nivelExaustao ?? 0
      onUpdateMembro(m.id, {
        pvAtual: m.pvMax,
        peAtual: m.peMax,
        nivelExaustao: Math.max(0, exAtual - 1),
      })
    })
    addLog?.({
      tipo: "sistema",
      texto: `Descanso longo: todos recuperaram PV/PE e reduziram exaustão em 1.`,
    })
    onClose()
  }

  const rolarDadosVida = (m: PartyMember) => {
    const expr = dadosVidaPadrao(m)
    const result = rolarExpressao(expr)
    if (!result) return
    const novoPV = Math.min(m.pvMax, m.pvAtual + result.total)
    onUpdateMembro(m.id, { pvAtual: novoPV })
    addLog?.({
      tipo: "cura",
      texto: `${m.nome}: dados de vida ${result.texto} → +${result.total} PV (${m.pvAtual} → ${novoPV}).`,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)]",
          "bg-[var(--color-bg-card)] shadow-xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Descanso</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Livro v2.5 — Cap. 12: descanso curto (rolar dados de vida) ou longo (recuperar PV/PE e reduzir exaustão).
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={tipo === "curto" ? "default" : "outline"}
              className={tipo === "curto" ? "bg-[var(--color-accent-purple)]" : ""}
              onClick={() => setTipo("curto")}
            >
              <Coffee className="mr-1.5 h-4 w-4" />
              Curto
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tipo === "longo" ? "default" : "outline"}
              className={tipo === "longo" ? "bg-[var(--color-accent-purple)]" : ""}
              onClick={() => setTipo("longo")}
            >
              <Moon className="mr-1.5 h-4 w-4" />
              Longo
            </Button>
          </div>

          {tipo === "curto" && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-text-muted)]">Rolar dados de vida por personagem:</p>
              {membros.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">{m.nome}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">{dadosVidaPadrao(m)}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)]"
                      onClick={() => rolarDadosVida(m)}
                    >
                      Rolar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tipo === "longo" && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-text-muted)]">
                Todos recuperam PV e PE ao máximo e reduzem exaustão em 1.
              </p>
              <Button
                type="button"
                size="sm"
                className="w-full bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple)]/90"
                onClick={aplicarDescansoLongo}
              >
                Aplicar descanso longo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
