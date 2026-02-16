import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { InitiativeEntry, Maldicao, PartyMember, LogEntry } from "@/types/mestre"
import { Swords, Target, Dices, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { rolarExpressao } from "@/lib/dados"

/** Sequência de ataques: a cada 2 ataques no mesmo alvo, Defesa -1 (máx -5 em 10 ataques). Cap. 12, p.310 */
export function penalidadeSequencia(nAtaques: number): number {
  return Math.min(Math.floor(nAtaques / 2), 5)
}

export interface PainelAcaoCombateProps {
  entradas: InitiativeEntry[]
  turnoAtual: number
  maldicoes: Maldicao[]
  membros: PartyMember[]
  /** Mapa alvoId -> quantidade de ataques seguidos (reset no turno do alvo) */
  sequenciaAtaques?: Record<string, number>
  onAplicarDano: (alvo: InitiativeEntry, valor: number, atacanteNome: string, tipoDano?: string) => void
  onAplicarCura: (alvo: InitiativeEntry, valor: number) => void
  addLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void
  onFerimentoComplexo?: (alvoNome: string, valorD10: number, textoEfeito: string) => void
  onPortasDaMorte?: (alvoNome: string) => void
  /** Quando marcado, o dano aplicado também reduz Integridade da Alma e PV máx (Cap. 12) */
  onAplicarDanoAlma?: (alvo: InitiativeEntry, valor: number) => void
}

const TABELA_FERIMENTOS: { roll: number; texto: string }[] = [
  { roll: 1, texto: "1-2: Perde um olho — Desvantagem em Percepção e ataques a distância." },
  { roll: 2, texto: "1-2: Perde um olho — Desvantagem em Percepção e ataques a distância." },
  { roll: 3, texto: "3: Perde ambos os olhos — Condição Cego até regenerar." },
  { roll: 4, texto: "4-5: Perde uma perna — Metade do movimento; desvantagem em Acrobacia." },
  { roll: 5, texto: "4-5: Perde uma perna — Metade do movimento; desvantagem em Acrobacia." },
  { roll: 6, texto: "6: Perde ambas as pernas — Só pode rastejar." },
  { roll: 7, texto: "7: Ferida interna — TR Fortitude CD 20+nível em ação de combate; falha = perde ação. Medicina: CD 20→10." },
  { roll: 8, texto: "8-9: Perde um braço — Uma mão; desvantagem em Atletismo." },
  { roll: 9, texto: "8-9: Perde um braço — Uma mão; desvantagem em Atletismo." },
  { roll: 10, texto: "10: Perde ambos os braços — Não segura objetos; Destreza -4." },
]

const TIPOS_DANO = [
  "",
  "Cortante",
  "Perfurante",
  "Impacto",
  "Alma",
  "Energia Reversa",
  "Energético",
  "Ácido",
  "Congelante",
  "Chocante",
  "Queimante",
  "Sônico",
  "Psíquico",
  "Radiante",
  "Necrótico",
  "Venenoso",
] as const

export function PainelAcaoCombate({
  entradas,
  turnoAtual,
  maldicoes,
  membros,
  sequenciaAtaques = {},
  onAplicarDano,
  onAplicarCura,
  addLog,
  onFerimentoComplexo,
  onAplicarDanoAlma,
}: PainelAcaoCombateProps) {
  const [danoNaAlma, setDanoNaAlma] = useState(false)
  const atacanteIndex = entradas.length > 0 ? Math.min(turnoAtual, entradas.length - 1) : -1

  const [atacanteOverride, setAtacanteOverride] = useState<number | null>(null)
  const idxAtacante = atacanteOverride ?? atacanteIndex
  const atacanteAtual = idxAtacante >= 0 && idxAtacante < entradas.length ? entradas[idxAtacante] : null
  const maldicaoAtual = atacanteAtual?.tipo === "maldicao" ? maldicoes.find((m) => m.id === atacanteAtual.id) : null

  const alvos = useMemo(
    () => entradas.filter((_, i) => i !== idxAtacante),
    [entradas, idxAtacante]
  )

  const opcoesAtaque = useMemo(() => {
    const list: { label: string; dano: string }[] = []
    if (maldicaoAtual?.ataques?.length) {
      maldicaoAtual.ataques.forEach((a) => list.push({ label: `${a.nome}${a.tipo ? ` (${a.tipo})` : ""}`, dano: a.dano }))
    }
    if (maldicaoAtual?.feiticos?.length) {
      maldicaoAtual.feiticos.forEach((f) =>
        list.push({ label: `${f.nome} (${f.custoPE} PE)`, dano: "" })
      )
    }
    list.push({ label: "Dano custom", dano: "" })
    return list
  }, [maldicaoAtual])

  const [acaoSelecionada, setAcaoSelecionada] = useState<{ label: string; dano: string }>({ label: "Dano custom", dano: "" })
  const [danoCustomExpr, setDanoCustomExpr] = useState("")
  const [danoAplicar, setDanoAplicar] = useState<number>(0)
  const [alvoId, setAlvoId] = useState<string>("")
  const [critico, setCritico] = useState(false)
  const [modoCura, setModoCura] = useState(false)
  const [curaValor, setCuraValor] = useState<number>(0)
  const [pendenteFerimento, setPendenteFerimento] = useState<{ alvoNome: string; pvMax: number } | null>(null)
  const [pendentePortas, setPendentePortas] = useState<string | null>(null)
  const [tipoDano, setTipoDano] = useState<string>("")

  const expressaoDano = acaoSelecionada.dano || (opcoesAtaque.length <= 1 ? danoCustomExpr : "")
  const nSequenciaAlvo = alvoId ? sequenciaAtaques[alvoId] ?? 0 : 0
  const defesaPenalidade = penalidadeSequencia(nSequenciaAlvo)
  const defesaAlvo =
    alvoEntry?.tipo === "jogador"
      ? membros.find((m) => m.id === alvoEntry.id)?.defesa ?? 10
      : maldicoes.find((m) => m.id === alvoEntry?.id)?.defesa ?? 10
  const defesaEfetiva = defesaAlvo - defesaPenalidade

  const rolarDano = () => {
    const expr = expressaoDano || danoCustomExpr
    const result = rolarExpressao(expr)
    if (result) {
      let total = result.total
      if (critico) total *= 2
      setDanoAplicar(total)
      addLog({ tipo: "rolagem", texto: critico ? `${result.texto} (crítico ×2) = ${total}` : result.texto })
    }
  }

  const alvoEntry = alvos.find((e) => e.id === alvoId)
  const membroAlvo = alvoEntry?.tipo === "jogador" ? membros.find((m) => m.id === alvoEntry.id) : null
  const pvMaxAlvo = alvoEntry?.tipo === "jogador" ? membroAlvo?.pvMax ?? (alvoEntry.pvMax ?? 0) : (alvoEntry?.pvMax ?? 0)
  const pvAtualAlvo = alvoEntry?.tipo === "jogador" ? membroAlvo?.pvAtual ?? (alvoEntry.pvAtual ?? 0) : (alvoEntry?.pvAtual ?? 0)

  const aplicarDano = () => {
    if (!alvoEntry || danoAplicar < 0) return
    const valor = Math.max(0, danoAplicar)
    const nomeAtacante = atacanteAtual?.nome ?? "?"
    onAplicarDano(alvoEntry, valor, nomeAtacante, tipoDano || undefined)
    if (danoNaAlma && alvoEntry.tipo === "jogador" && onAplicarDanoAlma) {
      onAplicarDanoAlma(alvoEntry, valor)
    }

    if (alvoEntry.tipo === "jogador" && pvMaxAlvo >= 50) {
      const metade = Math.floor(pvMaxAlvo / 2)
      if (valor >= metade) setPendenteFerimento({ alvoNome: alvoEntry.nome, pvMax: pvMaxAlvo })
    }
    const novoPv = Math.max(0, pvAtualAlvo - valor)
    if (alvoEntry.tipo === "jogador" && novoPv <= 0) setPendentePortas(alvoEntry.nome)

    setDanoAplicar(0)
  }

  const aplicarCura = () => {
    if (!alvoEntry || curaValor <= 0) return
    onAplicarCura(alvoEntry, curaValor)
    setCuraValor(0)
  }

  const rolarFerimentoComplexo = () => {
    if (!pendenteFerimento) return
    const d10 = Math.floor(Math.random() * 10) + 1
    const row = TABELA_FERIMENTOS[d10 - 1]
    const texto = row ? row.texto : `1d10 = ${d10}`
    addLog({ tipo: "condicao", texto: `Ferimento complexo (${pendenteFerimento.alvoNome}): 1d10 = ${d10} — ${texto}`, alvo: pendenteFerimento.alvoNome })
    onFerimentoComplexo?.(pendenteFerimento.alvoNome, d10, texto)
    setPendenteFerimento(null)
  }

  if (entradas.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
          <Swords className="h-4 w-4" />
          Ação de combate
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Sincronize a iniciativa com a party para usar este painel.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
        <Swords className="h-4 w-4" />
        Ação de combate
      </h3>

      {/* Atacante */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Atacante (turno atual)</label>
        <select
          value={idxAtacante}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            setAtacanteOverride(v >= 0 ? v : null)
          }}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-sm text-[var(--color-text)]"
        >
          {entradas.map((e, i) => (
            <option key={e.id} value={i}>
              {e.nome} ({e.tipo === "jogador" ? "jogador" : "maldição"})
            </option>
          ))}
        </select>
      </div>

      {/* Ação: ataques da maldição ou dano custom */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Ação</label>
        <div className="flex flex-wrap gap-1">
          {opcoesAtaque.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setAcaoSelecionada(opt)}
              className={cn(
                "rounded border px-2 py-1 text-xs transition-colors",
                acaoSelecionada.label === opt.label
                  ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple)]/20 text-[var(--color-neon-purple)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              {opt.label} {opt.dano ? `— ${opt.dano}` : ""}
            </button>
          ))}
        </div>
        {(acaoSelecionada.label === "Dano custom" || !acaoSelecionada.dano) && (
          <Input
            placeholder="Ex: 2d6+3"
            value={danoCustomExpr}
            onChange={(e) => setDanoCustomExpr(e.target.value)}
            className="mt-1 h-8 border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm"
          />
        )}
      </div>

      {/* Alvo */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <Target className="h-3.5 w-3.5" /> Alvo
        </label>
        <select
          value={alvoId}
          onChange={(e) => setAlvoId(e.target.value)}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1.5 text-sm text-[var(--color-text)]"
        >
          <option value="">Selecione o alvo</option>
          {alvos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome} ({e.tipo}) — PV {e.pvAtual ?? 0}/{e.pvMax ?? 0}
            </option>
          ))}
        </select>
        {alvoId && nSequenciaAlvo > 0 && (
          <p className="mt-1 text-[10px] text-amber-400/90">
            Sequência: {nSequenciaAlvo} ataques → Defesa -{defesaPenalidade} (efetiva {defesaEfetiva})
          </p>
        )}
        {membroAlvo?.concentrandoEm && (
          <p className="mt-1 text-[10px] text-violet-400/90" title="Dano pode quebrar concentração (Cap. 12)">
            Concentrando em: {membroAlvo.concentrandoEm}
          </p>
        )}
      </div>

      {/* Tipo de dano (para log e resistências) */}
      {!modoCura && (
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Tipo de dano</label>
          <select
            value={tipoDano}
            onChange={(e) => setTipoDano(e.target.value)}
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-sm text-[var(--color-text)]"
          >
            {TIPOS_DANO.map((t) => (
              <option key={t || "vazio"} value={t}>
                {t || "(nenhum)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dano / Cura */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={modoCura}
            onChange={(e) => setModoCura(e.target.checked)}
            className="rounded border-[var(--color-border)]"
          />
          <span className="text-xs text-[var(--color-text-muted)]">Cura</span>
        </label>
        {!modoCura && (
          <>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="critico-acao"
                checked={critico}
                onChange={(e) => setCritico(e.target.checked)}
                className="rounded border-[var(--color-border)]"
              />
              <label htmlFor="critico-acao" className="text-xs text-[var(--color-text-muted)]">Crítico</label>
            </div>
            {onAplicarDanoAlma && alvoId && membroAlvo && (membroAlvo.integridadeMax ?? 0) > 0 && (
              <div className="flex items-center gap-1" title="Reduz também Integridade da Alma e PV máx (Cap. 12)">
                <input
                  type="checkbox"
                  id="dano-alma"
                  checked={danoNaAlma}
                  onChange={(e) => setDanoNaAlma(e.target.checked)}
                  className="rounded border-[var(--color-border)]"
                />
                <label htmlFor="dano-alma" className="text-xs text-violet-300/90">Dano na alma</label>
              </div>
            )}
            {(expressaoDano || danoCustomExpr) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={rolarDano}
                className="h-8 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
              >
                <Dices className="mr-1 h-3.5 w-3.5" />
                Rolagem
              </Button>
            )}
            <Input
              type="number"
              min={0}
              placeholder="Dano"
              value={danoAplicar || ""}
              onChange={(e) => setDanoAplicar(parseInt(e.target.value, 10) || 0)}
              className="h-8 w-20 border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-center text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={aplicarDano}
              disabled={!alvoId || danoAplicar <= 0}
              className="h-8 bg-[var(--color-accent-red)]/80 hover:bg-[var(--color-accent-red)]"
            >
              Aplicar {danoAplicar || 0} PV dano
            </Button>
          </>
        )}
        {modoCura && (
          <>
            <Input
              type="number"
              min={1}
              placeholder="PV cura"
              value={curaValor || ""}
              onChange={(e) => setCuraValor(parseInt(e.target.value, 10) || 0)}
              className="h-8 w-24 border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-center text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={aplicarCura}
              disabled={!alvoId || curaValor <= 0}
              className="h-8 bg-emerald-600 hover:bg-emerald-500"
            >
              <Heart className="mr-1 h-3.5 w-3.5" />
              Aplicar cura
            </Button>
          </>
        )}
      </div>

      {/* Ferimento complexo */}
      {pendenteFerimento && (
        <div className="rounded border border-amber-700/60 bg-amber-900/20 p-2 text-sm">
          <p className="text-amber-200/90">
            Dano ≥ metade do PV máx. (mín. 50): rolar Ferimento Complexo (1d10)?
          </p>
          <div className="mt-2 flex gap-2">
            <Button type="button" size="sm" onClick={rolarFerimentoComplexo} className="bg-amber-600 hover:bg-amber-500">
              Rolar 1d10
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPendenteFerimento(null)}>
              Dispensar
            </Button>
          </div>
        </div>
      )}

      {/* Portas da Morte */}
      {pendentePortas && (
        <div className="rounded border border-rose-700/60 bg-rose-900/20 p-2 text-sm">
          <p className="font-medium text-rose-200/90">
            {pendentePortas} entrou nas Portas da Morte.
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Lembrete: no início do turno role 1d20 — 1 = 2 falhas, 2-9 = 1 falha, 10-19 = 1 sucesso, 20 = 2 sucessos. 3 sucessos = estável (1 PV); 3 falhas = morte.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => setPendentePortas(null)} className="mt-2">
            Ok
          </Button>
        </div>
      )}
    </div>
  )
}
