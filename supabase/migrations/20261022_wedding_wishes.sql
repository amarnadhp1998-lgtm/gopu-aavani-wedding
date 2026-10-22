-- Run this once in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.wedding_wishes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists wedding_wishes_public_order on public.wedding_wishes (created_at desc) where status = 'approved';
alter table public.wedding_wishes enable row level security;
revoke all on public.wedding_wishes from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert on public.wedding_wishes to service_role;
-- All reads and inserts go through the Edge Function. The service-role key stays server-side.
