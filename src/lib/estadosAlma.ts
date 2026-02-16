/**
 * Estados da Alma — Livro Feiticeiros e Maldições v2.5, Cap. 12, p.312.
 * Estável >75%, Danificado ≤75%, Instável ≤50%, Crítico ≤25%.
 */

export type EstadoAlma = "Estável" | "Danificado" | "Instável" | "Crítico"

export interface EstadoAlmaInfo {
  estado: EstadoAlma
  percentual: number
  penalidadeTestes: number
  custoExtraPE: number
  desvantagem: boolean
  condicoesAplicadas: string[]
  descricao: string
}

export function calcularEstadoAlma(
  integridadeAtual: number,
  integridadeMax: number
): EstadoAlmaInfo | null {
  if (integridadeMax <= 0) return null
  const percentual = (integridadeAtual / integridadeMax) * 100

  if (percentual > 75) {
    return {
      estado: "Estável",
      percentual,
      penalidadeTestes: 0,
      custoExtraPE: 0,
      desvantagem: false,
      condicoesAplicadas: [],
      descricao: "Nenhum prejuízo.",
    }
  }
  if (percentual > 50) {
    return {
      estado: "Danificado",
      percentual,
      penalidadeTestes: -3,
      custoExtraPE: 2,
      desvantagem: false,
      condicoesAplicadas: [],
      descricao: "-3 em todos os testes e rolagens; custo em PE/Estamina de todas as habilidades aumentado em 2.",
    }
  }
  if (percentual > 25) {
    return {
      estado: "Instável",
      percentual,
      penalidadeTestes: -6,
      custoExtraPE: 3,
      desvantagem: false,
      condicoesAplicadas: ["Exposto"],
      descricao: "-6 em todos os testes e rolagens; custo em PE/Estamina +3; Exposto.",
    }
  }
  if (percentual > 0) {
    return {
      estado: "Crítico",
      percentual,
      penalidadeTestes: -8,
      custoExtraPE: 5,
      desvantagem: true,
      condicoesAplicadas: ["Exposto", "Fragilizado"],
      descricao: "-8 e desvantagem em todos os testes; custo PE/Estamina +5; Exposto e Fragilizado.",
    }
  }
  return {
    estado: "Crítico",
    percentual: 0,
    penalidadeTestes: -8,
    custoExtraPE: 5,
    desvantagem: true,
    condicoesAplicadas: ["Exposto", "Fragilizado"],
    descricao: "Integridade 0: personagem morto (alma perdeu o formato).",
  }
}
