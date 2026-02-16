import { useState } from "react"
import { BookOpen, AlertTriangle, Skull } from "lucide-react"
import { cn } from "@/lib/utils"

const ABA_CD = "CDs"
const ABA_ACOES = "Ações"
const ABA_DANO = "Dano"
const ABA_FERIMENTOS = "Ferimentos"
const ABA_EXAUSTAO = "Exaustão"
const ABA_RITUAL = "Ritual"

const CDS = [
  { nivel: "Fácil", valor: 10, cor: "text-emerald-400" },
  { nivel: "Médio", valor: 15, cor: "text-amber-400" },
  { nivel: "Difícil", valor: 20, cor: "text-orange-400" },
  { nivel: "Muito difícil", valor: 25, cor: "text-rose-400" },
  { nivel: "Quase impossível", valor: 30, cor: "text-purple-400" },
] as const

/** Tipos de dano e regras de combate (Livro v2.5 — Cap. 12, p.305-316) */
const TIPOS_DANO_FISICOS = [
  { tipo: "Cortante", desc: "Cortes e lacerações; facas, garras, espadas." },
  { tipo: "Perfurante", desc: "Perfurações; lanças e projéteis." },
  { tipo: "Impacto", desc: "Concussões e ossos quebrados; martelos e pesos." },
] as const

const TIPOS_DANO_ELEMENTAIS = [
  { tipo: "Ácido", desc: "Corrosão; derrete e destrói ao contato." },
  { tipo: "Congelante", desc: "Gelo e temperaturas muito baixas." },
  { tipo: "Chocante", desc: "Raios e eletricidade." },
  { tipo: "Queimante", desc: "Chamas e calor." },
  { tipo: "Sônico", desc: "Vibrações e sons." },
] as const

const TIPOS_DANO_ETEREOS = [
  { tipo: "Alma", desc: "Ataca a essência; ignora defesas; reduz PV máx.; cura só Energia Reversa (Nív.4), metade." },
  { tipo: "Energia Reversa", desc: "Nocivo a maldições; criaturas curáveis por ER são imunes." },
  { tipo: "Energético", desc: "Emissão de energia amaldiçoada (explosão)." },
  { tipo: "Psíquico", desc: "Ataque à integridade da mente." },
  { tipo: "Radiante", desc: "Luz com aspecto divino/celestial." },
] as const

const TIPOS_DANO_BIOLOGICOS = [
  { tipo: "Necrótico", desc: "Putrefação e decomposição." },
  { tipo: "Venenoso", desc: "Venenos e substâncias." },
] as const

const REGRAS_DANO = [
  { titulo: "Durante vs Após ataque", texto: "Durante: entra no dano do ataque, pode dobrar no crítico. Após: somado depois, nunca dobra no crítico. Ambos sofrem resistência uma vez." },
  { titulo: "Crítico (20) / Desastre (1)", texto: "Crítico: sempre acerta; role dados de dano duas vezes. Desastre: sempre erra; alvo pode atacar você como reação." },
  { titulo: "Resistência / Vulnerabilidade", texto: "Resistência: dano reduzido pela metade. Vulnerabilidade: +metade do dano (1,5×). Imunidade: dano anulado." },
  { titulo: "Sequência de ataques", texto: "A cada 2 ataques seguidos no mesmo alvo: -1 na Defesa dele (máx. -5 em 10 ataques). Sequência termina no turno do alvo." },
  { titulo: "Perda de vida", texto: "Não é afetada por redução de dano nem resistências." },
] as const

/** Ferimentos complexos e Portas da Morte (Livro v2.5 — p.313-314) */
const QUANDO_FERIMENTO = "Um ataque que cause metade do seu PV máx. ou mais (mín. 50) causa 1 Ferimento Complexo (rolagem 1d10 na tabela)."

const TABELA_FERIMENTOS = [
  { roll: "1-2", membro: "Perde um olho", efeito: "Desvantagem em Percepção e ataques a distância." },
  { roll: "3", membro: "Perde ambos os olhos", efeito: "Condição Cego até regenerar." },
  { roll: "4-5", membro: "Perde uma perna", efeito: "Metade do movimento; desvantagem em Acrobacia." },
  { roll: "6", membro: "Perde ambas as pernas", efeito: "Só pode rastejar." },
  { roll: "7", membro: "Ferida interna", efeito: "TR Fortitude CD 20+nível ao tentar ação em combate; falha = perde a ação e reações até próximo turno. Medicina mestre: trata (CD 20→10)." },
  { roll: "8-9", membro: "Perde um braço", efeito: "Uma mão; desvantagem em Atletismo." },
  { roll: "10", membro: "Perde ambos os braços", efeito: "Não segura objetos; Destreza -4." },
] as const

