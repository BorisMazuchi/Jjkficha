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
}

export interface InitiativeEntry {
  id: string
  nome: string
  tipo: "jogador" | "maldicao"
  pvAtual?: number
  pvMax?: number
}

export interface Maldicao {
  id: string
  nome: string
  pvAtual: number
  pvMax: number
  grau?: string
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
