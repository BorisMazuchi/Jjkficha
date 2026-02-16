import { SiteHeader } from "@/components/layout/SiteHeader"
import { PainelRegrasRapidas } from "@/components/mestre/PainelRegrasRapidas"
import { URL_LIVRO_REGRAS } from "@/components/layout/SiteHeader"
import { ExternalLink } from "lucide-react"

export function Regras() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text)]">
      <SiteHeader
        title="REGRAS"
        subtitle="Regras rápidas — Livro v2.5"
      />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {URL_LIVRO_REGRAS && (
          <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <a
              href={URL_LIVRO_REGRAS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[var(--color-neon-purple)] hover:underline"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              Abrir Livro de Regras (PDF)
            </a>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Abre o PDF em nova aba. Coloque o arquivo em <code className="rounded bg-[var(--color-bg-elevated)] px-1">public/livro-regras.pdf</code> se ainda não estiver.
            </p>
          </div>
        )}
        <div className="min-h-[400px]">
          <PainelRegrasRapidas />
        </div>
      </main>
    </div>
  )
}
