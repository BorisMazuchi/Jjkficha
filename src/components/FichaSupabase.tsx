import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2, FolderOpen } from "lucide-react"
import {
  listarFichas,
  carregarFicha,
  salvarFicha,
  atualizarFicha,
  excluirFicha,
} from "@/lib/fichaDb"
import type { FichaDados } from "@/types/supabase"

interface FichaSupabaseProps {
  dados: FichaDados
  fichaId: string | null
  onCarregar: (dados: FichaDados) => void
  onFichaIdChange: (id: string | null) => void
}

export function FichaSupabase({
  dados,
  fichaId,
  onCarregar,
  onFichaIdChange,
}: FichaSupabaseProps) {
  const [fichas, setFichas] = useState<
    { id: string; nome_personagem: string; jogador: string; updated_at: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const recarregarLista = async () => {
    try {
      const lista = await listarFichas()
      setFichas(lista)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao listar fichas")
    }
  }

  useEffect(() => {
    recarregarLista()
  }, [])

  const handleSalvar = async () => {
    setLoading(true)
    setErro(null)
    try {
      if (fichaId) {
        await atualizarFicha(
          fichaId,
          dados.cabecalho.nomePersonagem,
          dados.cabecalho.jogador,
          dados
        )
      } else {
        const id = await salvarFicha(
          dados.cabecalho.nomePersonagem,
          dados.cabecalho.jogador,
          dados
        )
        if (id) onFichaIdChange(id)
      }
      await recarregarLista()
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  const handleCarregar = async (id: string) => {
    setLoading(true)
    setErro(null)
    try {
      const f = await carregarFicha(id)
      if (f) {
        onCarregar(f)
        onFichaIdChange(id)
      } else {
        setErro("Ficha não encontrada")
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async () => {
    if (!fichaId || !confirm("Excluir esta ficha?")) return
    setLoading(true)
    setErro(null)
    try {
      await excluirFicha(fichaId)
      onFichaIdChange(null)
      await recarregarLista()
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir")
    } finally {
      setLoading(false)
    }
  }

  const handleNova = () => {
    onFichaIdChange(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#2a2a4a] bg-[#16213e] p-3">
      <Button
        size="sm"
        onClick={handleSalvar}
        disabled={loading}
        title="Salvar no Supabase"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Salvar</span>
      </Button>
      <Button size="sm" variant="outline" onClick={handleNova}>
        Nova ficha
      </Button>
      {fichaId && (
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-400 hover:text-[#e94560]"
          onClick={handleExcluir}
          disabled={loading}
        >
          Excluir atual
        </Button>
      )}
      <Select
        value={fichaId ?? "none"}
        onValueChange={(v) => (v === "none" ? handleNova() : handleCarregar(v))}
      >
        <SelectTrigger className="w-[180px]">
          <FolderOpen className="h-4 w-4 shrink-0" />
          <SelectValue placeholder="Carregar ficha..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">(nova ficha)</SelectItem>
          {fichas.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span className="truncate">
                {f.nome_personagem || "(sem nome)"} — {f.jogador}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {erro && (
        <span className="text-xs text-[#e94560]">{erro}</span>
      )}
    </div>
  )
}
