import type { Position, CalculoDistancia, GridCell, Token } from '@/types/vtt'

/**
 * Calcula a distância entre dois pontos no grid usando a regra D&D 5e
 * Diagonais contam como 1-2-1-2 (alternando com retas)
 */
export function calcularDistanciaGrid(
  origem: Position,
  destino: Position
): CalculoDistancia {
  const dx = Math.abs(destino.x - origem.x)
  const dy = Math.abs(destino.y - origem.y)

  const min = Math.min(dx, dy)
  const max = Math.max(dx, dy)
  const diagonais = min
  const retas = max - min

  const quadrados = diagonais + retas
  const metros = quadrados * 1.5

  return {
    quadrados,
    metros,
    diagonais,
    retas,
  }
}

/**
 * Converte posição do grid para pixels
 */
export function posicaoParaPixel(
  pos: Position,
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number } = { x: 0, y: 0 }
): { x: number; y: number } {
  return {
    x: pos.x * gridSize * zoom + pan.x,
    y: pos.y * gridSize * zoom + pan.y,
  }
}

/**
 * Converte pixel para posição do grid
 */
export function pixelParaPosicao(
  pixel: { x: number; y: number },
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number } = { x: 0, y: 0 }
): Position {
  const x = Math.floor((pixel.x - pan.x) / (gridSize * zoom))
  const y = Math.floor((pixel.y - pan.y) / (gridSize * zoom))
  return { x, y }
}

/**
 * Verifica se uma posição está dentro dos limites do grid
 */
export function estaDentroDoGrid(
  pos: Position,
  largura: number,
  altura: number
): boolean {
  return pos.x >= 0 && pos.x < largura && pos.y >= 0 && pos.y < altura
}

/**
 * Cria um grid vazio com todas as células "normal" e não exploradas
 */
export function criarGridVazio(largura: number, altura: number): GridCell[][] {
  const grid: GridCell[][] = []
  for (let y = 0; y < altura; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < largura; x++) {
      row.push({
        x,
        y,
        terreno: 'normal',
        visivel: false,
        reveladoPermanente: false,
      })
    }
    grid.push(row)
  }
  return grid
}

/**
 * Calcula todas as células em um cone a partir de uma origem e direção
 * Ângulo de abertura: 60 graus (padrão) ou 90 graus
 */
export function calcularCelulasNoConе(
  origem: Position,
  destino: Position,
  tamanho: number, // em metros
  abertura: number = 60 // graus
): Position[] {
  const celulas: Position[] = []
  const raioQuad = Math.ceil(tamanho / 1.5)

  // Calcular ângulo entre origem e destino
  const dx = destino.x - origem.x
  const dy = destino.y - origem.y
  const anguloDestino = Math.atan2(dy, dx) * (180 / Math.PI)

  const anguloAbertura = abertura / 2

  for (let y = -raioQuad; y <= raioQuad; y++) {
    for (let x = -raioQuad; x <= raioQuad; x++) {
      const pos: Position = { x: origem.x + x, y: origem.y + y }
      const dist = Math.sqrt(x * x + y * y)

      if (dist <= raioQuad) {
        const angulo = Math.atan2(y, x) * (180 / Math.PI)
        const diferenca = Math.abs(anguloDestino - angulo)

        if (diferenca <= anguloAbertura || diferenca >= 360 - anguloAbertura) {
          celulas.push(pos)
        }
      }
    }
  }

  return celulas
}

/**
 * Calcula todas as células em um cilindro (círculo) ao redor de um ponto
 */
export function calcularCelulasNoCilindro(
  centro: Position,
  raio: number // em metros
): Position[] {
  const celulas: Position[] = []
  const raioQuad = Math.ceil(raio / 1.5)

  for (let y = -raioQuad; y <= raioQuad; y++) {
    for (let x = -raioQuad; x <= raioQuad; x++) {
      const dist = Math.sqrt(x * x + y * y)
      if (dist <= raioQuad) {
        celulas.push({ x: centro.x + x, y: centro.y + y })
      }
    }
  }

  return celulas
}

/**
 * Calcula todas as células em uma linha entre dois pontos
 */
