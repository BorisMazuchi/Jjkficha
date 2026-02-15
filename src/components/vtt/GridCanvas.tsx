import React, { useRef, useEffect, useState, useCallback } from 'react'
import type {
  Token,
  GridCell,
  Measurement,
  Position,
  Ferramenta,
  Camada,
} from '@/types/vtt'
import {
  posicaoParaPixel,
  pixelParaPosicao,
  calcularDistanciaGrid,
  estaDentroDoGrid,
  calcularCelulasNoCilindro,
  calcularCelulasNoConе,
  calcularCelulasNaLinha,
  calcularCelulasNoCubo,
  encontrarTokensEmPosicao,
} from '@/lib/vttUtils'

interface GridCanvasProps {
  tokens: Token[]
  grid: GridCell[][]
  medicoes: Measurement[]
  zoom: number
  pan: { x: number; y: number }
  camadas: Partial<Record<Camada, boolean>>
  ferramenta: Ferramenta
  tokenSelecionado: string | null
  gridSize: number
  ehMestre: boolean
  mostrarCoord: boolean
  mostrarGrid: boolean
  onTokenMove: (tokenId: string, newPos: Position) => void
  onTokenSelect: (tokenId: string | null) => void
  onMedicaoCreate: (medicao: Omit<Measurement, 'id'>) => void
  onCellToggle: (x: number, y: number, acao: 'revelar' | 'esconder') => void
}

export function GridCanvas({
  tokens,
  grid,
  medicoes,
  zoom,
  pan,
  camadas,
  ferramenta,
  tokenSelecionado,
  gridSize,
  ehMestre,
  mostrarCoord,
  mostrarGrid,
  onTokenMove,
  onTokenSelect,
  onMedicaoCreate,
  onCellToggle,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tokenArrastando, setTokenArrastando] = useState<string | null>(null)
  const [offsetArrastagem, setOffsetArrastagem] = useState<Position>({ x: 0, y: 0 })
  const [medicaoTemporaria, setMedicaoTemporaria] = useState<Position | null>(null)

  // Renderizar o canvas
  const renderizar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Limpar canvas
    ctx.fillStyle = '#0a0e14'
    ctx.fillRect(0, 0, width, height)

    // Camada: Mapa (fundo)
    if (camadas.mapa !== false) {
      desenharFundo(ctx, width, height)
    }

    // Camada: Grid
    if (mostrarGrid) {
      desenharGrid(ctx, grid, gridSize, zoom, pan, width, height)
    }

    // Camada: Fog of War
    if (ehMestre && camadas.tokens !== false) {
      desenharFogOfWar(ctx, grid, gridSize, zoom, pan, width, height)
    }

    // Camada: Medições
    if (camadas.medicao !== false) {
      desenharMedicoes(ctx, medicoes, gridSize, zoom, pan)
      if (medicaoTemporaria) {
        desenharMedicaoTemporaria(ctx, medicaoTemporaria, gridSize, zoom, pan)
      }
    }

    // Camada: Tokens
    if (camadas.tokens !== false) {
      desenharTokens(ctx, tokens, gridSize, zoom, pan, tokenSelecionado, ehMestre)
    }

    // Camada: Mestre (apenas para mestres)
    if (ehMestre && camadas.mestre !== false) {
      desenharCamadaMestre(ctx, tokens, gridSize, zoom, pan)
    }

    // Desenhar coordenadas se solicitado
    if (mostrarCoord) {
      desenharCoordenadas(ctx, grid, gridSize, zoom, pan, width, height)
    }
  }, [grid, tokens, medicoes, zoom, pan, camadas, gridSize, tokenSelecionado, ehMestre, mostrarCoord, mostrarGrid, medicaoTemporaria])

  // Setupdo canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    renderizar()
  }, [renderizar])

  // Lidar com mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const pixelPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    // Se está arrastando um token
    if (tokenArrastando) {
      const gridPos = pixelParaPosicao(pixelPos, gridSize, zoom, pan)
      const ajustedPos = {
        x: gridPos.x - offsetArrastagem.x,
        y: gridPos.y - offsetArrastagem.y,
      }

      if (estaDentroDoGrid(ajustedPos, grid[0].length, grid.length)) {
        onTokenMove(tokenArrastando, ajustedPos)
      }
      return
    }

    // Mostrar medição temporária se em modo de medição
    if (
      ferramenta.startsWith('regua') ||
      ferramenta.startsWith('cone') ||
      ferramenta.startsWith('cilindro')
    ) {
      const gridPos = pixelParaPosicao(pixelPos, gridSize, zoom, pan)
      setMedicaoTemporaria(gridPos)
    }
  }

  // Lidar com mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (ferramenta === 'select') {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const pixelPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      const gridPos = pixelParaPosicao(pixelPos, gridSize, zoom, pan)
      const tokensNaPosicao = encontrarTokensEmPosicao(tokens, gridPos)

      if (tokensNaPosicao.length > 0) {
        const token = tokensNaPosicao[0]
        onTokenSelect(token.id)
        setTokenArrastando(token.id)
        setOffsetArrastagem({
          x: gridPos.x - token.posicao.x,
          y: gridPos.y - token.posicao.y,
        })
      } else {
        onTokenSelect(null)
      }
    }
  }

  // Lidar com mouse up
  const handleMouseUp = () => {
    setTokenArrastando(null)
  }

  // Lidar com clique (criar medição, revelar fog, etc)
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const pixelPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const gridPos = pixelParaPosicao(pixelPos, gridSize, zoom, pan)

    if (!estaDentroDoGrid(gridPos, grid[0].length, grid.length)) return

    // Revelar/Esconder fog of war
    if (ehMestre && (ferramenta === 'revelar' || ferramenta === 'esconder')) {
      onCellToggle(gridPos.x, gridPos.y, ferramenta === 'revelar' ? 'revelar' : 'esconder')
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0a0e14] cursor-move overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(136,50,255,0.1) 1px, transparent 1px)',
        backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
    </div>
  )
}

