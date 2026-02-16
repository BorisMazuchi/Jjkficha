import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Dices, ArrowUp, ArrowDown, Swords } from "lucide-react"

const FACES = [4, 6, 8, 10, 12, 20] as const
type Faces = (typeof FACES)[number]

export type ModoRolagem = "normal" | "vantagem" | "desvantagem"

export interface ResultadoRolagem {
  expressao: string
  valores: number[]
  total: number
  critico?: boolean
  criticoFalha?: boolean
  modo?: ModoRolagem
}

interface DiceRollerProps {
  onRolar?: (resultado: ResultadoRolagem) => void
  className?: string
  compact?: boolean
}

function rolarDado(faces: number): number {
  return Math.floor(Math.random() * faces) + 1
}

export function DiceRoller({ onRolar, className, compact }: DiceRollerProps) {
  const [modo, setModo] = useState<ModoRolagem>("normal")
  const [ultimo, setUltimo] = useState<ResultadoRolagem | null>(null)

  const rolar = useCallback(
    (qtd: number, faces: Faces, modificador: number = 0) => {
      const valores: number[] = []
      for (let i = 0; i < qtd; i++) {
        valores.push(rolarDado(faces))
      }
      let total = valores.reduce((a, b) => a + b, 0) + modificador

      let critico: boolean | undefined
      let criticoFalha: boolean | undefined
      if (faces === 20) {
        const d20s = valores
        if (modo === "vantagem") {
          const [a, b] = [rolarDado(20), rolarDado(20)]
          const max = Math.max(a, b)
          total = max + (modificador !== 0 ? modificador : 0)
          valores.length = 0
          valores.push(a, b)
          critico = max === 20
          criticoFalha = max === 1
        } else if (modo === "desvantagem") {
          const [a, b] = [rolarDado(20), rolarDado(20)]
          const min = Math.min(a, b)
          total = min + (modificador !== 0 ? modificador : 0)
          valores.length = 0
          valores.push(a, b)
          critico = min === 20
          criticoFalha = min === 1
        } else {
          critico = d20s.some((v) => v === 20)
          criticoFalha = d20s.some((v) => v === 1)
        }
      }

      const expressao =
        modificador !== 0
          ? `${qtd}d${faces}${modificador >= 0 ? "+" : ""}${modificador}`
          : `${qtd}d${faces}`

      const resultado: ResultadoRolagem = {
        expressao,
        valores: [...valores],
        total,
        critico,
        criticoFalha,
        modo: faces === 20 ? modo : undefined,
      }
      setUltimo(resultado)
      onRolar?.(resultado)
      return resultado
    },
    [modo, onRolar]
  )

  const rolarD20 = useCallback(() => {
    if (modo === "vantagem" || modo === "desvantagem") {
      rolar(2, 20)
    } else {
      rolar(1, 20)
    }
  }, [modo, rolar])

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-700/80 bg-slate-900/50 p-3",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Dices className="h-4 w-4" />
          Dados
        </span>
        {!compact && (
          <div className="flex rounded border border-slate-600 bg-slate-800/80 p-0.5">
            <button
              type="button"
              onClick={() => setModo("desvantagem")}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                modo === "desvantagem"
                  ? "bg-rose-500/30 text-rose-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Desvantagem (2d20, menor)"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModo("normal")}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                modo === "normal"
                  ? "bg-[#8832ff]/30 text-[#a855f7]"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Normal"
            >
              1d20
            </button>
            <button
              type="button"
              onClick={() => setModo("vantagem")}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                modo === "vantagem"
                  ? "bg-emerald-500/30 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Vantagem (2d20, maior)"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={rolarD20}
          className="h-8 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
        >
          {modo === "vantagem" ? "2d20↑" : modo === "desvantagem" ? "2d20↓" : "d20"}
        </Button>
        {FACES.filter((f) => f !== 20).map((f) => (
          <Button
            key={f}
            size="sm"
            variant="outline"
            onClick={() => rolar(1, f)}
            className="h-8 border-slate-600 text-slate-300 hover:bg-slate-700/50"
          >
            d{f}
          </Button>
        ))}
      </div>

      {ultimo && (
        <div
          className={cn(
            "mt-2 rounded border font-mono text-xs",
            ultimo.critico && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
            ultimo.criticoFalha && "border-rose-500/50 bg-rose-500/10 text-rose-400",
            !ultimo.critico && !ultimo.criticoFalha && "border-slate-600 bg-slate-800/50 text-slate-300"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <span>
              {ultimo.expressao} → [{ultimo.valores.join(", ")}]
              {ultimo.modo === "vantagem"
                ? ` = ${Math.max(...ultimo.valores)}`
                : ultimo.modo === "desvantagem"
                  ? ` = ${Math.min(...ultimo.valores)}`
                  : ultimo.valores.length === 1
                    ? ` = ${ultimo.total}`
                    : ` = ${ultimo.valores.reduce((a, b) => a + b, 0)}`}
              {ultimo.total !== ultimo.valores.reduce((a, b) => a + b, 0) &&
                ultimo.modo !== "vantagem" &&
                ultimo.modo !== "desvantagem" &&
                ` (total ${ultimo.total})`}
            </span>
            {(ultimo.critico || ultimo.criticoFalha) && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                {ultimo.critico && (
                  <>
                    <Swords className="h-3 w-3" />
                    Crítico
                  </>
                )}
                {ultimo.criticoFalha && <>Falha crítica</>}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
