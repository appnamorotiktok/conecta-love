-- ============================================================
-- ConectaLove — Vincular um influenciador a uma conta de login
-- ============================================================
-- Rode isso no SQL Editor toda vez que cadastrar um influenciador
-- novo no admin. O influenciador precisa primeiro criar uma conta
-- normal (mesma tela de login/cadastro do app), e so depois voce
-- roda isso pra vincular o registro dele ao painel.
--
-- Troque os dois valores abaixo pelos corretos antes de rodar:
-- ============================================================

update public.influencers
set user_id = (select id from auth.users where email = 'EMAIL_DO_INFLUENCIADOR@exemplo.com')
where referral_code = 'CODIGO_DO_INFLUENCIADOR';
