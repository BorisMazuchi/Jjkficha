export interface PartyMember {
  id: string
  nome: string
  nivel: number
  grau: string
  pvAtual: number
  pvMax: number
  peAtual: number
  peMax: number
  defesa: number
  energiaTemporaria: boolean
  condicoes: string[]
  /** Nível de Exaustão 0–5 (Livro v2.5 — Cap. 12) */
  nivelExaustao?: number
  /** ID da ficha no Supabase, para o mestre abrir a ficha completa */
  fichaId?: string | null
  /** URL da imagem do personagem (vinda da ficha vinculada, para exibir no card) */
  imagemUrl?: string | null
}

export interface InitiativeEntry {
  id: string
  nome: string
  tipo: "jogador" | "maldicao"
  pvAtual?: number
  pvMax?: number
  /** URL da imagem (personagem ou maldição) para exibir no rastreador */
  imagemUrl?: string
  /** Posição no tabuleiro (grid). Se ausente, o grid usa posição automática por índice. */
  posicao?: { x: number; y: number }
}

export interface AtaqueMaldicao {
  id: string
  nome: string
  dano: string
  tipo?: string
  descricao?: string
}

export interface FeiticoMaldicao {
  id: string
  nome: string
  custoPE: number
  descricao?: string
  alcance?: string
}

export interface Maldicao {
  id: string
  nome: string
  pvAtual: number
  pvMax: number
  grau?: string
  defesa?: number
  descricao?: string
  /** URLs ou data URLs (base64) das imagens da maldição */
  imagens?: string[]
  /** True quando foi adicionada à sessão a partir do Bestiário (não aparece no Quick Bestiary) */
  origemBestiario?: boolean
  ataques?: AtaqueMaldicao[]
  feiticos?: FeiticoMaldicao[]
}

export type Condicao =
  | "Atordoado"
  | "Sangramento"
  | "Vontade Quebrada"
  | "Enfraquecido"
  | "Cego"
  | "Surdo"
  | "Paralisado"
  | "Petrificado"
  | "Outro"

export interface LogEntry {
  id: string
  timestamp: Date
  tipo: "rolagem" | "dano" | "cura" | "condicao" | "info"
  texto: string
  alvo?: string
}
