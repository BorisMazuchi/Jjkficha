import { useState } from "react"
import { cn } from "@/lib/utils"
import type { PartyMember } from "@/types/mestre"
import { calcularEstadoAlma } from "@/lib/estadosAlma"
import { Shield, Zap, Plus, Minus, FileText, UserPlus, Trash2, Heart, Coffee, Focus, Scan, Move, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PartyMonitorProps {
  membros: PartyMember[]
  onUpdateMembro: (id: string, dados: Partial<PartyMember>) => void
  onAddMembro?: () => void
  onRemoveMembro?: (id: string) => void
  onAbrirFicha?: (membro: PartyMember) => void
  onDescanso?: () => void
  /** Adicionar invocação (Shikigami/Corpo) do Controlador à iniciativa */
  onAddInvocacaoToIniciativa?: (membroId: string, invocacao: { id: string; nome: string; pvAtual: number; pvMax: number }) => void
}

export function PartyMonitor({
  membros,
  onUpdateMembro,
  onAddMembro,
  onRemoveMembro,
  onAbrirFicha,
  onDescanso,
  onAddInvocacaoToIniciativa,
}: PartyMonitorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="section-title flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Party Monitor
        </h3>
        <div className="flex items-center gap-2">
          {onDescanso && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onDescanso}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
            >
              <Coffee className="mr-1.5 h-4 w-4" />
              Descanso
            </Button>
          )}
          {onAddMembro && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddMembro}
              className="border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/20"
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Adicionar jogador
            </Button>
          )}
        </div>
      </div>
      {membros.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50 py-6 text-center text-sm text-[var(--color-text-muted)]">
          Nenhum jogador na party. Clique em &quot;Adicionar jogador&quot; para começar e depois vincule a ficha de cada um pelo ícone da ficha.
        </p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {membros.map((m) => (
          <PartyCard
            key={m.id}
            membro={m}
            onUpdate={(d) => onUpdateMembro(m.id, d)}
            onAbrirFicha={onAbrirFicha ? () => onAbrirFicha(m) : undefined}
            onRemove={onRemoveMembro ? () => onRemoveMembro(m.id) : undefined}
            onAddInvocacaoToIniciativa={onAddInvocacaoToIniciativa}
          />
        ))}
      </div>
    </div>
  )
}

