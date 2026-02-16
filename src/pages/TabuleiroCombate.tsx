import { TabuleiroContent } from "@/components/vtt/TabuleiroContent"
import { SiteHeader } from "@/components/layout/SiteHeader"

export function TabuleiroCombate() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--color-bg-page)]">
      <SiteHeader title="TABULEIRO" subtitle="Grid de combate" />
      <main className="min-h-0 flex-1">
        <TabuleiroContent fillHeight />
      </main>
    </div>
  )
}
