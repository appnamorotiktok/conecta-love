-- ============================================================
-- ConectaLove — Correcao: impedir auto-curtida / auto-match
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- A tela do app ja exclui o proprio usuario da lista de candidatos
-- do feed, entao isso nunca acontecia por ali. Mas nada no banco
-- impedia alguem de inserir um "like" pra si mesmo via chamada
-- direta a API, o que geraria um "match" consigo mesmo. Adiciona
-- a trava no proprio banco, defesa em profundidade.
-- ============================================================

alter table public.likes
  add constraint likes_no_self_like check (liker_id <> liked_id);

alter table public.matches
  add constraint matches_no_self_match check (user_a <> user_b);
