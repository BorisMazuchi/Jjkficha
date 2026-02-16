import { useState, useCallback, useMemo, useEffect } from "react"
import { GridCanvas } from "@/components/vtt/GridCanvas"
import { InitiativeGrid } from "@/components/vtt/InitiativeGrid"
import {
  ToolbarVTT,
  ZoomControls,
  LayerControls,
  TokenInfo,
} from "@/components/vtt/VTTControls"
import type {
  Token,
  GridCell,
  Measurement,
  Position,
  Ferramenta,
} from "@/types/vtt"
import type { InitiativeEntry } from "@/types/mestre"
import { criarGridVazio } from "@/lib/vttUtils"
import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"

const TOKENS_INICIAIS: Token[] = [
  {
    id: "1",
    nome: "Yuuji",
    tipo: "jogador",
    posicao: { x: 5, y: 5 },
    tamanho: 1,
    cor: "#06b6d4",
    visivel: true,
    pv: { atual: 45, max: 50 },
    pe: { atual: 30, max: 40 },
    condicoes: [],
  },
  {
    id: "2",
    nome: "Sukuna",
    tipo: "maldicao",
    posicao: { x: 15, y: 15 },
    tamanho: 2,
    cor: "#e94560",
    visivel: true,
    pv: { atual: 80, max: 100 },
    condicoes: ["Queimando"],
  },
]

interface TabuleiroContentProps {
  /** Quando true, layout compacto para embed no grid da Tela do Mestre */
  embedded?: boolean
  /** Quando embedded: entradas do rastreador de iniciativa (grid mostra só esses personagens) */
  entradas?: InitiativeEntry[]
  /** Índice do turno ativo (círculo destacado) */
  turnoAtual?: number
  /** Callback ao mover uma entrada no grid */
  onMoveEntry?: (id: string, pos: { x: number; y: number }) => void
  /** Callback ao clicar em uma entrada (opcional: definir como turno ativo) */
  onSelectTurn?: (index: number) => void
  className?: string
}

