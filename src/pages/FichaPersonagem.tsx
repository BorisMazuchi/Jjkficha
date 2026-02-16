import { useState, useMemo } from "react"
import { CabecalhoFicha } from "@/components/CabecalhoFicha"
import { AtributosDefesa } from "@/components/AtributosDefesa"
import { RecursosBarra } from "@/components/RecursosBarra"
import { AptidoesAmaldicadasComponent } from "@/components/AptidoesAmaldicadas"
import { HabilidadesTecnicas } from "@/components/HabilidadesTecnicas"
import { PainelPericias } from "@/components/PainelPericias"
import { CalculadoraRaioNegro } from "@/components/CalculadoraRaioNegro"
import { InventarioAmaldicado } from "@/components/InventarioAmaldicado"
import { FichaSupabase } from "@/components/FichaSupabase"
import type { FichaDados } from "@/types/supabase"
import type {
  CabeçalhoFicha,
  Atributos,
  Recursos,
  AptidoesAmaldicadas,
  Habilidade,
  Pericia,
  FerramentaAmaldicada,
  AptidaoAmaldicada,
} from "@/types/ficha"
import { Info } from "lucide-react"
import { SiteHeader } from "@/components/layout/SiteHeader"

const ATRIBUTO_PARA_MOD: Record<string, string> = {
  FOR: "forca",
  DES: "destreza",
  CON: "constituicao",
  INT: "inteligencia",
  SAB: "sabedoria",
  CAR: "carisma",
}

function modificarValor(val: number): number {
  return Math.floor((val - 10) / 2)
}

