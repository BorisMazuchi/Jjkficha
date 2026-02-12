import { useState, useCallback } from "react"
import { PartyMonitor } from "@/components/mestre/PartyMonitor"
import { InitiativeTracker } from "@/components/mestre/InitiativeTracker"
import { QuickBestiary } from "@/components/mestre/QuickBestiary"
import { PainelCondicoes } from "@/components/mestre/PainelCondicoes"
import { LogCombate } from "@/components/mestre/LogCombate"
import type {
  PartyMember,
  InitiativeEntry,
  Maldicao,
  LogEntry,
  Condicao,
} from "@/types/mestre"
import { cn } from "@/lib/utils"
import { Eye, LayoutGrid, FileText, Link2 } from "lucide-react"
import { Link } from "react-router-dom"

function useMestreState() {
  const [membros, setMembros] = useState<PartyMember[]>([
    {
      id: "1",
      nome: "Jogador 1",
      nivel: 5,
      grau: "3º",
      pvAtual: 35,
      pvMax: 40,
      peAtual: 20,
      peMax: 25,
      defesa: 14,
      energiaTemporaria: false,
      condicoes: [],
    },
    {
      id: "2",
      nome: "Jogador 2",
      nivel: 4,
      grau: "4º",
      pvAtual: 28,
      pvMax: 30,
      peAtual: 18,
      peMax: 20,
      defesa: 12,
      energiaTemporaria: true,
      condicoes: ["Sangramento"],
    },
  ])

  const [entradas, setEntradas] = useState<InitiativeEntry[]>([])
  const [turnoAtual, setTurnoAtual] = useState(0)
  const [maldicoes, setMaldicoes] = useState<Maldicao[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [modoPanico, setModoPanico] = useState(false)

  const addLog = useCallback(
    (entry: Omit<LogEntry, "id" | "timestamp">) => {
      setLog((prev) => [
        ...prev,
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ])
    },
    []
  )

  const syncIniciativaFromMembros = useCallback(() => {
    const jogadores: InitiativeEntry[] = membros.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo: "jogador",
      pvAtual: m.pvAtual,
      pvMax: m.pvMax,
    }))
    const maldiEntradas: InitiativeEntry[] = maldicoes.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo: "maldicao",
      pvAtual: m.pvAtual,
      pvMax: m.pvMax,
    }))
    setEntradas([...jogadores, ...maldiEntradas])
    setTurnoAtual(0)
    addLog({ tipo: "info", texto: "Iniciativa sincronizada" })
  }, [membros, maldicoes, addLog])

  const updateMembro = useCallback(
    (id: string, dados: Partial<PartyMember>) => {
      setMembros((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...dados } : m))
      )
      if (entradas.some((e) => e.id === id)) {
        setEntradas((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  pvAtual: dados.pvAtual ?? e.pvAtual,
                  pvMax: dados.pvMax ?? e.pvMax,
                }
              : e
          )
        )
      }
    },
    [entradas]
  )

  const addCondicaoMembro = useCallback(
    (membroId: string, condicao: Condicao) => {
      updateMembro(membroId, {
        condicoes: [
          ...(membros.find((m) => m.id === membroId)?.condicoes ?? []),
          condicao,
        ].filter((c, i, arr) => arr.indexOf(c) === i),
      })
      addLog({
        tipo: "condicao",
        texto: `Condição "${condicao}" aplicada`,
        alvo: membros.find((m) => m.id === membroId)?.nome,
      })
    },
    [membros, updateMembro, addLog]
  )

  const removeCondicaoMembro = useCallback(
    (membroId: string, condicao: string) => {
      updateMembro(membroId, {
        condicoes: (membros.find((m) => m.id === membroId)?.condicoes ?? []).filter(
          (c) => c !== condicao
        ),
      })
      addLog({
        tipo: "condicao",
        texto: `Condição "${condicao}" removida`,
        alvo: membros.find((m) => m.id === membroId)?.nome,
      })
    },
    [membros, updateMembro, addLog]
  )

  return {
    membros,
    entradas,
    turnoAtual,
    maldicoes,
    log,
    modoPanico,
    setModoPanico,
    setMembros,
    setEntradas,
    setTurnoAtual,
    setMaldicoes,
    updateMembro,
    addLog,
    addCondicaoMembro,
    removeCondicaoMembro,
    syncIniciativaFromMembros,
  }
}

