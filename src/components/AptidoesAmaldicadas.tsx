import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { AptidoesAmaldicadas, AptidaoAmaldicada } from "@/types/ficha"
import { cn } from "@/lib/utils"

const APTIDOES: AptidaoAmaldicada[] = ["Aura", "Controle", "Fluxo", "Potência"]

interface AptidoesAmaldicadasProps {
  aptidoes: AptidoesAmaldicadas
  onChange: (aptidoes: Partial<AptidoesAmaldicadas>) => void
}

function SliderNivel({
  valor,
  onChange,
  nome,
}: {
  valor: number
  onChange: (v: number) => void
  nome: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="min-w-[90px] text-sm">{nome}</Label>
      <div className="flex flex-1 items-center gap-2">
        <input
          type="range"
          min={0}
          max={5}
          value={valor}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1a1a2e] accent-[#8832ff]"
        />
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md font-bold",
            valor >= 4 ? "bg-[#8832ff] text-white" : "bg-[#2a2a4a] text-slate-300"
          )}
        >
          {valor}
        </span>
      </div>
    </div>
  )
}

export function AptidoesAmaldicadasComponent({
  aptidoes,
  onChange,
}: AptidoesAmaldicadasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aptidões Amaldiçadas</CardTitle>
        <p className="text-xs text-slate-400">Níveis 0 a 5</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {APTIDOES.map((apt) => (
          <SliderNivel
            key={apt}
            nome={apt}
            valor={aptidoes[apt]}
            onChange={(v) => onChange({ [apt]: v })}
          />
        ))}
      </CardContent>
    </Card>
  )
}
