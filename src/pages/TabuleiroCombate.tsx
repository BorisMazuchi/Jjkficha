import { useState, useEffect, useCallback } from "react"
import { TabuleiroContent } from "@/components/vtt/TabuleiroContent"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { carregarSessao, salvarSessao } from "@/lib/sessaoDb"
import type { SessaoCarregada } from "@/lib/sessaoDb"

export function TabuleiroCombate() {
  const [sessao, setSessao] = useState<SessaoCarregada | null>(null)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    let cancelled = false
    carregarSessao().then((s) => {
      if (!cancelled) {
        setSessao(s ?? null)
        setCarregado(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const onMoveEntry = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      if (!sessao) return
      const nova = {
        ...sessao,
        entradas: sessao.entradas.map((e) =>
          e.id === id ? { ...e, posicao: pos } : e
        ),
      }
      setSessao(nova)
      salvarSessao(nova)
    },
    [sessao]
  )

  const onSelectTurn = useCallback(
    (index: number) => {
      if (!sessao) return
      const nova = { ...sessao, turnoAtual: index }
      setSessao(nova)
      salvarSessao(nova)
    },
    [sessao]
  )

  const entradas = sessao?.entradas ?? []
  const turnoAtual = sessao?.turnoAtual ?? 0

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--color-bg-page)]">
      <SiteHeader title="TABULEIRO" subtitle="Grid de combate — sincronizado com a sessão do Mestre" />
      <main className="min-h-0 flex-1">
        <TabuleiroContent
          fillHeight
          entradas={carregado ? entradas : []}
          turnoAtual={turnoAtual}
          onMoveEntry={onMoveEntry}
          onSelectTurn={onSelectTurn}
        />
      </main>
    </div>
  )
}
