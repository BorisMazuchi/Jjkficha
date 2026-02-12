import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FerramentaAmaldicada, Grau } from "@/types/ficha"
import { Plus, Trash2 } from "lucide-react"

const GRAUS: Grau[] = ["4º", "3º", "2º", "1º", "Especial"]

interface InventarioAmaldicadoProps {
  ferramentas: FerramentaAmaldicada[]
  onChange: (ferramentas: FerramentaAmaldicada[]) => void
}

export function InventarioAmaldicado({
  ferramentas,
  onChange,
}: InventarioAmaldicadoProps) {
  const adicionar = () => {
    onChange([
      ...ferramentas,
      {
        id: crypto.randomUUID(),
        nome: "",
        grau: "4º",
        dano: "",
        propriedades: "",
      },
    ])
  }

  const atualizar = (id: string, dados: Partial<FerramentaAmaldicada>) => {
    onChange(
      ferramentas.map((f) => (f.id === id ? { ...f, ...dados } : f))
    )
  }

  const remover = (id: string) => {
    onChange(ferramentas.filter((f) => f.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário Amaldiçoado</CardTitle>
        <p className="text-xs text-slate-400">
          Ferramentas Amaldiçoadas (Grau 4 a Especial)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button size="sm" variant="outline" onClick={adicionar}>
          <Plus className="h-4 w-4" /> Nova Ferramenta
        </Button>

        <div className="space-y-3">
          {ferramentas.map((f) => (
            <div
              key={f.id}
              className="rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-4 space-y-3"
            >
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <Input
                  placeholder="Nome da ferramenta"
                  value={f.nome}
                  onChange={(e) => atualizar(f.id, { nome: e.target.value })}
                  className="flex-1 min-w-[180px]"
                />
                <Select
                  value={f.grau}
                  onValueChange={(v) => atualizar(f.id, { grau: v as Grau })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRAUS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remover(f.id)}
                  className="text-slate-400 hover:text-[#e94560]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Dano</Label>
                  <Input
                    placeholder="Ex: 2d6 + DES"
                    value={f.dano}
                    onChange={(e) => atualizar(f.id, { dano: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Propriedades especiais</Label>
                  <Input
                    placeholder="Ex: Empurra 3m, ignora resistência"
                    value={f.propriedades}
                    onChange={(e) =>
                      atualizar(f.id, { propriedades: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
