import { Link } from "react-router-dom"
import { FileText, BookOpen, LayoutGrid, Plus, ScrollText } from "lucide-react"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { Button } from "@/components/ui/button"

const LINKS = [
  { to: "/fichas", label: "Fichas", icon: FileText, desc: "Listar e editar fichas de personagem" },
  { to: "/bestiario", label: "Bestiário", icon: BookOpen, desc: "Maldições e criaturas" },
  { to: "/regras", label: "Regras", icon: ScrollText, desc: "Livro de regras e resumos (CDs, dano, ferimentos)" },
  { to: "/mestre", label: "Mestre", icon: LayoutGrid, desc: "Party, iniciativa, condições e regras" },
] as const

export function Home() {
  return (
    <div className="min-h-screen text-[var(--color-text)] hero-pattern">
      <SiteHeader title="FEITICEIROS & MALDIÇÕES" subtitle="Plataforma de Gestão — Jujutsu Kaisen RPG v2.5" />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/80 px-6 py-10 text-center shadow-[0_0_30px_rgba(106,13,173,0.15)]">
          <h2 className="font-display text-2xl font-bold tracking-wide text-[var(--color-jjk-gold)] sm:text-3xl">
            Bem-vindo à plataforma
          </h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Gerencie fichas, bestiário e sessões do Mestre em um só lugar.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <Button asChild className="bg-[var(--color-accent-red)] hover:opacity-90">
            <Link to="/ficha" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova ficha
            </Link>
          </Button>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {LINKS.map(({ to, label, icon: Icon, desc }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 transition-colors hover:border-[var(--color-neon-purple)]/50 hover:bg-[var(--color-bg-elevated)] hover:shadow-[0_0_20px_rgba(106,13,173,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--color-accent-purple)]/20 p-2">
                    <Icon className="h-6 w-6 text-[var(--color-neon-purple)]" />
                  </div>
                  <span className="font-semibold text-[var(--color-text)]">{label}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
