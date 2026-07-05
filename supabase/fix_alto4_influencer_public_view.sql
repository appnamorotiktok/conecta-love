-- ============================================================
-- ConectaLove — Correcao do Alto 4 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: a policy "influencers_select_public" libera TODAS as
-- colunas da tabela (inclusive "pix_key" e "commission_rate") pra
-- qualquer pessoa, mesmo sem login, quando o influenciador esta
-- ativo. Hoje nenhum pix_key esta preenchido, mas a regra ja fica
-- certa antes de precisar, evitando esquecer disso depois.
--
-- Correcao: remove a policy ampla e cria uma "view" (visao) publica
-- só com os campos realmente necessarios pro link de convite
-- funcionar (nome, codigo, status) — nunca pix_key ou comissao.
-- ============================================================

drop policy if exists "influencers_select_public" on public.influencers;

create or replace view public.public_influencer_lookup as
select id, name, referral_code, status
from public.influencers;

grant select on public.public_influencer_lookup to anon, authenticated;
