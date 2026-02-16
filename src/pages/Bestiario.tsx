import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Pencil, Trash2, Ghost, Send } from "lucide-react"
import type { Maldicao } from "@/types/mestre"
import { FichaMaldicaoModal } from "@/components/mestre/FichaMaldicaoModal"
import { Button } from "@/components/ui/button"
import { carregarBestiario, salvarBestiario } from "@/lib/bestiarioDb"
import { SiteHeader } from "@/components/layout/SiteHeader"
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
    let cancelled = false
    carregarBestiario().then((list) => {
      if (!cancelled) setMaldicoes(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      salvarBestiario(maldicoes)
    }, 500)
    return () => clearTimeout(timer)
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
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text)]">
      <SiteHeader title="BESTIÁRIO" subtitle="Maldições cadastradas por ficha" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[var(--color-text-muted)]">
            Adicione novas entradas e edite ataques, feitiços e descrição.
          </p>
          <Button
            onClick={handleOpenNew}
            className="bg-[var(--color-accent-red)] hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar maldição
          </Button>
        </div>

        {maldicoes.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] page-section py-16 text-center"
            )}
          >
            <Ghost className="mb-3 h-12 w-12 text-[var(--color-text-subtle)]" />
            <p className="text-[var(--color-text-muted)]">Nenhuma maldição no bestiário.</p>
            <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
              Clique em &quot;Adicionar maldição&quot; para criar uma ficha completa.
            </p>
            <Button
              onClick={handleOpenNew}
              variant="outline"
              className="mt-4 border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/10"
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
                  "flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4",
                  "transition-colors hover:border-[var(--color-neon-purple)]/50 hover:bg-[var(--color-bg-elevated)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-[var(--color-neon-purple)]">{m.nome || "Sem nome"}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
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
                      className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-neon-purple)]"
                      onClick={() => handleOpenEdit(m)}
                      title="Editar ficha"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
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
                  className="mt-3 w-full border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/10"
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
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                    {m.descricao}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {m.ataques && m.ataques.length > 0 && (
                    <span className="rounded bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[var(--color-text)]">
                      {m.ataques.length} ataque(s)
                    </span>
                  )}
                  {m.feiticos && m.feiticos.length > 0 && (
                    <span className="rounded bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[var(--color-text)]">
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
