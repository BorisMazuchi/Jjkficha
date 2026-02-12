import { supabase } from "./supabase"
import type { FichaDados } from "@/types/supabase"

export async function listarFichas(): Promise<
  { id: string; nome_personagem: string; jogador: string; updated_at: string }[]
> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("fichas")
    .select("id, nome_personagem, jogador, updated_at")
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function carregarFicha(id: string): Promise<FichaDados | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("fichas")
    .select("dados")
    .eq("id", id)
    .single()
  if (error || !data) return null
  return data.dados as FichaDados
}

export async function salvarFicha(
  nomePersonagem: string,
  jogador: string,
  dados: FichaDados
): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("fichas")
    .insert({
      nome_personagem: nomePersonagem,
      jogador,
      dados,
    })
    .select("id")
    .single()
  if (error) throw error
  return data?.id ?? null
}

export async function atualizarFicha(
  id: string,
  nomePersonagem: string,
  jogador: string,
  dados: FichaDados
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from("fichas")
    .update({
      nome_personagem: nomePersonagem,
      jogador,
      dados,
    })
    .eq("id", id)
  if (error) throw error
  return true
}

export async function excluirFicha(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from("fichas").delete().eq("id", id)
  if (error) throw error
  return true
}
