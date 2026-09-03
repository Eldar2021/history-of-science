-- 0001_init.sql — Uchkun core schema
-- See doc/04-mimari.md for the rationale. Years are integers; negative = BCE; there is no year 0.

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ---------- enums ----------
create type locale_code as enum ('en', 'ru', 'ky', 'tr');
create type year_precision as enum ('exact', 'circa', 'decade', 'century');
create type content_status as enum ('draft', 'review', 'published');
create type author_kind as enum ('human', 'ai');
create type translation_status as enum ('machine', 'human', 'reviewed');
create type link_type as enum ('builds_on', 'contradicts', 'parallel');

-- ---------- profiles / roles ----------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  ui_locale  locale_code not null default 'en',
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- auto-create a viewer profile for every new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- eras ----------
create table eras (
  id         smallint primary key,
  slug       text unique not null,
  start_year integer not null,
  end_year   integer,               -- null = today
  sort_order smallint not null,
  color      text not null          -- design token name
);
create table era_translations (
  era_id      smallint references eras(id) on delete cascade,
  locale      locale_code not null,
  name        text not null,
  tagline     text,
  description text,
  primary key (era_id, locale)
);

-- ---------- disciplines ----------
create table disciplines (
  id    smallint primary key,
  slug  text unique not null,
  color text not null,
  icon  text
);
create table discipline_translations (
  discipline_id smallint references disciplines(id) on delete cascade,
  locale        locale_code not null,
  name          text not null,
  primary key (discipline_id, locale)
);

-- ---------- events ----------
create table events (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  year             integer not null check (year <> 0),
  year_end         integer check (year_end is null or (year_end <> 0 and year_end >= year)),
  precision        year_precision not null default 'exact',
  era_id           smallint references eras(id),
  importance       smallint not null default 3 check (importance between 1 and 5),
  status           content_status not null default 'draft',
  drafted_by       author_kind not null default 'human',
  research_note    text,
  source_locale    locale_code not null default 'en',
  image_path       text,
  image_credit     text,
  image_license    text,
  image_source_url text,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  constraint image_needs_credit check (
    image_path is null or (image_credit is not null and image_license is not null and image_source_url is not null)
  )
);
create index events_published_year_idx on events (year) where status = 'published' and deleted_at is null;
create index events_status_idx on events (status) where deleted_at is null;

create table event_translations (
  event_id          uuid references events(id) on delete cascade,
  locale            locale_code not null,
  title             text not null,
  summary           text not null,
  body              text,
  why_it_matters    text,
  if_you_were_there text,
  status            translation_status not null default 'human',
  search            tsvector,
  updated_at        timestamptz not null default now(),
  primary key (event_id, locale)
);
create index event_translations_search_idx on event_translations using gin (search);

create table event_disciplines (
  event_id      uuid references events(id) on delete cascade,
  discipline_id smallint references disciplines(id),
  is_primary    boolean not null default false,
  primary key (event_id, discipline_id)
);

