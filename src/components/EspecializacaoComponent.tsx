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
import type { DadosEspecializacao, Especializacao, EstoqueInvocacao } from "@/types/especializacao"
import { DADO_VIDA_POR_ESP } from "@/types/especializacao"
import { Swords, Target, Flame, Ghost, Heart, Shield, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

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
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[var(--color-neon-purple)]" />
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{especInfo.descricao}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>PV Base: {PV_BASE[dados.especializacao]} + CON por nível</span>
                  <span>
                    {dados.usaEstamina ? "Estamina" : "PE"} Base: {PE_BASE[dados.especializacao]} por nível
                  </span>
                </div>
                <div className="rounded border border-[var(--color-accent-purple)]/30 bg-[var(--color-accent-purple)]/10 p-2 text-sm">
                  <div className="font-medium text-[var(--color-neon-purple)]">Recursos Calculados (Nível {nivel}):</div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    <span className="text-[#e94560]">PV Máx: {pvCalculado}</span>
                    <span className="text-[var(--color-neon-purple)]">
                      {dados.usaEstamina ? "Estamina" : "PE"} Máx: {peCalculado}
                    </span>
                    <span className="text-slate-300">
                      Dados de vida: {dados.dadosVida ?? `${nivel}d${DADO_VIDA_POR_ESP[dados.especializacao]}`}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="dadosVida" className="text-xs text-slate-400">Override (ex.: 2d10)</Label>
                    <Input
                      id="dadosVida"
                      placeholder={`Padrão: ${nivel}d${DADO_VIDA_POR_ESP[dados.especializacao]}`}
                      value={dados.dadosVida ?? ""}
                      onChange={(e) => onChange({ dadosVida: e.target.value.trim() || undefined })}
                      className="mt-0.5 h-8 w-32 text-sm"
                    />
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

        {/* Estoque de Invocações (Controlador) */}
        {dados.especializacao === "Controlador" && (
          <InvocacoesManager
            estoque={dados.estoqueInvocacoes ?? []}
            onChange={(estoqueInvocacoes) => onChange({ estoqueInvocacoes })}
          />
        )}
      </CardContent>
    </Card>
  )
}

function InvocacoesManager({
  estoque,
  onChange,
}: {
  estoque: EstoqueInvocacao[]
  onChange: (estoque: EstoqueInvocacao[]) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = estoque.find((i) => i.id === editingId)

  const addNew = () => {
    const novo: EstoqueInvocacao = {
      id: crypto.randomUUID(),
      nome: "Nova invocação",
      tipo: "Shikigami",
      pvMax: 20,
      pvAtual: 20,
      descricao: "",
      habilidades: [],
    }
    onChange([...estoque, novo])
    setEditingId(novo.id)
  }

  const updateOne = (id: string, data: Partial<EstoqueInvocacao>) => {
    onChange(
      estoque.map((i) => (i.id === id ? { ...i, ...data } : i))
    )
  }

  const removeOne = (id: string) => {
    onChange(estoque.filter((i) => i.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const setHabilidades = (id: string, text: string) => {
    const arr = text.split("\n").map((s) => s.trim()).filter(Boolean)
    updateOne(id, { habilidades: arr })
  }

  return (
    <div className="rounded-lg border border-[var(--color-accent-purple)]/30 bg-[var(--color-accent-purple)]/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-[var(--color-neon-purple)]">Estoque de Invocações</Label>
        <Button type="button" size="sm" variant="outline" className="border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)]" onClick={addNew}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {estoque.map((inv) =>
          editingId === inv.id ? (
            <div key={inv.id} className="rounded border border-slate-600 bg-slate-800/60 p-2 text-sm space-y-2">
              <Input
                placeholder="Nome"
                value={inv.nome}
                onChange={(e) => updateOne(inv.id, { nome: e.target.value })}
                className="h-8"
              />
              <div className="flex gap-2">
                <select
                  value={inv.tipo}
                  onChange={(e) => updateOne(inv.id, { tipo: e.target.value as "Shikigami" | "Corpo Amaldiçoado" })}
                  className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs"
                >
                  <option value="Shikigami">Shikigami</option>
                  <option value="Corpo Amaldiçoado">Corpo Amaldiçoado</option>
                </select>
                <Label className="flex items-center gap-1 text-xs">PV <Input type="number" min={1} value={inv.pvAtual} onChange={(e) => updateOne(inv.id, { pvAtual: parseInt(e.target.value) || 0 })} className="h-7 w-14" /></Label>
                <span className="text-slate-500">/</span>
                <Input type="number" min={1} value={inv.pvMax} onChange={(e) => updateOne(inv.id, { pvMax: parseInt(e.target.value) || 0 })} className="h-7 w-16" />
              </div>
              <textarea
                placeholder="Descrição"
                value={inv.descricao}
                onChange={(e) => updateOne(inv.id, { descricao: e.target.value })}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs min-h-[60px]"
              />
              <textarea
                placeholder="Habilidades (uma por linha)"
                value={inv.habilidades.join("\n")}
                onChange={(e) => setHabilidades(inv.id, e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs min-h-[50px]"
              />
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Concluir</Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs text-red-400 border-red-500/50" onClick={() => removeOne(inv.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ) : (
            <div key={inv.id} className="flex items-center justify-between rounded border border-slate-600/60 bg-slate-800/40 px-2 py-1.5">
              <div>
                <span className="font-medium text-slate-200">{inv.nome}</span>
                <span className="ml-1.5 text-xs text-slate-500">({inv.tipo})</span>
                <span className="ml-1.5 text-xs text-red-400">{inv.pvAtual}/{inv.pvMax} PV</span>
              </div>
              <div className="flex gap-0.5">
                <button type="button" onClick={() => setEditingId(inv.id)} className="rounded p-1 text-slate-400 hover:bg-slate-600/50 hover:text-slate-200 text-xs">Editar</button>
                <button type="button" onClick={() => removeOne(inv.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
