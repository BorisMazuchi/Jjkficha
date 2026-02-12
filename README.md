# Feiticeiros & Maldições — Plataforma de Gestão de Fichas

Web app responsivo para gerenciar fichas de personagem do RPG **Feiticeiros & Maldições** (Jujutsu Kaisen RPG). Design Dark Mode inspirado em Jujutsu Kaisen (roxo escuro, preto e detalhes neon).

## Deploy e Banco de Dados

- **Netlify** — hospedagem e deploy automático
- **Supabase** — banco de dados PostgreSQL para persistir fichas

## Tecnologias

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **Radix UI** (Label, Progress, Select, Slot, Tooltip)
- **Lucide React** (ícones)
- **Supabase** (PostgreSQL)

## Funcionalidades

1. **Cabeçalho da ficha** — Nome, jogador, nível (1–20), grau (4º a Especial) e origem/clã
2. **Atributos e defesa** — FOR, DES, CON, INT, SAB, CAR + cálculo automático de defesa
3. **Recursos** — Barras de PV e PE com Vida/Energia Temporária (regra v2.5: aviso visual quando excede metade do máximo)
4. **Aptidões amaldiçadas** — Aura, Controle, Fluxo e Potência (0–5)
5. **Validação de bônus** — Habilidades “Limitada pelo Nível” usam o menor valor entre bônus e nível
6. **Habilidades e técnicas** — Técnicas inatas e habilidades de classe com custo de PE
7. **Painel de perícias** — Treinamento (+nível) e especialização (+2×nível)
8. **Calculadora de Raio Negro** — Aumento automático de aptidão ao acertar Black Flash
9. **Inventário amaldiçoado** — Ferramentas (Grau 4 a Especial) com dano e propriedades

## Cores do tema

- Fundo: `#1a1a2e`
- Cards: `#16213e`
- Destaques/botões: `#e94560` ou `#8832ff`
- Tipografia: Inter e Rajdhani

## Configuração Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute o conteúdo de `supabase/schema.sql` (cria tabelas `fichas` e `sessao_mestre`)
3. Em **Settings > API**, copie a **Project URL** e a **anon public** key
4. Crie um arquivo `.env` na raiz (use `.env.example` como base):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Deploy no Netlify

1. Faça push do repositório para GitHub/GitLab/Bitbucket
2. Conecte o repositório no [Netlify](https://app.netlify.com)
3. O `netlify.toml` já define `build` e `publish`
4. Em **Site settings > Environment variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Faça o deploy

## Como rodar localmente

```bash
npm install
cp .env.example .env   # Edite .env com as credenciais do Supabase
npm run dev
```

## Build

```bash
npm run build
```

## Licença

Uso educacional / privado.
