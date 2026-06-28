-- Messages between buyers and realtors.
-- Buyers and realtors must both be authenticated (auth.uid()).
-- buyer_id references auth.users; realtor_id references public.realtors.id (text).

create table public.messages (
  id           uuid        primary key default gen_random_uuid(),
  buyer_id     uuid        not null references auth.users(id) on delete cascade,
  realtor_id   text        not null references public.realtors(id) on delete cascade,
  sender_role  text        not null check (sender_role in ('buyer', 'realtor')),
  content      text        not null check (char_length(content) > 0),
  created_at   timestamptz not null default now()
);

create index on public.messages (realtor_id, buyer_id, created_at);

alter table public.messages enable row level security;

-- Buyer reads their own threads
create policy "buyer read" on public.messages
  for select using (buyer_id = auth.uid());

-- Realtor reads threads for their profile
create policy "realtor read" on public.messages
  for select using (
    realtor_id in (select id from public.realtors where user_id = auth.uid())
  );

-- Buyer sends (must match their own auth.uid and declare sender_role = 'buyer')
create policy "buyer send" on public.messages
  for insert with check (buyer_id = auth.uid() and sender_role = 'buyer');

-- Realtor sends (realtor_id must belong to the authenticated user's profile)
create policy "realtor send" on public.messages
  for insert with check (
    realtor_id in (select id from public.realtors where user_id = auth.uid())
    and sender_role = 'realtor'
  );
