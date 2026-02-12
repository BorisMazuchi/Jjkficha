export type Grau = '4º' | '3º' | '2º' | '1º' | 'Especial'

export type AptidaoAmaldicada = 'Aura' | 'Controle' | 'Fluxo' | 'Potência'

export interface CabeçalhoFicha {
  nomePersonagem: string
  jogador: string
  nivel: number
  grau: Grau
  origemCla: string
}

export interface Atributos {
  forca: number
  destreza: number
  constituicao: number
  inteligencia: number
  sabedoria: number
  carisma: number
}

export interface Recursos {
  pvAtual: number
  pvMax: number
  peAtual: number
  peMax: number
  vidaTemporaria: number
  energiaTemporaria: number
}

export interface AptidoesAmaldicadas {
  Aura: number
  Controle: number
  Fluxo: number
  Potência: number
}

export type TipoPericia = 'Nenhum' | 'Treinamento' | 'Especialização'

export interface Pericia {
  nome: string
  atributoBase: string
  tipo: TipoPericia
  bonusCustomizado?: number
}

export interface Habilidade {
  id: string
  nome: string
  descricao: string
  custoPE: number
  limitadaPeloNivel: boolean
  bonusInserido?: number
}

export interface FerramentaAmaldicada {
  id: string
  nome: string
  grau: Grau
  dano: string
  propriedades: string
}
