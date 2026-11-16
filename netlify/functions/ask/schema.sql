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

-- One row per page visit, per click on a link or button, and per stretch of
-- time spent on a page, on every page.
create table if not exists public.ask_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  ip_hash text not null,
  event text not null,    -- 'visit', 'click' or 'leave' (time spent on a page)
  detail text,            -- for a click: the link address or the button's name
  path text,              -- the page it happened on
  referrer text,          -- where the visitor came from
  country text,
  region text,
  city text,
  device text,
  user_agent text,
  visitor_id text,        -- stays the same when the same browser comes back
  tag text,               -- from a tagged link, e.g. /?from=linkedin
  seconds integer,        -- 'leave' rows: seconds the page was in view
  scroll_pct smallint,    -- 'leave' rows: how far down the page they got
  network text,           -- name of the network they are on, e.g. a company
  network_domain text
);

-- For a database made before these columns existed.
alter table public.ask_events
  add column if not exists visitor_id text,
  add column if not exists tag text,
  add column if not exists seconds integer,
  add column if not exists scroll_pct smallint,
  add column if not exists network text,
  add column if not exists network_domain text;

alter table public.ask_log enable row level security;
alter table public.ask_leads enable row level security;
alter table public.ask_events enable row level security;

create index if not exists ask_log_created_at_idx on public.ask_log (created_at desc);
create index if not exists ask_leads_created_at_idx on public.ask_leads (created_at desc);
create index if not exists ask_events_created_at_idx on public.ask_events (created_at desc);
create index if not exists ask_events_session_idx on public.ask_events (session_id);
create index if not exists ask_log_session_idx on public.ask_log (session_id);

create index if not exists ask_events_visitor_idx on public.ask_events (visitor_id);

-- One line per visitor session: who they might be, where they came from, what
-- they looked at, how long they stayed, how much they asked.
drop view if exists public.ask_sessions;
create view public.ask_sessions with (security_invoker = true) as
with s as (
  select
    e.session_id,
    min(e.created_at) as first_seen,
    max(e.created_at) as last_seen,
    max(e.visitor_id) as visitor_id,
    max(e.country) as country,
    max(e.region) as region,
    max(e.city) as city,
    max(e.device) as device,
    max(e.network) as network,
    max(e.network_domain) as network_domain,
    max(e.tag) as tag,
    max(e.referrer) filter (where e.referrer is not null and e.referrer not like '%mohammadzayed.com%') as came_from,
    count(*) filter (where e.event = 'visit') as page_views,
    count(*) filter (where e.event = 'click') as clicks,
    coalesce(sum(e.seconds), 0) as seconds_on_site,
    max(e.scroll_pct) as deepest_scroll_pct,
    bool_or(e.event = 'click' and e.detail like '%resume%') as opened_resume
  from public.ask_events e
  group by e.session_id
)
select
  s.session_id, s.first_seen, s.last_seen,
  s.network, s.network_domain, s.tag, s.came_from,
  s.country, s.region, s.city, s.device,
  s.page_views, s.clicks, s.seconds_on_site, s.deepest_scroll_pct, s.opened_resume,
  (select count(*) from public.ask_log l where l.session_id = s.session_id and l.turn > 0) as questions,
  exists (select 1 from public.ask_leads d where d.session_id = s.session_id) as left_email,
  (select count(distinct p.session_id) from public.ask_events p
    where p.visitor_id = s.visitor_id and p.created_at < s.first_seen) as earlier_visits,
  s.visitor_id
from s
order by s.first_seen desc;
