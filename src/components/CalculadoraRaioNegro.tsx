import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AptidaoAmaldicada, AptidoesAmaldicadas } from "@/types/ficha"
import { Zap } from "lucide-react"

const APTIDOES: AptidaoAmaldicada[] = ["Aura", "Controle", "Fluxo", "Potência"]

interface CalculadoraRaioNegroProps {
  aptidoes: AptidoesAmaldicadas
  aptidaoSelecionada: AptidaoAmaldicada | null
  onAptidaoSelecionada: (apt: AptidaoAmaldicada | null) => void
  onAumentarAptidao: (apt: AptidaoAmaldicada) => void
}

export function CalculadoraRaioNegro({
  aptidoes,
  aptidaoSelecionada,
  onAptidaoSelecionada,
  onAumentarAptidao,
}: CalculadoraRaioNegroProps) {
  const podeAumentar = (apt: AptidaoAmaldicada) => aptidoes[apt] < 5

  const aplicarRaioNegro = () => {
    if (aptidaoSelecionada && podeAumentar(aptidaoSelecionada)) {
      onAumentarAptidao(aptidaoSelecionada)
    }
  }

  return (
    <Card className="border-[var(--color-accent-purple)]/30 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-page)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Calculadora de Raio Negro (Black Flash)
        </CardTitle>
        <p className="mt-1 text-sm text-slate-400">
          Quando o personagem acerta um <strong>Raio Negro</strong> em combate (timing preciso), ele pode aumentar uma aptidão em +1, até no máximo 5. Escolha qual aptidão será beneficiada e use o botão ao acertar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">
            Aptidão a aumentar:
          </label>
          <Select
            value={aptidaoSelecionada ?? ""}
            onValueChange={(v) =>
              onAptidaoSelecionada((v || null) as AptidaoAmaldicada | null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a aptidão" />
            </SelectTrigger>
            <SelectContent>
              {APTIDOES.map((apt) => (
                <SelectItem
                  key={apt}
                  value={apt}
                  disabled={!podeAumentar(apt)}
                >
                  {apt} (atual: {aptidoes[apt]}
                  {aptidoes[apt] >= 5 ? " — máx." : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={aplicarRaioNegro}
          disabled={!aptidaoSelecionada || !podeAumentar(aptidaoSelecionada)}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
        >
          <Zap className="h-4 w-4" />
          Aplicar +1 à aptidão (Raio Negro!)
        </Button>
      </CardContent>
    </Card>
  )
}
