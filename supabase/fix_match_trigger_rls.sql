-- ============================================================
-- ConectaLove — Correcao: triggers de match/conversa bloqueados por RLS
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: as funcoes que criam o match e a conversa automaticamente
-- rodam com o mesmo nivel de permissao de quem deu o "like" (RLS ativo).
-- Como "matches" e "conversations" nao tem policy de INSERT (de proposito,
-- so o proprio banco deveria criar essas linhas, nunca o usuario direto),
-- a tentativa de insercao feita pela trigger era bloqueada — e isso
-- derrubava a transacao inteira, entao nem o "like" ficava salvo.
--
-- Correcao: marcar essas funcoes como SECURITY DEFINER, para rodarem
-- com a permissao de quem criou a funcao (o dono do banco), ignorando
-- o RLS nesse caso especifico — e valido porque a logica dentro da
-- funcao ja garante que so cria o match quando o like e realmente mutuo.
-- ============================================================

create or replace function public.check_for_match()
returns trigger as $$
declare
  mutual boolean;
  a uuid;
  b uuid;
begin
  select exists (
    select 1 from public.likes
    where liker_id = new.liked_id and liked_id = new.liker_id
  ) into mutual;

  if mutual then
    if new.liker_id < new.liked_id then
      a := new.liker_id; b := new.liked_id;
    else
      a := new.liked_id; b := new.liker_id;
    end if;

    insert into public.matches (user_a, user_b)
    values (a, b)
    on conflict (user_a, user_b) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.create_conversation_for_match()
returns trigger as $$
begin
  insert into public.conversations (match_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Mesmo problema existe na funcao de "historia de sucesso" (usada mais
-- pra frente) — corrigindo ja, por consistencia.
create or replace function public.check_story_ready()
returns trigger as $$
declare
  total_confirmed integer;
begin
  select count(*) into total_confirmed
  from public.success_story_confirmations
  where success_story_id = new.success_story_id and consent_given = true;

  if total_confirmed >= 2 then
    update public.success_stories
    set status = 'ready_to_publish'
    where id = new.success_story_id and status = 'awaiting_confirmation';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
