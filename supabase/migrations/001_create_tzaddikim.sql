-- Run this once in the Supabase SQL editor if the table doesn't exist yet.

create table if not exists tzaddikim (
  id               serial primary key,
  hebrew_day       integer not null,
  hebrew_month     text    not null,
  popular_name     text    not null,
  full_name        text,
  birth_day        text,          -- death/birth years string e.g. "נפטר בשנת תר"מ"
  opening_quote    text,
  quote            text,
  stream           text,          -- חסידות / ליטא / ספרד / תימן / כללי
  role             text,          -- רב / אדמו"ר / ראש ישיבה / מקובל ...
  image_url        text,
  image_filename   text,
  sources          text,          -- pipe-separated, e.g. "ספר א|ספר ב"
  importance_score integer default 50,
  biography        text,
  story            text,
  torah            text,
  created_at       timestamptz default now()
);

-- Speeds up the main query (lookup by day + month)
create index if not exists idx_tzaddikim_date
  on tzaddikim (hebrew_day, hebrew_month);

-- Subscribers table
create table if not exists subscribers (
  id           serial primary key,
  email        text unique not null,
  phone        text,
  via_email    boolean default true,
  via_whatsapp boolean default false,
  created_at   timestamptz default now()
);
