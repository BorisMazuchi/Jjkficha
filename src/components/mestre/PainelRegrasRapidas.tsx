import { useState } from "react"
import { BookOpen, Zap, AlertTriangle, Skull } from "lucide-react"
import { cn } from "@/lib/utils"

const ABA_CD = "CDs"
const ABA_DANO = "Dano externo"
const ABA_FERIMENTOS = "Ferimentos complexos"

const CDS = [
  { nivel: "Fácil", valor: 10, cor: "text-emerald-400" },
  { nivel: "Médio", valor: 15, cor: "text-amber-400" },
  { nivel: "Difícil", valor: 20, cor: "text-orange-400" },
  { nivel: "Muito difícil", valor: 25, cor: "text-rose-400" },
  { nivel: "Quase impossível", valor: 30, cor: "text-purple-400" },
] as const

const DANO_EXTERNO = [
  { fonte: "Queda (por 1,5m)", dano: "1d6 por 1,5m", obs: "Máx. 20d6" },
  { fonte: "Colisão (veículo)", dano: "Conforme velocidade", obs: "Tabela p. XX" },
  { fonte: "Sufocamento", dano: "1d6 por rodada", obs: "Após segurar respiração" },
  { fonte: "Fome/Sede", dano: "1 nível de exaustão/dia", obs: "Após 3 dias" },
  { fonte: "Veneno (ingestão)", dano: "Conforme veneno", obs: "CD Constituição" },
] as const

const FERIMENTOS = [
  { tipo: "Perda de membro", efeito: "Incapacitação parcial", obs: "Cura avançada/domínio" },
  { tipo: "Trauma grave", efeito: "Desvantagem em testes", obs: "Até tratamento" },
  { tipo: "Sangramento", efeito: "1d6 por rodada", obs: "Teste Medicina ou pressão" },
  { tipo: "Concussão", efeito: "Atordoado 1d4 rodadas", obs: "CD Constituição" },
] as const

export function PainelRegrasRapidas() {
  const [aba, setAba] = useState<typeof ABA_CD | typeof ABA_DANO | typeof ABA_FERIMENTOS>(ABA_CD)

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-700/80 bg-slate-900/50 p-3">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
        <BookOpen className="h-4 w-4" />
        Regras rápidas
      </h3>

      <div className="mb-2 flex gap-1 rounded border border-slate-600 bg-slate-800/80 p-0.5">
        <button
          type="button"
          onClick={() => setAba(ABA_CD)}
          className={cn(
            "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            aba === ABA_CD
              ? "bg-cyan-500/30 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          CDs
        </button>
        <button
          type="button"
          onClick={() => setAba(ABA_DANO)}
          className={cn(
            "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            aba === ABA_DANO
              ? "bg-cyan-500/30 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          Dano
        </button>
        <button
          type="button"
          onClick={() => setAba(ABA_FERIMENTOS)}
          className={cn(
            "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            aba === ABA_FERIMENTOS
              ? "bg-cyan-500/30 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          Ferimentos
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto text-xs">
        {aba === ABA_CD && (
          <div className="space-y-1.5">
            <p className="text-slate-400">CD de testes (atributo + perícia vs CD)</p>
            {CDS.map((row) => (
              <div
                key={row.nivel}
                className="flex items-center justify-between rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <span className="text-slate-300">{row.nivel}</span>
                <span className={cn("font-mono font-bold", row.cor)}>{row.valor}</span>
              </div>
            ))}
          </div>
        )}

        {aba === ABA_DANO && (
          <div className="space-y-1.5">
            <p className="text-slate-400">Dano por fontes externas</p>
            {DANO_EXTERNO.map((row) => (
              <div
                key={row.fonte}
                className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  {row.fonte}
                </div>
                <div className="mt-0.5 font-mono text-cyan-300/90">{row.dano}</div>
                {row.obs && (
                  <div className="mt-0.5 text-slate-500">{row.obs}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {aba === ABA_FERIMENTOS && (
          <div className="space-y-1.5">
            <p className="text-slate-400">Ferimentos complexos (perda de membros, etc.)</p>
            {FERIMENTOS.map((row) => (
              <div
                key={row.tipo}
                className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <div className="flex items-center gap-1.5 font-medium text-rose-300/90">
                  <Skull className="h-3.5 w-3.5 shrink-0" />
                  {row.tipo}
                </div>
                <div className="mt-0.5 text-slate-300">{row.efeito}</div>
                {row.obs && (
                  <div className="mt-0.5 flex items-center gap-1 text-slate-500">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {row.obs}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
