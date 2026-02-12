import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Valida bônus de habilidade "Limitada pelo Nível".
 * Retorna o menor valor entre o bônus inserido e o nível do personagem.
 */
export function validarBonusLimitadoPeloNivel(
  bonusInserido: number,
  nivelPersonagem: number
): number {
  return Math.min(bonusInserido, nivelPersonagem)
}
