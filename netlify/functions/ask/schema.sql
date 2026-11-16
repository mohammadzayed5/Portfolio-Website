-- Tables for the "Ask Mohammad" chat. Run once in the Supabase project that
-- should hold the logs, then set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
-- in Netlify. Row-level security is on with no policies, so only the service
-- role (the Netlify Function) can read or write. No raw IPs are stored:
-- ip_hash is a keyed hash that rotates every day.

create table if not exists public.ask_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  ip_hash text not null,
  turn smallint not null,
  question text not null,
  answer text,
  markers text[] not null default '{}',
  stop_reason text,
  input_tokens integer,
  cache_read_tokens integer,
  output_tokens integer,
  source text,            -- 'typed' or 'prompt' (a suggested question was clicked)
  latency_ms integer,
  country text,
  region text,
  city text,
  device text             -- desktop, mobile or tablet
);

create table if not exists public.ask_leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  ip_hash text not null,
  email text not null,
  country text,
  region text,
  city text
);

-- One row per page visit and per click on a link or button, on every page.
create table if not exists public.ask_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  ip_hash text not null,
  event text not null,    -- 'visit' or 'click'
  detail text,            -- for a click: the link address or the button's name
  path text,              -- the page it happened on
  referrer text,          -- where the visitor came from
  country text,
  region text,
  city text,
  device text,
  user_agent text
);

alter table public.ask_log enable row level security;
alter table public.ask_leads enable row level security;
alter table public.ask_events enable row level security;

create index if not exists ask_log_created_at_idx on public.ask_log (created_at desc);
create index if not exists ask_leads_created_at_idx on public.ask_leads (created_at desc);
create index if not exists ask_events_created_at_idx on public.ask_events (created_at desc);
create index if not exists ask_events_session_idx on public.ask_events (session_id);
create index if not exists ask_log_session_idx on public.ask_log (session_id);

-- One line per visitor session: where they came from, what they looked at, how much they asked.
create or replace view public.ask_sessions with (security_invoker = true) as
select
  e.session_id,
  min(e.created_at) as first_seen,
  max(e.created_at) as last_seen,
  max(e.country) as country,
  max(e.region) as region,
  max(e.city) as city,
  max(e.device) as device,
  max(e.referrer) filter (where e.referrer is not null and e.referrer not like '%mohammadzayed.com%') as came_from,
  count(*) filter (where e.event = 'visit') as page_views,
  count(*) filter (where e.event = 'click') as clicks,
  bool_or(e.event = 'click' and e.detail like '%resume%') as opened_resume,
  (select count(*) from public.ask_log l where l.session_id = e.session_id and l.turn > 0) as questions,
  exists (select 1 from public.ask_leads d where d.session_id = e.session_id) as left_email
from public.ask_events e
group by e.session_id
order by first_seen desc;