const CURA_FERIMENTOS = "Cura: Energia Reversa ou meios raros. Após 1 dia (ou cicatrizar): permanente. Permanente: só cura com alma curada + PV e Integridade no máximo."

const PORTAS_DA_MORTE = [
  { quando: "PV = 0", texto: "Entra nas Portas da Morte." },
  { quando: "Início do turno", texto: "Rola d20: 1 = 2 falhas; 2-9 = 1 falha; 10-19 = 1 sucesso; 20 = 2 sucessos. 3 sucessos = estável (1 PV); 3 falhas = morte." },
  { quando: "Dano enquanto morrendo", texto: "Recebe 1 falha. Dano massivo (PV negativos além do máx.) = morte instantânea, sem Portas." },
  { quando: "Estabilizar", texto: "Medicina (ação comum, 1,5 m): CD 15 + 1 por cada 5 PV negativos. Sucesso = estável. Cura: curar todo PV negativo até 0." },
] as const

/** Exaustão (Livro v2.5 — Cap. 12) */
const TABELA_EXAUSTAO = [
  { nivel: 0, efeito: "Nenhum." },
  { nivel: 1, efeito: "Desvantagem em testes de Atributo." },
  { nivel: 2, efeito: "Metade da velocidade de deslocamento." },
  { nivel: 3, efeito: "Desvantagem em testes de ataque e Defesa -2." },
  { nivel: 4, efeito: "PV máx. reduzido à metade." },
  { nivel: 5, efeito: "Velocidade 0; morte ao terminar o próximo turno (sem cura)." },
] as const

/** Conjuração em Ritual (Livro v2.5 — Cap. 12) */
const CONJURACAO_RITUAL = [
  { titulo: "Tempo", texto: "Conjuração estendida fora de combate; tempo mínimo conforme o feitiço (minutos ou horas)." },
  { titulo: "CD", texto: "Teste de Técnica Amaldiçada (ou atributo/perícia conforme o feitiço). CD definido pelo mestre ou pela regra do feitiço." },
  { titulo: "Custo", texto: "PE (ou Estamina) pode ser reduzido ou pago ao longo do ritual, conforme descrição." },
  { titulo: "Falha", texto: "Falha no teste pode consumir recursos parcialmente ou causar efeitos colaterais (consulte o livro)." },
] as const

/** Ações de combate (Livro v2.5 — Cap. 12, p.300-304) */
const ACOES_COMBATE = [
  { nome: "Ação de movimento", desc: "Deslocar até o deslocamento; interagir com objeto; abrir porta; levantar do chão (metade do deslocamento)." },
  { nome: "Ação comum", desc: "Ataque; conjurar feitiço; usar item; Esconder; Ajudar; Disparada; etc." },
  { nome: "Ação livre", desc: "Comunicação breve; soltar objeto; terminar concentração (opcional)." },
  { nome: "Reação", desc: "Uma por rodada, fora do seu turno: contra-ataque, interromper movimento, escudo, etc." },
  { nome: "Ataque", desc: "Um ataque com arma ou ataque desarmado; ou múltiplos ataques se a classe permitir (cada um -2 no próximo)." },
  { nome: "Concentração", desc: "Manter efeito ativo; ao sofrer dano, TR Constituição (CD 10 ou metade do dano, maior); falha = efeito termina." },
] as const

type AbaRegras = typeof ABA_CD | typeof ABA_ACOES | typeof ABA_DANO | typeof ABA_FERIMENTOS | typeof ABA_EXAUSTAO | typeof ABA_RITUAL

