-- Migration: create_realtors_and_buyer_leads
-- Run this in the Supabase dashboard → SQL Editor

create extension if not exists pgcrypto;

-- ─── realtors ────────────────────────────────────────────────────────────────
-- Matches the Realtor interface in lib/realtors.ts exactly.
create table if not exists public.realtors (
  id                       text        primary key default 'r-' || gen_random_uuid()::text,
  name                     text        not null,
  photo                    text        not null default '🧑‍💼',
  regions                  text[]      not null default '{}',
  years_experience         integer     not null default 0,
  homes_sold               integer     not null default 0,
  price_band_min           integer     not null default 0,
  price_band_max           integer     not null default 0,
  commission_rate          numeric(4,2) not null default 2.5,
  specialties              text[]      not null default '{}',
  first_time_friendly      boolean     not null default false,
  out_of_state_experienced boolean     not null default false,
  investment_experienced   boolean     not null default false,
  languages                text[]      not null default '{English}',
  comm_styles              text[]      not null default '{}',
  available_this_week      boolean     not null default true,
  avg_response_hours       numeric(4,1) not null default 2,
  rating                   numeric(3,1) not null default 0,
  review_count             integer     not null default 0,
  license_verified         boolean     not null default false,
  personality              text[]      not null default '{}',
  bio                      text        not null default '',
  recent_deal              text        not null default '',
  created_at               timestamptz not null default now()
);

alter table public.realtors enable row level security;

-- Anyone can read realtors (buyers need to see the list)
create policy "Public read"
  on public.realtors for select using (true);

-- Inserts go through the API route which uses the service role — allow all here
create policy "Service role insert"
  on public.realtors for insert with check (true);

create policy "Service role update"
  on public.realtors for update using (true);

-- ─── buyer_leads ─────────────────────────────────────────────────────────────
-- Matches the BuyerProfile interface in lib/matching.ts exactly.
create table if not exists public.buyer_leads (
  id              uuid        primary key default gen_random_uuid(),
  price_min       integer     not null,
  price_max       integer     not null,
  region          text        not null,
  in_state        text        not null check (in_state in ('in', 'out')),
  first_time      boolean     not null,
  home_type       text        not null check (home_type in ('starter','investment','luxury','condo','multi-family','land')),
  timeline        text        not null check (timeline in ('asap','3mo','6mo','browsing')),
  pre_approved    boolean     not null,
  experience_pref text        not null check (experience_pref in ('newer','experienced','noPref')),
  comm_style      text        not null check (comm_style in ('text','call','video','in-person')),
  created_at      timestamptz not null default now()
);

alter table public.buyer_leads enable row level security;

-- Buyers can submit anonymously; no one can read others' leads
create policy "Anyone can submit"
  on public.buyer_leads for insert with check (true);
