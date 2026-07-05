-- ============================================================
-- ConectaLove — Realtime do chat
-- ============================================================
-- Rode isso no SQL Editor do Supabase, depois do schema.sql.
-- ============================================================

-- Habilita Realtime na tabela de mensagens (necessario pro chat
-- atualizar sozinho quando chega mensagem nova, sem recarregar a pagina).
alter publication supabase_realtime add table public.messages;

-- Permite marcar mensagem como lida (update de read_at) por quem
-- participa da conversa (esse policy nao existia ainda no schema.sql).
create policy "messages_update_read" on public.messages
  for update to authenticated using (
    exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = messages.conversation_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );
