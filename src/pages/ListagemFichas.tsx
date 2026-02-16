import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FileText, Plus, FolderOpen, Ghost } from "lucide-react"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Button } from "@/components/ui/button"
import { listarFichas } from "@/lib/fichaDb"
import type { FichaListItem } from "@/lib/fichaDb"
import { cn } from "@/lib/utils"

export function ListagemFichas() {
  const navigate = useNavigate()
  const [fichas, setFichas] = useState<FichaListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listarFichas().then((list) => {
      if (!cancelled) {
        setFichas(list)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const abrirFicha = (id: string) => {
    navigate("/ficha", { state: { fichaId: id } })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text)]">
      <SiteHeader title="FICHAS" subtitle="Listagem de personagens" />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[var(--color-text-muted)]">
            Selecione uma ficha para editar ou crie uma nova.
          </p>
          <Button asChild className="bg-[var(--color-accent-red)] hover:opacity-90">
            <Link to="/ficha" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova ficha
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
            <FolderOpen className="mr-2 h-5 w-5 animate-pulse" />
            Carregando…
          </div>
        ) : fichas.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] page-section py-16 text-center"
            )}
          >
            <Ghost className="mb-3 h-12 w-12 text-[var(--color-text-subtle)]" />
            <p className="text-[var(--color-text-muted)]">Nenhuma ficha salva.</p>
            <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
              Crie uma ficha e salve no Supabase para vê-la aqui.
            </p>
            <Button asChild variant="outline" className="mt-4 border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/10">
              <Link to="/ficha" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova ficha
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fichas.map((f) => (
              <li
                key={f.id}
                className={cn(
                  "flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4",
                  "transition-colors hover:border-[var(--color-neon-purple)]/50 hover:bg-[var(--color-bg-elevated)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-[var(--color-neon-purple)]">
                      {f.nome_personagem || "Sem nome"}
                    </h3>
                    <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                      {f.jogador || "—"}
                    </p>
                    {f.nivel != null && (
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                        Nível {f.nivel}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full border-[var(--color-accent-purple)]/50 text-[var(--color-neon-purple)] hover:bg-[var(--color-accent-purple)]/10"
                  onClick={() => abrirFicha(f.id)}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Abrir
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
