import { useState, useCallback, useEffect, useRef } from "react"
import { PartyMonitor } from "@/components/mestre/PartyMonitor"
import { InitiativeTracker } from "@/components/mestre/InitiativeTracker"
import { FichaModal } from "@/components/mestre/FichaModal"
import { FichaMaldicaoModal } from "@/components/mestre/FichaMaldicaoModal"
import { QuickBestiary } from "@/components/mestre/QuickBestiary"
import { PainelCondicoes } from "@/components/mestre/PainelCondicoes"
import { PainelRegrasRapidas } from "@/components/mestre/PainelRegrasRapidas"
import { ControleVotos } from "@/components/mestre/ControleVotos"
import { LogCombate } from "@/components/mestre/LogCombate"
import { DiceRoller } from "@/components/DiceRoller"
import {
  carregarSessao,
  salvarSessao,
  SESSAO_INICIAL,
} from "@/lib/sessaoDb"
import type {
  PartyMember,
  InitiativeEntry,
  Maldicao,
  LogEntry,
  Condicao,
} from "@/types/mestre"
import type { VotoRestricao } from "@/components/mestre/ControleVotos"
import { cn } from "@/lib/utils"
import { Eye, FileText, LayoutGrid, Link2, BookOpen, Swords, Minus } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

function useMestreState() {
  const [membros, setMembros] = useState<PartyMember[]>(SESSAO_INICIAL.membros)
  const [entradas, setEntradas] = useState<InitiativeEntry[]>(SESSAO_INICIAL.entradas)
  const [turnoAtual, setTurnoAtual] = useState(SESSAO_INICIAL.turnoAtual)
  const [maldicoes, setMaldicoes] = useState<Maldicao[]>(SESSAO_INICIAL.maldicoes)
  const [log, setLog] = useState<LogEntry[]>([])
  const [votos, setVotos] = useState<VotoRestricao[]>(SESSAO_INICIAL.votos as VotoRestricao[])
  const [modoPanico, setModoPanico] = useState(false)
  const [carregado, setCarregado] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const sessao = await carregarSessao()
      if (cancelled) return
      if (sessao) {
        setMembros(sessao.membros as PartyMember[])
        setEntradas(sessao.entradas as InitiativeEntry[])
        setTurnoAtual(sessao.turnoAtual)
        setMaldicoes(sessao.maldicoes as Maldicao[])
        setLog(sessao.log as LogEntry[])
        setVotos(
          (sessao.votos ?? []).map((v) => ({
            ...v,
            dono: (v as { dono?: string }).dono ?? "",
            tipo: (v as VotoRestricao).tipo,
          })) as VotoRestricao[]
        )
      }
      setCarregado(true)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const stateRef = useRef({ membros, entradas, turnoAtual, maldicoes, log, votos })
  stateRef.current = { membros, entradas, turnoAtual, maldicoes, log, votos }

  useEffect(() => {
    if (!carregado) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      const s = stateRef.current
      salvarSessao({
        membros: s.membros,
        entradas: s.entradas,
        turnoAtual: s.turnoAtual,
        maldicoes: s.maldicoes,
        log: s.log,
        votos: s.votos,
      })
      saveTimeoutRef.current = null
    }, 1500)
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        const s = stateRef.current
        salvarSessao({
          membros: s.membros,
          entradas: s.entradas,
          turnoAtual: s.turnoAtual,
          maldicoes: s.maldicoes,
          log: s.log,
          votos: s.votos,
        })
      }
    }
  }, [carregado, membros, entradas, turnoAtual, maldicoes, log, votos])

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

  const addMembro = useCallback(() => {
    const novo: PartyMember = {
      id: crypto.randomUUID(),
      nome: "Novo jogador",
      nivel: 1,
      grau: "4º",
      pvAtual: 10,
      pvMax: 10,
      peAtual: 10,
      peMax: 10,
      defesa: 10,
      energiaTemporaria: false,
      condicoes: [],
    }
    setMembros((prev) => [...prev, novo])
    addLog({ tipo: "info", texto: `${novo.nome} adicionado à party` })
  }, [addLog])

  const removeMembro = useCallback(
    (id: string) => {
      setMembros((prev) => prev.filter((m) => m.id !== id))
      setEntradas((prev) => prev.filter((e) => e.id !== id))
      addLog({
        tipo: "info",
        texto: "Jogador removido da party",
        alvo: membros.find((m) => m.id === id)?.nome,
      })
    },
    [membros, addLog]
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
    addMembro,
    removeMembro,
    votos,
    setVotos,
  }
}

const danoRapido = [5, 10, 15, 20, 25]

