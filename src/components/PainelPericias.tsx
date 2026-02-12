import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Pericia, TipoPericia } from "@/types/ficha"
import { cn } from "@/lib/utils"

const PERICIAS_BASE: Omit<Pericia, "tipo" | "bonusCustomizado">[] = [
  { nome: "Acrobacia", atributoBase: "DES" },
  { nome: "Atletismo", atributoBase: "FOR" },
  { nome: "Conhecimento (Amaldiçoado)", atributoBase: "INT" },
  { nome: "Conhecimento (Geral)", atributoBase: "INT" },
  { nome: "Enganação", atributoBase: "CAR" },
  { nome: "Furtividade", atributoBase: "DES" },
  { nome: "Intimidação", atributoBase: "CAR" },
  { nome: "Intuição", atributoBase: "SAB" },
  { nome: "Investigação", atributoBase: "INT" },
  { nome: "Luta", atributoBase: "FOR" },
  { nome: "Medicina", atributoBase: "INT" },
  { nome: "Percepção", atributoBase: "SAB" },
  { nome: "Persuasão", atributoBase: "CAR" },
  { nome: "Pontaria", atributoBase: "DES" },
  { nome: "Sobrevivência", atributoBase: "SAB" },
  { nome: "Técnica Amaldiçoada", atributoBase: "INT" },
  { nome: "Vontade", atributoBase: "SAB" },
]

interface PainelPericiasProps {
  pericias: Pericia[]
  nivel: number
  modificadores: Record<string, number>
  onChange: (pericias: Pericia[]) => void
}

function bonusPorTipo(tipo: TipoPericia, nivel: number): number {
  switch (tipo) {
    case "Treinamento":
      return nivel
    case "Especialização":
      return nivel * 2
    default:
      return 0
  }
}

export function PainelPericias({
  pericias,
  nivel,
  modificadores,
  onChange,
}: PainelPericiasProps) {
  const atualizar = (nome: string, dados: Partial<Pericia>) => {
    onChange(
      pericias.map((p) => (p.nome === nome ? { ...p, ...dados } : p))
    )
  }

  const periciasCompletas =
    pericias.length >= PERICIAS_BASE.length
      ? pericias
      : [
          ...pericias,
          ...PERICIAS_BASE.filter(
            (p) => !pericias.some((x) => x.nome === p.nome)
          ).map((p) => ({ ...p, tipo: "Nenhum" as TipoPericia })),
        ]

  const lista = periciasCompletas.length ? periciasCompletas : pericias

  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel de Atributos e Perícias</CardTitle>
        <p className="text-xs text-slate-400">
          Marque Treinamento (+Nível) ou Especialização (+2×Nível)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map(
            (p) => {
              const mod = modificadores[p.atributoBase] ?? 0
              const bonus = bonusPorTipo(p.tipo, nivel) + (p.bonusCustomizado ?? 0)
              const total = mod + bonus

              return (
                <div
                  key={p.nome}
                  className="flex items-center justify-between rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {p.nome}
                    </span>
                    <span className="text-xs text-slate-500">
                      {p.atributoBase} {mod >= 0 ? "+" : ""}
                      {mod}
                      {bonus !== 0 && ` + ${bonus}`} = {total >= 0 ? "+" : ""}
                      {total}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {(["Nenhum", "Treinamento", "Especialização"] as const).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => atualizar(p.nome, { tipo: t })}
                          className={cn(
                            "rounded px-2 py-0.5 text-xs transition-colors",
                            p.tipo === t
                              ? "bg-[#8832ff] text-white"
                              : "bg-[#2a2a4a] text-slate-400 hover:bg-[#3a3a5a]"
                          )}
                        >
                          {t === "Nenhum" ? "—" : t === "Treinamento" ? "T" : "E"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            }
          )}
        </div>
      </CardContent>
    </Card>
  )
}
