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
import { ImagePicker } from "@/components/ImagePicker"

interface CabecalhoFichaProps {
  dados: CabeçalhoFicha
  onChange: (dados: Partial<CabeçalhoFicha>) => void
}

const GRAUS: Grau[] = ["4º", "3º", "2º", "1º", "Especial"]

export function CabecalhoFicha({ dados, onChange }: CabecalhoFichaProps) {
  return (
    <Card className="border-[var(--color-accent-purple)]/30 shadow-[0_0_20px_rgba(136,50,255,0.1)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="font-display tracking-wider">FICHA DE PERSONAGEM</span>
          <span className="text-xs font-normal text-[var(--color-text-muted)]">Feiticeiros & Maldições v2.5</span>
        </CardTitle>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Identificação e nível do personagem. O <strong>Grau</strong> é a classificação do feiticeiro (4º ao Especial).
        </p>
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
            <Label htmlFor="nivel">Nível (1–20)</Label>
            <Input
              id="nivel"
              type="number"
              min={1}
              max={20}
              value={dados.nivel || ""}
              onChange={(e) => onChange({ nivel: parseInt(e.target.value) || 1 })}
              placeholder="1"
            />
            <p className="text-xs text-slate-500">Define bônus de perícia e defesa (metade do nível).</p>
          </div>
          <div className="space-y-2">
            <Label>Grau do Feiticeiro</Label>
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

        <div className="border-t border-[#2a2a4a] pt-4">
          <ImagePicker
            label="Imagem do personagem (URL ou arquivo — aceita GIF)"
            value={dados.imagemPersonagem}
            onChange={(url) => onChange({ imagemPersonagem: url || undefined })}
            previewSize={96}
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
            <p className="text-xs text-slate-500">Acumule XP para subir de nível (consulte a tabela do livro).</p>
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
            <p className="text-xs text-slate-500">Quanto falta para o próximo nível (referência).</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
