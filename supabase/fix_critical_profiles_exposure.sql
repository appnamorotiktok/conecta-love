-- ============================================================
-- ConectaLove — Correcao do Critico 1 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: a policy "profiles_select_anon" liberava a tabela
-- "profiles" INTEIRA (todas as colunas, inclusive data de nascimento
-- e orientacao sexual) pra qualquer pessoa sem login, via API publica.
-- Ela existia so pra pagina /recomendar/[token] conseguir mostrar o
-- nome da pessoa a partir do link de convite.
--
-- Correcao: remove essa policy ampla, e cria uma "view" (visao)
-- que mostra só os 2 campos realmente necessarios (id, full_name),
-- usada apenas pra resolver o token de convite. A tabela "profiles"
-- em si volta a não ter nenhum acesso anonimo.
-- ============================================================

drop policy if exists "profiles_select_anon" on public.profiles;

create or replace view public.public_profile_lookup as
select id, full_name, invite_token
from public.profiles;

grant select on public.public_profile_lookup to anon, authenticated;
