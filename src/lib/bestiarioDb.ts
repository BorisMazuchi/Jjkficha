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

/** Remove dados do bestiário do localStorage (usado após migrar para Supabase). */
function limparBestiarioLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Carrega o bestiário apenas do Supabase (tabela bestiario).
 * Se a tabela não existir, retorna []. Se existir dados antigos no localStorage, tenta migrar uma vez.
 */
export async function carregarBestiario(): Promise<Maldicao[]> {
  const fromSupabase = await carregarBestiarioSupabase()
  if (fromSupabase != null) return fromSupabase
  // Migração única: se tinha dados no localStorage, tenta enviar para o Supabase (quando a tabela já existir)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Maldicao[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ok = await salvarBestiarioSupabase(parsed)
        if (ok) {
          limparBestiarioLocal()
          return parsed
        }
      }
    }
  } catch {
    // ignore
  }
  return []
}

/**
 * Salva o bestiário apenas no Supabase (tabela bestiario).
 * Retorna true se salvou, false se Supabase não está configurado ou a tabela não existe.
 */
export async function salvarBestiario(maldicoes: Maldicao[]): Promise<boolean> {
  const ok = await salvarBestiarioSupabase(maldicoes)
  if (ok) limparBestiarioLocal()
  return ok
}
