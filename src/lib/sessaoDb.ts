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
  }[]
  entradas: {
    id: string
    nome: string
    tipo: "jogador" | "maldicao"
    pvAtual?: number
    pvMax?: number
  }[]
  turnoAtual: number
  maldicoes: {
    id: string
    nome: string
    pvAtual: number
    pvMax: number
    grau?: string
  }[]
  log: {
    id: string
    timestamp: string
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
}

export async function carregarSessao(): Promise<SessaoMestreDados | null> {
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
  } as SessaoMestreDados
}

export async function salvarSessao(dados: SessaoMestreDados): Promise<boolean> {
  if (!supabase) return false
  const paraSalvar = {
    ...dados,
    log: dados.log.map((e) => ({
      ...e,
      timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : e.timestamp,
    })),
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
