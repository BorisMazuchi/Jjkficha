# Roadmap VTT — Feiticeiros & Maldições (Projeto Onigiri)

Documento que alinha o **prompt de especificação** do Livro de Regras ao estado atual do código e às próximas prioridades.

---

## 1. Visão geral e estética

| Especificação | Status | Onde / Observação |
|---------------|--------|-------------------|
| Tema Dark Fantasy/Moderno (JK) | ✅ | `index.css`: `--color-accent-purple`, `--color-bg-dark`, scrollbar roxa |
| Paleta escura, roxo, preto, “energia amaldiçada” | ✅ | Uso de `#8832ff`, `#0a0e14`, `#e94560` no app e VTT |
| Suporte múltiplas salas | ⏳ | Supabase presente; salas/convites ainda não implementados |

---

## 2. Módulo: Ficha de personagem interativa

| Especificação | Status | Onde / Observação |
|---------------|--------|-------------------|
| Nome, Nível (1–20), Grau (4º–Especial), XP | ✅ | `CabecalhoFicha`, `FichaPersonagem`; XP em `EspecializacaoComponent` / `XPIntegridade` |
| Atributos (FOR, DES, CON, INT, SAB, Presença) + modificadores | ✅ | `AtributosDefesa`; spec usa “Presença” = `carisma` no código |
| PV por Especialização + Constituição | ✅ | Cálculo em `EspecializacaoComponent` (pvPorNivel + CON) |
| PE / Estamina (Restringido) | ✅ | `RecursosBarra`, `DadosEspecializacao.pePorNivel`, `usaEstamina` |
| **Defesa:** 10 + Mod DES + **metade do nível** + bônus | ⚠️ | Fórmula atual: 10 + Mod DES + bônus; falta **+ metade do nível** em `AtributosDefesa` |
| **Integridade da Alma** = PV máx., rastreamento separado | ⏳ | Tipo em `especializacao.ts`; UI dedicada ainda não integrada na ficha principal |
| **Atenção:** 10 + Percepção + bônus | ⏳ | Não calculado; depende de Percepção (perícia) |
| Especializações (Lutador… Restringido) | ✅ | `EspecializacaoComponent`, abas Empolgação / Estoque Invocações |
| **Builder de Técnica Amaldiçada** (texto livre + feitiços) | ✅ | `TecnicaBuilder`: funcionamento básico + feitiços com custo PE, dano (dados), alcance, tipo de ação |
| Inventário (slots, armas, ferramentas amaldiçadas) | ✅ | `InventarioAmaldicado`, tipos em `ficha.ts` / `especializacao.ts` |

---

## 3. Módulo: Tabuleiro virtual (VTT)

| Especificação | Status | Onde / Observação |
|---------------|--------|-------------------|
| Grid 1 quadrado = 1,5 m | ✅ | `vttUtils.ts`: conversão metros/quadrados |
| Terreno difícil (custo dobrado) | ⚠️ | `GridCell.terreno: 'dificil'` existe; custo na movimentação não aplicado |
| Réguas e gabaritos (cone, linha, cilindro, esfera) | ✅ | `GridCanvas` + `Measurement`, ferramentas em `VTTControls` |
| Camadas (Mestre, Tokens, Mapa) | ✅ | `Camada`, `camadas` em `GridCanvas` / `TabuleiroCombate` |
| Fog of War | ✅ | `desenharFogOfWar`, revelar/esconder |
| Iluminação dinâmica | ⏳ | Não implementado |
| Indicadores de status (condições + rodadas) | ✅ | `Token.condicoes`, `PainelCondicoes`; contador de rodadas pode ser expandido no token |

---

## 4. Módulo: Tela do mestre

| Especificação | Status | Onde / Observação |
|---------------|--------|-------------------|
| Gerenciador de iniciativa (rolagem DES, ordenação) | ✅ | `InitiativeTracker`, sincronização com party/maldições |
| Bestiário rápido (Maldições/NPCs por Grau) | ✅ | `QuickBestiary` |
| **Painel de regras rápidas** (CDs, dano externo, ferimentos) | ✅ | Novo: `PainelRegrasRapidas` |
| **Controle de Votos de Restrição** | ✅ | Novo: `ControleVotos` |
| Modo “Expansão de Domínio” (efeito visual) | ✅ | Botão “Modo de Pânico” + `dominio-pulse` em `index.css` |

---

## 5. Funcionalidades específicas do sistema

| Especificação | Status | Onde / Observação |
|---------------|--------|-------------------|
| **Rolador de dados** (d4–d20, vantagem/desvantagem, crítico) | ✅ | Novo: `DiceRoller` reutilizável |
| Sistema de interlúdios (entre missões) | ⏳ | Não implementado; página dedicada sugerida |
| Gestão de invocações (Controlador) | ✅ | `EstoqueInvocacao`, aba em `EspecializacaoComponent` |
| Expansão de domínio (efeito no tabuleiro) | ⏳ | Apenas visual na Tela Mestre; efeito no VTT (acerto garantido, etc.) não implementado |
| **Compêndio digital** (talentos, itens, regras) | ⏳ | Não implementado; rota `/compendio` sugerida |

---

## 6. Compêndio digital

- **Biblioteca pesquisável** de Talentos, Itens Amaldiçoados, Modificações de Uniforme, Regras de Combate.
- Prioridade: após consolidar ficha, VTT e tela do mestre.

---

## Prioridades de implementação (sugeridas)

1. **Ficha:** Incluir **metade do nível** na Defesa; exibir **Integridade da Alma** e **Atenção** onde fizer sentido.
2. **VTT:** Aplicar custo dobrado para terreno difícil na movimentação.
3. **Mestre:** Regras rápidas e Votos integrados (feito); rolagem de iniciativa automática (Mod. DES) se ainda não estiver.
4. **Rolador:** Componente único usado na ficha, mestre e (futuro) compêndio.
5. **Interlúdios:** Página “Entre missões” com focos (Treino, Criar itens, Invocações) e testes de Ofício.
6. **Compêndio:** Estrutura de dados + página pesquisável.

---

## Modularidade (instrução da spec)

- **Técnica Amaldiçada:** Manter `TecnicaBuilder` com texto livre no funcionamento básico e feitiços com seletores de dano (dados + modificador), alcance e tipo de ação.
- Novos módulos (Rolador, Regras Rápidas, Votos, Interlúdios, Compêndio) devem ser componentes/páginas isolados e reutilizáveis.
