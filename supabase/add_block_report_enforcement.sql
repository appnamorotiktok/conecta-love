-- ============================================================
-- ConectaLove — Bloqueio e denuncia com efeito real
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- As tabelas "blocked_users" e "reports" ja existiam, mas nao tinham
-- botao na tela, e bloquear alguem nao impedia novas mensagens.
-- Este script adiciona a checagem de bloqueio na hora de enviar
-- mensagem (nao muda nada de fora do necessario).
-- ============================================================

create or replace function public.users_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocked_users
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = messages.conversation_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
      and not public.users_blocked(m.user_a, m.user_b)
    )
  );
