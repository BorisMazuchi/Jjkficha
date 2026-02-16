export type Especializacao =
  | "Lutador"
  | "Especialista em Combate"
  | "Especialista em Técnica"
  | "Controlador"
  | "Suporte"
  | "Restringido"

export interface DadosEspecializacao {
  especializacao: Especializacao
  pvPorNivel: number // Base de PV por nível da classe
  pePorNivel: number // Base de PE por nível (ou Estamina para Restringido)
  // Campos específicos por especialização
  empolgacao?: number // Lutador
  estoqueInvocacoes?: EstoqueInvocacao[] // Controlador
  usaEstamina?: boolean // Restringido usa Estamina ao invés de PE
}

export interface EstoqueInvocacao {
  id: string
  nome: string
  tipo: "Shikigami" | "Corpo Amaldiçoado"
  pvMax: number
  pvAtual: number
  descricao: string
  habilidades: string[]
}

export interface XPData {
  xpAtual: number
  xpProximoNivel: number
}

export interface IntegridadeAlma {
  atual: number
  max: number // Sempre igual ao PV Max
}

export interface TecnicaAmaldicada {
  id: string
  nome: string
  descricao: string
  funcionamentoBasico: string // Texto livre da técnica
  /** URL ou data URL da imagem da técnica inata (aceita GIF) */
  imagem?: string
  feiticos: Feitico[]
}

export interface Feitico {
  id: string
  nome: string
  custoPE: number
  dano: DadoDano
  alcance: string // Ex: "9m", "30m", "Toque", "Pessoal"
  tipoAcao: TipoAcao
  areaEfeito?: AreaEfeito
  descricao: string
  efeitos?: string[] // Efeitos especiais (ex: "Empurra 3m", "Queima")
}

export interface DadoDano {
  quantidadeDados: number // Ex: 3 para 3d8
  tipoDado: 4 | 6 | 8 | 10 | 12 | 20
  modificador: string // Ex: "Inteligência", "Potência", "+5"
  tipoDano?: string // Ex: "Cortante", "Fogo", "Energia Amaldiçoada"
}

export type TipoAcao =
  | "Ação"
  | "Ação Bônus"
  | "Reação"
  | "Ação Livre"
  | "Ação Completa"

export interface AreaEfeito {
  tipo: "Cone" | "Linha" | "Cilindro" | "Esfera" | "Cubo"
  tamanho: string // Ex: "9m de raio", "Cone de 6m"
}

export interface InventarioSlot {
  id: string
  nome: string
  tipo: "Arma Simples" | "Arma Complexa" | "Ferramenta Amaldiçoada" | "Item" | "Consumível"
  espacosOcupados: number
  grau?: string
  dano?: string
  propriedades?: string[]
  encantamentos?: string[]
  descricao?: string
}
