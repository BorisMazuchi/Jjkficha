# 🚀 Guia de Instalação - Fase 1

Este guia explica como integrar os novos componentes da Fase 1 no projeto existente de Feiticeiros & Maldições.

## 📦 Arquivos Fornecidos

```
fase1/
├── FASE1_README.md          (documentação completa)
└── src/
    ├── components/
    │   ├── EspecializacaoComponent.tsx
    │   ├── TecnicaBuilder.tsx
    │   └── XPIntegridade.tsx
    ├── types/
    │   ├── especializacao.ts
    │   ├── ficha.ts (atualizado)
    │   └── supabase.ts (atualizado)
    ├── pages/
    │   └── FichaPersonagemV2.tsx
    └── lib/
        └── utils.ts
```

## 🔧 Opção 1: Substituir a Ficha Atual (Recomendado)

Esta opção substitui completamente a ficha atual pela versão com todos os recursos da Fase 1.

### Passos:

1. **Backup do projeto atual**
   ```bash
   git commit -am "Backup antes da Fase 1"
   # ou copie a pasta do projeto para um local seguro
   ```

2. **Copiar os novos componentes**
   ```bash
   # Da pasta onde você extraiu os arquivos
   cp -r fase1/src/components/* seu-projeto/src/components/
   cp -r fase1/src/types/* seu-projeto/src/types/
   cp -r fase1/src/lib/utils.ts seu-projeto/src/lib/
   ```

3. **Substituir a página principal**
   ```bash
   # Fazer backup da versão atual
   cp seu-projeto/src/pages/FichaPersonagem.tsx seu-projeto/src/pages/FichaPersonagem.backup.tsx
   
   # Copiar nova versão
   cp fase1/src/pages/FichaPersonagemV2.tsx seu-projeto/src/pages/FichaPersonagem.tsx
   ```

4. **Testar**
   ```bash
   npm run dev
   ```
   
   Acesse `http://localhost:5173` e verifique se:
   - ✅ Seletor de Especialização aparece
   - ✅ XP e Integridade da Alma funcionam
   - ✅ Builder de Técnica Amaldiçoada é exibido

## 🔀 Opção 2: Manter Ambas as Versões

Esta opção mantém a ficha original e adiciona uma nova rota para a versão V2.

### Passos:

1. **Copiar os novos arquivos**
   ```bash
   cp -r fase1/src/components/* seu-projeto/src/components/
   cp -r fase1/src/types/* seu-projeto/src/types/
   cp -r fase1/src/lib/utils.ts seu-projeto/src/lib/
   cp fase1/src/pages/FichaPersonagemV2.tsx seu-projeto/src/pages/
   ```

2. **Atualizar o App.tsx**
   ```typescript
   import { BrowserRouter, Routes, Route } from "react-router-dom"
   import { FichaPersonagem } from "@/pages/FichaPersonagem"
   import { FichaPersonagemV2 } from "@/pages/FichaPersonagemV2"  // NOVO
   import { TelaMestre } from "@/pages/TelaMestre"

   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<FichaPersonagem />} />
           <Route path="/v2" element={<FichaPersonagemV2 />} />  {/* NOVO */}
           <Route path="/mestre" element={<TelaMestre />} />
         </Routes>
       </BrowserRouter>
     )
   }

   export default App
   ```

3. **Adicionar link para V2**
   
   Em `src/pages/FichaPersonagem.tsx`, adicione um link no header:
   ```tsx
   <Link
     to="/v2"
     className="text-sm text-slate-400 hover:text-cyan-400"
   >
     🔥 Testar Ficha V2 (Fase 1)
   </Link>
   ```

4. **Testar ambas as versões**
   - Ficha original: `http://localhost:5173/`
   - Ficha V2 (Fase 1): `http://localhost:5173/v2`

## 🗄️ Atualizar Schema do Supabase (Obrigatório)

Os novos campos precisam ser adicionados ao banco de dados. Execute no SQL Editor do Supabase:

```sql
-- Não é necessário alterar a estrutura da tabela, pois usamos JSONB
-- Mas é bom criar índices para performance

-- Criar índices para os novos campos JSONB (opcional mas recomendado)
CREATE INDEX IF NOT EXISTS idx_fichas_especializacao 
  ON fichas ((dados->'especializacao'->>'especializacao'));

CREATE INDEX IF NOT EXISTS idx_fichas_nivel 
  ON fichas ((dados->'cabecalho'->>'nivel')::int);

-- Comentário útil
COMMENT ON COLUMN fichas.dados IS 'Dados da ficha em JSON. 
Novos campos da Fase 1: 
- especializacao (classe do personagem)
- xp (experiência)
- integridade (integridade da alma)
- tecnicaAmaldicada (técnica custom do jogador)';
```

## 📝 Checklist de Integração

Antes de considerar a instalação completa, verifique:

- [ ] Todos os arquivos foram copiados para os lugares corretos
- [ ] `npm install` executado (se necessário)
- [ ] Projeto compila sem erros (`npm run build`)
- [ ] Servidor de desenvolvimento inicia (`npm run dev`)
- [ ] Seletor de Especialização funciona
- [ ] Cálculo automático de PV/PE funciona
- [ ] Sistema de XP e Level Up funciona
- [ ] Integridade da Alma sincroniza com PV
- [ ] Builder de Técnica permite criar/editar feitiços
- [ ] Cards de feitiços expandem/contraem
- [ ] Dados salvam no Supabase
- [ ] Dados carregam do Supabase

## 🐛 Resolução de Problemas

### Erro: "Cannot find module '@/types/especializacao'"
**Solução**: Verifique se o arquivo `src/types/especializacao.ts` foi copiado corretamente.

### Erro: "Property 'especializacao' does not exist"
**Solução**: Certifique-se de que o `src/types/supabase.ts` foi atualizado com a nova versão.

### Componentes não renderizam
**Solução**: 
1. Verifique se todos os componentes UI estão instalados: `npm install @radix-ui/react-label @radix-ui/react-select lucide-react`
2. Limpe o cache: `rm -rf node_modules/.vite && npm run dev`

### PV/PE não calculam automaticamente
**Solução**: Certifique-se de que a função `onRecursosCalculados` está sendo chamada no `EspecializacaoComponent`.

### Dados não salvam no Supabase
**Solução**: 
1. Verifique suas variáveis de ambiente `.env`
2. Confirme que o usuário tem permissões no Supabase
3. Verifique o console do navegador para erros de rede

## 🎯 Próximos Passos

Após a instalação bem-sucedida da Fase 1:

1. **Teste Extensivamente**: Crie várias fichas com diferentes especializações
2. **Documente Bugs**: Anote qualquer comportamento inesperado
3. **Customize**: Ajuste os valores de PV/PE por classe se necessário
4. **Prepare para Fase 2**: Leia sobre o Tabuleiro Virtual que será implementado

## 📚 Recursos Adicionais

- **README Completo**: Veja `FASE1_README.md` para documentação detalhada
- **Tipos TypeScript**: Consulte `src/types/especializacao.ts` para referência de tipos
- **Exemplo de Uso**: Veja `FichaPersonagemV2.tsx` como referência de implementação

## 💡 Dicas

- Mantenha a versão V1 por algum tempo para comparação
- Use o console do navegador (F12) para debug
- Exporte/importe fichas para testar persistência
- Experimente com diferentes combinações de especialização e técnicas

---

**Desenvolvido com ❤️ para Feiticeiros & Maldições**

Dúvidas? Consulte o `FASE1_README.md` ou revise o código-fonte dos componentes.
