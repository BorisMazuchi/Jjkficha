import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CabeçalhoFicha, Grau } from "@/types/ficha"

interface CabecalhoFichaProps {
  dados: CabeçalhoFicha
  onChange: (dados: Partial<CabeçalhoFicha>) => void
}

const GRAUS: Grau[] = ["4º", "3º", "2º", "1º", "Especial"]

export function CabecalhoFicha({ dados, onChange }: CabecalhoFichaProps) {
  return (
    <Card className="border-[#8832ff]/30 shadow-[0_0_20px_rgba(136,50,255,0.1)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="font-display tracking-wider">FICHA DE PERSONAGEM</span>
          <span className="text-xs font-normal text-slate-400">Feiticeiros & Maldições</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Personagem</Label>
            <Input
              id="nome"
              value={dados.nomePersonagem}
              onChange={(e) => onChange({ nomePersonagem: e.target.value })}
              placeholder="Ex: Yuji Itadori"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jogador">Jogador</Label>
            <Input
              id="jogador"
              value={dados.jogador}
              onChange={(e) => onChange({ jogador: e.target.value })}
              placeholder="Nome do jogador"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel">Nível (1-20)</Label>
            <Input
              id="nivel"
              type="number"
              min={1}
              max={20}
              value={dados.nivel || ""}
              onChange={(e) => onChange({ nivel: parseInt(e.target.value) || 1 })}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label>Grau</Label>
            <Select value={dados.grau} onValueChange={(v) => onChange({ grau: v as Grau })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {GRAUS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="origem">Origem / Clã</Label>
          <Input
            id="origem"
            value={dados.origemCla}
            onChange={(e) => onChange({ origemCla: e.target.value })}
            placeholder="Ex: Técnica Amaldiçoada Inata, Clã Gojo"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-[#2a2a4a] pt-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="xpAtual" className="text-amber-400/90">XP Atual (v2.5)</Label>
            <Input
              id="xpAtual"
              type="number"
              min={0}
              value={dados.xpAtual ?? ""}
              onChange={(e) =>
                onChange({ xpAtual: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xpProximo">XP para próximo nível</Label>
            <Input
              id="xpProximo"
              type="number"
              min={0}
              value={dados.xpProximoNivel ?? ""}
              onChange={(e) =>
                onChange({
                  xpProximoNivel:
                    e.target.value === "" ? undefined : parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ex: 300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
