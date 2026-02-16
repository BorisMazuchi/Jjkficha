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
  { key: "carisma", label: "Presença", short: "PRE" },
] as const

interface AtributosDefesaProps {
  atributos: Atributos
  nivel: number
  bonusDefesaClasse: number
  /** Total da perícia Percepção (Mod + bônus) para Atenção = 10 + Percepção + bônus (Livro v2.5) */
  percepcaoTotal?: number
  /** Bônus extra à Atenção (equipamento, etc.) */
  bonusAtencao?: number
  onChange: (atributos: Partial<Atributos>) => void
  onBonusDefesaChange: (valor: number) => void
  onBonusAtencaoChange?: (valor: number) => void
}

function modificarValor(val: number): number {
  return Math.floor((val - 10) / 2)
}

export function AtributosDefesa({
  atributos,
  nivel,
  bonusDefesaClasse,
  percepcaoTotal = 0,
  bonusAtencao = 0,
  onChange,
  onBonusDefesaChange,
  onBonusAtencaoChange,
}: AtributosDefesaProps) {
  const destreza = atributos.destreza
  const modDes = modificarValor(destreza)
  const metadeNivel = Math.floor(nivel / 2)
  const defesa = 10 + modDes + metadeNivel + bonusDefesaClasse
  const atencao = 10 + percepcaoTotal + bonusAtencao

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atributos e Defesa</CardTitle>
        <p className="mt-1 text-sm text-slate-400">
          Digite o <strong>valor base</strong> de cada atributo (geralmente 10). O <strong>modificador</strong> (em roxo) é calculado assim: (valor − 10) ÷ 2, arredondado para baixo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ATRIBUTOS.map(({ key, label, short }) => (
            <div key={key} className="space-y-2">
              <Label className="text-xs text-slate-400">{short} — {label}</Label>
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
                <span className="text-sm font-medium text-[#8832ff]">
                  Mod. {modificarValor(atributos[key] ?? 10) >= 0 ? "+" : ""}
                  {modificarValor(atributos[key] ?? 10)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-6 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Defesa (CD para te acertarem)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold text-[#e94560]">{defesa}</span>
              <span className="text-sm text-slate-400">
                = 10 + Mod. DES ({modDes >= 0 ? "+" : ""}{modDes}) + metade do nível ({metadeNivel}) + bônus de classe
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonusDefesa">Bônus de Classe (Defesa)</Label>
            <Input
              id="bonusDefesa"
              type="number"
              min={0}
              value={bonusDefesaClasse}
              onChange={(e) => onBonusDefesaChange(parseInt(e.target.value) || 0)}
              className="w-20"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Atenção (CD para te surpreenderem)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-cyan-400">{atencao}</span>
              <span className="text-sm text-slate-400">
                = 10 + Percepção ({percepcaoTotal >= 0 ? "+" : ""}{percepcaoTotal})
                {bonusAtencao !== 0 && ` + bônus (${bonusAtencao >= 0 ? "+" : ""}${bonusAtencao})`}
              </span>
            </div>
            {onBonusAtencaoChange != null && (
              <Input
                type="number"
                placeholder="Bônus Atenção"
                value={bonusAtencao || ""}
                onChange={(e) => onBonusAtencaoChange(parseInt(e.target.value) || 0)}
                className="mt-1 h-8 w-20"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
