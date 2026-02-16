import { useState, useEffect, useRef } from "react"
import { listarFichas, carregarFicha } from "@/lib/fichaDb"
import type { FichaDados } from "@/types/supabase"
import { X, FileText, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const CARREGAR_FICHA_TIMEOUT_MS = 12_000

interface FichaModalProps {
  isOpen: boolean
  onClose: () => void
  membroNome: string
  fichaIdInicial?: string | null
  onVincularFicha?: (
    membroId: string,
    fichaId: string,
    nomePersonagem?: string,
    imagemUrl?: string
  ) => void
  /** Chamado quando a ficha vinculada ao jogador é carregada — permite sincronizar nome e foto do personagem na party/iniciativa */
  onDadosCarregados?: (membroId: string, dados: FichaDados) => void
  membroId?: string
}

export function FichaModal({
  isOpen,
  onClose,
  membroNome,
  fichaIdInicial,
  onVincularFicha,
  onDadosCarregados,
  membroId,
}: FichaModalProps) {
  const [fichas, setFichas] = useState<
    { id: string; nome_personagem: string; jogador: string }[]
  >([])
  const [fichaSelecionada, setFichaSelecionada] = useState<string>(
    fichaIdInicial ?? ""
  )
  const [dados, setDados] = useState<FichaDados | null>(null)
  const [loading, setLoading] = useState(false)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setFichaSelecionada(fichaIdInicial ?? "")
      setDados(null)
      setErroCarregar(null)
      listarFichas()
        .then((lista) =>
          setFichas(
            lista.map((f) => ({
              id: f.id,
              nome_personagem: f.nome_personagem,
              jogador: f.jogador,
            }))
          )
        )
        .catch(() => setFichas([]))
    }
  }, [isOpen, fichaIdInicial])

  useEffect(() => {
    if (!fichaSelecionada) {
      setDados(null)
      setErroCarregar(null)
      setLoading(false)
      return
    }
    const id = ++requestIdRef.current
    setLoading(true)
    setErroCarregar(null)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      if (id !== requestIdRef.current) return
      setLoading(false)
      setErroCarregar("Demorou demais para carregar. Verifique a conexão e se o Supabase está configurado.")
    }, CARREGAR_FICHA_TIMEOUT_MS)

    carregarFicha(fichaSelecionada)
      .then((f) => {
        if (id !== requestIdRef.current) return
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setDados(f)
        setErroCarregar(null)
        if (f && membroId && onDadosCarregados && fichaSelecionada === fichaIdInicial) {
          onDadosCarregados(membroId, f)
        }
      })
      .catch(() => {
        if (id !== requestIdRef.current) return
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setDados(null)
        setErroCarregar("Não foi possível carregar a ficha. Verifique a conexão e as variáveis VITE_SUPABASE_*.")
      })
      .finally(() => {
        if (id === requestIdRef.current) setLoading(false)
      })
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [fichaSelecionada, membroId, fichaIdInicial, onDadosCarregados])

  const handleVincular = () => {
    if (membroId && fichaSelecionada && onVincularFicha) {
      const cabecalho = dados?.cabecalho as { nomePersonagem?: string; imagemPersonagem?: string } | undefined
      onVincularFicha(
        membroId,
        fichaSelecionada,
        cabecalho?.nomePersonagem,
        cabecalho?.imagemPersonagem
      )
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl",
          "overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-4 py-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-neon-purple)]">
            <FileText className="h-5 w-5" />
            Ficha — {membroNome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-700 bg-slate-800/50 p-3">
          <select
            value={fichaSelecionada}
            onChange={(e) => setFichaSelecionada(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
          >
            <option value="">Selecione uma ficha...</option>
            {fichas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome_personagem || "(sem nome)"} — {f.jogador}
              </option>
            ))}
          </select>
          {membroId && onVincularFicha && fichaSelecionada && (
            <button
              type="button"
              onClick={handleVincular}
              className="rounded border border-[var(--color-accent-purple)]/50 bg-[var(--color-accent-purple)]/10 px-3 py-1.5 text-sm text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/20"
            >
              Vincular esta ficha ao jogador
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-neon-purple)]" />
              <span className="text-sm text-[var(--color-text-muted)]">Carregando ficha…</span>
            </div>
          ) : erroCarregar ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-[var(--color-accent-red)]" />
              <p className="text-sm text-[var(--color-text-muted)]">{erroCarregar}</p>
            </div>
          ) : dados ? (
            <FichaResumo dados={dados} />
          ) : (
            <div className="py-12 text-center text-slate-500">
              {fichas.length === 0
                ? "Nenhuma ficha no Supabase. Configure VITE_SUPABASE_* no .env ou salve uma ficha na página de fichas."
                : "Selecione uma ficha na lista acima para visualizar"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FichaResumo({ dados }: { dados: FichaDados }) {
  const c = dados.cabecalho
  const a = dados.atributos
  const r = dados.recursos
  const apt = dados.aptidoes

  const mod = (val: number) => Math.floor((val - 10) / 2)

  const imagemPersonagem = (c as { imagemPersonagem?: string }).imagemPersonagem
  const imagemTecnica = dados.tecnicaAmaldicada
    ? (dados.tecnicaAmaldicada as { imagem?: string }).imagem
    : undefined

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          Cabeçalho
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          {(imagemPersonagem && (
            <div className="mb-3">
              <img
                src={imagemPersonagem}
                alt="Personagem"
                className="h-24 w-24 rounded-lg border border-slate-600 object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )) || null}
          <div className="grid grid-cols-2 gap-2">
            <span className="text-slate-500">Personagem:</span>
            <span>{c.nomePersonagem || "—"}</span>
            <span className="text-slate-500">Jogador:</span>
            <span>{c.jogador || "—"}</span>
            <span className="text-slate-500">Nível:</span>
            <span>{c.nivel}</span>
            <span className="text-slate-500">Grau:</span>
            <span>{c.grau}</span>
            <span className="text-slate-500">Origem/Clã:</span>
            <span>{c.origemCla || "—"}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          Atributos
        </h3>
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          {["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].map(
            (k) => (
              <div key={k}>
                <span className="text-slate-500">{k.slice(0, 3).toUpperCase()}:</span>{" "}
                {(a as Record<string, number>)[k] ?? 10} (
                {mod((a as Record<string, number>)[k] ?? 10) >= 0 ? "+" : ""}
                {mod((a as Record<string, number>)[k] ?? 10)})
              </div>
            )
          )}
          <div>
            <span className="text-slate-500">Defesa:</span> 10 + DES + bônus ={" "}
            {10 + mod(a.destreza ?? 10) + (dados.bonusDefesaClasse ?? 0)}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          Recursos
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-slate-500">PV:</span>
            <span className="text-red-400">
              {r.pvAtual}/{r.pvMax}
            </span>
            <span className="text-slate-500">PE:</span>
            <span className="text-violet-400">
              {r.peAtual}/{r.peMax}
            </span>
            {(r.vidaTemporaria > 0 || r.energiaTemporaria > 0) && (
              <>
                <span className="text-slate-500">Temp. PV:</span>
                <span>{r.vidaTemporaria}</span>
                <span className="text-slate-500">Temp. PE:</span>
                <span>{r.energiaTemporaria}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          Aptidões Amaldiçadas
        </h3>
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          {["Aura", "Controle", "Fluxo", "Potência"].map((k) => (
            <span key={k}>
              {k}: {(apt as Record<string, number>)[k] ?? 0}
            </span>
          ))}
        </div>
      </section>

      {(imagemTecnica || dados.tecnicasInatas?.length > 0 || dados.habilidadesClasse?.length > 0) && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
            Técnica Inata / Habilidades
          </h3>
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
            {imagemTecnica && (
              <div className="mb-2">
                <img
                  src={imagemTecnica}
                  alt="Técnica inata"
                  className="h-20 w-20 rounded-lg border border-slate-600 object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}
            {(dados.tecnicasInatas ?? []).map((h: unknown, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{(h as { nome?: string }).nome || "—"}</span>
                <span className="text-slate-500">
                  PE: {(h as { custoPE?: number }).custoPE ?? 0}
                </span>
              </div>
            ))}
            {(dados.habilidadesClasse ?? []).map((h: unknown, i: number) => (
              <div key={`c-${i}`} className="flex justify-between text-xs">
                <span>{(h as { nome?: string }).nome || "—"}</span>
                <span className="text-slate-500">
                  PE: {(h as { custoPE?: number }).custoPE ?? 0}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(dados.pericias?.length ?? 0) > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
            Perícias
          </h3>
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
            {(dados.pericias ?? [])
              .filter((p: unknown) => (p as { tipo?: string }).tipo !== "Nenhum")
              .map((p: unknown, i: number) => (
                <span
                  key={i}
                  className="rounded bg-[var(--color-accent-purple)]/20 px-2 py-0.5 text-xs text-[var(--color-neon-purple)]"
                >
                  {(p as { nome?: string }).nome} (
                  {(p as { tipo?: string }).tipo})
                </span>
              ))}
          </div>
        </section>
      )}

      {(dados.ferramentas?.length ?? 0) > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
            Inventário Amaldiçoado
          </h3>
          <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
            {(dados.ferramentas ?? []).map((f: unknown, i: number) => {
              const ferramenta = f as { nome?: string; grau?: string; dano?: string; imagem?: string }
              return (
                <div key={i} className="flex flex-wrap items-start gap-2 text-xs">
                  {ferramenta.imagem && (
                    <img
                      src={ferramenta.imagem}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded border border-slate-600 object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  )}
                  <div>
                    <span className="font-medium">{ferramenta.nome}</span>{" "}
                    ({ferramenta.grau}) — {ferramenta.dano}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
