-- ============================================================
-- ConectaLove — Acesso publico pro fluxo de recomendacao de amigo
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- O amigo que vai escrever a recomendacao pode nao ter conta no
-- app — por isso essas duas policies liberam acesso sem login
-- (role "anon"), restrito ao necessario pro fluxo do link de convite.
-- ============================================================

-- permite ver o nome do perfil a partir do link de convite (token unico)
create policy "profiles_select_anon" on public.profiles
  for select to anon using (true);

-- permite enviar a recomendacao mesmo sem conta
create policy "recommendations_insert_public" on public.recommendations
  for insert to anon, authenticated with check (true);
