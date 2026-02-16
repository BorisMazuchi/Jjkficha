import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BookOpen, Plus, Pencil, Trash2, Ghost, FileText, Send } from "lucide-react"
import type { Maldicao } from "@/types/mestre"
import { FichaMaldicaoModal } from "@/components/mestre/FichaMaldicaoModal"
import { Button } from "@/components/ui/button"
import { carregarBestiario, salvarBestiario } from "@/lib/bestiarioDb"
import { cn } from "@/lib/utils"

const MALDICAO_VAZIA = (): Maldicao => ({
  id: crypto.randomUUID(),
  nome: "",
  pvAtual: 1,
  pvMax: 1,
  grau: undefined,
  defesa: undefined,
  descricao: undefined,
  ataques: undefined,
  feiticos: undefined,
})

export function Bestiario() {
  const navigate = useNavigate()
  const [maldicoes, setMaldicoes] = useState<Maldicao[]>([])
  const [modalMaldicao, setModalMaldicao] = useState<Maldicao | null>(null)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    setMaldicoes(carregarBestiario())
  }, [])

  useEffect(() => {
    if (maldicoes.length > 0) salvarBestiario(maldicoes)
  }, [maldicoes])

  const handleOpenNew = () => {
    setModalMaldicao(MALDICAO_VAZIA())
    setIsNew(true)
  }

  const handleOpenEdit = (m: Maldicao) => {
    setModalMaldicao({ ...m })
    setIsNew(false)
  }

  const handleSave = (m: Maldicao) => {
    if (isNew) {
      setMaldicoes((prev) => [...prev, { ...m, pvAtual: m.pvMax }])
    } else {
      setMaldicoes((prev) =>
        prev.map((x) => (x.id === m.id ? { ...m, pvAtual: m.pvAtual ?? m.pvMax } : x))
      )
    }
    setModalMaldicao(null)
  }

  const handleRemove = (id: string) => {
    if (window.confirm("Remover esta maldição do bestiário?")) {
      setMaldicoes((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <FileText className="h-4 w-4" />
              Fichas
            </Link>
            <Link
              to="/mestre"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              Mestre
            </Link>
            <Link
              to="/tabuleiro"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              Tabuleiro
            </Link>
            <h1 className="font-display flex items-center gap-2 text-xl font-bold tracking-[0.15em] text-cyan-400">
              <BookOpen className="h-6 w-6" />
              BESTIÁRIO
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-400">
            Maldições cadastradas por ficha. Adicione novas entradas e edite ataques, feitiços e
            descrição.
          </p>
          <Button
            onClick={handleOpenNew}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar maldição
          </Button>
        </div>

        {maldicoes.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-16 text-center"
            )}
          >
            <Ghost className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-slate-400">Nenhuma maldição no bestiário.</p>
            <p className="mt-1 text-sm text-slate-500">
              Clique em &quot;Adicionar maldição&quot; para criar uma ficha completa.
            </p>
            <Button
              onClick={handleOpenNew}
              variant="outline"
              className="mt-4 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar maldição
              </Button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {maldicoes.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col rounded-xl border border-slate-700/80 bg-slate-800/50 p-4",
                  "transition-colors hover:border-slate-600 hover:bg-slate-800/70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-cyan-300">{m.nome || "Sem nome"}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      {m.grau && <span>{m.grau}</span>}
                      {m.pvMax != null && (
                        <span>PV {m.pvAtual ?? m.pvMax}/{m.pvMax}</span>
                      )}
                      {m.defesa != null && <span>Defesa {m.defesa}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400"
                      onClick={() => handleOpenEdit(m)}
                      title="Editar ficha"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                      onClick={() => handleRemove(m.id)}
                      title="Remover do bestiário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() =>
                    navigate("/mestre", {
                      state: {
                        addMaldicaoFromBestiario: { ...m, pvAtual: m.pvMax },
                      },
                    })
                  }
                  title="Adicionar uma cópia à sessão do Mestre"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Usar na sessão
                </Button>
                {m.descricao && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                    {m.descricao}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {m.ataques && m.ataques.length > 0 && (
                    <span className="rounded bg-slate-700/80 px-1.5 py-0.5 text-slate-300">
                      {m.ataques.length} ataque(s)
                    </span>
                  )}
                  {m.feiticos && m.feiticos.length > 0 && (
                    <span className="rounded bg-slate-700/80 px-1.5 py-0.5 text-slate-300">
                      {m.feiticos.length} feitiço(s)
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {modalMaldicao && (
        <FichaMaldicaoModal
          maldicao={modalMaldicao}
          isOpen={true}
          onClose={() => setModalMaldicao(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
