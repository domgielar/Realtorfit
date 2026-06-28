-- Migration: add user_id to realtors so each DB row links to a Supabase Auth user
-- Run this in the Supabase dashboard → SQL Editor

alter table public.realtors
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists realtors_user_id_idx on public.realtors(user_id);

-- Allow the owner to update their own record (e.g. toggling available_this_week)
create policy "Realtor can update own record"
  on public.realtors for update
  using (auth.uid() = user_id);
