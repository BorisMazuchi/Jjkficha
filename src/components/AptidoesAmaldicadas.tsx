import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { AptidoesAmaldicadas, AptidaoAmaldicada } from "@/types/ficha"
import { cn } from "@/lib/utils"

const APTIDOES: AptidaoAmaldicada[] = ["Aura", "Controle", "Fluxo", "Potência"]

interface AptidoesAmaldicadasProps {
  aptidoes: AptidoesAmaldicadas
  onChange: (aptidoes: Partial<AptidoesAmaldicadas>) => void
}

function SliderNivel({
  valor,
  onChange,
  nome,
}: {
  valor: number
  onChange: (v: number) => void
  nome: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="min-w-[90px] text-sm">{nome}</Label>
      <div className="flex flex-1 items-center gap-2">
        <input
          type="range"
          min={0}
          max={5}
          value={valor}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--color-bg-page)] accent-[var(--color-accent-purple)]"
        />
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md font-bold",
            valor >= 4 ? "bg-[var(--color-accent-purple)] text-white" : "bg-[var(--color-border)] text-slate-300"
          )}
        >
          {valor}
        </span>
      </div>
    </div>
  )
}

const APTIDAO_DICA: Record<AptidaoAmaldicada, string> = {
  Aura: "Presença e resistência da energia amaldiçada.",
  Controle: "Precisão e fineza no uso da técnica.",
  Fluxo: "Quantidade e fluidez da energia disponível.",
  Potência: "Força bruta dos efeitos da técnica.",
}

export function AptidoesAmaldicadasComponent({
  aptidoes,
  onChange,
}: AptidoesAmaldicadasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aptidões amaldiçadas</CardTitle>
        <p className="mt-1 text-sm text-slate-400">
          Níveis de 0 a 5. Definem o perfil da sua energia amaldiçada e influenciam testes e efeitos (consulte o livro para cada aptidão).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {APTIDOES.map((apt) => (
          <div key={apt} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-3 py-2">
            <SliderNivel
              nome={apt}
              valor={aptidoes[apt]}
              onChange={(v) => onChange({ [apt]: v })}
            />
            <p className="mt-1 text-xs text-slate-500">{APTIDAO_DICA[apt]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
