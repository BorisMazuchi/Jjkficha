import React, { useRef, useEffect, useCallback, useState } from "react"
import type { InitiativeEntry } from "@/types/mestre"
import { posicaoParaPixel, pixelParaPosicao } from "@/lib/vttUtils"
import { cn } from "@/lib/utils"

const GRID_CELL = 40
const GRID_COLS = 24
const GRID_ROWS = 18
const RADIUS_MIN = 14
const RADIUS_MAX = 28
const DEFAULT_SPACING = 4

interface InitiativeGridProps {
  entradas: InitiativeEntry[]
  turnoAtual: number
  onMoveEntry: (id: string, pos: { x: number; y: number }) => void
  onSelectTurn?: (index: number) => void
  className?: string
}

function posicaoPadrao(index: number): { x: number; y: number } {
  const row = Math.floor(index / 6)
  const col = index % 6
  return { x: 2 + col * DEFAULT_SPACING, y: 3 + row * 4 }
}

export function InitiativeGrid({
  entradas,
  turnoAtual,
  onMoveEntry,
  onSelectTurn,
  className,
}: InitiativeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [offsetArrastagem, setOffsetArrastagem] = useState({ x: 0, y: 0 })
  const [imagensCarregadas, setImagensCarregadas] = useState<Record<string, HTMLImageElement>>({})

  const carregarImagens = useCallback((lista: InitiativeEntry[]) => {
    const urls = lista.map((e) => e.imagemUrl).filter(Boolean) as string[]
    urls.forEach((url) => {
      if (imagensCarregadas[url]) return
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setImagensCarregadas((prev) => ({ ...prev, [url]: img }))
      }
      img.src = url
    })
  }, [])

  useEffect(() => {
    carregarImagens(entradas)
  }, [entradas, carregarImagens])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const w = canvas.width
    const h = canvas.height
    const cellZoom = GRID_CELL * zoom

    ctx.fillStyle = "#0a0e14"
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = "rgba(136, 50, 255, 0.25)"
    ctx.lineWidth = 1
    const startX = Math.floor(-pan.x / cellZoom)
    const endX = Math.ceil((w - pan.x) / cellZoom)
    const startY = Math.floor(-pan.y / cellZoom)
    const endY = Math.ceil((h - pan.y) / cellZoom)
    for (let x = startX; x <= endX; x++) {
      const px = x * cellZoom + pan.x
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, h)
      ctx.stroke()
    }
    for (let y = startY; y <= endY; y++) {
      const py = y * cellZoom + pan.y
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(w, py)
      ctx.stroke()
    }

    entradas.forEach((e, index) => {
      const pos = e.posicao ?? posicaoPadrao(index)
      const pixel = posicaoParaPixel(
        { x: pos.x + 0.5, y: pos.y + 0.5 },
        GRID_CELL,
        zoom,
        pan
      )
      const pvMax = e.pvMax ?? 1
      const pvAtual = Math.max(0, e.pvAtual ?? pvMax)
      const ratio = pvMax > 0 ? pvAtual / pvMax : 1
      const radius = RADIUS_MIN + ratio * (RADIUS_MAX - RADIUS_MIN)
      const radiusZoomed = radius * zoom
      const isActive = index === turnoAtual

      if (isActive) {
        ctx.strokeStyle = "#06b6d4"
        ctx.lineWidth = 4
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(pixel.x, pixel.y, radiusZoomed + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      const cor =
        e.tipo === "jogador" ? "#06b6d4" : "#e94560"
      ctx.fillStyle = cor
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.arc(pixel.x, pixel.y, radiusZoomed, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = cor
      ctx.lineWidth = 2
      ctx.stroke()

      const img = e.imagemUrl ? imagensCarregadas[e.imagemUrl] : null
      if (img && img.complete && img.naturalWidth) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(pixel.x, pixel.y, radiusZoomed - 2, 0, Math.PI * 2)
        ctx.clip()
        const d = (radiusZoomed - 2) * 2
        ctx.drawImage(img, pixel.x - d / 2, pixel.y - d / 2, d, d)
        ctx.restore()
      } else {
        const letra = (e.nome || "?").trim()[0]?.toUpperCase() || "?"
        ctx.fillStyle = "#fff"
        ctx.font = `bold ${Math.max(12, Math.floor(radiusZoomed))}px system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(letra, pixel.x, pixel.y)
      }
    })
  }, [entradas, turnoAtual, zoom, pan, imagensCarregadas])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    render()
  }, [render])

  const getEntryAtPixel = useCallback(
    (pixel: { x: number; y: number }) => {
      const cellZoom = GRID_CELL * zoom
      for (let i = entradas.length - 1; i >= 0; i--) {
        const e = entradas[i]
        const pos = e.posicao ?? posicaoPadrao(i)
        const center = posicaoParaPixel(
          { x: pos.x + 0.5, y: pos.y + 0.5 },
          GRID_CELL,
          zoom,
          pan
        )
        const pvMax = e.pvMax ?? 1
        const pvAtual = Math.max(0, e.pvAtual ?? pvMax)
        const ratio = pvMax > 0 ? pvAtual / pvMax : 1
        const r = (RADIUS_MIN + ratio * (RADIUS_MAX - RADIUS_MIN)) * zoom
        const dx = pixel.x - center.x
        const dy = pixel.y - center.y
        if (dx * dx + dy * dy <= r * r) return { index: i, entry: e }
      }
      return null
    },
    [entradas, zoom, pan]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const pixel = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    const hit = getEntryAtPixel(pixel)
    if (hit) {
      if (onSelectTurn) onSelectTurn(hit.index)
      const pos = hit.entry.posicao ?? posicaoPadrao(hit.index)
      setArrastando(hit.entry.id)
      setOffsetArrastagem({
        x: (pixel.x - pan.x) / (GRID_CELL * zoom) - pos.x - 0.5,
        y: (pixel.y - pan.y) / (GRID_CELL * zoom) - pos.y - 0.5,
      })
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !arrastando) return
    const rect = canvas.getBoundingClientRect()
    const pixel = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    const gridPos = pixelParaPosicao(pixel, GRID_CELL, zoom, pan)
    const x = Math.round(gridPos.x - 0.5 - offsetArrastagem.x)
    const y = Math.round(gridPos.y - 0.5 - offsetArrastagem.y)
    const clampedX = Math.max(0, Math.min(GRID_COLS - 1, x))
    const clampedY = Math.max(0, Math.min(GRID_ROWS - 1, y))
    onMoveEntry(arrastando, { x: clampedX, y: clampedY })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setArrastando(null)
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-lg", className)}>
      <div ref={containerRef} className="relative flex-1 min-h-[280px]">
        <canvas
          ref={canvasRef}
          className="block w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={arrastando ? handlePointerMove : undefined}
          onPointerUp={handlePointerUp}
          onPointerLeave={arrastando ? handlePointerUp : undefined}
        />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-700/80 bg-slate-800/60 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          +
        </button>
        <span className="text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
          className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          −
        </button>
      </div>
    </div>
  )
}