export function calcularCelulasNaLinha(
  origem: Position,
  destino: Position
): Position[] {
  const celulas: Position[] = []
  const dx = destino.x - origem.x
  const dy = destino.y - origem.y
  const passos = Math.max(Math.abs(dx), Math.abs(dy))

  if (passos === 0) {
    return [origem]
  }

  for (let i = 0; i <= passos; i++) {
    const t = passos === 0 ? 0 : i / passos
    const x = Math.round(origem.x + dx * t)
    const y = Math.round(origem.y + dy * t)
    celulas.push({ x, y })
  }

  return celulas
}

/**
 * Calcula todas as células em um cubo quadrado
 */
export function calcularCelulasNoCubo(
  centro: Position,
  tamanho: number // em células (será quadrado)
): Position[] {
  const celulas: Position[] = []
  const metade = Math.floor(tamanho / 2)

  for (let y = -metade; y <= metade; y++) {
    for (let x = -metade; x <= metade; x++) {
      celulas.push({ x: centro.x + x, y: centro.y + y })
    }
  }

  return celulas
}

/**
 * Calcula o custo de movimento entre duas posições considerando terreno
 */
export function calcularCustoMovimento(
  origem: Position,
  destino: Position,
  grid: GridCell[][]
): number {
  const celulas = calcularCelulasNaLinha(origem, destino)
  let custo = 0

  for (const cel of celulas) {
    if (cel.y >= 0 && cel.y < grid.length && cel.x >= 0 && cel.x < grid[0].length) {
      const gridCell = grid[cel.y][cel.x]
      if (gridCell.terreno === 'bloqueado') {
        return Infinity // Movimento inválido
      } else if (gridCell.terreno === 'dificil') {
        custo += 3 // metros (dobro)
      } else {
        custo += 1.5 // metros
      }
    }
  }

  return custo
}

/**
 * Verifica se um token ocupa uma posição (considerando tamanho)
 */
export function tokenOcupaPosicao(token: Token, pos: Position): boolean {
  const tamanho = token.tamanho
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      if (token.posicao.x + x === pos.x && token.posicao.y + y === pos.y) {
        return true
      }
    }
  }
  return false
}

/**
 * Encontra todos os tokens que ocupam uma determinada posição
 */
export function encontrarTokensEmPosicao(tokens: Token[], pos: Position): Token[] {
  return tokens.filter((token) => tokenOcupaPosicao(token, pos))
}

/**
 * Calcula o bounding box de um token
 */
export function calcularBoundingBoxToken(token: Token): {
  x1: number
  y1: number
  x2: number
  y2: number
} {
  return {
    x1: token.posicao.x,
    y1: token.posicao.y,
    x2: token.posicao.x + token.tamanho - 1,
    y2: token.posicao.y + token.tamanho - 1,
  }
}

/**
 * Verifica se dois tokens se sobrepõem
 */
export function tokensSeOverlapam(token1: Token, token2: Token): boolean {
  const box1 = calcularBoundingBoxToken(token1)
  const box2 = calcularBoundingBoxToken(token2)

  return !(box1.x2 < box2.x1 || box2.x2 < box1.x1 || box1.y2 < box2.y1 || box2.y2 < box1.y1)
}

/**
 * Gera uma cor aleatória para um novo token
 */
export function gerarCorAleatoria(): string {
  const cores = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  return cores[Math.floor(Math.random() * cores.length)]
}

/**
 * Formata a distância em metros para exibição
 */
export function formatarDistancia(metros: number): string {
  if (metros < 1.5) {
    return 'Adj.'
  }
  return `${metros.toFixed(1)}m`
}

/**
 * Valida se uma posição é válida para colocar um token
 */
export function validarPosicaoToken(
  pos: Position,
  token: Partial<Token>,
  tokens: Token[],
  grid: GridCell[][]
): boolean {
  const tamanho = token.tamanho || 1

  // Verificar limites do grid
  if (
    pos.x < 0 ||
    pos.y < 0 ||
    pos.x + tamanho > grid[0].length ||
    pos.y + tamanho > grid.length
  ) {
    return false
  }

  // Verificar se há terreno bloqueado
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      if (grid[pos.y + y][pos.x + x].terreno === 'bloqueado') {
        return false
      }
    }
  }

  // Verificar sobreposição com outros tokens
  for (const outroToken of tokens) {
    if (outroToken.id === token.id) continue
    const novoToken = { ...token, posicao: pos, id: 'temp' } as Token
    if (tokensSeOverlapam(novoToken, outroToken)) {
      return false
    }
  }

  return true
}
