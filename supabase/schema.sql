-- ============================================================
-- ConectaLove — Schema Fase 1
-- ============================================================
-- Rode este arquivo no SQL Editor do painel do Supabase
-- (Database > SQL Editor > New query > colar e rodar).
--
-- Tabelas de Fase 2/3 (communities, events, verification_requests)
-- ficam de fora de proposito — entram quando essas fases comecarem.
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES
-- Extensao 1-para-1 de auth.users com os dados publicos do app.
-- ------------------------------------------------------------
create table public.influencers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  referral_code text unique not null,
  commission_rate numeric(5,4) not null default 0.2000, -- ex: 0.2000 = 20%
  pix_key text,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  gender text not null check (gender in ('masculino', 'feminino', 'outro')),
  orientation text not null,
  looking_for text not null, -- objetivo: relacionamento serio, etc.
  city text not null,
  profession text,
  bio text,
  invite_token uuid not null default gen_random_uuid(), -- usado no link "convide um amigo"
  referred_by_influencer_id uuid references public.influencers(id) on delete set null, -- gravado 1x no cadastro, imutavel na aplicacao
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  position smallint not null default 1, -- 1 a 4
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- limite de 4 fotos por perfil (decisao: autenticidade, nao custo de storage)
create or replace function public.enforce_max_photos()
returns trigger as $$
begin
  if (select count(*) from public.profile_photos where profile_id = new.profile_id) >= 4 then
    raise exception 'Limite de 4 fotos por perfil';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_max_photos
  before insert on public.profile_photos
  for each row execute function public.enforce_max_photos();

-- ------------------------------------------------------------
-- RECOMENDACOES (opcionais — selo de confianca, nao bloqueio)
-- ------------------------------------------------------------
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade, -- quem esta sendo recomendado
  recommender_name text not null,
  recommender_photo_path text,
  friendship_years smallint,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- ------------------------------------------------------------
