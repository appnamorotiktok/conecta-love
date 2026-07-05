-- ============================================================
-- ConectaLove — Correcao do Alto 3 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: a policy "messages_update_read" permite update em
-- QUALQUER coluna da mensagem pra quem participa da conversa —
-- nao so "read_at". Isso permitia um dos dois lados reescrever o
-- que a outra pessoa "disse" (conteudo da mensagem).
--
-- Correcao: trava por privilegio de coluna (mesma tecnica do
-- is_admin) — revoga update geral e libera update só da coluna
-- "read_at". A policy de RLS continua controlando QUEM pode
-- marcar como lida (participante da conversa); o privilegio de
-- coluna controla O QUE pode ser alterado.
--
-- Isso nao afeta o app: o unico lugar que atualiza mensagens
-- (marcar como lida) so mexe em "read_at" mesmo.
-- ============================================================

revoke update on public.messages from authenticated;
grant update (read_at) on public.messages to authenticated;
