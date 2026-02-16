import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import type { XPData, IntegridadeAlma } from "@/types/especializacao"
import { calcularEstadoAlma } from "@/lib/estadosAlma"
import { Award, Heart } from "lucide-react"

// Tabela de XP necessário por nível (progressão padrão d20)
const XP_POR_NIVEL: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
}

interface XPIntegridadeProps {
  xp: XPData
  integridade: IntegridadeAlma
  nivel: number
  pvMax: number
  onXPChange: (xp: XPData) => void
  onIntegridadeChange: (integridade: IntegridadeAlma) => void
  onNivelUp: () => void
}

export function XPIntegridade({
  xp,
  integridade,
  nivel,
  pvMax,
  onXPChange,
  onIntegridadeChange,
  onNivelUp,
}: XPIntegridadeProps) {
  const xpNecessario = XP_POR_NIVEL[nivel + 1] || 999999
  const xpProgresso = nivel >= 20 ? 100 : (xp.xpAtual / xpNecessario) * 100

  const podeSubirNivel = xp.xpAtual >= xpNecessario && nivel < 20

  // Integridade da Alma sempre igual ao PV Max
  const integridadeAtualizada: IntegridadeAlma = {
    atual: integridade.atual,
    max: pvMax,
  }

  if (integridade.max !== pvMax) {
    onIntegridadeChange(integridadeAtualizada)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* XP e Progressão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Experiência (XP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <Label htmlFor="xpAtual">XP Atual</Label>
              <span className="text-xs text-slate-400">
                Nível {nivel} {nivel >= 20 && "(Máx)"}
              </span>
            </div>
            <Input
              id="xpAtual"
              type="number"
              min={0}
              value={xp.xpAtual}
              onChange={(e) =>
                onXPChange({ ...xp, xpAtual: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          {nivel < 20 && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Próximo nível</span>
                  <span className="font-medium">
                    {xp.xpAtual} / {xpNecessario} XP
                  </span>
                </div>
                <Progress value={xpProgresso} className="h-3" />
              </div>

              {podeSubirNivel && (
                <button
                  type="button"
                  onClick={onNivelUp}
                  className="w-full rounded-lg border-2 border-amber-500 bg-amber-500/20 px-4 py-3 font-bold text-amber-400 transition-all hover:bg-amber-500/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                >
                  <Award className="mr-2 inline h-5 w-5" />
                  SUBIR PARA NÍVEL {nivel + 1}!
                </button>
              )}
            </>
          )}

          {nivel >= 20 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
              <p className="font-medium text-amber-400">🎉 Nível Máximo Atingido!</p>
              <p className="text-xs text-slate-400">
                Você alcançou o poder máximo de um Feiticeiro
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integridade da Alma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[var(--color-neon-purple)]" />
            Integridade da Alma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <Label htmlFor="integridadeAtual">Integridade Atual</Label>
              <span className="text-xs text-slate-400">
                Máx: {integridadeAtualizada.max} (= PV Máx)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="integridadeAtual"
                type="number"
                min={0}
                max={integridadeAtualizada.max}
                value={integridadeAtualizada.atual}
                onChange={(e) =>
                  onIntegridadeChange({
                    ...integridadeAtualizada,
                    atual: Math.min(
                      parseInt(e.target.value) || 0,
                      integridadeAtualizada.max
                    ),
                  })
                }
                className="flex-1"
              />
              <span className="text-slate-400">/</span>
              <span className="w-16 text-center font-medium">
                {integridadeAtualizada.max}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Progress
              value={
                integridadeAtualizada.max > 0
                  ? (integridadeAtualizada.atual / integridadeAtualizada.max) *
                    100
                  : 0
              }
              variant={
                integridadeAtualizada.atual <= integridadeAtualizada.max * 0.25
                  ? "danger"
                  : integridadeAtualizada.atual <=
                    integridadeAtualizada.max * 0.5
                  ? "warning"
                  : "default"
              }
              className="h-3"
            />
          </div>

          {(() => {
            const estadoInfo = calcularEstadoAlma(
              integridadeAtualizada.atual,
              integridadeAtualizada.max
            )
            if (!estadoInfo) return null
            return (
              <div
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-xs"
                title={estadoInfo.descricao}
              >
                <span className="font-medium text-[var(--color-neon-purple)]">
                  Estado da alma: {estadoInfo.estado}
                </span>
                {" — "}
                <span className="text-slate-400">
                  {estadoInfo.percentual.toFixed(0)}%
                </span>
                {estadoInfo.penalidadeTestes !== 0 && (
                  <div className="mt-1 text-slate-300">
                    {estadoInfo.penalidadeTestes} em testes; custo PE +{estadoInfo.custoExtraPE}
                    {estadoInfo.desvantagem && "; desvantagem em todos os testes"}
                    {estadoInfo.condicoesAplicadas.length > 0 &&
                      `; ${estadoInfo.condicoesAplicadas.join(", ")}`}
                  </div>
                )}
              </div>
            )
          })()}

          <div className="rounded-lg border border-[var(--color-accent-purple)]/30 bg-[var(--color-accent-purple)]/5 p-3">
            <p className="text-xs text-slate-300">
              <strong className="text-[var(--color-neon-purple)]">Integridade da Alma</strong>{" "}
              representa o quão inteira sua essência espiritual está. Dano à alma
              ignora PV e afeta diretamente este valor. Quando chega a 0, o
              personagem pode sofrer consequências permanentes.
            </p>
          </div>

          {integridadeAtualizada.atual <= integridadeAtualizada.max * 0.25 && (
            <div className="rounded-lg border border-[#e94560]/50 bg-[#e94560]/10 p-3">
              <p className="text-xs font-medium text-[#e94560]">
                ⚠️ ALMA EM PERIGO! Sua integridade está criticamente baixa.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
