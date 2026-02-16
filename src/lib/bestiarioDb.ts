import type { Maldicao } from "@/types/mestre"

const STORAGE_KEY = "bestiario-maldicoes"

export function carregarBestiario(): Maldicao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Maldicao[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function salvarBestiario(maldicoes: Maldicao[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maldicoes))
  } catch {
    // ignore
  }
}
