import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Recursos } from "@/types/ficha"

interface RecursosBarraProps {
  recursos: Recursos
  onChange: (recursos: Partial<Recursos>) => void
  /** Se false, não exibe o bloco Integridade da Alma (ex.: quando já existe XPIntegridade na página) */
  mostrarIntegridade?: boolean
}

/**
 * Regra v2.5: Vida/Energia Temporária que excede metade do máximo
 * deve ser sinalizado visualmente.
 */
function BarraRecurso({
  label,
  atual,
  max,
  temporario,
  onAtualChange,
  onMaxChange,
  cor,
}: {
  label: string
  atual: number
  max: number
  temporario: number
  onAtualChange: (v: number) => void
  onMaxChange: (v: number) => void
  cor: "pv" | "pe"
}) {
  const totalEfetivo = atual + temporario
  const metadeMax = max / 2
  const excedeMetade = temporario > metadeMax

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={atual}
            onChange={(e) => onAtualChange(parseInt(e.target.value) || 0)}
            className="h-8 w-14 text-center"
          />
          <span className="text-slate-400">/</span>
          <Input
            type="number"
            min={1}
            value={max}
            onChange={(e) => onMaxChange(parseInt(e.target.value) || 1)}
            className="h-8 w-14 text-center"
          />
          {temporario > 0 && (
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium",
                excedeMetade
                  ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                  : "bg-slate-700 text-slate-300"
              )}
              title={
                excedeMetade
                  ? "⚠️ Regra v2.5: Temporário excede metade do máximo!"
                  : `+${temporario} temporário`
              }
            >
              +{temporario} temp
            </span>
          )}
        </div>
      </div>
      <Progress
        value={max > 0 ? Math.min((totalEfetivo / max) * 100, 100) : 0}
        variant={totalEfetivo <= 0 ? "danger" : excedeMetade ? "warning" : "default"}
        className={cn(
          cor === "pv" && " [&>div]:bg-[#e94560]",
          cor === "pe" && " [&>div]:bg-[#8832ff]"
        )}
      />
    </div>
  )
}

export function RecursosBarra({ recursos, onChange, mostrarIntegridade = true }: RecursosBarraProps) {
  const integridadeMax = recursos.pvMax
  const integridadeAtual = recursos.integridadeAtual ?? recursos.pvMax

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos (Barra de Status)</CardTitle>
        <p className="text-xs text-slate-400">Livro v2.5 — PE ou Estamina (Restringido)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <BarraRecurso
          label="Pontos de Vida (PV)"
          atual={recursos.pvAtual}
          max={recursos.pvMax}
          temporario={recursos.vidaTemporaria}
          onAtualChange={(v) => onChange({ pvAtual: v })}
          onMaxChange={(v) => onChange({ pvMax: v })}
          cor="pv"
        />
        <BarraRecurso
          label="Pontos de Energia (PE)"
          atual={recursos.peAtual}
          max={recursos.peMax}
          temporario={recursos.energiaTemporaria}
          onAtualChange={(v) => onChange({ peAtual: v })}
          onMaxChange={(v) => onChange({ peMax: v })}
          cor="pe"
        />

        {mostrarIntegridade && (
          <div className="space-y-2 rounded-lg border border-[#8832ff]/30 bg-[#8832ff]/5 p-3">
            <Label className="text-[#8832ff]/90">Integridade da Alma (v2.5)</Label>
            <p className="text-xs text-slate-400 mb-2">
              Máximo = PV Máximo. Rastreamento separado; dano à alma afeta este valor.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={integridadeMax}
                value={integridadeAtual}
                onChange={(e) =>
                  onChange({
                    integridadeAtual: Math.min(
                      parseInt(e.target.value) || 0,
                      integridadeMax
                    ),
                  })
                }
                className="h-10 w-20 text-center"
              />
              <span className="text-slate-400">/</span>
              <span className="w-16 text-center font-medium">{integridadeMax}</span>
            </div>
            <Progress
              value={integridadeMax > 0 ? (integridadeAtual / integridadeMax) * 100 : 0}
              variant={integridadeAtual <= integridadeMax * 0.25 ? "danger" : "default"}
              className="h-2 [&>div]:bg-[#8832ff]"
            />
          </div>
        )}
        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Label className="text-amber-400/90">Regra v2.5 - Temporários</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="vidaTemp" className="text-sm">Vida temp:</Label>
              <Input
                id="vidaTemp"
                type="number"
                min={0}
                value={recursos.vidaTemporaria}
                onChange={(e) =>
                  onChange({
                    vidaTemporaria: parseInt(e.target.value) || 0,
                  })
                }
                className="h-8 w-16"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="energiaTemp" className="text-sm">Energia temp:</Label>
              <Input
                id="energiaTemp"
                type="number"
                min={0}
                value={recursos.energiaTemporaria}
                onChange={(e) =>
                  onChange({
                    energiaTemporaria: parseInt(e.target.value) || 0,
                  })
                }
                className="h-8 w-16"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Se o valor temporário exceder metade do máximo, será destacado em
            amarelo como aviso.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
