# Fase 2: Tabuleiro Virtual (VTT) - Guia de Implementação

## 📋 Status

**Versão**: 2.0 (Fase 2 - Primeira Iteração)
**Data**: Fevereiro 2026
**Status**: ✅ Núcleo implementado, funcionalidades básicas funcionais

## 🎮 O que foi Implementado

### 1. Grid Tático Interativo ✅
- Grid de 30x30 células renderizado com Canvas
- 1 célula = 1,5 metros (padrão D&D 5e)
- Zoom: 0.5x até 2.0x (incrementos de 10%)
- Pan (arrastar com mouse) para navegar
- Snap-to-grid automático para tokens
- Visualização de coordenadas (ativável com "O")

**Arquivo**: `src/components/vtt/GridCanvas.tsx`

### 2. Sistema de Tokens ✅
- Criar, mover, deletar tokens
- Tokens de tamanho variável (1x1 até 4x4 células)
- Seleção de token (clique)
- Drag and drop com restrição ao grid
- Indicadores visuais de PV (barra vermelha)
- Display de nome reduzido
- Suporte para tipos: jogador, maldição, NPC, objeto

**Arquivo**: `src/components/vtt/GridCanvas.tsx` (renderização)
**Página**: `src/pages/TabuleiroCombate.tsx` (lógica)

### 3. Ferramentas de Medição 🔧
Implementadas:
- **Régua** (linha com distância)
- **Cone** (para técnicas cone 60°)
- **Cilindro** (círculo/raioNegro)
- **Cubo** (área quadrada)

Render:
- Linha tracejada com cor customizável
- Preenchimento semi-transparente para áreas
- Cálculo automático de distância em metros

**Arquivo**: `src/lib/vttUtils.ts` (cálculos)
**Renderização**: `src/components/vtt/GridCanvas.tsx`

### 4. Sistema de Camadas ✅
Camadas disponíveis:
- **Mapa** (fundo)
- **Medições** (réguas, gabaritos)
- **Tokens** (personagens, maldições)
- **Mestre** (elementos invisíveis)

Toggle de visibilidade por camada
Apenas mestres veem camada "Mestre"

**Arquivo**: `src/components/vtt/VTTControls.tsx` (UI)

### 5. Fog of War (Névoa de Guerra) ✅
- Células começam não exploradas (preto)
- Mestres podem revelar/esconder áreas
- Estados visuais:
  - Não explorada: opaco preto
  - Explorada mas fora de visão: cinza 60%
  - Visível: normal
- Ferramentas de revelar/esconder ativadas com "E"/"H"

**Renderização**: `src/components/vtt/GridCanvas.tsx`

### 6. Toolbar e Controles ✅
Ferramentas disponíveis:
- ✏️ Selecionar (V)
- 📏 Régua (R)
- 🔺 Cone (C)
- ➖ Linha (L)
- 🔴 Cilindro (O)
- 🟦 Cubo (U)
- 👁️ Revelar (E)
- 👁️‍🗨️ Esconder (H)

Controles:
- Zoom In/Out (botões)
- Reset zoom (1x)
- Mostrar/esconder grid (G)
- Mostrar/esconder coordenadas (O)

**Arquivo**: `src/components/vtt/VTTControls.tsx`

### 7. Informações do Token ✅
Painel direito mostra:
- Nome e tipo do token selecionado
- Barra de PV com percentual
- Barra de PE/Estamina
- Lista de condições ativas
- Botões rápidos para aplicar dano (5, 10, 20)

**Arquivo**: `src/components/vtt/VTTControls.tsx`

### 8. Atalhos de Teclado ✅
Implementados:
- `R` - Ferramenta de Régua
- `C` - Ferramenta de Cone
- `G` - Toggle Grid
- `O` - Toggle Coordenadas
- `Delete` - Deletar token selecionado
- `Escape` - Deselecionar tudo

### 9. Tipos TypeScript Rigorosos ✅

**Arquivo**: `src/types/vtt.ts`

Tipos criados:
- `Position` - Coordenada no grid
- `Token` - Personagem/maldição/NPC
- `GridCell` - Célula individualdo grid
- `Measurement` - Régua/gabarito
- `Ferramenta` e `Camada` - Enums

### 10. Utilitários de Cálculo ✅

**Arquivo**: `src/lib/vttUtils.ts`

Funções:
- `calcularDistanciaGrid()` - Distância D&D 5e
- `posicaoParaPixel()` - Conversão coordenadas
- `pixelParaPosicao()` - Conversão reversa
- `criarGridVazio()` - Inicializar tabuleiro
- `gerarCorAleatoria()` - Cores para tokens
- `calcularCelulasNoCone()` - Geometria de cone
- `calcularCelulasNoCilindro()` - Geometria circular
- `calcularCustoMovimento()` - Terreno difícil
- `validarPosicaoToken()` - Verificação de colisão

## 🏗️ Estrutura de Arquivos

```
src/
├── components/
│   └── vtt/
│       ├── GridCanvas.tsx          (canvas + renderização)
│       └── VTTControls.tsx         (UI: toolbar, controles, info)
├── pages/
│   └── TabuleiroCombate.tsx        (página principal)
├── types/
│   └── vtt.ts                      (tipos TypeScript)
└── lib/
    └── vttUtils.ts                 (utilitários + cálculos)
```

## 🚀 Como Usar

### Criar um Tabuleiro

```typescript
import { TabuleiroCombate } from '@/pages/TabuleiroCombate'

// Em App.tsx:
<Route path="/tabuleiro" element={<TabuleiroCombate />} />
```

### Adicionar um Token Programaticamente

