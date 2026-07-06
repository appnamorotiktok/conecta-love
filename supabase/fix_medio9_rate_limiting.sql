-- ============================================================
-- ConectaLove — Correcao do Medio 9 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: nenhuma acao tinha limite de quantidade (mensagens,
-- recomendacoes, denuncias) — alguem poderia enviar centenas em
-- sequencia. Como essas acoes vao direto do navegador pro Supabase
-- (nao passam pelo servidor do Next.js), o limite precisa estar
-- aqui no banco, nao no Vercel.
--
-- Limites definidos (dá pra ajustar os numeros depois se precisar):
-- - Recomendacoes: 10 por perfil a cada 24h (fluxo publico, sem login,
--   o mais visado pra spam)
-- - Denuncias: 20 por denunciante a cada 24h
-- - Mensagens: 60 por remetente a cada 10 minutos (bem folgado pra
--   conversa normal, mas barra flood)
-- ============================================================

create or replace function public.check_recommendations_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.recommendations
  where profile_id = new.profile_id
    and created_at > now() - interval '24 hours';

  if recent_count >= 10 then
    raise exception 'Muitas recomendacoes recebidas recentemente. Tente novamente mais tarde.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_recommendations_rate_limit on public.recommendations;
create trigger trg_recommendations_rate_limit
  before insert on public.recommendations
  for each row execute function public.check_recommendations_rate_limit();

create or replace function public.check_reports_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.reports
  where reporter_id = new.reporter_id
    and created_at > now() - interval '24 hours';

  if recent_count >= 20 then
    raise exception 'Muitas denuncias enviadas recentemente. Tente novamente mais tarde.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_reports_rate_limit on public.reports;
create trigger trg_reports_rate_limit
  before insert on public.reports
  for each row execute function public.check_reports_rate_limit();

create or replace function public.check_messages_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.messages
  where sender_id = new.sender_id
    and created_at > now() - interval '10 minutes';

  if recent_count >= 60 then
    raise exception 'Muitas mensagens enviadas recentemente. Aguarde um pouco.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_messages_rate_limit on public.messages;
create trigger trg_messages_rate_limit
  before insert on public.messages
  for each row execute function public.check_messages_rate_limit();