export function PainelRegrasRapidas() {
  const [aba, setAba] = useState<AbaRegras>(ABA_CD)

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-700/80 bg-slate-900/50 p-3">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-purple)]">
        <BookOpen className="h-4 w-4" />
        Regras rápidas
      </h3>
      <p className="mb-2 text-[10px] text-slate-500">Livro v2.5 — Cap. 12 (combate), p.300-319</p>

      <div className="mb-2 flex flex-wrap gap-1 rounded border border-slate-600 bg-slate-800/80 p-0.5">
        {([ABA_CD, ABA_ACOES, ABA_DANO, ABA_FERIMENTOS, ABA_EXAUSTAO, ABA_RITUAL] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAba(a)}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              aba === a
                ? "bg-[var(--color-accent-purple)]/30 text-[var(--color-neon-purple)]"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {a}
          </button>
        ))}
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

        {aba === ABA_ACOES && (
          <div className="space-y-2">
            <p className="text-slate-400">Ações de combate (Cap. 12, p.300-304)</p>
            {ACOES_COMBATE.map((a) => (
              <div
                key={a.nome}
                className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <div className="font-medium text-amber-300">{a.nome}</div>
                <div className="mt-0.5 text-slate-300">{a.desc}</div>
              </div>
            ))}
          </div>
        )}

        {aba === ABA_DANO && (
          <div className="space-y-2">
            <p className="text-slate-400">Tipos de dano e regras (Cap. 12)</p>
            {REGRAS_DANO.map((r) => (
              <div
                key={r.titulo}
                className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <div className="font-medium text-amber-300">{r.titulo}</div>
                <div className="mt-0.5 text-slate-300">{r.texto}</div>
              </div>
            ))}
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-[var(--color-neon-purple)]">Físicos</div>
              {TIPOS_DANO_FISICOS.map((t) => (
                <div key={t.tipo} className="mt-0.5 text-slate-300"><span className="text-amber-300/90">{t.tipo}:</span> {t.desc}</div>
              ))}
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-[var(--color-neon-purple)]">Elementais</div>
              {TIPOS_DANO_ELEMENTAIS.map((t) => (
                <div key={t.tipo} className="mt-0.5 text-slate-300"><span className="text-amber-300/90">{t.tipo}:</span> {t.desc}</div>
              ))}
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-[var(--color-neon-purple)]">Etéreos</div>
              {TIPOS_DANO_ETEREOS.map((t) => (
                <div key={t.tipo} className="mt-0.5 text-slate-300"><span className="text-amber-300/90">{t.tipo}:</span> {t.desc}</div>
              ))}
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-[var(--color-neon-purple)]">Biológicos</div>
              {TIPOS_DANO_BIOLOGICOS.map((t) => (
                <div key={t.tipo} className="mt-0.5 text-slate-300"><span className="text-amber-300/90">{t.tipo}:</span> {t.desc}</div>
              ))}
            </div>
          </div>
        )}

        {aba === ABA_FERIMENTOS && (
          <div className="space-y-2">
            <p className="text-slate-400">Ferimentos complexos e Portas da Morte (p.313-314)</p>
            <div className="rounded border border-rose-800/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-rose-300">Quando ocorre</div>
              <div className="mt-0.5 text-slate-300">{QUANDO_FERIMENTO}</div>
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-rose-300/90 flex items-center gap-1.5">
                <Skull className="h-3.5 w-3.5 shrink-0" />
                Tabela (1d10)
              </div>
              {TABELA_FERIMENTOS.map((row) => (
                <div key={row.roll} className="mt-1.5 border-t border-slate-700/50 pt-1 first:mt-0 first:border-0 first:pt-0">
                  <span className="font-mono text-[var(--color-neon-purple)]/90">{row.roll}</span> — <span className="text-amber-300/90">{row.membro}</span>
                  <div className="mt-0.5 text-slate-300">{row.efeito}</div>
                </div>
              ))}
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="flex items-center gap-1 font-medium text-amber-300/90">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Cura
              </div>
              <div className="mt-0.5 text-slate-300">{CURA_FERIMENTOS}</div>
            </div>
            <div className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5">
              <div className="font-medium text-rose-300/90">Portas da Morte (PV = 0)</div>
              {PORTAS_DA_MORTE.map((row) => (
                <div key={row.quando} className="mt-1">
                  <span className="text-[var(--color-neon-purple)]/90">{row.quando}:</span>{" "}
                  <span className="text-slate-300">{row.texto}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === ABA_EXAUSTAO && (
          <div className="space-y-2">
            <p className="text-slate-400">Exaustão (Cap. 12) — níveis 0 a 5</p>
            {TABELA_EXAUSTAO.map((row) => (
              <div
                key={row.nivel}
                className="flex items-start gap-2 rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <span className="font-mono font-bold text-[var(--color-neon-purple)]/90 shrink-0">Nív. {row.nivel}</span>
                <span className="text-slate-300">{row.efeito}</span>
              </div>
            ))}
          </div>
        )}

        {aba === ABA_RITUAL && (
          <div className="space-y-2">
            <p className="text-slate-400">Conjuração em Ritual (Cap. 12)</p>
            {CONJURACAO_RITUAL.map((r) => (
              <div
                key={r.titulo}
                className="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1.5"
              >
                <div className="font-medium text-amber-300">{r.titulo}</div>
                <div className="mt-0.5 text-slate-300">{r.texto}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
