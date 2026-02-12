import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Atributos } from "@/types/ficha"

const ATRIBUTOS = [
  { key: "forca", label: "Força", short: "FOR" },
  { key: "destreza", label: "Destreza", short: "DES" },
  { key: "constituicao", label: "Constituição", short: "CON" },
  { key: "inteligencia", label: "Inteligência", short: "INT" },
  { key: "sabedoria", label: "Sabedoria", short: "SAB" },
  { key: "carisma", label: "Carisma", short: "CAR" },
] as const

interface AtributosDefesaProps {
  atributos: Atributos
  bonusDefesaClasse: number
  onChange: (atributos: Partial<Atributos>) => void
  onBonusDefesaChange: (valor: number) => void
}

function modificarValor(val: number): number {
  return Math.floor((val - 10) / 2)
}

export function AtributosDefesa({
  atributos,
  bonusDefesaClasse,
  onChange,
  onBonusDefesaChange,
}: AtributosDefesaProps) {
  const destreza = atributos.destreza
  const defesa = 10 + modificarValor(destreza) + bonusDefesaClasse

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atributos e Defesa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ATRIBUTOS.map(({ key, label, short }) => (
            <div key={key} className="space-y-2">
              <Label className="text-xs text-slate-400">{short}</Label>
              <div className="flex flex-col items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={atributos[key] ?? ""}
                  onChange={(e) =>
                    onChange({ [key]: parseInt(e.target.value) || 0 })
                  }
                  className="h-12 text-center text-lg font-bold"
                />
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-sm font-medium text-[#8832ff]">
                  {modificarValor(atributos[key] ?? 10) >= 0 ? "+" : ""}
                  {modificarValor(atributos[key] ?? 10)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Defesa Base</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#e94560]">{defesa}</span>
              <span className="text-sm text-slate-400">
                = 10 + DES ({modificarValor(destreza) >= 0 ? "+" : ""}
                {modificarValor(destreza)}) + bônus classe
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonusDefesa">Bônus de Classe</Label>
            <Input
              id="bonusDefesa"
              type="number"
              min={0}
              value={bonusDefesaClasse}
              onChange={(e) => onBonusDefesaChange(parseInt(e.target.value) || 0)}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
