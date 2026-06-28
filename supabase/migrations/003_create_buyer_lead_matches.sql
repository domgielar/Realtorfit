-- Migration: buyer_lead_matches
-- Records which realtors each buyer was shown and at what fit score.
-- Buyer info is denormalized here so the dashboard can display lead cards
-- without a cross-table join across the private buyer_leads table.

create table if not exists public.buyer_lead_matches (
  id             uuid        primary key default gen_random_uuid(),
  buyer_lead_id  uuid        not null,
  realtor_id     text        references public.realtors(id) on delete cascade not null,
  fit_score      integer     not null,
  home_type      text        not null,
  region         text        not null,
  price_min      integer     not null,
  price_max      integer     not null,
  comm_style     text        not null,
  first_time     boolean     not null default false,
  timeline       text        not null,
  created_at     timestamptz not null default now(),
  unique (buyer_lead_id, realtor_id)
);

alter table public.buyer_lead_matches enable row level security;

-- Authenticated realtors can read leads matched to their own profile
create policy "Realtor can read own matches"
  on public.buyer_lead_matches for select
  using (
    realtor_id in (
      select id from public.realtors where user_id = auth.uid()
    )
  );

-- Inserts go through the service-role API route
create policy "Service role insert"
  on public.buyer_lead_matches for insert with check (true);
