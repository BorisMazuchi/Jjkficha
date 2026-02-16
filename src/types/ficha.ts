export type Grau = '4º' | '3º' | '2º' | '1º' | 'Especial'

export type AptidaoAmaldicada = 'Aura' | 'Controle' | 'Fluxo' | 'Potência'

export interface CabeçalhoFicha {
  nomePersonagem: string
  jogador: string
  nivel: number
  grau: Grau
  origemCla: string
  /** XP atual (Livro v2.5) */
  xpAtual?: number
  /** XP necessário para próximo nível */
  xpProximoNivel?: number
  /** URL ou data URL (base64) da imagem do personagem (aceita GIF) */
  imagemPersonagem?: string
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
  /** Integridade da Alma atual (máx = pvMax, Livro v2.5) */
  integridadeAtual?: number
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
  /** URL ou data URL da imagem da ferramenta (aceita GIF) */
  imagem?: string
}
// Re-exportar tipos de especializacao para compatibilidade
export type {
  Especializacao,
  DadosEspecializacao,
  XPData,
  IntegridadeAlma,
  TecnicaAmaldicada,
  EstoqueInvocacao,
  Feitico,
} from "./especializacao"