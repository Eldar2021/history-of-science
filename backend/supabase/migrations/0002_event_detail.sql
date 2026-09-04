-- 0002_event_detail.sql — one-call event detail for /[locale]/event/[slug]
-- doc/mimari.md "v_event_detail(slug, locale)": event + translation (with source-locale fallback)
-- + era + disciplines + people + links in both directions + sources, as a single JSON document.
-- Security invoker: RLS applies, so drafts return null for anonymous readers.

-- Title of an event in the reader's locale, falling back to the event's source locale.
create or replace function public.event_title(p_event_id uuid, p_locale locale_code, p_source locale_code)
returns text language sql stable as $$
  select coalesce(
    (select title from event_translations where event_id = p_event_id and locale = p_locale),
    (select title from event_translations where event_id = p_event_id and locale = p_source));
$$;

create or replace function public.get_event_detail(p_slug text, p_locale locale_code)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', e.id, 'slug', e.slug, 'year', e.year, 'year_end', e.year_end, 'precision', e.precision,
    'era_id', e.era_id, 'importance', e.importance, 'source_locale', e.source_locale,
    'image_path', e.image_path, 'image_credit', e.image_credit,
    'image_license', e.image_license, 'image_source_url', e.image_source_url,
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