export function TelaMestre() {
  const state = useMestreState()
  const [fichaModalMembro, setFichaModalMembro] = useState<PartyMember | null>(null)
  const [fichaBestiarioAberta, setFichaBestiarioAberta] = useState<Maldicao | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const addFromBestiario = (location.state as { addMaldicaoFromBestiario?: Maldicao } | null)
      ?.addMaldicaoFromBestiario
    if (!addFromBestiario) return
    navigate("/mestre", { replace: true, state: {} })
    state.setMaldicoes((prev) => [
      ...prev,
      {
        ...addFromBestiario,
        id: crypto.randomUUID(),
        pvAtual: addFromBestiario.pvMax,
        origemBestiario: true,
      },
    ])
  }, [location.state, navigate, state.setMaldicoes])

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
            <Link
              to="/bestiario"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <BookOpen className="h-4 w-4" />
              Bestiário
            </Link>
            <Link
              to="/tabuleiro"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <LayoutGrid className="h-4 w-4" />
              Tabuleiro
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
            onAddMembro={state.addMembro}
            onRemoveMembro={state.removeMembro}
            onAbrirFicha={(m) => setFichaModalMembro(state.membros.find((x) => x.id === m.id) ?? m)}
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
            onRemove={(id) => {
              const idx = state.entradas.findIndex((e) => e.id === id)
              if (idx === -1) return
              state.setEntradas((prev) => prev.filter((e) => e.id !== id))
              state.setTurnoAtual((t) => {
                const newLen = state.entradas.length - 1
                if (newLen <= 0) return 0
                if (t > idx) return t - 1
                if (t === idx) return Math.min(t, newLen - 1)
                return t
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

        {state.maldicoes.filter((m) => m.origemBestiario).length > 0 && (
          <section
            className={cn(
              "col-span-full min-h-[120px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
              state.modoPanico
                ? "border-rose-500/30 bg-black/30"
                : "border-cyan-900/60 bg-slate-900/50"
            )}
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
              <BookOpen className="h-4 w-4" />
              Maldições do bestiário
            </h3>
            <div className="flex flex-wrap gap-2">
              {state.maldicoes
                .filter((m) => m.origemBestiario)
                .map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-lg border border-slate-700/80 bg-slate-800/50 p-2 min-w-[180px]",
                      m.pvAtual <= 0 && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="truncate block text-sm font-medium">{m.nome}</span>
                        {m.grau && (
                          <span className="text-xs text-slate-500">{m.grau}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setFichaBestiarioAberta(m)}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-600 hover:text-cyan-400"
                          title="Editar ficha"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
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
                            state.addLog({ tipo: "info", texto: `${m.nome} adicionado à iniciativa` })
                          }}
                          className="rounded p-0.5 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400"
                          title="Adicionar à iniciativa"
                        >
                          <Swords className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => state.setMaldicoes((prev) => prev.filter((mal) => mal.id !== m.id))}
                          className="rounded p-0.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                          title="Remover da sessão"
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
                            onClick={() => {
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
                                        pvAtual: Math.max(0, (e.pvAtual ?? 0) - d),
                                      }
                                    : e
                                )
                              )
                              state.addLog({ tipo: "dano", texto: `-${d} PV`, alvo: m.nome })
                            }}
                            className="rounded border border-red-900/60 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400 hover:bg-red-500/30"
                          >
                            -{d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

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

        <section
          className={cn(
            "col-span-full min-h-[160px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <PainelRegrasRapidas />
        </section>

        <section
          className={cn(
            "col-span-full min-h-[160px] rounded-xl border p-4 transition-all duration-500 lg:col-span-4",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <ControleVotos
            votos={state.votos}
            onVotosChange={state.setVotos}
            membros={state.membros.map((m) => ({ id: m.id, nome: m.nome }))}
          />
        </section>

        {/* Log + Rolador de dados - full width bottom */}
        <section
          className={cn(
            "col-span-full min-h-[180px] rounded-xl border p-4 transition-all duration-500",
            state.modoPanico
              ? "border-rose-500/30 bg-black/30"
              : "border-cyan-900/60 bg-slate-900/50"
          )}
        >
          <div className="flex h-full gap-4">
            <div className="w-56 shrink-0">
              <DiceRoller
                onRolar={(r) => {
                  const txt =
                    r.critico || r.criticoFalha
                      ? `${r.expressao} → ${r.total} ${r.critico ? " (Crítico!)" : " (Falha crítica)"}`
                      : `${r.expressao} → [${r.valores.join(", ")}] = ${r.total}`
                  state.addLog({ tipo: "rolagem", texto: txt })
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <LogCombate log={state.log} onRolagem={state.addLog} />
            </div>
          </div>
        </section>
      </main>

      <FichaModal
        isOpen={fichaModalMembro != null}
        onClose={() => setFichaModalMembro(null)}
        membroNome={fichaModalMembro?.nome ?? ""}
        fichaIdInicial={fichaModalMembro?.fichaId ?? undefined}
        membroId={fichaModalMembro?.id}
        onVincularFicha={(membroId, fichaId, nomePersonagem) => {
          state.updateMembro(membroId, {
            fichaId,
            ...(nomePersonagem ? { nome: nomePersonagem } : {}),
          })
          setFichaModalMembro((prev) =>
            prev && prev.id === membroId
              ? { ...prev, fichaId, ...(nomePersonagem ? { nome: nomePersonagem } : {}) }
              : prev
          )
        }}
      />

      {fichaBestiarioAberta && (
        <FichaMaldicaoModal
          maldicao={fichaBestiarioAberta}
          isOpen={true}
          onClose={() => setFichaBestiarioAberta(null)}
          onSave={(m) => {
            state.setMaldicoes((prev) =>
              prev.map((mal) => (mal.id === m.id ? { ...m, origemBestiario: true } : mal))
            )
            setFichaBestiarioAberta(null)
          }}
        />
      )}
    </div>
  )
}
