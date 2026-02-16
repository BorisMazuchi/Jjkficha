import { useState } from "react"
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
import type {
  TecnicaAmaldicada,
  Feitico,
  DadoDano,
  TipoAcao,
  AreaEfeito,
} from "@/types/especializacao"
import { ImagePicker } from "@/components/ImagePicker"
import { Plus, Trash2, Zap, Edit3, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const TIPOS_DADO = [4, 6, 8, 10, 12, 20] as const
const TIPOS_ACAO: TipoAcao[] = [
  "Ação",
  "Ação Bônus",
  "Reação",
  "Ação Livre",
  "Ação Completa",
]
const TIPOS_AREA = ["Cone", "Linha", "Cilindro", "Esfera", "Cubo"] as const

interface TecnicaBuilderProps {
  tecnica: TecnicaAmaldicada | null
  onChange: (tecnica: TecnicaAmaldicada) => void
}

export function TecnicaBuilder({ tecnica, onChange }: TecnicaBuilderProps) {
  const [tecnicaAtual, setTecnicaAtual] = useState<TecnicaAmaldicada>(
    tecnica || {
      id: crypto.randomUUID(),
      nome: "",
      descricao: "",
      funcionamentoBasico: "",
      feiticos: [],
      imagem: undefined,
    }
  )
  const [editandoFeitico, setEditandoFeitico] = useState<string | null>(null)
  const [feiticoExpandido, setFeiticoExpandido] = useState<string | null>(null)

  const atualizarTecnica = (dados: Partial<TecnicaAmaldicada>) => {
    const nova = { ...tecnicaAtual, ...dados }
    setTecnicaAtual(nova)
    onChange(nova)
  }

  const adicionarFeitico = () => {
    const novoFeitico: Feitico = {
      id: crypto.randomUUID(),
      nome: "",
      custoPE: 0,
      dano: {
        quantidadeDados: 1,
        tipoDado: 8,
        modificador: "Inteligência",
      },
      alcance: "9m",
      tipoAcao: "Ação",
      descricao: "",
    }
    atualizarTecnica({
      feiticos: [...tecnicaAtual.feiticos, novoFeitico],
    })
    setEditandoFeitico(novoFeitico.id)
    setFeiticoExpandido(novoFeitico.id)
  }

  const atualizarFeitico = (id: string, dados: Partial<Feitico>) => {
    atualizarTecnica({
      feiticos: tecnicaAtual.feiticos.map((f) =>
        f.id === id ? { ...f, ...dados } : f
      ),
    })
  }

  const removerFeitico = (id: string) => {
    atualizarTecnica({
      feiticos: tecnicaAtual.feiticos.filter((f) => f.id !== id),
    })
  }

  const formatarDano = (dano: DadoDano) => {
    return `${dano.quantidadeDados}d${dano.tipoDado} + ${dano.modificador}${
      dano.tipoDano ? ` (${dano.tipoDano})` : ""
    }`
  }

  return (
    <Card className="border-[var(--color-accent-purple)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--color-neon-purple)]" />
          Builder de Técnica Amaldiçoada
        </CardTitle>
        <p className="text-xs text-slate-400">
          Crie sua técnica única com funcionamento base e feitiços individuais
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados Básicos da Técnica */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeTecnica">Nome da Técnica</Label>
            <Input
              id="nomeTecnica"
              placeholder="Ex: Manipulação de Sombras"
              value={tecnicaAtual.nome}
              onChange={(e) => atualizarTecnica({ nome: e.target.value })}
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoTecnica">Descrição Temática</Label>
            <textarea
              id="descricaoTecnica"
              placeholder="Descreva a aparência e tema da sua técnica..."
              value={tecnicaAtual.descricao}
              onChange={(e) => atualizarTecnica({ descricao: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcionamento">Funcionamento Básico</Label>
            <textarea
              id="funcionamento"
              placeholder="Explique as regras e mecânicas gerais da técnica (texto livre)..."
              value={tecnicaAtual.funcionamentoBasico}
              onChange={(e) =>
                atualizarTecnica({ funcionamentoBasico: e.target.value })
              }
              className="flex min-h-[120px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)]"
            />
            <p className="text-xs text-slate-500">
              Ex: "Permite criar e manipular sombras físicas. As sombras podem
              ser moldadas em armas ou usadas para prender inimigos."
            </p>
          </div>

          <ImagePicker
            label="Imagem da técnica (URL ou arquivo — aceita GIF)"
            value={tecnicaAtual.imagem}
            onChange={(url) => atualizarTecnica({ imagem: url || undefined })}
            previewSize={80}
          />
        </div>

        {/* Lista de Feitiços */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Feitiços da Técnica</Label>
            <Button size="sm" variant="outline" onClick={adicionarFeitico}>
              <Plus className="h-4 w-4" /> Novo Feitiço
            </Button>
          </div>

          <div className="space-y-2">
            {tecnicaAtual.feiticos.map((feitico) => (
              <FeiticoCard
                key={feitico.id}
                feitico={feitico}
                expandido={feiticoExpandido === feitico.id}
                editando={editandoFeitico === feitico.id}
                onToggleExpand={() =>
                  setFeiticoExpandido(
                    feiticoExpandido === feitico.id ? null : feitico.id
                  )
                }
                onEditar={() =>
                  setEditandoFeitico(
                    editandoFeitico === feitico.id ? null : feitico.id
                  )
                }
                onAtualizar={(dados) => atualizarFeitico(feitico.id, dados)}
                onRemover={() => removerFeitico(feitico.id)}
                formatarDano={formatarDano}
              />
            ))}

            {tecnicaAtual.feiticos.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/50 p-8 text-center">
                <Zap className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-2 text-sm text-slate-400">
                  Nenhum feitiço criado ainda
                </p>
                <p className="text-xs text-slate-500">
                  Clique em "Novo Feitiço" para começar
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface FeiticoCardProps {
  feitico: Feitico
  expandido: boolean
  editando: boolean
  onToggleExpand: () => void
  onEditar: () => void
  onAtualizar: (dados: Partial<Feitico>) => void
  onRemover: () => void
  formatarDano: (dano: DadoDano) => string
}

function FeiticoCard({
  feitico,
  expandido,
  editando,
  onToggleExpand,
  onEditar,
  onAtualizar,
  onRemover,
  formatarDano,
}: FeiticoCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all",
        expandido && "border-[var(--color-accent-purple)]/50"
      )}
    >
      {/* Header do Feitiço */}
      <div className="flex items-center justify-between p-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {expandido ? (
            <ChevronUp className="h-4 w-4 text-[var(--color-neon-purple)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-100">
              {feitico.nome || "(Sem nome)"}
            </div>
            {!expandido && (
              <div className="text-xs text-slate-400">
                {feitico.custoPE} PE • {formatarDano(feitico.dano)} • {feitico.alcance}
              </div>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEditar}
            className={cn(
              "rounded p-1 transition-colors",
              editando
                ? "bg-[var(--color-accent-purple)]/20 text-[var(--color-neon-purple)]"
                : "text-slate-400 hover:bg-[var(--color-border)] hover:text-slate-100"
            )}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemover}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-[#e94560]/20 hover:text-[#e94560]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {expandido && (
        <div className="space-y-4 border-t border-[var(--color-border)] p-4">
          {editando ? (
            <FeiticoEditor feitico={feitico} onAtualizar={onAtualizar} />
          ) : (
            <FeiticoDisplay feitico={feitico} formatarDano={formatarDano} />
          )}
        </div>
      )}
    </div>
  )
}

function FeiticoEditor({
  feitico,
  onAtualizar,
}: {
  feitico: Feitico
  onAtualizar: (dados: Partial<Feitico>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome do Feitiço</Label>
          <Input
            value={feitico.nome}
            onChange={(e) => onAtualizar({ nome: e.target.value })}
            placeholder="Ex: Lança de Sombra"
          />
        </div>
        <div className="space-y-2">
          <Label>Custo de PE</Label>
          <Input
            type="number"
            min={0}
            value={feitico.custoPE}
            onChange={(e) =>
              onAtualizar({ custoPE: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Configuração de Dano */}
      <div className="space-y-2">
        <Label>Dano</Label>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            type="number"
            min={1}
            value={feitico.dano.quantidadeDados}
            onChange={(e) =>
              onAtualizar({
                dano: {
                  ...feitico.dano,
                  quantidadeDados: parseInt(e.target.value) || 1,
                },
              })
            }
            placeholder="Qtd"
          />
          <Select
            value={String(feitico.dano.tipoDado)}
            onValueChange={(v) =>
              onAtualizar({
                dano: {
                  ...feitico.dano,
                  tipoDado: parseInt(v) as 4 | 6 | 8 | 10 | 12 | 20,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_DADO.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  d{d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={feitico.dano.modificador}
            onChange={(e) =>
              onAtualizar({
                dano: { ...feitico.dano, modificador: e.target.value },
              })
            }
            placeholder="Mod"
          />
          <Input
            value={feitico.dano.tipoDano || ""}
            onChange={(e) =>
              onAtualizar({
                dano: { ...feitico.dano, tipoDano: e.target.value },
              })
            }
            placeholder="Tipo"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Alcance</Label>
          <Input
            value={feitico.alcance}
            onChange={(e) => onAtualizar({ alcance: e.target.value })}
            placeholder="Ex: 9m, 30m, Toque"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo de Ação</Label>
          <Select
            value={feitico.tipoAcao}
            onValueChange={(v) => onAtualizar({ tipoAcao: v as TipoAcao })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_ACAO.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Área de Efeito (Opcional) */}
      <div className="space-y-2">
        <Label>Área de Efeito (Opcional)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Select
            value={feitico.areaEfeito?.tipo || "none"}
            onValueChange={(v) =>
              onAtualizar({
                areaEfeito:
                  v === "none"
                    ? undefined
                    : {
                        tipo: v as AreaEfeito["tipo"],
                        tamanho: feitico.areaEfeito?.tamanho || "9m",
                      },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem área</SelectItem>
              {TIPOS_AREA.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {feitico.areaEfeito && (
            <Input
              value={feitico.areaEfeito.tamanho}
              onChange={(e) =>
                onAtualizar({
                  areaEfeito: {
                    ...feitico.areaEfeito!,
                    tamanho: e.target.value,
                  },
                })
              }
              placeholder="Ex: 9m de raio"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição / Efeitos</Label>
        <textarea
          value={feitico.descricao}
          onChange={(e) => onAtualizar({ descricao: e.target.value })}
          placeholder="Descreva os efeitos especiais, condições, etc..."
          className="flex min-h-[80px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)]"
        />
      </div>
    </div>
  )
}

function FeiticoDisplay({
  feitico,
  formatarDano,
}: {
  feitico: Feitico
  formatarDano: (dano: DadoDano) => string
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <div>
          <span className="text-slate-400">Custo:</span>{" "}
          <span className="font-medium text-[var(--color-neon-purple)]">{feitico.custoPE} PE</span>
        </div>
        <div>
          <span className="text-slate-400">Dano:</span>{" "}
          <span className="font-medium text-[#e94560]">
            {formatarDano(feitico.dano)}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Alcance:</span>{" "}
          <span className="font-medium">{feitico.alcance}</span>
        </div>
        <div>
          <span className="text-slate-400">Ação:</span>{" "}
          <span className="font-medium">{feitico.tipoAcao}</span>
        </div>
        {feitico.areaEfeito && (
          <div>
            <span className="text-slate-400">Área:</span>{" "}
            <span className="font-medium">
              {feitico.areaEfeito.tipo} ({feitico.areaEfeito.tamanho})
            </span>
          </div>
        )}
      </div>
      {feitico.descricao && (
        <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 text-slate-300">
          {feitico.descricao}
        </div>
      )}
    </div>
  )
}
