# Feiticeiros & Maldições - Fase 1: Ficha Avançada ✨

## O que foi implementado

### 🎯 Sistema de Especializações (Classes)
**Arquivo**: `src/components/EspecializacaoComponent.tsx`

6 especializações totalmente funcionais:
- **Lutador**: Combate corpo a corpo com sistema de Empolgação (PE temporário)
- **Especialista em Combate**: Balanceado entre técnicas e combate
- **Especialista em Técnica**: Maior pool de PE, foco em feitiços
- **Controlador**: Gerencia Shikigamis e Corpos Amaldiçoados
- **Suporte**: Cura e buffs para aliados
- **Restringido**: Sem energia amaldiçoada, usa Estamina

**Features**:
- Cálculo automático de PV e PE baseado na classe e nível
- PV = (Base da Classe + Mod. CON) + ((Nível - 1) × (Base + Mod. CON))
- PE/Estamina = Base da Classe × Nível
- Campo de Empolgação para Lutadores
- Botão de gestão de invocações para Controladores (preparado para expansão)

### ⚡ Builder de Técnica Amaldiçoada
**Arquivo**: `src/components/TecnicaBuilder.tsx`

Sistema completo de criação de técnicas customizadas:

**Estrutura da Técnica**:
- Nome e descrição temática
- Funcionamento Básico (texto livre para as regras gerais)
- Lista de Feitiços individuais

**Cada Feitiço possui**:
- Nome e custo de PE
- Sistema de dano configurável:
  - Quantidade de dados (ex: 3d8)
  - Tipo de dado (d4, d6, d8, d10, d12, d20)
  - Modificador (texto livre: "Inteligência", "Potência", "+5")
  - Tipo de dano opcional (ex: "Cortante", "Fogo", "Energia Amaldiçoada")
- Alcance (ex: "9m", "30m", "Toque", "Pessoal")
- Tipo de Ação (Ação, Ação Bônus, Reação, Ação Livre, Ação Completa)
- Área de Efeito opcional (Cone, Linha, Cilindro, Esfera, Cubo)
- Descrição e efeitos especiais

**UI Features**:
- Cards expansíveis para cada feitiço
- Modo de visualização vs modo de edição
- Formatação automática de dano (ex: "3d8 + Inteligência (Fogo)")
- Interface drag-free para facilitar uso

### 📊 Sistema de XP e Progressão
**Arquivo**: `src/components/XPIntegridade.tsx`

**XP (Experiência)**:
- Rastreamento de XP atual
- Tabela completa de XP por nível (1-20)
- Barra de progresso visual
- Botão de "Level Up" quando XP suficiente é atingido
- Indicador de nível máximo (20)

**Integridade da Alma**:
- Sistema separado de PV para dano à alma
- Valor máximo sempre igual ao PV máximo
- Atualização automática quando PV muda
- Barra de progresso com cores:
  - Verde: Saudável (>50%)
  - Amarelo: Machucado (25-50%)
  - Vermelho: Crítico (<25%)
- Aviso visual quando em perigo crítico

### 🗂️ Novos Tipos TypeScript
**Arquivo**: `src/types/especializacao.ts`

Tipos completos para:
- `Especializacao` - Enum das 6 classes
- `DadosEspecializacao` - Dados da classe escolhida
- `XPData` - Sistema de experiência
- `IntegridadeAlma` - Sistema de dano à alma
- `TecnicaAmaldicada` - Estrutura da técnica
- `Feitico` - Estrutura de cada feitiço
- `DadoDano` - Sistema de dados de dano
- `TipoAcao` - Tipos de ação do sistema
- `AreaEfeito` - Geometria de áreas de efeito
- `EstoqueInvocacao` - Para Controladores (preparado)
- `InventarioSlot` - Slots de inventário (preparado)

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── EspecializacaoComponent.tsx    (NOVO)
│   ├── TecnicaBuilder.tsx             (NOVO)
│   ├── XPIntegridade.tsx              (NOVO)
│   ├── [componentes existentes...]
│   └── ui/
│       └── [componentes Radix UI...]
├── pages/
│   ├── FichaPersonagem.tsx            (original)
│   └── FichaPersonagemV2.tsx          (NOVO - versão com Fase 1)
├── types/
│   ├── especializacao.ts              (NOVO)
│   ├── ficha.ts                       (atualizado)
│   └── supabase.ts                    (atualizado)
└── lib/
    └── utils.ts                       (existente)
