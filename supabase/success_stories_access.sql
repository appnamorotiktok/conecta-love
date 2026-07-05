-- ============================================================
-- ConectaLove — Acesso pras historias de sucesso
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

-- Permite que qualquer um dos dois do match crie o registro inicial
-- da historia de sucesso (nao existia policy de insert pra essa tabela).
drop policy if exists "success_stories_insert_own" on public.success_stories;
create policy "success_stories_insert_own" on public.success_stories
  for insert to authenticated with check (
    exists (
      select 1 from public.matches m
      where m.id = success_stories.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- Admin ve todas as historias prontas (pra pegar o material e repassar
-- pro influenciador, ate a tela dele existir de verdade).
drop policy if exists "success_stories_select_admin" on public.success_stories;
create policy "success_stories_select_admin" on public.success_stories
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "success_story_confirmations_select_admin" on public.success_story_confirmations;
create policy "success_story_confirmations_select_admin" on public.success_story_confirmations
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
