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
    <Card className="border-[#8832ff]/30 bg-gradient-to-br from-[#16213e] to-[#1a1a2e]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Calculadora de Raio Negro (Black Flash)
        </CardTitle>
        <p className="text-xs text-slate-400">
          Ao acertar um Raio Negro, aumente automaticamente uma aptidão em +1
          (até máx. 5)
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
