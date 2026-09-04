-- 0004_event_place_data.sql — where the first 43 events happened.
--
-- Why a function and not plain UPDATEs: `supabase db reset` applies migrations *before* seed.sql,
-- so at migration time a fresh local database has no events yet and the updates would silently do
-- nothing. The data therefore lives in one idempotent function, called here (which fills the cloud,
-- where the 43 events already exist) and once more at the end of seed.sql (which fills a fresh
-- local database). One copy of the data, both environments correct.
--
-- A backfill, not content: from here on places are entered through /admin, not through migrations.
--
-- precision, as defined in 0003:
--   exact     the identified building or site (excavated, still standing, or documented)
--   city      the town it happened in; the exact spot inside it is not the point
--   region    only the wider area is known; al-Biruni's hill in the Punjab is unidentified
--   continent / unknown  not used yet; reserved for prehistory and for ideas with no one place
--
-- Coordinates are city-centre or site level. Six rest on a scholarly judgement worth re-checking
-- before they are treated as settled: copernicus (Frombork, where he worked and died, over
-- Nuremberg, where it was printed), roger-bacon (Paris over Oxford), aryabhata (Kusumapura),
-- ibn-sina (a Canon written across three cities, finished in Hamadan), al-biruni (the hill),
-- tycho (Herrevad Abbey in 1572, before Uraniborg existed).

create or replace function public.seed_event_places() returns void language sql as $$
  with d(slug, lat, lng, prec, place_name) as (values
    -- Antiquity
    ('thales-natural-explanations',       37.53060,  27.27780, 'city'::place_precision, 'Miletus'),
    ('pythagoras-school',                 39.08080,  17.12730, 'city',   'Croton'),
    ('democritus-atoms',                  40.93330,  24.98330, 'city',   'Abdera'),
    ('hippocrates-natural-disease',       36.89330,  27.28870, 'city',   'Kos'),
    ('plato-academy',                     37.99250,  23.70750, 'exact',  'Athens'),
    ('aristotle-lyceum',                  37.97500,  23.74200, 'exact',  'Athens'),
    ('euclid-elements',                   31.20010,  29.91870, 'city',   'Alexandria'),
    ('archimedes-buoyancy-levers',        37.07550,  15.28660, 'city',   'Syracuse'),
    ('eratosthenes-earth-circumference',  31.20010,  29.91870, 'city',   'Alexandria'),
    ('hipparchus-star-catalogue',         36.43490,  28.21760, 'city',   'Rhodes'),
    ('ptolemy-almagest',                  31.20010,  29.91870, 'city',   'Alexandria'),
    ('galen-anatomy',                     41.90280,  12.49640, 'city',   'Rome'),
    ('hypatia-alexandria',                31.20010,  29.91870, 'city',   'Alexandria'),
    -- India
    ('aryabhata',                         25.59410,  85.13760, 'city',   'Pataliputra'),
    ('brahmagupta-zero',                  25.00570,  72.26180, 'city',   'Bhinmal'),
    -- The Islamic world and Central Asia
    ('al-khwarizmi-algebra',              33.31520,  44.36610, 'city',   'Baghdad'),
    ('al-farabi-classification',          33.31520,  44.36610, 'city',   'Baghdad'),
    ('ibn-al-haytham-optics',             30.04440,  31.23570, 'city',   'Cairo'),
    ('ibn-sina-canon',                    34.79830,  48.51480, 'city',   'Hamadan'),
    ('al-biruni-earth-radius',            32.72000,  73.33000, 'region', 'Punjab'),
    ('omar-khayyam-cubics',               39.62700,  66.97500, 'city',   'Samarkand'),
    ('ulugh-beg-observatory',             39.67530,  67.00530, 'exact',  'Samarkand'),
    -- Medieval Europe
    ('fibonacci-liber-abaci',             43.72280,  10.40170, 'city',   'Pisa'),
    ('roger-bacon-experiment',            48.85660,   2.35220, 'city',   'Paris'),
    ('gutenberg-press',                   49.99290,   8.24730, 'city',   'Mainz'),
    -- The Scientific Revolution
    ('copernicus-heliocentrism',          54.35860,  19.68070, 'city',   'Frombork'),
    ('vesalius-fabrica',                  45.40640,  11.87680, 'city',   'Padua'),
    ('tycho-supernova',                   56.03000,  13.15000, 'exact',  'Herrevad Abbey'),
    ('gilbert-de-magnete',                51.50740,  -0.12780, 'city',   'London'),
    ('galileo-telescope',                 45.40640,  11.87680, 'city',   'Padua'),
    ('kepler-elliptical-orbits',          50.07550,  14.43780, 'city',   'Prague'),
    ('napier-logarithms',                 55.92800,  -3.21000, 'city',   'Edinburgh'),
    ('bacon-novum-organum',               51.50740,  -0.12780, 'city',   'London'),
    ('harvey-blood-circulation',          51.50740,  -0.12780, 'city',   'London'),
    ('descartes-geometry',                52.16010,   4.49700, 'city',   'Leiden'),
    ('torricelli-barometer',              43.76960,  11.25580, 'city',   'Florence'),
    ('royal-society',                     51.51550,  -0.09220, 'exact',  'London'),
    ('boyle-law',                         51.75200,  -1.25770, 'city',   'Oxford'),
    ('hooke-micrographia',                51.51550,  -0.09220, 'exact',  'London'),
    ('romer-speed-of-light',              48.83580,   2.33630, 'exact',  'Paris'),
    ('leeuwenhoek-microbes',              52.01160,   4.35710, 'city',   'Delft'),
    ('newton-principia',                  52.20530,   0.12180, 'city',   'Cambridge'),
    -- Modern
    ('transistor',                        40.68360, -74.40070, 'exact',  'Murray Hill')
  ),
  placed as (
    update events ev set lat = d.lat, lng = d.lng, place_precision = d.prec
    from d where ev.slug = d.slug
    returning ev.id as event_id, ev.source_locale, d.place_name
  )
  update event_translations t set place_name = p.place_name
  from placed p
  where t.event_id = p.event_id and t.locale = p.source_locale;
$$;

comment on function public.seed_event_places() is
  'One-off backfill of the first 43 places. Called by migration 0004 and again by seed.sql, because db reset runs migrations before the seed.';

select public.seed_event_places();
