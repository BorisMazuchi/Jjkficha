import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { validarBonusLimitadoPeloNivel } from "@/lib/utils"
import type { Habilidade } from "@/types/ficha"
import { Plus, Trash2 } from "lucide-react"

interface HabilidadesTecnicasProps {
  tecnicasInatas: Habilidade[]
  habilidadesClasse: Habilidade[]
  nivel: number
  onTecnicasChange: (h: Habilidade[]) => void
  onHabilidadesChange: (h: Habilidade[]) => void
}

function ListaHabilidades({
  titulo,
  habilidades,
  nivel,
  onChange,
}: {
  titulo: string
  habilidades: Habilidade[]
  nivel: number
  onChange: (h: Habilidade[]) => void
}) {
  const adicionar = () => {
    onChange([
      ...habilidades,
      {
        id: crypto.randomUUID(),
        nome: "",
        descricao: "",
        custoPE: 0,
        limitadaPeloNivel: false,
      },
    ])
  }

  const atualizar = (id: string, dados: Partial<Habilidade>) => {
    onChange(
      habilidades.map((h) =>
        h.id === id ? { ...h, ...dados } : h
      )
    )
  }

  const remover = (id: string) => {
    onChange(habilidades.filter((h) => h.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{titulo}</Label>
        <Button size="sm" variant="outline" onClick={adicionar}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {habilidades.map((h) => {
          const bonusEfetivo =
            h.limitadaPeloNivel && h.bonusInserido != null
              ? validarBonusLimitadoPeloNivel(h.bonusInserido, nivel)
              : h.bonusInserido
          return (
            <div
              key={h.id}
              className="flex flex-col gap-2 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-3"
            >
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Nome"
                  value={h.nome}
                  onChange={(e) => atualizar(h.id, { nome: e.target.value })}
                  className="flex-1 min-w-[120px]"
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Custo PE"
                  value={h.custoPE || ""}
                  onChange={(e) =>
                    atualizar(h.id, { custoPE: parseInt(e.target.value) || 0 })
                  }
                  className="w-20"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remover(h.id)}
                  className="text-slate-400 hover:text-[#e94560]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Descrição"
                value={h.descricao}
                onChange={(e) => atualizar(h.id, { descricao: e.target.value })}
                className="text-sm"
              />
              {h.limitadaPeloNivel && (
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={h.limitadaPeloNivel}
                      onChange={(e) =>
                        atualizar(h.id, { limitadaPeloNivel: e.target.checked })
                      }
                    />
                    Limitada pelo Nível
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Bônus"
                    value={h.bonusInserido ?? ""}
                    onChange={(e) =>
                      atualizar(h.id, {
                        bonusInserido: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="h-7 w-16"
                  />
                  {h.bonusInserido != null && (
                    <span className="text-[#8832ff]">
                      Bônus efetivo: {bonusEfetivo} (menor entre {h.bonusInserido}{" "}
                      e nível {nivel})
                    </span>
                  )}
                </div>
              )}
              {!h.limitadaPeloNivel && (
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={h.limitadaPeloNivel}
                    onChange={(e) =>
                      atualizar(h.id, { limitadaPeloNivel: e.target.checked })
                    }
                  />
                  Marcar como Limitada pelo Nível
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function HabilidadesTecnicas({
  tecnicasInatas,
  habilidadesClasse,
  nivel,
  onTecnicasChange,
  onHabilidadesChange,
}: HabilidadesTecnicasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades e Técnicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListaHabilidades
          titulo="Técnicas Inatas"
          habilidades={tecnicasInatas}
          nivel={nivel}
          onChange={onTecnicasChange}
        />
        <ListaHabilidades
          titulo="Habilidades de Classe"
          habilidades={habilidadesClasse}
          nivel={nivel}
          onChange={onHabilidadesChange}
        />
      </CardContent>
    </Card>
  )
}
