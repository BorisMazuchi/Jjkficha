import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Recursos } from "@/types/ficha"

interface RecursosBarraProps {
  recursos: Recursos
  onChange: (recursos: Partial<Recursos>) => void
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
  onTemporarioChange,
  cor,
}: {
  label: string
  atual: number
  max: number
  temporario: number
  onAtualChange: (v: number) => void
  onMaxChange: (v: number) => void
  onTemporarioChange: (v: number) => void
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

export function RecursosBarra({ recursos, onChange }: RecursosBarraProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos (Barra de Status)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BarraRecurso
          label="Pontos de Vida (PV)"
          atual={recursos.pvAtual}
          max={recursos.pvMax}
          temporario={recursos.vidaTemporaria}
          onAtualChange={(v) => onChange({ pvAtual: v })}
          onMaxChange={(v) => onChange({ pvMax: v })}
          onTemporarioChange={(v) => onChange({ vidaTemporaria: v })}
          cor="pv"
        />
        <BarraRecurso
          label="Pontos de Energia (PE)"
          atual={recursos.peAtual}
          max={recursos.peMax}
          temporario={recursos.energiaTemporaria}
          onAtualChange={(v) => onChange({ peAtual: v })}
          onMaxChange={(v) => onChange({ peMax: v })}
          onTemporarioChange={(v) => onChange({ energiaTemporaria: v })}
          cor="pe"
        />
        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Label className="text-amber-400/90">Regra v2.5 - Temporários</Label>
          <p className="text-xs text-slate-400">
            Se o valor temporário exceder metade do máximo, será destacado em
            amarelo como aviso.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
