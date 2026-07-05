-- ============================================================
-- ConectaLove — Link de referencia do influenciador
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

-- Qualquer pessoa (mesmo sem conta) pode ver nome/codigo de um
-- influenciador ativo — necessario pra pagina de convite (/r/[code])
-- e pra resolver o codigo no cadastro (onboarding).
drop policy if exists "influencers_select_public" on public.influencers;
create policy "influencers_select_public" on public.influencers
  for select to anon, authenticated using (status = 'active');

-- Admin ve todos os influenciadores (inclusive pausados) e pode cadastrar novos.
drop policy if exists "influencers_select_admin" on public.influencers;
create policy "influencers_select_admin" on public.influencers
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "influencers_insert_admin" on public.influencers;
create policy "influencers_insert_admin" on public.influencers
  for insert to authenticated with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
