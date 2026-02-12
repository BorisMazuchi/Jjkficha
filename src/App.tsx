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
  { nome: "Técnica Amaldiçoada", atributoBase: "INT", tipo: "Nenhum" },
  { nome: "Vontade", atributoBase: "SAB", tipo: "Nenhum" },
]

function App() {
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
              Plataforma de Gestão de Fichas — Jujutsu Kaisen RPG
            </p>
          </div>
          <FichaSupabase
            dados={dadosParaSupabase}
            fichaId={fichaId}
            onCarregar={carregarFichaNoApp}
            onFichaIdChange={setFichaId}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 pb-12">
        <CabecalhoFicha
          dados={cabecalho}
          onChange={(d) => setCabecalho((prev) => ({ ...prev, ...d }))}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <AtributosDefesa
            atributos={atributos}
            bonusDefesaClasse={bonusDefesaClasse}
            onChange={(d) => setAtributos((prev) => ({ ...prev, ...d }))}
            onBonusDefesaChange={setBonusDefesaClasse}
          />
          <RecursosBarra
            recursos={recursos}
            onChange={(d) => setRecursos((prev) => ({ ...prev, ...d }))}
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

        <InventarioAmaldicado ferramentas={ferramentas} onChange={setFerramentas} />
      </main>
    </div>
  )
}

export default App
