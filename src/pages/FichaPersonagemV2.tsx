import { useState, useMemo, useCallback } from "react"
import { CabecalhoFicha } from "@/components/CabecalhoFicha"
import { AtributosDefesa } from "@/components/AtributosDefesa"
import { RecursosBarra } from "@/components/RecursosBarra"
import { AptidoesAmaldicadasComponent } from "@/components/AptidoesAmaldicadas"
import { EspecializacaoComponent } from "@/components/EspecializacaoComponent"
import { XPIntegridade } from "@/components/XPIntegridade"
import { TecnicaBuilder } from "@/components/TecnicaBuilder"
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
  DadosEspecializacao,
  XPData,
  IntegridadeAlma,
  TecnicaAmaldicada,
} from "@/types/ficha"
import { Link } from "react-router-dom"
import { LayoutGrid } from "lucide-react"

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
  { nome: "Conhecimento (Amaldiçoado)", atributoBase: "INT", tipo: "Nenhum" },
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

  const [especializacao, setEspecializacao] = useState<DadosEspecializacao>({
    especializacao: "Lutador",
    pvPorNivel: 12,
    pePorNivel: 4,
  })

  const [xp, setXP] = useState<XPData>({
    xpAtual: 0,
    xpProximoNivel: 300,
  })

  const [integridade, setIntegridade] = useState<IntegridadeAlma>({
    atual: 10,
    max: 10,
  })

  const [tecnicaAmaldicada, setTecnicaAmaldicada] =
    useState<TecnicaAmaldicada | null>(null)

  const [aptidaoRaioNegro, setAptidaoRaioNegro] =
    useState<AptidaoAmaldicada | null>(null)

  const [tecnicasInatas, setTecnicasInatas] = useState<Habilidade[]>([])
  const [habilidadesClasse, setHabilidadesClasse] = useState<Habilidade[]>([])
  const [pericias, setPericias] = useState<Pericia[]>(PERICIAS_INICIAIS)
  const [ferramentas, setFerramentas] = useState<FerramentaAmaldicada[]>([])
  const [fichaId, setFichaId] = useState<string | null>(null)

  const handleRecursosCalculados = useCallback(
    (pvMax: number, peMax: number) => {
      setRecursos((prev) => ({
        ...prev,
        pvMax,
        peMax,
        pvAtual: Math.min(prev.pvAtual, pvMax),
        peAtual: Math.min(prev.peAtual, peMax),
      }))
      setIntegridade((prev) => ({
        ...prev,
        max: pvMax,
        atual: Math.min(prev.atual, pvMax),
      }))
    },
    []
  )

  const handleNivelUp = useCallback(() => {
    setCabecalho((prev) => ({ ...prev, nivel: prev.nivel + 1 }))
    // Recalcular recursos será feito automaticamente pelo EspecializacaoComponent
  }, [])

  const dadosParaSupabase = useMemo(
    (): FichaDados => ({
      cabecalho,
      atributos: { ...atributos },
      bonusDefesaClasse,
      recursos,
      aptidoes: { ...aptidoes },
      especializacao: {
        especializacao: especializacao.especializacao,
        pvPorNivel: especializacao.pvPorNivel,
        pePorNivel: especializacao.pePorNivel,
        empolgacao: especializacao.empolgacao,
        estoqueInvocacoes: especializacao.estoqueInvocacoes,
        usaEstamina: especializacao.usaEstamina,
      },
      xp: {
        xpAtual: xp.xpAtual,
        xpProximoNivel: xp.xpProximoNivel,
      },
      integridade: {
        atual: integridade.atual,
        max: integridade.max,
      },
      tecnicaAmaldicada: tecnicaAmaldicada
        ? {
            id: tecnicaAmaldicada.id,
            nome: tecnicaAmaldicada.nome,
            descricao: tecnicaAmaldicada.descricao,
            funcionamentoBasico: tecnicaAmaldicada.funcionamentoBasico,
            imagem: tecnicaAmaldicada.imagem,
            feiticos: tecnicaAmaldicada.feiticos,
          }
        : undefined,
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
      especializacao,
      xp,
      integridade,
      tecnicaAmaldicada,
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
    setRecursos(d.recursos)
    setAptidoes({
      Aura: d.aptidoes.Aura ?? 0,
      Controle: d.aptidoes.Controle ?? 0,
      Fluxo: d.aptidoes.Fluxo ?? 0,
      Potência: d.aptidoes["Potência"] ?? 0,
    })

    if (d.especializacao) {
      setEspecializacao({
        especializacao: d.especializacao.especializacao as any,
        pvPorNivel: d.especializacao.pvPorNivel,
        pePorNivel: d.especializacao.pePorNivel,
        empolgacao: d.especializacao.empolgacao,
        estoqueInvocacoes: d.especializacao.estoqueInvocacoes as any,
        usaEstamina: d.especializacao.usaEstamina,
      })
    }

    if (d.xp) {
      setXP(d.xp as XPData)
    }

    if (d.integridade) {
      setIntegridade(d.integridade as IntegridadeAlma)
    }

    if (d.tecnicaAmaldicada) {
      setTecnicaAmaldicada(d.tecnicaAmaldicada as any)
    }

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
    <div className="min-h-screen bg-[#1a1a2e] text-slate-100">
      <header className="border-b border-[#2a2a4a] bg-[#16213e] px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider text-[#e94560]">
              FEITICEIROS & MALDIÇÕES
            </h1>
            <p className="text-sm text-slate-400">
              Plataforma de Gestão de Fichas — Jujutsu Kaisen RPG v2.5
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/mestre"
              className="flex items-center gap-2 rounded border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-400 transition-colors hover:bg-cyan-500/20"
            >
              <LayoutGrid className="h-4 w-4" />
              Tela do Mestre
            </Link>
            <FichaSupabase
              dados={dadosParaSupabase}
              fichaId={fichaId}
              onCarregar={carregarFichaNoApp}
              onFichaIdChange={setFichaId}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 pb-12">
        <CabecalhoFicha
          dados={cabecalho}
          onChange={(d) => setCabecalho((prev) => ({ ...prev, ...d }))}
        />

        {/* Especialização - NOVO */}
        <EspecializacaoComponent
          dados={especializacao}
          nivel={cabecalho.nivel}
          constituicao={atributos.constituicao}
          onChange={(d) =>
            setEspecializacao((prev) => ({ ...prev, ...d }))
          }
          onRecursosCalculados={handleRecursosCalculados}
        />

        {/* XP e Integridade - NOVO */}
        <XPIntegridade
          xp={xp}
          integridade={integridade}
          nivel={cabecalho.nivel}
          pvMax={recursos.pvMax}
          onXPChange={setXP}
          onIntegridadeChange={setIntegridade}
          onNivelUp={handleNivelUp}
        />

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
            mostrarIntegridade={false}
          />
        </div>

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

        {/* Builder de Técnica Amaldiçoada - NOVO */}
        <TecnicaBuilder
          tecnica={tecnicaAmaldicada}
          onChange={setTecnicaAmaldicada}
        />

        <PainelPericias
          pericias={pericias}
          nivel={cabecalho.nivel}
          modificadores={modificadoresPericia}
          onChange={setPericias}
        />

        <HabilidadesTecnicas
          tecnicasInatas={tecnicasInatas}
          habilidadesClasse={habilidadesClasse}
          nivel={cabecalho.nivel}
          onTecnicasChange={setTecnicasInatas}
          onHabilidadesChange={setHabilidadesClasse}
        />

        <InventarioAmaldicado
          ferramentas={ferramentas}
          onChange={setFerramentas}
        />
      </main>
    </div>
  )
}
