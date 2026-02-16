import { supabase } from "./supabase"

export interface SessaoMestreDados {
  membros: {
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
    fichaId?: string | null
    imagemUrl?: string | null
  }[]
  entradas: {
    id: string
    nome: string
    tipo: "jogador" | "maldicao"
    pvAtual?: number
    pvMax?: number
    imagemUrl?: string
  }[]
  turnoAtual: number
  maldicoes: {
    id: string
    nome: string
    pvAtual: number
    pvMax: number
    grau?: string
    defesa?: number
    descricao?: string
    imagens?: string[]
    origemBestiario?: boolean
    ataques?: { id: string; nome: string; dano: string; tipo?: string; descricao?: string }[]
    feiticos?: { id: string; nome: string; custoPE: number; descricao?: string; alcance?: string }[]
  }[]
  log: {
    id: string
    timestamp: string
    tipo: string
    texto: string
    alvo?: string
  }[]
  votos: {
    id: string
    dono: string
    tipo: string
    beneficio: string
    maleficio: string
    ativo: boolean
  }[]
}

export interface SessaoCarregada extends Omit<SessaoMestreDados, "log"> {
  log: {
    id: string
    timestamp: Date
    tipo: string
    texto: string
    alvo?: string
  }[]
}

export const SESSAO_INICIAL: SessaoMestreDados = {
  membros: [],
  entradas: [],
  turnoAtual: 0,
  maldicoes: [],
  log: [],
  votos: [],
}

export async function carregarSessao(): Promise<SessaoCarregada | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("sessao_mestre")
    .select("dados")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data?.dados) return null
  const d = data.dados as SessaoMestreDados
  return {
    ...SESSAO_INICIAL,
    ...d,
    log: (d.log ?? []).map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    })),
    votos: d.votos ?? [],
  }
}

export async function salvarSessao(dados: SessaoCarregada): Promise<boolean> {
  if (!supabase) return false
  const paraSalvar: SessaoMestreDados = {
    ...dados,
    log: dados.log.map((e) => ({
      ...e,
      timestamp: typeof e.timestamp === "string" ? e.timestamp : e.timestamp.toISOString(),
    })),
    votos: dados.votos ?? [],
  }
  const { data: existing } = await supabase
    .from("sessao_mestre")
    .select("id")
    .limit(1)
    .maybeSingle()
  if (existing?.id) {
    const { error } = await supabase
      .from("sessao_mestre")
      .update({ dados: paraSalvar })
      .eq("id", existing.id)
    return !error
  }
  const { error } = await supabase.from("sessao_mestre").insert({ dados: paraSalvar })
  return !error
}