```

## 🚀 Como Usar

### 1. Escolher Especialização
Na ficha de personagem, selecione a especialização desejada. O sistema automaticamente:
- Calculará PV e PE baseado no nível e constituição
- Mostrará recursos específicos (Empolgação para Lutador, etc.)
- Atualizará os valores máximos de recursos

### 2. Criar Técnica Amaldiçoada
No card "Builder de Técnica Amaldiçoada":
1. Dê um nome à sua técnica (ex: "Manipulação de Sombras")
2. Escreva a descrição temática
3. Explique o funcionamento básico no campo de texto
4. Clique em "Novo Feitiço" para cada ataque/poder
5. Configure dano, alcance, custo de PE para cada feitiço
6. Use os cards expansíveis para visualizar ou editar

### 3. Gerenciar XP
- Insira o XP ganho nas sessões
- Quando atingir o necessário para o próximo nível, clique em "SUBIR PARA NÍVEL X"
- O sistema recalculará automaticamente PV, PE e Integridade da Alma

### 4. Rastrear Integridade da Alma
- Use o campo "Integridade Atual" para dano à alma
- O máximo é sempre igual ao PV Máximo
- Fique atento aos avisos visuais em situações críticas

## 💾 Persistência no Supabase

Todos os novos dados são salvos automaticamente no Supabase:
- `especializacao`: Classe e valores base
- `xp`: XP atual e próximo nível
- `integridade`: Integridade da alma atual e máxima
- `tecnicaAmaldicada`: Técnica completa com todos os feitiços

## 🔄 Integração com Sistema Existente

A Fase 1 se integra perfeitamente com o sistema existente:
- ✅ Cálculo automático de Defesa mantido
- ✅ Sistema de Aptidões Amaldiçoadas preservado
- ✅ Rastreador de Recursos (PV/PE) atualizado
- ✅ Sistema de Perícias inalterado
- ✅ Inventário funcional
- ✅ Tela do Mestre não afetada

## 📋 Próximas Fases

### Fase 2: Tabuleiro Virtual (VTT Core)
- Grid tático com medição em metros (1 quadrado = 1,5m)
- Sistema de tokens para personagens e maldições
- Ferramentas de medição (réguas, gabaritos de área)
- Camadas (Mestre, Tokens, Mapa)
- Névoa de guerra
- Indicadores de status visuais

### Fase 3: Melhorias da Tela do Mestre
- Gerenciador de iniciativa aprimorado com drag-and-drop
- Bestiário rápido expandido
- Painel de regras rápidas (CDs, dano por queda, etc.)
- Sistema de Votos de Restrição

### Fase 4: Funcionalidades Avançadas
- Sistema de Interlúdios (treino, criação de itens)
- Gestão completa de Invocações para Controladores
- Efeitos visuais de Expansão de Domínio
- Compêndio digital de talentos e itens

## 🎨 Design e Estética

Mantém o tema Dark Fantasy/Jujutsu Kaisen:
- Paleta: Roxo (#8832ff), Vermelho (#e94560), Preto (#1a1a2e)
- Fontes: Inter (corpo), Rajdhani (títulos)
- Animações sutis e transições suaves
- Cards com bordas neon e sombras coloridas

## 🐛 Observações Técnicas

- Todos os componentes são TypeScript com tipagem forte
- React Hooks modernos (useState, useMemo, useCallback)
- Validação de dados em tempo real
- Performance otimizada com memoização
- Compatível com Tailwind CSS v4
- Suporte a Radix UI para acessibilidade

## 📞 Suporte

Para dúvidas ou sugestões sobre a implementação:
- Verifique os comentários no código
- Consulte os tipos em `src/types/especializacao.ts`
- Revise os exemplos de uso em `FichaPersonagemV2.tsx`

---

**Versão**: 2.5 (Fase 1 completa)
**Data**: Fevereiro 2026
**Status**: ✅ Pronto para testes