export function TelaMestre() {
  const state = useMestreState()

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-700",
        state.modoPanico
          ? "bg-[#0f0a14]"
          : "bg-[#0a0e14]"
      )}
    >
      <header
        className={cn(
          "border-b px-4 py-3 transition-all duration-500",
          state.modoPanico
            ? "border-rose-500/60 bg-black/60 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
            : "border-cyan-900/60 bg-slate-900/80"
        )}
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <FileText className="h-4 w-4" />
              Fichas
            </Link>
            <h1 className="font-display text-xl font-bold tracking-[0.2em] text-cyan-400">
              TELA DO MESTRE
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => state.syncIniciativaFromMembros()}
              className="rounded border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
            >
              <Link2 className="mr-1.5 inline h-4 w-4" />
              Sincronizar Iniciativa
            </button>
            <button
              type="button"
              onClick={() => state.setModoPanico(!state.modoPanico)}
              className={cn(
                "flex items-center gap-2 rounded px-4 py-2 font-bold transition-all duration-500",
                state.modoPanico
                  ? "border-2 border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                  : "border border-rose-900/80 bg-slate-800/80 text-rose-400/80 hover:border-rose-500/60 hover:bg-rose-500/10"
              )}
            >
              <Eye className="h-5 w-5" />
              {state.modoPanico ? "EXPANSÃO DE DOMÍNIO" : "Modo de Pânico"}
            </button>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto grid max-w-[1800px] gap-4 p-4 transition-all duration-500",
          "grid-cols-1 lg:grid-cols-12",
          state.modoPanico && "[&>*]:animate-[pulse_3s_ease-in-out_infinite]"
        )}
      >
        {/* Party Monitor - full width */}
        <section
          className={cn(
            "col-span-full rounded-xl border p-4 transition-all duration-500",
            state.modoPanico
              ? "border-rose-500/40 bg-black/40 shadow-[inset_0_0_40px_rgba(244,63,94,0.05)]"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <PartyMonitor
            membros={state.membros}
            onUpdateMembro={state.updateMembro}
          />
        </section>

        {/* Bento Grid */}
        <section
          className={cn(
            "col-span-full min-h-[200px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <InitiativeTracker
            entradas={state.entradas}
            turnoAtual={state.turnoAtual}
            onReorder={state.setEntradas}
            onTurnoChange={state.setTurnoAtual}
          />
        </section>

        <section
          className={cn(
            "col-span-full min-h-[200px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <QuickBestiary
            maldicoes={state.maldicoes}
            onMaldicoesChange={state.setMaldicoes}
            onAddToIniciativa={(m) => {
              state.setEntradas((prev) => [
                ...prev,
                {
                  id: m.id,
                  nome: m.nome,
                  tipo: "maldicao",
                  pvAtual: m.pvAtual,
                  pvMax: m.pvMax,
                },
              ])
              state.addLog({
                tipo: "info",
                texto: `${m.nome} adicionado à iniciativa`,
              })
            }}
            onDano={(m, d) => {
              state.setMaldicoes((prev) =>
                prev.map((mal) =>
                  mal.id === m.id
                    ? { ...mal, pvAtual: Math.max(0, mal.pvAtual - d) }
                    : mal
                )
              )
              state.setEntradas((prev) =>
                prev.map((e) =>
                  e.id === m.id
                    ? {
                        ...e,
                        pvAtual: Math.max(
                          0,
                          (e.pvAtual ?? 0) - d
                        ),
                      }
                    : e
                )
              )
              state.addLog({
                tipo: "dano",
                texto: `-${d} PV`,
                alvo: m.nome,
              })
            }}
          />
        </section>

        <section
          className={cn(
            "col-span-full min-h-[200px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <PainelCondicoes
            membros={state.membros}
            onAddCondicao={state.addCondicaoMembro}
            onRemoveCondicao={state.removeCondicaoMembro}
          />
        </section>

        {/* Log - full width bottom */}
        <section
          className={cn(
            "col-span-full min-h-[180px] rounded-xl border p-4 transition-all duration-500",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <LogCombate log={state.log} onRolagem={state.addLog} />
        </section>
      </main>
    </div>
  )
}
