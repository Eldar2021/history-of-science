-- reset-content.sql — empty the content tables, keep the reference data.
--
-- Run this in the Supabase Studio SQL editor against the cloud project (ADR-036).
-- Take a dump first: backend/scripts/backup.sh
--
-- Deleted:  events (cascades to event_translations, event_disciplines, event_people,
--           event_links and sources), people, person_translations.
-- Kept:     eras, era_translations, disciplines, discipline_translations, profiles, auth.users.
--
-- The counts before and after are printed so the result is visible rather than assumed.

begin;

-- What is about to go.
select 'before' as when,
       (select count(*) from events)             as events,
       (select count(*) from event_translations) as translations,
       (select count(*) from event_links)        as links,
       (select count(*) from sources)            as sources,
       (select count(*) from people)             as people;

-- events cascades to event_translations, event_disciplines, event_people, event_links, sources.
delete from events;
-- people is not reachable from events by cascade; person_translations hangs off it.
delete from people;

select 'after' as when,
       (select count(*) from events)             as events,
       (select count(*) from event_translations) as translations,
       (select count(*) from event_links)        as links,
       (select count(*) from sources)            as sources,
       (select count(*) from people)             as people;

-- The reference data must be untouched: 8 eras, 8 disciplines, 32 translations each.
select 'kept' as when,
       (select count(*) from eras)                    as eras,
       (select count(*) from era_translations)        as era_tr,
       (select count(*) from disciplines)             as disciplines,
       (select count(*) from discipline_translations) as disc_tr,
       (select count(*) from profiles)                as profiles;

commit;

-- The Studio SQL editor runs the whole script in one go, so the three result sets above are a record
-- of what happened, not a checkpoint to decide at. Confirm the project ref in the browser URL is
-- hsllmvouqayaccubodcl and that a fresh dump exists (backend/scripts/backup.sh) BEFORE running this.
