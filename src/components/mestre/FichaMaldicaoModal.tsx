import { useState, useEffect } from "react"
import type { Maldicao, AtaqueMaldicao, FeiticoMaldicao } from "@/types/mestre"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Trash2, Swords, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface FichaMaldicaoModalProps {
  maldicao: Maldicao
  isOpen: boolean
  onClose: () => void
  onSave: (m: Maldicao) => void
}

export function FichaMaldicaoModal({
  maldicao,
  isOpen,
  onClose,
  onSave,
}: FichaMaldicaoModalProps) {
  const [nome, setNome] = useState(maldicao.nome)
  const [pvMax, setPvMax] = useState(maldicao.pvMax)
  const [grau, setGrau] = useState(maldicao.grau ?? "")
  const [defesa, setDefesa] = useState<string>(String(maldicao.defesa ?? ""))
  const [descricao, setDescricao] = useState(maldicao.descricao ?? "")
  const [ataques, setAtaques] = useState<AtaqueMaldicao[]>(maldicao.ataques ?? [])
  const [feiticos, setFeiticos] = useState<FeiticoMaldicao[]>(maldicao.feiticos ?? [])

  useEffect(() => {
    if (isOpen) {
      setNome(maldicao.nome)
      setPvMax(maldicao.pvMax)
      setGrau(maldicao.grau ?? "")
      setDefesa(maldicao.defesa != null ? String(maldicao.defesa) : "")
      setDescricao(maldicao.descricao ?? "")
      setAtaques(maldicao.ataques ?? [])
      setFeiticos(maldicao.feiticos ?? [])
    }
  }, [isOpen, maldicao])

  const addAtaque = () => {
    setAtaques((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: "", dano: "", tipo: "" },
    ])
  }

  const updateAtaque = (id: string, patch: Partial<AtaqueMaldicao>) => {
    setAtaques((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    )
  }

  const removeAtaque = (id: string) => {
    setAtaques((prev) => prev.filter((a) => a.id !== id))
  }

  const addFeitico = () => {
    setFeiticos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: "", custoPE: 0, descricao: "" },
    ])
  }

  const updateFeitico = (id: string, patch: Partial<FeiticoMaldicao>) => {
    setFeiticos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    )
  }

  const removeFeitico = (id: string) => {
    setFeiticos((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSave = () => {
    const defesaNum = defesa === "" ? undefined : parseInt(String(defesa), 10)
    onSave({
      ...maldicao,
      nome,
      pvMax,
      pvAtual: Math.min(maldicao.pvAtual, pvMax),
      grau: grau || undefined,
      defesa: defesaNum !== undefined && !Number.isNaN(defesaNum) ? defesaNum : undefined,
      descricao: descricao || undefined,
      ataques: ataques.length ? ataques : undefined,
      feiticos: feiticos.length ? feiticos : undefined,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-xl",
          "overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-4 py-3">
          <h2 className="font-display text-lg font-bold text-cyan-400">
            Ficha da maldição
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Nome</label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-slate-600 bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">PV Máx</label>
              <Input
                type="number"
                min={1}
                value={pvMax}
                onChange={(e) => setPvMax(parseInt(e.target.value) || 1)}
                className="border-slate-600 bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Grau</label>
              <Input
                value={grau}
                onChange={(e) => setGrau(e.target.value)}
                placeholder="4º, 3º, 2º, 1º, Especial"
                className="border-slate-600 bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Defesa (CD)</label>
              <Input
                type="number"
                min={0}
                value={defesa}
                onChange={(e) => setDefesa(e.target.value)}
                placeholder="Ex: 14"
                className="border-slate-600 bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Descrição / notas</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200"
              placeholder="Resumo da maldição, resistências, etc."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <Swords className="h-4 w-4" />
                Ataques
              </h3>
              <Button size="sm" variant="outline" onClick={addAtaque} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Ataque
              </Button>
            </div>
            <div className="space-y-2">
              {ataques.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-2 rounded border border-slate-700 bg-slate-800/50 p-2"
                >
                  <Input
                    placeholder="Nome"
                    value={a.nome}
                    onChange={(e) => updateAtaque(a.id, { nome: e.target.value })}
                    className="h-8 w-32 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Input
                    placeholder="Dano (ex: 2d6+3)"
                    value={a.dano}
                    onChange={(e) => updateAtaque(a.id, { dano: e.target.value })}
                    className="h-8 w-28 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Input
                    placeholder="Tipo"
                    value={a.tipo ?? ""}
                    onChange={(e) => updateAtaque(a.id, { tipo: e.target.value })}
                    className="h-8 w-24 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    onClick={() => removeAtaque(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <Zap className="h-4 w-4" />
                Feitiços / técnicas
              </h3>
              <Button size="sm" variant="outline" onClick={addFeitico} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Feitiço
              </Button>
            </div>
            <div className="space-y-2">
              {feiticos.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center gap-2 rounded border border-slate-700 bg-slate-800/50 p-2"
                >
                  <Input
                    placeholder="Nome"
                    value={f.nome}
                    onChange={(e) => updateFeitico(f.id, { nome: e.target.value })}
                    className="h-8 w-36 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="PE"
                    value={f.custoPE || ""}
                    onChange={(e) =>
                      updateFeitico(f.id, { custoPE: parseInt(e.target.value) || 0 })
                    }
                    className="h-8 w-14 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Input
                    placeholder="Alcance (ex: 9m)"
                    value={f.alcance ?? ""}
                    onChange={(e) => updateFeitico(f.id, { alcance: e.target.value })}
                    className="h-8 w-20 border-slate-600 bg-slate-800 text-sm"
                  />
                  <Input
                    placeholder="Efeito / descrição"
                    value={f.descricao ?? ""}
                    onChange={(e) => updateFeitico(f.id, { descricao: e.target.value })}
                    className="h-8 flex-1 min-w-[120px] border-slate-600 bg-slate-800 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    onClick={() => removeFeitico(f.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-700 bg-slate-800/80 p-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500">
            Salvar ficha
          </Button>
        </div>
      </div>
    </div>
  )
}
