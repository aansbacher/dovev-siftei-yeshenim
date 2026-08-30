-- Suggestions table: lets visitors suggest a missing tzaddik or add info/corrections.
-- Run this once in Supabase → SQL Editor.

create table if not exists public.suggestions (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  type            text not null default 'add_info',      -- 'new_tzaddik' | 'add_info'
  tzaddik_id      bigint references public.tzaddikim(id),
  tzaddik_name    text,
  hebrew_date     text,
  content         text not null,
  sources         text,
  submitter_name  text,
  submitter_email text,
  status          text not null default 'pending'        -- 'pending' | 'reviewed' | 'applied' | 'rejected'
);

-- Enable Row Level Security
alter table public.suggestions enable row level security;

-- Allow anyone (anon key from the site) to submit a suggestion, but not to read them.
drop policy if exists "public can submit suggestions" on public.suggestions;
create policy "public can submit suggestions"
  on public.suggestions
  for insert
  to anon, authenticated
  with check (true);

-- Editor reads via the service-role key, which bypasses RLS. No public SELECT policy on purpose.
