-- 0003_event_place.sql — where each event happened, for the globe home page.
-- Mirrors how years work (ADR-004, ADR-023): the uncertainty lives in the data as an enum,
-- the wording ("around Samarkand", "somewhere in Central Asia") is added by the UI from
-- messages, never stored. place_name therefore holds the bare name only.

create type place_precision as enum ('exact', 'city', 'region', 'continent', 'unknown');

alter table events
  add column if not exists lat             numeric(8, 5),
  add column if not exists lng             numeric(8, 5),
  add column if not exists place_precision place_precision not null default 'unknown';

alter table events
  add constraint lat_in_range check (lat is null or lat between -90 and 90),
  add constraint lng_in_range check (lng is null or lng between -180 and 180),
  -- 'unknown' means we will not point at a spot; anything else must have one.
  add constraint place_needs_coords check (
    (place_precision = 'unknown' and lat is null and lng is null)
    or (place_precision <> 'unknown' and lat is not null and lng is not null)
  );

alter table event_translations
  add column if not exists place_name text;

comment on column events.place_precision is
  'How well the location is known. exact = the building or site, city, region, continent, unknown = no single place.';
comment on column event_translations.place_name is
  'Bare place name in this locale ("Samarkand", "Central Asia"). No qualifier; the UI adds it from place_precision.';

-- ---------- read functions ----------

-- get_timeline gains four place columns. Postgres cannot change a function's OUT columns in
-- place, so the old signature is dropped first.
drop function if exists public.get_timeline(locale_code);

create function public.get_timeline(p_locale locale_code)
returns table (
  id uuid, slug text, year integer, year_end integer, "precision" year_precision,
  era_id smallint, importance smallint, image_path text,
  lat numeric, lng numeric, place_precision place_precision, place_name text,
  title text, summary text, translation_status translation_status,
  locale_used locale_code, is_fallback boolean, disciplines text[]
) language sql stable as $$
  select e.id, e.slug, e.year, e.year_end, e.precision, e.era_id, e.importance, e.image_path,
         e.lat, e.lng, e.place_precision,
         coalesce(t.place_name,
           (select place_name from event_translations
            where event_id = e.id and locale = e.source_locale)),
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

-- get_event_detail returns jsonb, so replacing it in place is enough.
create or replace function public.get_event_detail(p_slug text, p_locale locale_code)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', e.id, 'slug', e.slug, 'year', e.year, 'year_end', e.year_end, 'precision', e.precision,
    'era_id', e.era_id, 'importance', e.importance, 'source_locale', e.source_locale,
    'image_path', e.image_path, 'image_credit', e.image_credit,
    'image_license', e.image_license, 'image_source_url', e.image_source_url,
    'lat', e.lat, 'lng', e.lng, 'place_precision', e.place_precision,
    'place_name', coalesce(t.place_name,
           (select place_name from event_translations
            where event_id = e.id and locale = e.source_locale)),
    'title', t.title, 'summary', t.summary, 'body', t.body,
    'why_it_matters', t.why_it_matters, 'if_you_were_there', t.if_you_were_there,
    'translation_status', t.status, 'locale_used', t.locale, 'is_fallback', (t.locale <> p_locale),
    'era', (
      select jsonb_build_object('slug', er.slug, 'name', coalesce(ert.name, er.slug))
      from eras er
      left join era_translations ert on ert.era_id = er.id and ert.locale = p_locale
      where er.id = e.era_id
    ),
    'disciplines', coalesce((
      select jsonb_agg(jsonb_build_object('slug', d.slug, 'name', coalesce(dt.name, d.slug))
                       order by ed.is_primary desc, d.id)
      from event_disciplines ed
      join disciplines d on d.id = ed.discipline_id
      left join discipline_translations dt on dt.discipline_id = d.id and dt.locale = p_locale
      where ed.event_id = e.id
    ), '[]'::jsonb),
    'people', coalesce((
      select jsonb_agg(jsonb_build_object(
               'slug', p.slug, 'role', ep.role, 'birth_year', p.birth_year, 'death_year', p.death_year,
               'name', coalesce(
                 (select name from person_translations where person_id = p.id and locale = p_locale),
                 (select name from person_translations where person_id = p.id order by (locale = 'en') desc limit 1),
                 p.slug))
             order by p.birth_year nulls last, p.slug)
      from event_people ep join people p on p.id = ep.person_id
      where ep.event_id = e.id
    ), '[]'::jsonb),
    -- what this event builds on (earlier events), newest first
    'builds_on', coalesce((
      select jsonb_agg(jsonb_build_object('slug', te.slug, 'year', te.year, 'note', l.note,
               'title', public.event_title(te.id, p_locale, te.source_locale))
             order by te.year desc)
      from event_links l join events te on te.id = l.to_event_id
      where l.from_event_id = e.id and l.type = 'builds_on'
        and te.status = 'published' and te.deleted_at is null
    ), '[]'::jsonb),
    -- what this event made possible (later events that build on it), oldest first
    'enabled', coalesce((
      select jsonb_agg(jsonb_build_object('slug', fe.slug, 'year', fe.year, 'note', l.note,
               'title', public.event_title(fe.id, p_locale, fe.source_locale))
             order by fe.year)
      from event_links l join events fe on fe.id = l.from_event_id
      where l.to_event_id = e.id and l.type = 'builds_on'
        and fe.status = 'published' and fe.deleted_at is null
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('title', s.title, 'url', s.url, 'kind', s.kind) order by s.title)
      from sources s where s.event_id = e.id
    ), '[]'::jsonb)
  )
  from events e
  join lateral (
    select * from event_translations et
    where et.event_id = e.id and et.locale in (p_locale, e.source_locale)
    order by (et.locale = p_locale) desc limit 1
  ) t on true
  where e.slug = p_slug and e.status = 'published' and e.deleted_at is null;
$$;
