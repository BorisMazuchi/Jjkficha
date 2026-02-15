import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Hand, 
  Ruler, 
  Triangle, 
  Minus, 
  Circle, 
  Square, 
  Eye, 
  EyeOff, 
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import type { Ferramenta } from '@/types/vtt'
import { cn } from '@/lib/utils'

interface ToolbarVTTProps {
  ferramentaAtiva: Ferramenta
  onFerramentaChange: (ferramenta: Ferramenta) => void
}

export function ToolbarVTT({ ferramentaAtiva, onFerramentaChange }: ToolbarVTTProps) {
  const tools = [
    { id: 'select' as Ferramenta, icon: Hand, label: 'Selecionar', hotkey: 'V' },
    { id: 'regua' as Ferramenta, icon: Ruler, label: 'Régua', hotkey: 'R' },
    { id: 'cone' as Ferramenta, icon: Triangle, label: 'Cone', hotkey: 'C' },
    { id: 'linha' as Ferramenta, icon: Minus, label: 'Linha', hotkey: 'L' },
    { id: 'cilindro' as Ferramenta, icon: Circle, label: 'Cilindro', hotkey: 'O' },
    { id: 'cubo' as Ferramenta, icon: Square, label: 'Cubo', hotkey: 'U' },
    { id: 'revelar' as Ferramenta, icon: Eye, label: 'Revelar', hotkey: 'E' },
    { id: 'esconder' as Ferramenta, icon: EyeOff, label: 'Esconder', hotkey: 'H' },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-start gap-2 py-4 bg-slate-900 border-r border-slate-700">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.id}
            onClick={() => onFerramentaChange(tool.id)}
            className={cn(
              'p-2 rounded transition-colors',
              ferramentaAtiva === tool.id
                ? 'bg-[#8832ff] text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
            title={`${tool.label} (${tool.hotkey})`}
          >
            <Icon className="h-5 w-5" />
          </button>
        )
      })}

      <div className="flex-1" />

      <button
        onClick={() => onFerramentaChange('revelar')}
        className="p-2 rounded text-slate-300 hover:bg-slate-700 text-xs"
        title="Recarregar"
      >
        ⟳
      </button>
    </div>
  )
}

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg border border-slate-700 p-2">
      <button
        onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
        className="p-1 rounded hover:bg-slate-700 text-slate-300"
        title="Zoom Out (–)"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span className="text-sm text-slate-300 min-w-[40px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
        className="p-1 rounded hover:bg-slate-700 text-slate-300"
        title="Zoom In (+)"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <button
        onClick={() => onZoomChange(1)}
        className="px-2 py-1 text-xs rounded hover:bg-slate-700 text-slate-300"
        title="Reset (1.0x)"
      >
        1x
      </button>
    </div>
  )
}

interface LayerControlsProps {
  camadas: {
    mapa: boolean
    medicoes: boolean
    tokens: boolean
    mestre: boolean
  }
  camadaAtiva: string
  ehMestre: boolean
  onToggleLayer: (camada: string) => void
  onSelectLayer: (camada: string) => void
}

export function LayerControls({
  camadas,
  camadaAtiva,
  ehMestre,
  onToggleLayer,
  onSelectLayer,
}: LayerControlsProps) {
  const layers = [
    { id: 'mapa', label: 'Mapa' },
    { id: 'medicoes', label: 'Medições' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'mestre', label: 'Mestre', mestresOnly: true },
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-slate-100">
        <Layers className="h-4 w-4" />
        Camadas
      </h3>

      <div className="space-y-2">
        {layers.map((layer) => {
          if (layer.mestresOnly && !ehMestre) return null

          const isVisible = camadas[layer.id as keyof typeof camadas]

          return (
            <div key={layer.id} className="flex items-center gap-2">
              <button
                onClick={() => onToggleLayer(layer.id)}
                className={cn(
                  'flex-1 text-left text-sm px-2 py-1 rounded transition-colors',
                  isVisible
                    ? 'bg-[#8832ff]/20 text-[#8832ff]'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {layer.label}
              </button>
              <button
                onClick={() => onSelectLayer(layer.id)}
                className={cn(
                  'p-1 rounded text-xs',
                  camadaAtiva === layer.id
                    ? 'bg-[#8832ff] text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                )}
              >
                👁️
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TokenInfoProps {
  token?: {
    id: string
    nome: string
    tipo: string
    pv?: { atual: number; max: number }
    pe?: { atual: number; max: number }
    condicoes: string[]
  } | null
}

export function TokenInfo({ token }: TokenInfoProps) {
  if (!token) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <p className="text-sm text-slate-400 text-center">Nenhum token selecionado</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium text-slate-100">{token.nome}</h3>
        <p className="text-xs text-slate-400 capitalize">{token.tipo}</p>
      </div>

      {token.pv && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">PV</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${(token.pv.atual / token.pv.max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-300">
            {token.pv.atual} / {token.pv.max}
          </p>
        </div>
      )}

      {token.pe && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">PE</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(token.pe.atual / token.pe.max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-300">
            {token.pe.atual} / {token.pe.max}
          </p>
        </div>
      )}

      {token.condicoes.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Condições</div>
          <div className="flex flex-wrap gap-1">
            {token.condicoes.map((cond) => (
              <span key={cond} className="text-xs bg-[#8832ff]/20 text-[#8832ff] px-2 py-1 rounded">
                {cond}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
