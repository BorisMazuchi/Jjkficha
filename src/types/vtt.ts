// Posição no grid
export interface Position {
  x: number // coordenada em grid
  y: number // coordenada em grid
}

// Token (personagem, maldição, NPC, objeto)
export interface Token {
  id: string
  nome: string
  tipo: 'jogador' | 'maldicao' | 'npc' | 'objeto'
  posicao: Position
  tamanho: 1 | 2 | 3 | 4 // quantos quadrados ocupa
  cor: string
  icone?: string // URL ou nome do ícone lucide
  visivel: boolean // para camada do mestre
  pv?: {
    atual: number
    max: number
  }
  pe?: {
    atual: number
    max: number
  }
  condicoes: string[]
  alcanceMovimento?: number // em metros
  rotacao?: number // em graus (0-360)
}

// Célula do grid
export interface GridCell {
  x: number
  y: number
  terreno: 'normal' | 'dificil' | 'bloqueado'
  visivel: boolean // fog of war para jogadores
  reveladoPermanente: boolean // foi explorada
}

// Medição (régua, cone, etc)
export interface Measurement {
  id: string
  tipo: 'linha' | 'cone' | 'esfera' | 'cilindro' | 'cubo'
  origem: Position
  destino?: Position
  tamanho: number // em metros
  cor: string
  criada_em: number // timestamp
}

// Tipo de camada do tabuleiro
export type Camada = 'mapa' | 'medicao' | 'tokens' | 'mestre'

// Tipo de ferramenta ativa
export type Ferramenta =
  | 'select'
  | 'regua'
  | 'cone'
  | 'linha'
  | 'cilindro'
  | 'esfera'
  | 'cubo'
  | 'revelar'
  | 'esconder'
  | 'terreno_dificil'
  | 'terreno_bloqueado'

// Configuração do tabuleiro
export interface ConfiguracaoTabuleiro {
  gridSize: number // pixels por célula
  largura: number // cells
  altura: number // cells
  mostrarCoordernadas: boolean
  mostrarGrid: boolean
}

// Estado completo do tabuleiro
export interface EstadoTabuleiro {
  tokens: Token[]
  grid: GridCell[][]
  medicoes: Measurement[]
  configuracao: ConfiguracaoTabuleiro
  zoom: number
  pan: {
    x: number
    y: number
  }
  camadas: Partial<Record<Camada, boolean>>
  tokenSelecionado: string | null
  ferramenta: Ferramenta
}

// Dados para salvar no Supabase
export interface DadosTabuleiro {
  tokens: Token[]
  grid: GridCell[][]
  medicoes: Measurement[]
  configuracao: ConfiguracaoTabuleiro
}

// Status indicator para condições
export interface IndicadorStatus {
  condicao: string
  icone: string
  cor: string
  duracao?: number // rodadas restantes
}

// Para cálculos de distância
export interface CalculoDistancia {
  quadrados: number
  metros: number
  diagonais: number
  retas: number
}
