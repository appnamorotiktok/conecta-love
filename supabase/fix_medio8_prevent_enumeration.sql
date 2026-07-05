-- ============================================================
-- ConectaLove — Correcao do Medio 8 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: as views "public_profile_lookup" e
-- "public_influencer_lookup" (criadas nas correcoes do Critico 1 e
-- Alto 4) escondem os dados sensiveis certos, mas ainda podem ser
-- consultadas SEM FILTRO (ex: "select * from public_profile_lookup"
-- sem "where"), retornando o token de convite de TODOS os usuarios
-- de uma vez. Combinado com a insercao livre de recomendacoes
-- (sem exigir login), isso permite enumerar todo mundo e mandar
-- spam em massa.
--
-- Correcao: troca as views por funcoes que exigem o valor exato
-- (token ou codigo) como parametro — nao da pra "listar tudo",
-- só consultar um de cada vez, e só quem ja tem o link/codigo
-- especifico consegue uma resposta.
-- ============================================================

drop view if exists public.public_profile_lookup;
drop view if exists public.public_influencer_lookup;

create or replace function public.get_profile_by_invite_token(token uuid)
returns table (id uuid, full_name text)
language sql
security definer
set search_path = public
stable
as $$
  select id, full_name from public.profiles where invite_token = token;
$$;

grant execute on function public.get_profile_by_invite_token(uuid) to anon, authenticated;

create or replace function public.get_influencer_by_referral_code(code text)
returns table (id uuid, name text, referral_code text, status text)
language sql
security definer
set search_path = public
stable
as $$
  select id, name, referral_code, status
  from public.influencers
  where referral_code = code and status = 'active';
$$;

grant execute on function public.get_influencer_by_referral_code(text) to anon, authenticated;

-- protecao extra na propria tabela de recomendacoes: limite de
-- tamanho, defesa adicional contra flood de texto gigante
alter table public.recommendations
  add constraint recommendations_message_length check (char_length(message) <= 1000),
  add constraint recommendations_name_length check (char_length(recommender_name) <= 200);
