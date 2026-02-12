import { cn } from "@/lib/utils"
import type { PartyMember } from "@/types/mestre"
import { Shield, Zap, Plus, Minus } from "lucide-react"

interface PartyMonitorProps {
  membros: PartyMember[]
  onUpdateMembro: (id: string, dados: Partial<PartyMember>) => void
}

export function PartyMonitor({
  membros,
  onUpdateMembro,
}: PartyMonitorProps) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
        <Shield className="h-4 w-4" />
        Party Monitor
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {membros.map((m) => (
          <PartyCard key={m.id} membro={m} onUpdate={(d) => onUpdateMembro(m.id, d)} />
        ))}
      </div>
    </div>
  )
}

function PartyCard({
  membro,
  onUpdate,
}: {
  membro: PartyMember
  onUpdate: (d: Partial<PartyMember>) => void
}) {
  const pvPct = membro.pvMax > 0 ? (membro.pvAtual / membro.pvMax) * 100 : 0
  const pePct = membro.peMax > 0 ? (membro.peAtual / membro.peMax) * 100 : 0

  const alterarPV = (delta: number) =>
    onUpdate({ pvAtual: Math.max(0, Math.min(membro.pvMax, membro.pvAtual + delta)) })
  const alterarPE = (delta: number) =>
    onUpdate({ peAtual: Math.max(0, Math.min(membro.peMax, membro.peAtual + delta)) })

  return (
    <div
      className={cn(
        "min-w-[180px] flex-shrink-0 rounded-lg border border-cyan-900/60 bg-slate-900/80 p-3 shadow-lg",
        "transition-all hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]",
        membro.condicoes.length > 0 && "ring-1 ring-amber-500/50",
        membro.energiaTemporaria && "ring-1 ring-amber-400/40"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="truncate font-medium text-slate-100">{membro.nome}</span>
        <span className="text-xs text-slate-500">Nv.{membro.nivel} {membro.grau}</span>
      </div>

      <div className="space-y-2">
        <div>
          <div className="mb-0.5 flex justify-between text-xs">
            <span className="text-slate-400">PV</span>
            <span className="text-red-400">{membro.pvAtual}/{membro.pvMax}</span>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => alterarPV(-1)}
                className="rounded bg-red-500/20 p-0.5 text-red-400 hover:bg-red-500/40"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => alterarPV(1)}
                className="rounded bg-emerald-500/20 p-0.5 text-emerald-400 hover:bg-emerald-500/40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full transition-all",
                pvPct <= 25 ? "bg-red-500" : pvPct <= 50 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(pvPct, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-0.5 flex justify-between text-xs">
            <span className="text-slate-400">PE</span>
            <button
              type="button"
              onClick={() => onUpdate({ energiaTemporaria: !membro.energiaTemporaria })}
              className={cn(
                "flex items-center gap-0.5 transition-colors",
                membro.energiaTemporaria ? "text-amber-400" : "text-violet-400 hover:text-amber-400/70"
              )}
              title={membro.energiaTemporaria ? "Energia Amaldiçada Temporária (clique para remover)" : "Clique para marcar Energia Temporária"}
            >
              {membro.peAtual}/{membro.peMax}
              <Zap
                className={cn(
                  "h-3 w-3",
                  membro.energiaTemporaria && "text-amber-400"
                )}
              />
            </button>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => alterarPE(-1)}
                className="rounded bg-slate-600/50 p-0.5 text-slate-400 hover:bg-slate-500/50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => alterarPE(1)}
                className="rounded bg-violet-500/20 p-0.5 text-violet-400 hover:bg-violet-500/40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full transition-all",
                membro.energiaTemporaria ? "bg-amber-500" : "bg-violet-500"
              )}
              style={{ width: `${Math.min(pePct, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Shield className="h-3 w-3" />
          <span>Defesa: {membro.defesa}</span>
        </div>
        {membro.condicoes.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {membro.condicoes.map((c) => (
              <span
                key={c}
                className="rounded bg-amber-500/20 px-1 py-0.5 text-[10px] text-amber-400"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
