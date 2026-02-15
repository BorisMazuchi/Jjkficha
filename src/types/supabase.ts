export interface FichaRow {
  id: string
  nome_personagem: string
  jogador: string
  dados: FichaDados
  created_at: string
  updated_at: string
}

export interface FichaDados {
  cabecalho: {
    nomePersonagem: string
    jogador: string
    nivel: number
    grau: string
    origemCla: string
  }
  atributos: Record<string, number>
  bonusDefesaClasse: number
  recursos: {
    pvAtual: number
    pvMax: number
    peAtual: number
    peMax: number
    vidaTemporaria: number
    energiaTemporaria: number
  }
  aptidoes: Record<string, number>
  // Novos campos da Fase 1
  especializacao?: {
    especializacao: string
    pvPorNivel: number
    pePorNivel: number
    empolgacao?: number
    estoqueInvocacoes?: unknown[]
    usaEstamina?: boolean
  }
  xp?: {
    xpAtual: number
    xpProximoNivel: number
  }
  integridade?: {
    atual: number
    max: number
  }
  tecnicaAmaldicada?: {
    id: string
    nome: string
    descricao: string
    funcionamentoBasico: string
    feiticos: unknown[]
  }
  // Campos existentes
  tecnicasInatas: unknown[]
  habilidadesClasse: unknown[]
  pericias: unknown[]
  ferramentas: unknown[]
}
