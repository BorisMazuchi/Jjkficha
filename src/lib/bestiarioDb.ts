import { supabase } from "./supabase"
import type { Maldicao } from "@/types/mestre"

const STORAGE_KEY = "bestiario-maldicoes"

export interface BestiarioDados {
  maldicoes: Maldicao[]
}

async function carregarBestiarioSupabase(): Promise<Maldicao[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("bestiario")
    .select("dados")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data?.dados) return null
  const d = data.dados as BestiarioDados
  const list = d?.maldicoes
  return Array.isArray(list) ? list : null
}

async function salvarBestiarioSupabase(maldicoes: Maldicao[]): Promise<boolean> {
  if (!supabase) return false
  const payload: BestiarioDados = { maldicoes }
  const { data: existing } = await supabase
    .from("bestiario")
    .select("id")
    .limit(1)
    .maybeSingle()
  if (existing?.id) {
    const { error } = await supabase
      .from("bestiario")
      .update({ dados: payload })
      .eq("id", existing.id)
    return !error
  }
  const { error } = await supabase.from("bestiario").insert({ dados: payload })
  return !error
}

function carregarBestiarioLocal(): Maldicao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Maldicao[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function salvarBestiarioLocal(maldicoes: Maldicao[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maldicoes))
  } catch {
    // ignore
  }
}

/**
 * Carrega o bestiário: tenta Supabase primeiro; se não configurado ou falha, usa localStorage.
 */
export async function carregarBestiario(): Promise<Maldicao[]> {
  const fromSupabase = await carregarBestiarioSupabase()
  if (fromSupabase != null) return fromSupabase
  return carregarBestiarioLocal()
}

/**
 * Salva o bestiário: tenta Supabase primeiro; se não configurado ou falha, usa localStorage.
 * Retorna true se salvou no Supabase, false se usou apenas localStorage.
 */
export async function salvarBestiario(maldicoes: Maldicao[]): Promise<boolean> {
  const ok = await salvarBestiarioSupabase(maldicoes)
  if (ok) return true
  salvarBestiarioLocal(maldicoes)
  return false
}
