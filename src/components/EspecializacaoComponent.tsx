import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { DadosEspecializacao, Especializacao } from "@/types/especializacao"
import { Swords, Target, Flame, Ghost, Heart, Shield } from "lucide-react"

const ESPECIALIZACOES: { value: Especializacao; label: string; icon: typeof Swords; descricao: string }[] = [
  {
    value: "Lutador",
    label: "Lutador",
    icon: Swords,
    descricao: "Combate corpo a corpo. Ganha Empolgação (PE temporário ao derrotar inimigos)."
  },
  {
    value: "Especialista em Combate",
    label: "Especialista em Combate",
    icon: Target,
    descricao: "Equilíbrio entre técnicas e combate físico. Versátil."
  },
  {
    value: "Especialista em Técnica",
    label: "Especialista em Técnica",
    icon: Flame,
    descricao: "Foco em Feitiços poderosos. Maior pool de PE."
  },
  {
    value: "Controlador",
    label: "Controlador",
    icon: Ghost,
    descricao: "Invoca Shikigamis e Corpos Amaldiçoados. Gestão de múltiplas criaturas."
  },
  {
    value: "Suporte",
    label: "Suporte",
    icon: Heart,
    descricao: "Cura e buffs para aliados. PE dedicado ao suporte."
  },
  {
    value: "Restringido",
    label: "Restringido",
    icon: Shield,
    descricao: "Sem energia amaldiçoada. Usa Estamina para ações físicas."
  }
]

// Tabela de PV/PE por nível (valores base - ajuste conforme o livro)
const PV_BASE: Record<Especializacao, number> = {
  "Lutador": 12,
  "Especialista em Combate": 10,
  "Especialista em Técnica": 8,
  "Controlador": 8,
  "Suporte": 8,
  "Restringido": 10
}

const PE_BASE: Record<Especializacao, number> = {
  "Lutador": 4,
  "Especialista em Combate": 6,
  "Especialista em Técnica": 8,
  "Controlador": 6,
  "Suporte": 6,
  "Restringido": 6 // Estamina
}

interface EspecializacaoComponentProps {
  dados: DadosEspecializacao
  nivel: number
  constituicao: number
  onChange: (dados: Partial<DadosEspecializacao>) => void
  onRecursosCalculados: (pvMax: number, peMax: number) => void
}

export function EspecializacaoComponent({
  dados,
  nivel,
  constituicao,
  onChange,
  onRecursosCalculados
}: EspecializacaoComponentProps) {
  const modCon = Math.floor((constituicao - 10) / 2)
  
  // Calcula PV e PE automaticamente
  const pvCalculado = dados.especializacao 
    ? PV_BASE[dados.especializacao] + modCon + ((nivel - 1) * (PV_BASE[dados.especializacao] + modCon))
    : 0
  
  const peCalculado = dados.especializacao
    ? PE_BASE[dados.especializacao] * nivel
    : 0

  const handleEspecializacaoChange = (esp: Especializacao) => {
    const usaEstamina = esp === "Restringido"
    onChange({ 
      especializacao: esp,
      usaEstamina,
      pvPorNivel: PV_BASE[esp],
      pePorNivel: PE_BASE[esp]
    })
    
    // Atualiza recursos calculados
    const pvMax = PV_BASE[esp] + modCon + ((nivel - 1) * (PV_BASE[esp] + modCon))
    const peMax = PE_BASE[esp] * nivel
    onRecursosCalculados(pvMax, peMax)
  }

  const especInfo = ESPECIALIZACOES.find(e => e.value === dados.especializacao)
  const Icon = especInfo?.icon || Swords

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialização (Classe)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Escolha sua Especialização</Label>
          <Select 
            value={dados.especializacao || ""} 
            onValueChange={(v) => handleEspecializacaoChange(v as Especializacao)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma especialização" />
            </SelectTrigger>
            <SelectContent>
              {ESPECIALIZACOES.map(esp => {
                const EspIcon = esp.icon
                return (
                  <SelectItem key={esp.value} value={esp.value}>
                    <div className="flex items-center gap-2">
                      <EspIcon className="h-4 w-4" />
                      <span>{esp.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {especInfo && (
          <div className="rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] p-3">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[#8832ff]" />
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{especInfo.descricao}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>PV Base: {PV_BASE[dados.especializacao]} + CON por nível</span>
                  <span>
                    {dados.usaEstamina ? "Estamina" : "PE"} Base: {PE_BASE[dados.especializacao]} por nível
                  </span>
                </div>
                <div className="rounded border border-[#8832ff]/30 bg-[#8832ff]/10 p-2 text-sm">
                  <div className="font-medium text-[#8832ff]">Recursos Calculados (Nível {nivel}):</div>
                  <div className="mt-1 flex gap-4">
                    <span className="text-[#e94560]">PV Máx: {pvCalculado}</span>
                    <span className="text-[#8832ff]">
                      {dados.usaEstamina ? "Estamina" : "PE"} Máx: {peCalculado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campo específico: Empolgação para Lutador */}
        {dados.especializacao === "Lutador" && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <Label htmlFor="empolgacao" className="text-amber-400">
              Empolgação (PE Temporário)
            </Label>
            <Input
              id="empolgacao"
              type="number"
              min={0}
              value={dados.empolgacao || 0}
              onChange={(e) => onChange({ empolgacao: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
            <p className="text-xs text-slate-400">
              Ganhe PE temporário ao derrotar inimigos
            </p>
          </div>
        )}

        {/* Botão para gerenciar invocações (Controlador) */}
        {dados.especializacao === "Controlador" && (
          <div className="rounded-lg border border-[#8832ff]/30 bg-[#8832ff]/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#8832ff]">Estoque de Invocações</Label>
                <p className="text-xs text-slate-400">
                  {(dados.estoqueInvocacoes || []).length} Shikigamis/Corpos criados
                </p>
              </div>
              <button
                type="button"
                className="rounded border border-[#8832ff]/50 bg-[#8832ff]/10 px-3 py-1 text-sm text-[#8832ff] hover:bg-[#8832ff]/20"
                onClick={() => {
                  // TODO: Abrir modal de gerenciamento de invocações
                  alert("Gerenciamento de Invocações será implementado em breve")
                }}
              >
                Gerenciar
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