// ===== Funções de Desenho =====

function desenharFundo(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#0a0e14'
  ctx.fillRect(0, 0, width, height)
}

function desenharGrid(
  ctx: CanvasRenderingContext2D,
  grid: GridCell[][],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number },
  width: number,
  height: number
) {
  const cellSizeZoomed = gridSize * zoom

  ctx.strokeStyle = 'rgba(136, 50, 255, 0.2)'
  ctx.lineWidth = 1

  // Desenhar linhas verticais
  const startX = Math.floor(-pan.x / cellSizeZoomed)
  const endX = Math.ceil((width - pan.x) / cellSizeZoomed)

  for (let x = startX; x <= endX; x++) {
    const pixelX = x * cellSizeZoomed + pan.x
    ctx.beginPath()
    ctx.moveTo(pixelX, 0)
    ctx.lineTo(pixelX, height)
    ctx.stroke()
  }

  // Desenhar linhas horizontais
  const startY = Math.floor(-pan.y / cellSizeZoomed)
  const endY = Math.ceil((height - pan.y) / cellSizeZoomed)

  for (let y = startY; y <= endY; y++) {
    const pixelY = y * cellSizeZoomed + pan.y
    ctx.beginPath()
    ctx.moveTo(0, pixelY)
    ctx.lineTo(width, pixelY)
    ctx.stroke()
  }
}

function desenharFogOfWar(
  ctx: CanvasRenderingContext2D,
  grid: GridCell[][],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number },
  width: number,
  height: number
) {
  const cellSizeZoomed = gridSize * zoom

  const startX = Math.max(0, Math.floor(-pan.x / cellSizeZoomed))
  const endX = Math.min(grid[0].length, Math.ceil((width - pan.x) / cellSizeZoomed) + 1)
  const startY = Math.max(0, Math.floor(-pan.y / cellSizeZoomed))
  const endY = Math.min(grid.length, Math.ceil((height - pan.y) / cellSizeZoomed) + 1)

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const cell = grid[y][x]
      const pixelX = x * cellSizeZoomed + pan.x
      const pixelY = y * cellSizeZoomed + pan.y

      if (!cell.visivel && !cell.reveladoPermanente) {
        // Não explorada - preto opaco
        ctx.fillStyle = '#000000'
        ctx.fillRect(pixelX, pixelY, cellSizeZoomed, cellSizeZoomed)
      } else if (!cell.visivel && cell.reveladoPermanente) {
        // Explorada mas fora de visão - cinza semi-transparente
        ctx.fillStyle = 'rgba(64, 64, 64, 0.6)'
        ctx.fillRect(pixelX, pixelY, cellSizeZoomed, cellSizeZoomed)
      }
    }
  }
}

function desenharTokens(
  ctx: CanvasRenderingContext2D,
  tokens: Token[],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number },
  tokenSelecionado: string | null,
  ehMestre: boolean
) {
  for (const token of tokens) {
    // Não desenhar tokens invisíveis para jogadores
    if (!ehMestre && !token.visivel) continue

    const pixelPos = posicaoParaPixel(token.posicao, gridSize, zoom, pan)
    const tamanhoPixel = token.tamanho * gridSize * zoom

    // Desenhar corpo do token
    ctx.fillStyle = token.cor
    ctx.beginPath()
    ctx.arc(pixelPos.x + tamanhoPixel / 2, pixelPos.y + tamanhoPixel / 2, tamanhoPixel / 2, 0, Math.PI * 2)
    ctx.fill()

    // Desenhar borda se selecionado
    if (token.id === tokenSelecionado) {
      ctx.strokeStyle = '#8832ff'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    // Desenhar PV se disponível
    if (token.pv) {
      desenharBarraPV(ctx, token.pv.atual, token.pv.max, pixelPos, tamanhoPixel)
    }

    // Desenhar nome
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.max(10, 12 * zoom)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      token.nome.substring(0, 3),
      pixelPos.x + tamanhoPixel / 2,
      pixelPos.y + tamanhoPixel / 2
    )
  }
}

