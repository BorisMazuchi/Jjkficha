import { useState, useCallback, useMemo, useEffect } from 'react'
import { GridCanvas } from '@/components/vtt/GridCanvas'
import { ToolbarVTT, ZoomControls, LayerControls, TokenInfo } from '@/components/vtt/VTTControls'
import type { Token, GridCell, Measurement, Position, Ferramenta } from '@/types/vtt'
import { criarGridVazio } from '@/lib/vttUtils'

export function TabuleiroCombate() {
  // Estado do tabuleiro
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: '1',
      nome: 'Yuuji',
      tipo: 'jogador',
      posicao: { x: 5, y: 5 },
      tamanho: 1,
      cor: '#06b6d4',
      visivel: true,
      pv: { atual: 45, max: 50 },
      pe: { atual: 30, max: 40 },
      condicoes: [],
    },
    {
      id: '2',
      nome: 'Sukuna',
      tipo: 'maldicao',
      posicao: { x: 15, y: 15 },
      tamanho: 2,
      cor: '#e94560',
      visivel: true,
      pv: { atual: 80, max: 100 },
      condicoes: ['Queimando'],
    },
  ])

  const [grid, setGrid] = useState<GridCell[][]>(criarGridVazio(30, 30))
  const [medicoes, setMedicoes] = useState<Measurement[]>([])
  const [zoom, setZoom] = useState(1)
  const [ferramenta, setFerramenta] = useState<Ferramenta>('select')
  const [tokenSelecionado, setTokenSelecionado] = useState<string | null>(null)
  const [ehMestre] = useState(true) // TODO: pegar do contexto
  const [mostrarCoord, setMostrarCoord] = useState(false)
  const [mostrarGrid, setMostrarGrid] = useState(true)
  const [pan] = useState({ x: 0, y: 0 })

  const [camadas, setCamadas] = useState({
    mapa: true,
    medicoes: true,
    tokens: true,
    mestre: false,
  })

  // Callbacks
  const handleTokenMove = useCallback((tokenId: string, newPos: Position) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, posicao: newPos } : t))
    )
  }, [])

  const handleTokenSelect = useCallback((tokenId: string | null) => {
    setTokenSelecionado(tokenId)
  }, [])

  const handleMedicaoCreate = useCallback((medicao: Omit<Measurement, 'id'>) => {
    const novaId = Math.random().toString(36)
    setMedicoes((prev) => [
      ...prev,
      {
        ...medicao,
        id: novaId,
      },
    ])

    // Remover medição após 5 segundos
    setTimeout(() => {
      setMedicoes((prev) => prev.filter((m) => m.id !== novaId))
    }, 5000)
  }, [])

  const handleCellToggle = useCallback(
    (x: number, y: number, acao: 'revelar' | 'esconder') => {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        const cell = newGrid[y][x]

        if (acao === 'revelar') {
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
            pv: {
              ...t.pv,
              atual: Math.max(0, t.pv.atual - dano),
            },
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

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && tokenSelecionado) {
        handleDeletarToken(tokenSelecionado)
      }
      if (e.key === 'Escape') {
        setTokenSelecionado(null)
      }
      if (e.key === 'r' || e.key === 'R') {
        setFerramenta('regua')
      }
      if (e.key === 'c' || e.key === 'C') {
        setFerramenta('cone')
      }
      if (e.key === 'g' || e.key === 'G') {
        setMostrarGrid(!mostrarGrid)
      }
      if (e.key === 'o' || e.key === 'O') {
        setMostrarCoord(!mostrarCoord)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tokenSelecionado, mostrarGrid, mostrarCoord, handleDeletarToken])

  return (
    <div className="flex h-screen bg-[#0a0e14]">
      {/* Sidebar Esquerda - Ferramentas */}
      <ToolbarVTT
        ferramentaAtiva={ferramenta}
        onFerramentaChange={setFerramenta}
      />

      {/* Canvas Principal */}
      <div className="flex-1 relative overflow-hidden">
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

        {/* Controles de Zoom - Canto inferior direito */}
        <div className="absolute bottom-4 right-4">
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Atalhos visuais - Canto superior esquerdo */}
        <div className="absolute top-4 left-4 bg-slate-800/80 rounded-lg border border-slate-700 p-2 text-xs text-slate-300 space-y-1 max-w-[180px]">
          <div className="font-medium text-slate-100 mb-2">Atalhos</div>
          <div>
            <span className="font-mono text-[#8832ff]">R</span> - Régua
          </div>
          <div>
            <span className="font-mono text-[#8832ff]">C</span> - Cone
          </div>
          <div>
            <span className="font-mono text-[#8832ff]">G</span> - Grid
          </div>
          <div>
            <span className="font-mono text-[#8832ff]">O</span> - Coord
          </div>
          <div>
            <span className="font-mono text-[#8832ff]">Del</span> - Remover token
          </div>
          <div>
            <span className="font-mono text-[#8832ff]">Esc</span> - Deselecionar
          </div>
        </div>
      </div>

      {/* Sidebar Direita - Informações */}
      <div className="w-80 border-l border-slate-700 bg-slate-900 overflow-y-auto p-4 space-y-4">
        {/* Token Info */}
        <TokenInfo token={tokenAtivo} />

        {/* Token Actions */}
        {tokenAtivo && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-100">Ações</h3>

            {tokenAtivo.pv && (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Aplicar Dano</label>
                <div className="flex gap-2">
                  {[5, 10, 20].map((dano) => (
                    <button
                      key={dano}
                      onClick={() => handleAplicarDano(tokenAtivo.id, dano)}
                      className="flex-1 px-2 py-1 text-xs rounded bg-[#e94560]/20 text-[#e94560] hover:bg-[#e94560]/30"
                    >
                      -{dano}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => handleDeletarToken(tokenAtivo.id)}
              className="w-full px-3 py-2 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              Deletar Token
            </button>
          </div>
        )}

        {/* Layer Controls */}
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

        {/* Quick Stats */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-100 mb-2">Estatísticas</h3>
          <div className="text-xs space-y-1 text-slate-400">
            <div>Tokens: {tokens.length}</div>
            <div>Zoom: {Math.round(zoom * 100)}%</div>
            <div>Grid: {grid.length}x{grid[0]?.length || 0}</div>
            <div>Selecionado: {tokenAtivo?.nome || '-'}</div>
          </div>
        </div>

        {/* Debug Info */}
        {ehMestre && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-xs space-y-2 text-slate-400">
            <button
              onClick={() => setMostrarGrid(!mostrarGrid)}
              className="w-full px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
            >
              {mostrarGrid ? 'Esconder' : 'Mostrar'} Grid
            </button>
            <button
              onClick={() => setMostrarCoord(!mostrarCoord)}
              className="w-full px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
            >
              {mostrarCoord ? 'Esconder' : 'Mostrar'} Coord
            </button>
            <button
              onClick={() =>
                setCamadas((p) => ({ ...p, mestre: !p.mestre }))
              }
              className="w-full px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
            >
              {camadas.mestre ? 'Esconder' : 'Mostrar'} Mestre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