export function TabuleiroContent({
  embedded = false,
  entradas = [],
  turnoAtual = 0,
  onMoveEntry,
  onSelectTurn,
  className,
}: TabuleiroContentProps) {
  const [tokens, setTokens] = useState<Token[]>(TOKENS_INICIAIS)
  const [grid, setGrid] = useState<GridCell[][]>(criarGridVazio(30, 30))
  const [medicoes, setMedicoes] = useState<Measurement[]>([])
  const [zoom, setZoom] = useState(1)
  const [ferramenta, setFerramenta] = useState<Ferramenta>("select")
  const [tokenSelecionado, setTokenSelecionado] = useState<string | null>(null)
  const [ehMestre] = useState(true)
  const [mostrarCoord, setMostrarCoord] = useState(false)
  const [mostrarGrid, setMostrarGrid] = useState(true)
  const [pan] = useState({ x: 0, y: 0 })
  const [camadas, setCamadas] = useState({
    mapa: true,
    medicoes: true,
    tokens: true,
    mestre: false,
  })

  const handleTokenMove = useCallback((tokenId: string, newPos: Position) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, posicao: newPos } : t))
    )
  }, [])

  const handleTokenSelect = useCallback((tokenId: string | null) => {
    setTokenSelecionado(tokenId)
  }, [])

  const handleMedicaoCreate = useCallback((medicao: Omit<Measurement, "id">) => {
    const novaId = Math.random().toString(36)
    setMedicoes((prev) => [...prev, { ...medicao, id: novaId }])
    setTimeout(() => {
      setMedicoes((prev) => prev.filter((m) => m.id !== novaId))
    }, 5000)
  }, [])

  const handleCellToggle = useCallback(
    (x: number, y: number, acao: "revelar" | "esconder") => {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        const cell = newGrid[y][x]
        if (acao === "revelar") {
          cell.visivel = true
          cell.reveladoPermanente = true
        } else {
          cell.visivel = false
        }
        return newGrid
      })
    },
    []
  )

  const handleDeletarToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
    setTokenSelecionado(null)
  }, [])

  const handleAplicarDano = useCallback((tokenId: string, dano: number) => {
    setTokens((prev) =>
      prev.map((t) => {
        if (t.id === tokenId && t.pv) {
          return {
            ...t,
            pv: { ...t.pv, atual: Math.max(0, t.pv.atual - dano) },
          }
        }
        return t
      })
    )
  }, [])

  const tokenAtivo = useMemo(
    () => tokens.find((t) => t.id === tokenSelecionado),
    [tokens, tokenSelecionado]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && tokenSelecionado) {
        handleDeletarToken(tokenSelecionado)
      }
      if (e.key === "Escape") setTokenSelecionado(null)
      if (e.key === "r" || e.key === "R") setFerramenta("regua")
      if (e.key === "c" || e.key === "C") setFerramenta("cone")
      if (e.key === "g" || e.key === "G") setMostrarGrid((g) => !g)
      if (e.key === "o" || e.key === "O") setMostrarCoord((c) => !c)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [tokenSelecionado, handleDeletarToken])

  const canvasArea = (
    <>
      <GridCanvas
        tokens={tokens}
        grid={grid}
        medicoes={medicoes}
        zoom={zoom}
        pan={pan}
        camadas={camadas}
        ferramenta={ferramenta}
        tokenSelecionado={tokenSelecionado}
        gridSize={40}
        ehMestre={ehMestre}
        mostrarCoord={mostrarCoord}
        mostrarGrid={mostrarGrid}
        onTokenMove={handleTokenMove}
        onTokenSelect={handleTokenSelect}
        onMedicaoCreate={handleMedicaoCreate}
        onCellToggle={handleCellToggle}
      />
      <div className="absolute bottom-2 right-2">
        <ZoomControls zoom={zoom} onZoomChange={setZoom} />
      </div>
      {!embedded && (
        <div className="absolute top-4 left-4 rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-xs text-slate-300 max-w-[180px] space-y-1">
          <div className="mb-2 font-medium text-slate-100">Atalhos</div>
          <div><span className="font-mono text-[#8832ff]">R</span> Régua</div>
          <div><span className="font-mono text-[#8832ff]">C</span> Cone</div>
          <div><span className="font-mono text-[#8832ff]">G</span> Grid</div>
          <div><span className="font-mono text-[#8832ff]">O</span> Coord</div>
          <div><span className="font-mono text-[#8832ff]">Del</span> Remover</div>
          <div><span className="font-mono text-[#8832ff]">Esc</span> Deselecionar</div>
        </div>
      )}
    </>
  )

  if (embedded) {
    const usaIniciativa =
      Array.isArray(entradas) &&
      entradas.length >= 0 &&
      typeof onMoveEntry === "function"

    return (
      <div
        className={cn(
          "flex flex-col rounded-xl border border-slate-700/80 bg-slate-900/80 overflow-hidden",
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700/80 bg-slate-800/60 px-3 py-2">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
            <LayoutGrid className="h-4 w-4" />
            Rastreador de Iniciativa
          </h3>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="relative min-h-[320px] flex-1 overflow-hidden">
            {usaIniciativa ? (
              <InitiativeGrid
                entradas={entradas}
                turnoAtual={turnoAtual}
                onMoveEntry={onMoveEntry}
                onSelectTurn={onSelectTurn}
                className="h-full"
              />
            ) : (
              <>
                {canvasArea}
                <div className="absolute bottom-2 right-2">
                  <ZoomControls zoom={zoom} onZoomChange={setZoom} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0a0e14]">
      <ToolbarVTT
        ferramentaAtiva={ferramenta}
        onFerramentaChange={setFerramenta}
      />
      <div className="relative flex-1 overflow-hidden">
        {canvasArea}
      </div>
      <div className="w-80 space-y-4 border-l border-slate-700 bg-slate-900 overflow-y-auto p-4">
        <TokenInfo token={tokenAtivo} />
        {tokenAtivo && (
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
            <h3 className="text-sm font-medium text-slate-100">Ações</h3>
            {tokenAtivo.pv && (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Aplicar Dano</label>
                <div className="flex gap-2">
                  {[5, 10, 20].map((dano) => (
                    <button
                      key={dano}
                      type="button"
                      onClick={() => handleAplicarDano(tokenAtivo.id, dano)}
                      className="flex-1 rounded bg-[#e94560]/20 px-2 py-1 text-xs text-[#e94560] hover:bg-[#e94560]/30"
                    >
                      -{dano}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDeletarToken(tokenAtivo.id)}
              className="w-full rounded bg-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/30"
            >
              Deletar Token
            </button>
          </div>
        )}
        <LayerControls
          camadas={camadas}
          camadaAtiva="tokens"
          ehMestre={ehMestre}
          onToggleLayer={(camada) =>
            setCamadas((prev) => ({
              ...prev,
              [camada]: !prev[camada as keyof typeof camadas],
            }))
          }
          onSelectLayer={() => {}}
        />
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-100">Estatísticas</h3>
          <div className="space-y-1 text-xs text-slate-400">
            <div>Tokens: {tokens.length}</div>
            <div>Zoom: {Math.round(zoom * 100)}%</div>
            <div>Grid: {grid.length}x{grid[0]?.length || 0}</div>
            <div>Selecionado: {tokenAtivo?.nome || "-"}</div>
          </div>
        </div>
        {ehMestre && (
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-800 p-4 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setMostrarGrid((g) => !g)}
              className="w-full rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
            >
              {mostrarGrid ? "Esconder" : "Mostrar"} Grid
            </button>
            <button
              type="button"
              onClick={() => setMostrarCoord((c) => !c)}
              className="w-full rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
            >
              {mostrarCoord ? "Esconder" : "Mostrar"} Coord
            </button>
            <button
              type="button"
              onClick={() => setCamadas((p) => ({ ...p, mestre: !p.mestre }))}
              className="w-full rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
            >
              {camadas.mestre ? "Esconder" : "Mostrar"} Mestre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
