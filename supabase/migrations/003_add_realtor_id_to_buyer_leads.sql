-- Migration: add realtor_id to buyer_leads so matched leads are attributed to a realtor
-- Run this in the Supabase dashboard → SQL Editor

alter table public.buyer_leads
  add column if not exists realtor_id text references public.realtors(id) on delete set null;

create index if not exists buyer_leads_realtor_id_idx on public.buyer_leads(realtor_id);

-- Realtors can read leads that were matched to their profile
create policy "Realtor can read own leads"
  on public.buyer_leads for select
  using (
    realtor_id = (
      select id from public.realtors where user_id = auth.uid() limit 1
    )
  );