-- LIKES / MATCHES / CHAT (estilo Tinder)
-- ------------------------------------------------------------
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid not null references public.profiles(id) on delete cascade,
  liked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (liker_id, liked_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

-- quando os dois lados se curtem, cria o match automaticamente
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
    -- guarda sempre em ordem determinística pra evitar duplicidade (A,B) vs (B,A)
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
$$ language plpgsql;

create trigger trg_check_match
  after insert on public.likes
  for each row execute function public.check_for_match();

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- cria a conversa automaticamente quando um match acontece
create or replace function public.create_conversation_for_match()
returns trigger as $$
begin
  insert into public.conversations (match_id) values (new.id);
  return new;
end;
$$ language plpgsql;

create trigger trg_create_conversation
  after insert on public.matches
  for each row execute function public.create_conversation_for_match();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ASSINATURA / PAGAMENTOS / COMISSAO (Asaas)
-- Escritas sensiveis (webhook do Asaas, calculo de comissao) devem
-- ser feitas via Supabase Edge Function com a service role key,
-- do mesmo jeito que ja e feito no projeto Regua — nao direto do
-- cliente. RLS abaixo cobre apenas leitura.
-- ------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  asaas_subscription_id text unique,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  plan text not null default 'premium_mensal',
  price_cents integer not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  asaas_payment_id text unique,
  amount_cents integer not null,
  net_amount_cents integer, -- valor liquido, ja descontada a taxa do Asaas
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'overdue', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  rate_applied numeric(5,4) not null,
  amount_cents integer not null,
  payout_status text not null default 'pending' check (payout_status in ('pending', 'paid')),
  paid_out_at timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- HISTORIAS DE SUCESSO (prova social pro influenciador)
-- ------------------------------------------------------------
create table public.success_stories (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  status text not null default 'awaiting_confirmation'
    check (status in ('awaiting_confirmation', 'ready_to_publish', 'published')),
  created_at timestamptz not null default now()
);

-- um registro por pessoa do casal — só fica "pronto" quando os dois preencherem
create table public.success_story_confirmations (
  id uuid primary key default gen_random_uuid(),
  success_story_id uuid not null references public.success_stories(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  photo_storage_path text,
  testimonial text,
  consent_given boolean not null default false,
  consent_text_version text, -- versao exata do termo de autorizacao aceito
  consented_at timestamptz,
  created_at timestamptz not null default now(),
  unique (success_story_id, profile_id)
);

-- quando ambos os lados tiverem consent_given = true, marca a historia como pronta
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
$$ language plpgsql;

create trigger trg_check_story_ready
  after insert or update on public.success_story_confirmations
  for each row execute function public.check_story_ready();

-- ------------------------------------------------------------
-- NOTIFICACOES
-- ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- 'new_match' | 'new_message' | 'recommendation_approved' | 'story_ready' | etc.
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.recommendations enable row level security;
alter table public.likes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocked_users enable row level security;
alter table public.reports enable row level security;
alter table public.influencers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.commissions enable row level security;
alter table public.success_stories enable row level security;
alter table public.success_story_confirmations enable row level security;
alter table public.notifications enable row level security;

-- profiles: qualquer usuario logado pode ver perfis (necessario pro feed),
-- mas so o dono pode editar o proprio.
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "profile_photos_select_authenticated" on public.profile_photos
  for select to authenticated using (true);
create policy "profile_photos_insert_own" on public.profile_photos
  for insert to authenticated with check (
    auth.uid() = (select id from public.profiles where id = profile_id)
  );
create policy "profile_photos_delete_own" on public.profile_photos
  for delete to authenticated using (
    auth.uid() = (select id from public.profiles where id = profile_id)
  );

-- recomendacoes aprovadas sao publicas; o dono do perfil ve tambem as pendentes
create policy "recommendations_select" on public.recommendations
  for select to authenticated using (
    status = 'approved' or profile_id = auth.uid()
  );
create policy "recommendations_update_own" on public.recommendations
  for update to authenticated using (profile_id = auth.uid());
-- insert de recomendacao (fluxo "convide um amigo") passa por Edge Function
-- com service role, pois quem escreve pode nao ter conta no app.

create policy "likes_select_own" on public.likes
  for select to authenticated using (liker_id = auth.uid() or liked_id = auth.uid());
create policy "likes_insert_own" on public.likes
  for insert to authenticated with check (liker_id = auth.uid());

create policy "matches_select_own" on public.matches
  for select to authenticated using (user_a = auth.uid() or user_b = auth.uid());

create policy "conversations_select_own" on public.conversations
  for select to authenticated using (
    exists (
      select 1 from public.matches
      where matches.id = conversations.match_id
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

create policy "messages_select_own" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = messages.conversation_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );
create policy "messages_insert_own" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = messages.conversation_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy "blocked_users_select_own" on public.blocked_users
  for select to authenticated using (blocker_id = auth.uid());
create policy "blocked_users_insert_own" on public.blocked_users
  for insert to authenticated with check (blocker_id = auth.uid());

create policy "reports_select_own" on public.reports
  for select to authenticated using (reporter_id = auth.uid());
create policy "reports_insert_own" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

-- influenciador ve seus proprios dados; leitura publica so do nome/codigo (para a pagina /r/[code])
create policy "influencers_select_own" on public.influencers
  for select to authenticated using (user_id = auth.uid());

create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (profile_id = auth.uid());

create policy "payments_select_own" on public.payments
  for select to authenticated using (
    exists (
      select 1 from public.subscriptions s
      where s.id = payments.subscription_id and s.profile_id = auth.uid()
    )
  );

create policy "commissions_select_own_influencer" on public.commissions
  for select to authenticated using (
    exists (
      select 1 from public.influencers i
      where i.id = commissions.influencer_id and i.user_id = auth.uid()
    )
  );

create policy "success_stories_select_own" on public.success_stories
  for select to authenticated using (
    exists (
      select 1 from public.matches m
      where m.id = success_stories.match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy "success_story_confirmations_select_own" on public.success_story_confirmations
  for select to authenticated using (
    profile_id = auth.uid() or exists (
      select 1 from public.success_stories ss
      join public.matches m on m.id = ss.match_id
      where ss.id = success_story_confirmations.success_story_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );
create policy "success_story_confirmations_upsert_own" on public.success_story_confirmations
  for insert to authenticated with check (profile_id = auth.uid());
create policy "success_story_confirmations_update_own" on public.success_story_confirmations
  for update to authenticated using (profile_id = auth.uid());

create policy "notifications_select_own" on public.notifications
  for select to authenticated using (profile_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (profile_id = auth.uid());