function PartyCard({
  membro,
  onUpdate,
  onAbrirFicha,
  onRemove,
  onAddInvocacaoToIniciativa,
}: {
  membro: PartyMember
  onUpdate: (d: Partial<PartyMember>) => void
  onAbrirFicha?: () => void
  onRemove?: () => void
  onAddInvocacaoToIniciativa?: (membroId: string, invocacao: { id: string; nome: string; pvAtual: number; pvMax: number }) => void
}) {
  const [showInvocacoes, setShowInvocacoes] = useState(false)
  const pvPct = membro.pvMax > 0 ? (membro.pvAtual / membro.pvMax) * 100 : 0
  const pePct = membro.peMax > 0 ? (membro.peAtual / membro.peMax) * 100 : 0

  const alterarPV = (delta: number) =>
    onUpdate({ pvAtual: Math.max(0, Math.min(membro.pvMax, membro.pvAtual + delta)) })
  const alterarPE = (delta: number) =>
    onUpdate({ peAtual: Math.max(0, Math.min(membro.peMax, membro.peAtual + delta)) })

  return (
    <div
      className={cn(
        "min-w-[180px] flex-shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 shadow-lg",
        "transition-all hover:border-[var(--color-neon-purple)]/40 hover:shadow-[0_0_15px_rgba(106,13,173,0.15)]",
        membro.condicoes.length > 0 && "ring-1 ring-amber-500/50",
        membro.energiaTemporaria && "ring-1 ring-amber-400/40"
      )}
    >
      {(membro.imagemUrl && (
        <div className="mb-2 flex justify-center">
          <img
            src={membro.imagemUrl}
            alt=""
            className="h-14 w-14 rounded-lg border border-[var(--color-border)] object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      )) || null}
      <div className="mb-2 flex items-center justify-between gap-1">
        <input
          type="text"
          value={membro.nome}
          onChange={(e) => onUpdate({ nome: e.target.value })}
          className="min-w-0 flex-1 truncate rounded border-0 bg-transparent font-medium text-slate-100 outline-none focus:ring-1 focus:ring-[var(--color-accent-purple)]/50"
          placeholder="Nome"
        />
        <span className="shrink-0 text-xs text-slate-500">Nv.{membro.nivel} {membro.grau}</span>
        <div className="flex shrink-0 items-center gap-0.5">
          {onAbrirFicha && (
            <>
              {membro.fichaId && (
                <span className="rounded bg-[var(--color-accent-purple)]/20 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-neon-purple)]" title="Ficha vinculada">
                  Ficha ✓
                </span>
              )}
              <button
                type="button"
                onClick={onAbrirFicha}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-[var(--color-accent-purple)]/20 hover:text-[var(--color-neon-purple)]"
                title={membro.fichaId ? "Abrir/alterar ficha vinculada" : "Vincular ou abrir ficha do jogador"}
              >
                <FileText className="h-4 w-4" />
              </button>
            </>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="Remover da party"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
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
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-red-500/20 p-1 text-red-400 hover:bg-red-500/40 touch-manipulation"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => alterarPV(1)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-emerald-500/20 p-1 text-emerald-400 hover:bg-emerald-500/40 touch-manipulation"
              >
                <Plus className="h-4 w-4" />
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
            <span className="text-slate-400">{membro.usaEstamina ? "Estamina" : "PE"}</span>
            <button
              type="button"
              onClick={() => onUpdate({ energiaTemporaria: !membro.energiaTemporaria })}
              className={cn(
                "flex items-center gap-0.5 transition-colors",
                membro.energiaTemporaria ? "text-amber-400" : "text-violet-400 hover:text-amber-400/70"
              )}
              title={membro.energiaTemporaria ? "Energia Amaldiçada Temporária (clique para remover)" : membro.usaEstamina ? "Estamina (Restringido)" : "Clique para marcar Energia Temporária"}
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
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-slate-600/50 p-1 text-slate-400 hover:bg-slate-500/50 touch-manipulation"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => alterarPE(1)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-violet-500/20 p-1 text-violet-400 hover:bg-violet-500/40 touch-manipulation"
              >
                <Plus className="h-4 w-4" />
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
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Defesa: {membro.defesa}
          </span>
          <span className="flex items-center gap-0.5">
            Inic.+
            <input
              type="number"
              value={membro.bonusIniciativa ?? ""}
              onChange={(e) => onUpdate({ bonusIniciativa: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-8 rounded border-0 bg-slate-800/50 px-0.5 py-0.5 text-center text-slate-300 outline-none focus:ring-1 focus:ring-[var(--color-accent-purple)]/50"
            />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Move className="h-3 w-3" />
            <input
              type="number"
              min={0}
              value={membro.movimento ?? ""}
              onChange={(e) => onUpdate({ movimento: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })}
              placeholder="m"
              className="w-10 rounded border-0 bg-slate-800/50 px-1 py-0.5 text-slate-300 outline-none focus:ring-1 focus:ring-[var(--color-accent-purple)]/50"
            />
            m
          </span>
          <span className="flex items-center gap-0.5 text-slate-400">
            <ShieldCheck className="h-3 w-3" title="Cobertura" />
            {(["meia", "total"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onUpdate({ cobertura: membro.cobertura === c ? undefined : c })}
                className={cn(
                  "rounded px-1 py-0.5 text-[10px]",
                  membro.cobertura === c ? "bg-amber-500/30 text-amber-300" : "text-slate-500 hover:bg-slate-600/50"
                )}
              >
                {c === "meia" ? "Meia" : "Total"}
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={() => onUpdate({ emFlanco: !membro.emFlanco })}
            className={cn(
              "rounded px-1 py-0.5 text-[10px]",
              membro.emFlanco ? "bg-[var(--color-accent-purple)]/30 text-[var(--color-neon-purple)]" : "text-slate-500 hover:bg-slate-600/50"
            )}
            title="Em flanco"
          >
            Flanco
          </button>
        </div>
        {membro.integridadeMax != null && membro.integridadeMax > 0 && (
          <div
            className="flex items-center gap-1 text-xs text-slate-400"
            title={calcularEstadoAlma(membro.integridadeAtual ?? 0, membro.integridadeMax)?.descricao}
          >
            <Heart className="h-3 w-3 text-[var(--color-neon-purple)]" />
            <span>
              Alma: {calcularEstadoAlma(membro.integridadeAtual ?? 0, membro.integridadeMax)?.estado ?? "—"} (
              {membro.integridadeAtual ?? 0}/{membro.integridadeMax})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-1 text-xs">
          <span className="text-slate-400">Exaustão:</span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  nivelExaustao: Math.max(0, (membro.nivelExaustao ?? 0) - 1),
                })
              }
              className="rounded bg-slate-600/50 p-0.5 text-slate-400 hover:bg-slate-500/50 min-h-[28px] min-w-[28px] flex items-center justify-center"
              title="Reduzir exaustão"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span
              className={cn(
                "min-w-[1.25rem] text-center font-medium",
                (membro.nivelExaustao ?? 0) > 0 ? "text-amber-400" : "text-slate-500"
              )}
            >
              {membro.nivelExaustao ?? 0}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  nivelExaustao: Math.min(5, (membro.nivelExaustao ?? 0) + 1),
                })
              }
              className="rounded bg-amber-500/20 p-0.5 text-amber-400 hover:bg-amber-500/40 min-h-[28px] min-w-[28px] flex items-center justify-center"
              title="Aumentar exaustão"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Focus className="h-3 w-3 text-slate-500" title="Concentração (Cap. 12)" />
          <input
            type="text"
            value={membro.concentrandoEm ?? ""}
            onChange={(e) => onUpdate({ concentrandoEm: e.target.value.trim() || undefined })}
            placeholder="Concentrando em..."
            className="min-w-0 flex-1 truncate rounded border-0 bg-slate-800/50 px-1.5 py-0.5 text-slate-300 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[var(--color-accent-purple)]/50"
          />
        </div>
        {membro.dominioNome && (
          <div className="flex items-center gap-1.5 text-xs">
            <Scan className="h-3 w-3 text-slate-500" title="Expansão de Domínio (Cap. 12)" />
            <span className="min-w-0 truncate text-slate-400">{membro.dominioNome}</span>
            <button
              type="button"
              onClick={() => onUpdate({ dominioAtivo: !membro.dominioAtivo })}
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                membro.dominioAtivo
                  ? "bg-[var(--color-accent-purple)]/40 text-[var(--color-neon-purple)]"
                  : "bg-slate-700/60 text-slate-500 hover:bg-slate-600/60"
              )}
            >
              {membro.dominioAtivo ? "Ativo" : "Inativo"}
            </button>
          </div>
        )}
        {membro.invocoes && membro.invocoes.length > 0 && onAddInvocacaoToIniciativa && (
          <div className="text-xs">
            <button
              type="button"
              onClick={() => setShowInvocacoes((v) => !v)}
              className="text-[var(--color-neon-purple)]/90 hover:underline"
            >
              {showInvocacoes ? "Ocultar invocações" : "Adicionar à iniciativa"}
            </button>
            {showInvocacoes && (
              <div className="mt-1 flex flex-wrap gap-0.5">
                {membro.invocoes.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => onAddInvocacaoToIniciativa(membro.id, inv)}
                    className="rounded bg-slate-600/60 px-1.5 py-0.5 text-[10px] text-slate-200 hover:bg-slate-500/60"
                  >
                    {inv.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