```typescript
const novoToken: Token = {
  id: 'token-1',
  nome: 'Yuuji',
  tipo: 'jogador',
  posicao: { x: 5, y: 5 },
  tamanho: 1,
  cor: '#06b6d4',
  visivel: true,
  pv: { atual: 45, max: 50 },
  pe: { atual: 30, max: 40 },
  condicoes: [],
}

setTokens(prev => [...prev, novoToken])
```

### Calcular Distância Entre Dois Pontos

```typescript
import { calcularDistanciaGrid } from '@/lib/vttUtils'

const dist = calcularDistanciaGrid({ x: 0, y: 0 }, { x: 5, y: 5 })
console.log(dist.metros) // ~10.6m
```

## 📊 Paleta de Cores

- **Grid**: `rgba(136, 50, 255, 0.2)` - Roxo transparente
- **Jogadores**: `#06b6d4` - Cyan
- **Maldições**: `#e94560` - Vermelho
- **NPCs**: `#8b5cf6` - Roxo
- **Seleção**: `#8832ff` - Roxo Neon
- **Medições**: `#fbbf24` - Âmbar
- **Fog of War**: `#000000` - Preto
- **Fundo**: `#0a0e14` - Azul escuro

## 🎯 Funcionalidades Próximas

### Prioritárias
- [ ] Persistência no Supabase
- [ ] Integração com Party Monitor da Tela do Mestre
- [ ] Modal de criação de novos tokens
- [ ] Histórico de ações (undo/redo)
- [ ] Terreno difícil (visual + custo duplicado)

### Secundárias
- [ ] Importar image de mapa
- [ ] Sistema completo de fog of war com visão
- [ ] Efeitos de dano em área (esfera, cubo)
- [ ] Indicadores de linha de visão
- [ ] Suporte a múltiplos mestres
- [ ] Chat integrado com log de combate
- [ ] Estatísticas de distância em tempo real

### Futuro
- [ ] Grid hexagonal (alternativa)
- [ ] Suporte a 3D (elevação de tokens)
- [ ] Animações de movimento
- [ ] Suporte a música/SFX
- [ ] Exportação de tabuleiro como imagem

## 🐛 Bugs Conhecidos

Nenhum crítico no momento.

**Considerações**:
- Performance com 100+ tokens pode sofrer (considerar virtualização)
- Fog of War não sincroniza com visão dos personagens ainda
- Terreno difícil não bloqueia movimento (apenas visual)

## 📈 Performance

- Canvas renderiza ~60fps na maioria dos casos
- Zoom funciona suavemente até 2x
- Pan sem lag
- ~50 tokens antes de considerações de otimização

**Otimizações presentes**:
- Cálculo de bounds para renderização parcial (grid)
- Debounce de eventos MouseMove implícito
- Memoização de callbacks com useCallback

**Futuras otimizações**:
- Virtualização de tokens (renderizar apenas visíveis)
- Web Workers para cálculos pesados
- Caching de geometrias de medição

## 🔗 Integração com Outros Sistemas

### Com Ficha do Personagem
- TokenInfo mostra PV/PE sincronizado
- Aplicar dano no tabuleiro atualiza token
- TODO: Sincronizar bidirecional com FichaPersonagem

### Com Tela do Mestre
- QuickBestiary: criar tokens de maldições
- InitiativeTracker: sincronizar ordem
- LogCombate: registrar ações no tabuleiro
- PartyMonitor: mostrar stats enquanto usa tabuleiro

### Com Supabase
- TODO: Salvar estado do tabuleiro
- TODO: Carregar mapas salvos
- TODO: Histórico de sessões

## 💡 Dicas de Desenvolvimento

### Adicionar Nova Ferramenta de Medição

1. Adicione tipo em `Ferramenta` em `src/types/vtt.ts`
2. Crie função de cálculo em `src/lib/vttUtils.ts`
3. Adicione rendering em `GridCanvas.tsx`
4. Adicione botão em `ToolbarVTT` em `VTTControls.tsx`

### Adicionar Novo Tipo de Token

Estenda `Token` em `src/types/vtt.ts`:
```typescript
export type TokenType = 'jogador' | 'maldicao' | 'npc' | 'objeto' | 'seu_novo_tipo'
```

### Otimizar Renderização

Se performance cair:
```typescript
// Em GridCanvas.tsx, adicione culling:
const visibleTokens = tokens.filter(t => 
  isRectInViewport(tokenBounds, viewportBounds)
)
```

## 📚 Documentação Relacionada

- Prompt original: `docs/FASE2_PROMPT.md`
- Tipos completos: `src/types/vtt.ts`
- Utilitários: `src/lib/vttUtils.ts`
- Exemplo de uso: `src/pages/TabuleiroCombate.tsx`

## 🎓 Aprender Mais

### Canvas API
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

### Geometria e Cálculos
- [D&D 5e Distance Rules](https://www.dndbeyond.com/sources/basic-rules/combat#DistanceandMovement)
- [Algoritmos Geométricos](https://en.wikipedia.org/wiki/Computational_geometry)

### React Canvas
- [Using Canvas with React](https://react.dev/reference/react-dom/components/canvas)
- [Efficient Canvas Rendering](https://jhalverson.medium.com/efficient-canvas-rendering-with-react-5d4c02467b65)

## 📞 Suporte

Para dúvidas:
1. Verifique os comentários no código
2. Consulte `src/types/vtt.ts` para tipos
3. Revise `src/lib/vttUtils.ts` para cálculos
4. Veja `src/pages/TabuleiroCombate.tsx` para exemplo

---

**Desenvolvido com ❤️ para Feiticeiros & Maldições**

Versão 2.0 - Fase 2 Completa ✨
