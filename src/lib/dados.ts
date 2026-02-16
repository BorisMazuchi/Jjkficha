/** Regex para expressão de dados (ex.: 2d10, 1d8+2) */
const DADOS_REGEX = /(\d+)d(\d+)([+-]\d+)?/i

/**
 * Rola uma expressão de dados (ex.: "2d10", "1d8+3").
 * Retorna o total e um texto descritivo dos resultados.
 */
export function rolarExpressao(expressao: string): { total: number; texto: string } | null {
  const match = expressao.trim().match(DADOS_REGEX)
  if (!match) return null
  const qtd = parseInt(match[1], 10)
  const faces = parseInt(match[2], 10)
  const mod = match[3] ? parseInt(match[3], 10) : 0
  let total = 0
  const rolls: number[] = []
  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * faces) + 1
    rolls.push(r)
    total += r
  }
  total += mod
  const texto =
    mod !== 0
      ? `${qtd}d${faces}${mod >= 0 ? "+" : ""}${mod}: [${rolls.join(", ")}] = ${total}`
      : `${qtd}d${faces}: [${rolls.join(", ")}] = ${total}`
  return { total, texto }
}