function desenharBarraPV(
  ctx: CanvasRenderingContext2D,
  pvAtual: number,
  pvMax: number,
  pixelPos: { x: number; y: number },
  tamanho: number
) {
  const percentualPV = pvAtual / pvMax
  const barraAltura = 4
  const barraLargura = tamanho
  const barraY = pixelPos.y - 6

  // Fundo da barra (vermelho escuro)
  ctx.fillStyle = '#4a1a1a'
  ctx.fillRect(pixelPos.x, barraY, barraLargura, barraAltura)

  // Barra de PV (verde)
  ctx.fillStyle = percentualPV > 0.25 ? '#10b981' : '#e94560'
  ctx.fillRect(pixelPos.x, barraY, barraLargura * percentualPV, barraAltura)

  // Borda
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.strokeRect(pixelPos.x, barraY, barraLargura, barraAltura)
}

function desenharMedicoes(
  ctx: CanvasRenderingContext2D,
  medicoes: Measurement[],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number }
) {
  for (const med of medicoes) {
    ctx.strokeStyle = med.cor || '#fbbf24'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    const origin = posicaoParaPixel(med.origem, gridSize, zoom, pan)

    switch (med.tipo) {
      case 'linha': {
        if (med.destino) {
          const dest = posicaoParaPixel(med.destino, gridSize, zoom, pan)
          ctx.beginPath()
          ctx.moveTo(origin.x, origin.y)
          ctx.lineTo(dest.x, dest.y)
          ctx.stroke()
        }
        break
      }
      case 'cilindro':
      case 'esfera': {
        const raioPixel = (med.tamanho / 1.5) * gridSize * zoom
        ctx.beginPath()
        ctx.arc(origin.x, origin.y, raioPixel, 0, Math.PI * 2)
        ctx.stroke()
        break
      }
      case 'cone': {
        if (med.destino) {
          const cellsCone = calcularCelulasNoConе(med.origem, med.destino, med.tamanho)
          ctx.fillStyle = 'rgba(251, 191, 36, 0.1)'
          for (const cell of cellsCone) {
            const pixelCell = posicaoParaPixel(cell, gridSize, zoom, pan)
            ctx.fillRect(pixelCell.x, pixelCell.y, gridSize * zoom, gridSize * zoom)
          }
        }
        break
      }
    }

    ctx.setLineDash([])
  }
}

function desenharMedicaoTemporaria(
  ctx: CanvasRenderingContext2D,
  posicao: Position,
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number }
) {
  const pixelPos = posicaoParaPixel(posicao, gridSize, zoom, pan)
  ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'
  ctx.fillRect(pixelPos.x, pixelPos.y, gridSize * zoom, gridSize * zoom)
}

function desenharCamadaMestre(
  ctx: CanvasRenderingContext2D,
  tokens: Token[],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number }
) {
  // Mostrar tokens invisíveis com transparência
  const tokensInvisiveis = tokens.filter((t) => !t.visivel)

  for (const token of tokensInvisiveis) {
    const pixelPos = posicaoParaPixel(token.posicao, gridSize, zoom, pan)
    const tamanhoPixel = token.tamanho * gridSize * zoom

    ctx.fillStyle = token.cor + '4d' // 30% opacidade
    ctx.beginPath()
    ctx.arc(pixelPos.x + tamanhoPixel / 2, pixelPos.y + tamanhoPixel / 2, tamanhoPixel / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function desenharCoordenadas(
  ctx: CanvasRenderingContext2D,
  grid: GridCell[][],
  gridSize: number,
  zoom: number,
  pan: { x: number; y: number },
  width: number,
  height: number
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '10px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cellSizeZoomed = gridSize * zoom
  const startX = Math.max(0, Math.floor(-pan.x / cellSizeZoomed))
  const endX = Math.min(grid[0].length, Math.ceil((width - pan.x) / cellSizeZoomed) + 1)
  const startY = Math.max(0, Math.floor(-pan.y / cellSizeZoomed))
  const endY = Math.min(grid.length, Math.ceil((height - pan.y) / cellSizeZoomed) + 1)

  for (let x = startX; x < endX; x += 5) {
    const pixelX = x * cellSizeZoomed + pan.x + cellSizeZoomed / 2
    ctx.fillText(String(x), pixelX, 15)
  }

  for (let y = startY; y < endY; y += 5) {
    const pixelY = y * cellSizeZoomed + pan.y + cellSizeZoomed / 2
    ctx.fillText(String(y), 15, pixelY)
  }
}
