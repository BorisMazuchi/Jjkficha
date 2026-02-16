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
  /** Integridade da Alma (Livro v2.5 — Cap. 12, p.312); sincronizado da ficha */
  integridadeAtual?: number
  integridadeMax?: number
  /** Dados de vida para descanso curto (ex.: "2d10"); sincronizado da ficha */
  dadosVida?: string
  /** Em que está concentrando (ex.: nome da técnica); perde ao sofrer dano/condição. Cap. 12 */
  concentrandoEm?: string
  /** Nome da Expansão de Domínio (sincronizado da ficha); usado para exibir e toggle ativo */
  dominioNome?: string
  /** Se a Expansão de Domínio está ativa no combate (toggle no mestre) */
  dominioAtivo?: boolean
  /** Invocações (Shikigamis/Corpos) do Controlador; sincronizado da ficha para adicionar à iniciativa */
  invocoes?: { id: string; nome: string; tipo: string; pvAtual: number; pvMax: number }[]
  /** Deslocamento em metros (Cap. 12); sincronizado da ficha ou definido no mestre */
  movimento?: number
  /** Cobertura atual: meia (+2 Defesa) ou total (+5 Defesa) */
  cobertura?: "meia" | "total"
  /** Em flanco (vantagem/bônus conforme regras) */
  emFlanco?: boolean
  /** Restringido usa Estamina em vez de PE; sincronizado da ficha */
  usaEstamina?: boolean
  /** Bônus de iniciativa (d20 + este valor); definido no mestre ou ficha */
  bonusIniciativa?: number
}

export interface InitiativeEntry {
  id: string
  nome: string
  tipo: "jogador" | "maldicao"
  pvAtual?: number
  pvMax?: number
  /** URL da imagem (personagem ou maldição) para exibir no rastreador */
  imagemUrl?: string
  /** Posição (legado; reservado para uso futuro). */
  posicao?: { x: number; y: number }
  /** Surpresa (Cap. 12); não age no primeiro round */
  surpresa?: boolean
  /** Bônus de iniciativa (d20 + este valor para ordenar) */
  bonusIniciativa?: number
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
  /** Resistências a tipos de dano (ex.: "Cortante, Fogo"); Cap. 12 */
  resistencias?: string
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