-- ---------- people ----------
create table people (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  birth_year    integer check (birth_year <> 0),
  death_year    integer check (death_year <> 0),
  image_path    text,
  image_credit  text,
  image_license text,
  image_source_url text,
  created_at    timestamptz not null default now()
);
create table person_translations (
  person_id uuid references people(id) on delete cascade,
  locale    locale_code not null,
  name      text not null,
  bio       text,
  status    translation_status not null default 'human',
  primary key (person_id, locale)
);
create table event_people (
  event_id  uuid references events(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  role      text,
  primary key (event_id, person_id)
);

-- ---------- links: "from builds_on to" (from is later, to is earlier) ----------
create table event_links (
  from_event_id uuid references events(id) on delete cascade,
  to_event_id   uuid references events(id) on delete cascade,
  type          link_type not null default 'builds_on',
  note          text,
  primary key (from_event_id, to_event_id, type),
  check (from_event_id <> to_event_id)
);
create index event_links_to_idx on event_links (to_event_id);

-- ---------- sources ----------
create table sources (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  title    text not null,
  url      text,
  kind     text check (kind in ('encyclopedia', 'book', 'paper', 'article', 'other'))
);
create index sources_event_idx on sources (event_id);

-- ---------- triggers ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger events_touch before update on events for each row execute function public.touch_updated_at();
create trigger event_translations_touch before update on event_translations for each row execute function public.touch_updated_at();

create or replace function public.event_translation_search()
returns trigger language plpgsql as $$
declare cfg regconfig;
begin
  cfg := case new.locale when 'en' then 'english'::regconfig when 'ru' then 'russian'::regconfig
                         when 'tr' then 'turkish'::regconfig else 'simple'::regconfig end;
  new.search :=
    setweight(to_tsvector(cfg, coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector(cfg, coalesce(new.summary, '')), 'B') ||
    setweight(to_tsvector(cfg, coalesce(new.body, '')), 'C');
  return new;
end; $$;
create trigger event_translations_search before insert or update of title, summary, body
  on event_translations for each row execute function public.event_translation_search();

-- auto-assign era from year if not set
create or replace function public.assign_era()
returns trigger language plpgsql as $$
begin
  if new.era_id is null then
    select id into new.era_id from eras
    where new.year >= start_year and (end_year is null or new.year < end_year)
    order by sort_order limit 1;
  end if;
  return new;
end; $$;
create trigger events_assign_era before insert or update of year, era_id on events
  for each row execute function public.assign_era();

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table eras enable row level security;
alter table era_translations enable row level security;
alter table disciplines enable row level security;
alter table discipline_translations enable row level security;
alter table events enable row level security;
alter table event_translations enable row level security;
alter table event_disciplines enable row level security;
alter table people enable row level security;
alter table person_translations enable row level security;
alter table event_people enable row level security;
alter table event_links enable row level security;
alter table sources enable row level security;

-- profiles: own row readable; admin reads/writes all
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_admin_write on profiles for all using (is_admin()) with check (is_admin());

-- reference tables: readable by all, writable by staff
create policy eras_read on eras for select using (true);
create policy eras_write on eras for all using (is_staff()) with check (is_staff());
create policy era_tr_read on era_translations for select using (true);
create policy era_tr_write on era_translations for all using (is_staff()) with check (is_staff());
create policy disc_read on disciplines for select using (true);
create policy disc_write on disciplines for all using (is_staff()) with check (is_staff());
create policy disc_tr_read on discipline_translations for select using (true);
create policy disc_tr_write on discipline_translations for all using (is_staff()) with check (is_staff());

-- events: public sees only published + not deleted; staff sees everything
create policy events_public_read on events for select
  using ((status = 'published' and deleted_at is null) or is_staff());
create policy events_staff_write on events for all using (is_staff()) with check (is_staff());

create or replace function public.event_is_visible(eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from events e where e.id = eid and e.status = 'published' and e.deleted_at is null)
      or is_staff();
$$;

create policy event_tr_read on event_translations for select using (event_is_visible(event_id));
create policy event_tr_write on event_translations for all using (is_staff()) with check (is_staff());
create policy event_disc_read on event_disciplines for select using (event_is_visible(event_id));
create policy event_disc_write on event_disciplines for all using (is_staff()) with check (is_staff());
create policy event_people_read on event_people for select using (event_is_visible(event_id));
create policy event_people_write on event_people for all using (is_staff()) with check (is_staff());
create policy links_read on event_links for select
  using (event_is_visible(from_event_id) and event_is_visible(to_event_id));
create policy links_write on event_links for all using (is_staff()) with check (is_staff());
create policy sources_read on sources for select using (event_is_visible(event_id));
create policy sources_write on sources for all using (is_staff()) with check (is_staff());

create policy people_read on people for select using (true);
create policy people_write on people for all using (is_staff()) with check (is_staff());
create policy person_tr_read on person_translations for select using (true);
create policy person_tr_write on person_translations for all using (is_staff()) with check (is_staff());

-- ---------- read functions (security invoker: RLS applies) ----------
-- Timeline rows for one locale; falls back to the event's source locale when the translation is missing.
create or replace function public.get_timeline(p_locale locale_code)
returns table (
  id uuid, slug text, year integer, year_end integer, "precision" year_precision,
  era_id smallint, importance smallint, image_path text,
  title text, summary text, translation_status translation_status,
  locale_used locale_code, is_fallback boolean, disciplines text[]
) language sql stable as $$
  select e.id, e.slug, e.year, e.year_end, e.precision, e.era_id, e.importance, e.image_path,
         t.title, t.summary, t.status, t.locale, (t.locale <> p_locale),
         coalesce((select array_agg(d.slug order by ed.is_primary desc, d.id)
                   from event_disciplines ed join disciplines d on d.id = ed.discipline_id
                   where ed.event_id = e.id), '{}')
  from events e
  join lateral (
    select * from event_translations et
    where et.event_id = e.id and et.locale in (p_locale, e.source_locale)
    order by (et.locale = p_locale) desc limit 1
  ) t on true
  where e.status = 'published' and e.deleted_at is null
  order by e.year, e.importance desc, e.slug;
$$;

-- Backward chain: what this event builds on, recursively (depth-limited, cycle-safe).
create or replace function public.get_chain(p_slug text, p_locale locale_code, p_depth int default 6)
returns table (depth int, from_slug text, to_slug text, to_year integer, to_title text, note text)
language sql stable as $$
  with recursive chain as (
    select 0 as depth, e.id as from_id, l.to_event_id as to_id, l.note, array[e.id] as path
    from events e join event_links l on l.from_event_id = e.id and l.type = 'builds_on'
    where e.slug = p_slug
    union all
    select c.depth + 1, c.to_id, l.to_event_id, l.note, c.path || c.to_id
    from chain c join event_links l on l.from_event_id = c.to_id and l.type = 'builds_on'
    where c.depth + 1 < p_depth and not (l.to_event_id = any (c.path))
  )
  select c.depth, fe.slug, te.slug, te.year,
         coalesce((select title from event_translations where event_id = te.id and locale = p_locale),
                  (select title from event_translations where event_id = te.id and locale = te.source_locale)),
         c.note
  from chain c
  join events fe on fe.id = c.from_id
  join events te on te.id = c.to_id
  where te.status = 'published' and te.deleted_at is null
  order by c.depth, te.year desc;
$$;
