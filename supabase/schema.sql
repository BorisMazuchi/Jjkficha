-- Schema para Feiticeiros & Maldições - Ficha de Personagem
-- Execute este SQL no SQL Editor do Supabase (Dashboard > SQL Editor)

-- Tabela de fichas
create table if not exists fichas (
  id uuid primary key default gen_random_uuid(),
  nome_personagem text not null default '',
  jogador text not null default '',
  dados jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice para buscar por jogador ou nome
create index if not exists idx_fichas_jogador on fichas(jogador);
create index if not exists idx_fichas_nome on fichas(nome_personagem);
create index if not exists idx_fichas_updated on fichas(updated_at desc);

-- Trigger para atualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fichas_updated_at on fichas;
create trigger fichas_updated_at
  before update on fichas
  for each row
  execute function update_updated_at();

-- RLS (Row Level Security) - desabilitado por padrão para facilitar testes
-- Habilite e configure policies quando adicionar autenticação

alter table fichas enable row level security;

-- Permite leitura e escrita para todos (adequado para MVP sem auth)
-- Quando adicionar Supabase Auth, substitua por policies que usem auth.uid()

create policy "Permitir leitura pública" on fichas
  for select using (true);

create policy "Permitir inserção pública" on fichas
  for insert with check (true);

create policy "Permitir atualização pública" on fichas
  for update using (true);

create policy "Permitir exclusão pública" on fichas
  for delete using (true);

-- Tabela da sessão do mestre (party, iniciativa, maldições, log)
create table if not exists sessao_mestre (
  id uuid primary key default gen_random_uuid(),
  dados jsonb not null default '{}',
  updated_at timestamptz default now()
);

drop trigger if exists sessao_mestre_updated_at on sessao_mestre;
create trigger sessao_mestre_updated_at
  before update on sessao_mestre
  for each row
  execute function update_updated_at();

alter table sessao_mestre enable row level security;

create policy "Permitir leitura pública" on sessao_mestre for select using (true);
create policy "Permitir inserção pública" on sessao_mestre for insert with check (true);
create policy "Permitir atualização pública" on sessao_mestre for update using (true);
create policy "Permitir exclusão pública" on sessao_mestre for delete using (true);

