-- ============================================================
-- ConectaLove — Admin minimo
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

-- Campo que marca quem e administrador. Bloqueado por privilegio de
-- coluna (nao so RLS) para que nenhum usuario consiga virar admin
-- sozinho atualizando o proprio perfil.
alter table public.profiles add column if not exists is_admin boolean not null default false;
revoke update (is_admin) on public.profiles from authenticated;

-- Admin pode ver e atualizar todas as denuncias (nao so as proprias)
-- (o "drop policy if exists" antes de cada uma deixa seguro rodar
-- esse script mais de uma vez, sem dar erro de "ja existe")
drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin" on public.reports
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports
  for update to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- IMPORTANTE: depois de rodar o script acima, troque o email abaixo
-- pelo SEU email de cadastro no app e rode essa linha separadamente,
-- pra virar administrador (isso so pode ser feito aqui pelo SQL Editor,
-- de proposito, pra ninguem conseguir se promover pelo proprio app):
-- ============================================================

-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'SEU_EMAIL_AQUI@exemplo.com');