const PERICIAS_INICIAIS: Pericia[] = [
  { nome: "Acrobacia", atributoBase: "DES", tipo: "Nenhum" },
  { nome: "Atletismo", atributoBase: "FOR", tipo: "Nenhum" },
  { nome: "Conhecimento (Amaldiçado)", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Conhecimento (Geral)", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Enganação", atributoBase: "CAR", tipo: "Nenhum" },
  { nome: "Furtividade", atributoBase: "DES", tipo: "Nenhum" },
  { nome: "Intimidação", atributoBase: "CAR", tipo: "Nenhum" },
  { nome: "Intuição", atributoBase: "SAB", tipo: "Nenhum" },
  { nome: "Investigação", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Luta", atributoBase: "FOR", tipo: "Nenhum" },
  { nome: "Medicina", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Percepção", atributoBase: "SAB", tipo: "Nenhum" },
  { nome: "Persuasão", atributoBase: "CAR", tipo: "Nenhum" },
  { nome: "Pontaria", atributoBase: "DES", tipo: "Nenhum" },
  { nome: "Sobrevivência", atributoBase: "SAB", tipo: "Nenhum" },
  { nome: "Técnica Amaldiçada", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Vontade", atributoBase: "SAB", tipo: "Nenhum" },
]

export function FichaPersonagem() {
  const [cabecalho, setCabecalho] = useState<CabeçalhoFicha>({
    nomePersonagem: "",
    jogador: "",
    nivel: 1,
    grau: "4º",
    origemCla: "",
  })

  const [atributos, setAtributos] = useState<Atributos>({
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,
  })

  const [bonusDefesaClasse, setBonusDefesaClasse] = useState(0)
  const [bonusAtencao, setBonusAtencao] = useState(0)
  const [recursos, setRecursos] = useState<Recursos>({
    pvAtual: 0,
    pvMax: 10,
    peAtual: 0,
    peMax: 10,
    vidaTemporaria: 0,
    energiaTemporaria: 0,
  })

  const [aptidoes, setAptidoes] = useState<AptidoesAmaldicadas>({
    Aura: 0,
    Controle: 0,
    Fluxo: 0,
    Potência: 0,
  })

  const [aptidaoRaioNegro, setAptidaoRaioNegro] =
    useState<AptidaoAmaldicada | null>(null)

  const [tecnicasInatas, setTecnicasInatas] = useState<Habilidade[]>([])
  const [habilidadesClasse, setHabilidadesClasse] = useState<Habilidade[]>([])
  const [pericias, setPericias] = useState<Pericia[]>(PERICIAS_INICIAIS)
  const [ferramentas, setFerramentas] = useState<FerramentaAmaldicada[]>([])
  const [fichaId, setFichaId] = useState<string | null>(null)

  const dadosParaSupabase = useMemo(
    (): FichaDados => ({
      cabecalho,
      atributos: { ...atributos },
      bonusDefesaClasse,
      recursos,
      aptidoes: { ...aptidoes },
      tecnicasInatas,
      habilidadesClasse,
      pericias,
      ferramentas,
    }),
    [
      cabecalho,
      atributos,
      bonusDefesaClasse,
      recursos,
      aptidoes,
      tecnicasInatas,
      habilidadesClasse,
      pericias,
      ferramentas,
    ]
  )

  const carregarFichaNoApp = (d: FichaDados) => {
    setCabecalho({
      ...d.cabecalho,
      grau: (d.cabecalho.grau || "4º") as import("@/types/ficha").Grau,
      xpAtual: (d.cabecalho as { xpAtual?: number }).xpAtual,
      xpProximoNivel: (d.cabecalho as { xpProximoNivel?: number }).xpProximoNivel,
    })
    setAtributos({
      forca: d.atributos.forca ?? 10,
      destreza: d.atributos.destreza ?? 10,
      constituicao: d.atributos.constituicao ?? 10,
      inteligencia: d.atributos.inteligencia ?? 10,
      sabedoria: d.atributos.sabedoria ?? 10,
      carisma: d.atributos.carisma ?? 10,
    })
    setBonusDefesaClasse(d.bonusDefesaClasse ?? 0)
    setRecursos({
      ...d.recursos,
      integridadeAtual: (d.recursos as { integridadeAtual?: number }).integridadeAtual,
    })
    setAptidoes({
      Aura: d.aptidoes.Aura ?? 0,
      Controle: d.aptidoes.Controle ?? 0,
      Fluxo: d.aptidoes.Fluxo ?? 0,
      Potência: d.aptidoes["Potência"] ?? 0,
    })
    setTecnicasInatas((d.tecnicasInatas ?? []) as Habilidade[])
    setHabilidadesClasse((d.habilidadesClasse ?? []) as Habilidade[])
    setPericias((d.pericias ?? PERICIAS_INICIAIS) as Pericia[])
    setFerramentas((d.ferramentas ?? []) as FerramentaAmaldicada[])
  }

  const modificadoresPericia = useMemo(() => {
    const mod: Record<string, number> = {}
    for (const [sigla, key] of Object.entries(ATRIBUTO_PARA_MOD)) {
      mod[sigla] = modificarValor(atributos[key as keyof Atributos] ?? 10)
    }
    return mod
  }, [atributos])

  const bonusPorTipoPericia = (tipo: import("@/types/ficha").TipoPericia, n: number) =>
    tipo === "Treinamento" ? n : tipo === "Especialização" ? n * 2 : 0

  const percepcaoTotal = useMemo(() => {
    const p = pericias.find((x) => x.nome === "Percepção")
    if (!p) return 0
    const mod = modificadoresPericia[p.atributoBase] ?? 0
    const bonus = bonusPorTipoPericia(p.tipo, cabecalho.nivel)
    const custom = p.bonusCustomizado ?? 0
    return mod + bonus + custom
  }, [pericias, cabecalho.nivel, modificadoresPericia])

  const aumentarAptidaoRaioNegro = (apt: AptidaoAmaldicada) => {
    setAptidoes((prev) => ({
      ...prev,
      [apt]: Math.min(5, (prev[apt] ?? 0) + 1),
    }))
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text)]">
      <SiteHeader
        subtitle="Plataforma de Gestão de Fichas — Jujutsu Kaisen RPG"
        right={
          <FichaSupabase
            dados={dadosParaSupabase}
            fichaId={fichaId}
            onCarregar={carregarFichaNoApp}
            onFichaIdChange={setFichaId}
          />
        }
      />

      <main className="mx-auto max-w-6xl space-y-6 p-4 pb-12">
        <div
          className="flex gap-3 rounded-lg border border-[var(--color-border-accent)] bg-cyan-500/10 px-4 py-3 text-sm text-[var(--color-text-muted)]"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-cyan)]" />
          <div>
            <p className="font-medium text-cyan-200">Como preencher a ficha</p>
            <p className="mt-1 text-[var(--color-text-muted)]">
              Preencha na ordem: <strong>dados básicos</strong> (nome, nível, grau) →{" "}
              <strong>atributos e defesa</strong> → <strong>recursos</strong> (PV, PE, Integridade) →{" "}
              <strong>aptidões</strong> → <strong>perícias</strong> (escolha Treinamento ou Especialização) →{" "}
              <strong>habilidades e inventário</strong>. Os valores em roxo são calculados automaticamente.
            </p>
          </div>
        </div>

        <section aria-labelledby="sec-cabecalho">
          <h2 id="sec-cabecalho" className="section-title mb-3">
            1. Dados do personagem
          </h2>
          <CabecalhoFicha
            dados={cabecalho}
            onChange={(d) => setCabecalho((prev) => ({ ...prev, ...d }))}
          />
        </section>

        <section aria-labelledby="sec-atributos-recursos">
          <h2 id="sec-atributos-recursos" className="section-title mb-3">
            2. Atributos, defesa e recursos
          </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <AtributosDefesa
            atributos={atributos}
            nivel={cabecalho.nivel}
            bonusDefesaClasse={bonusDefesaClasse}
            percepcaoTotal={percepcaoTotal}
            bonusAtencao={bonusAtencao}
            onChange={(d) => setAtributos((prev) => ({ ...prev, ...d }))}
            onBonusDefesaChange={setBonusDefesaClasse}
            onBonusAtencaoChange={setBonusAtencao}
          />
          <RecursosBarra
            recursos={recursos}
            onChange={(d) => setRecursos((prev) => ({ ...prev, ...d }))}
          />
        </div>
        </section>

        <section aria-labelledby="sec-aptidoes">
          <h2 id="sec-aptidoes" className="section-title mb-3">
            3. Aptidões amaldiçadas
          </h2>
        <AptidoesAmaldicadasComponent
          aptidoes={aptidoes}
          onChange={(d) => setAptidoes((prev) => ({ ...prev, ...d }))}
        />

        <CalculadoraRaioNegro
          aptidoes={aptidoes}
          aptidaoSelecionada={aptidaoRaioNegro}
          onAptidaoSelecionada={setAptidaoRaioNegro}
          onAumentarAptidao={aumentarAptidaoRaioNegro}
        />
        </section>

        <section aria-labelledby="sec-pericias">
          <h2 id="sec-pericias" className="section-title mb-3">
            4. Perícias
          </h2>
        <PainelPericias
          pericias={pericias}
          nivel={cabecalho.nivel}
          modificadores={modificadoresPericia}
          onChange={setPericias}
        />
        </section>

        <section aria-labelledby="sec-habilidades">
          <h2 id="sec-habilidades" className="section-title mb-3">
            5. Habilidades e técnicas
          </h2>
        <HabilidadesTecnicas
          tecnicasInatas={tecnicasInatas}
          habilidadesClasse={habilidadesClasse}
          nivel={cabecalho.nivel}
          onTecnicasChange={setTecnicasInatas}
          onHabilidadesChange={setHabilidadesClasse}
        />
        </section>

        <section aria-labelledby="sec-inventario">
          <h2 id="sec-inventario" className="section-title mb-3">
            6. Inventário amaldiçado
          </h2>
        <InventarioAmaldicado ferramentas={ferramentas} onChange={setFerramentas} />
        </section>
      </main>
    </div>
  )
}
