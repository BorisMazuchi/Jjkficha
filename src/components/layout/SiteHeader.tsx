import { Link, useLocation } from "react-router-dom"
import { Home, FileText, BookOpen, LayoutGrid, Swords, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

/** URL do Livro de Regras (PDF). Deixe vazio ou defina para o arquivo em /public ou URL externa. */
export const URL_LIVRO_REGRAS = ""

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/fichas", label: "Fichas", icon: FileText },
  { to: "/bestiario", label: "Bestiário", icon: BookOpen },
  { to: "/mestre", label: "Mestre", icon: LayoutGrid },
  { to: "/tabuleiro", label: "Tabuleiro", icon: Swords },
] as const

interface SiteHeaderProps {
  /** Conteúdo à direita do header (ex: botões, FichaSupabase) */
  right?: React.ReactNode
  /** Título customizado (default: Feiticeiros & Maldições) */
  title?: string
  /** Subtítulo opcional */
  subtitle?: string
  className?: string
}

export function SiteHeader({ right, title, subtitle, className }: SiteHeaderProps) {
  const location = useLocation()

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg-header)] px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                location.pathname === to
                  ? "text-[var(--color-accent-cyan)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
          <div className="hidden h-5 w-px bg-[var(--color-border)] sm:block" />
          <div>
            <h1 className="font-display text-xl font-bold tracking-[0.12em] text-[var(--color-accent-red)]">
              {title ?? "FEITICEIROS & MALDIÇÕES"}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
            )}
          </div>
          {URL_LIVRO_REGRAS && (
            <a
              href={URL_LIVRO_REGRAS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Livro de Regras (PDF)
            </a>
          )}
        </div>
        {right && <div className="flex items-center gap-3">{right}</div>}
      </div>
    </header>
  )
}
