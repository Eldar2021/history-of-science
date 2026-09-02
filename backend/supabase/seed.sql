-- seed.sql — reference data (eras, disciplines) in 4 locales + 10 sample events in English.
-- Runs after migrations on `supabase db reset`. Idempotent via on conflict.

-- ---------- eras ----------
insert into eras (id, slug, start_year, end_year, sort_order, color) values
  (1, 'ancient',       -700,  500, 1, 'era-ancient'),
  (2, 'golden-age',     500, 1400, 2, 'era-golden'),
  (3, 'revolution',    1400, 1700, 3, 'era-revolution'),
  (4, 'enlightenment', 1700, 1800, 4, 'era-enlightenment'),
  (5, 'industrial',    1800, 1900, 5, 'era-industrial'),
  (6, 'modern',        1900, 1945, 6, 'era-modern'),
  (7, 'information',   1945, 2000, 7, 'era-information'),
  (8, 'today',         2000, null, 8, 'era-today')
on conflict (id) do update set slug = excluded.slug, start_year = excluded.start_year, end_year = excluded.end_year, sort_order = excluded.sort_order, color = excluded.color;

insert into era_translations (era_id, locale, name, tagline) values
  (1, 'en', 'The Ancient World', 'Nature instead of gods: for the first time, someone asked "why?"'),
  (1, 'tr', 'Antik Dünya', 'Tanrılar yerine doğa: ilk kez "neden?" diye soruldu'),
  (1, 'ru', 'Древний мир', 'Природа вместо богов: впервые кто-то спросил «почему?»'),
  (1, 'ky', 'Байыркы дүйнө', 'Кудайлардын ордуна табият: биринчи жолу «эмне үчүн?» деген суроо берилди'),
  (2, 'en', 'The Islamic Golden Age and the Middle Ages', 'From Baghdad to Samarkand: knowledge was preserved, multiplied and measured'),
  (2, 'tr', 'İslam Altın Çağı ve Orta Çağ', 'Bağdat''tan Semerkant''a: bilgi korundu, çoğaldı, ölçüldü'),
  (2, 'ru', 'Золотой век ислама и Средневековье', 'От Багдада до Самарканда: знание сохранили, умножили и измерили'),
  (2, 'ky', 'Ислам алтын доору жана Орто кылымдар', 'Багдаддан Самаркандга чейин: билим сакталды, көбөйдү, өлчөндү'),
  (3, 'en', 'Renaissance and the Scientific Revolution', 'The Earth left the center; experiment defeated the book'),
  (3, 'tr', 'Rönesans ve Bilimsel Devrim', 'Dünya merkezden çıktı, deney kitaba galip geldi'),
  (3, 'ru', 'Возрождение и научная революция', 'Земля покинула центр; опыт победил книгу'),
  (3, 'ky', 'Кайра жаралуу жана илимий революция', 'Жер борбордон чыкты; тажрыйба китепти жеңди'),
  (4, 'en', 'The Enlightenment', 'Classification, measurement, electricity: nature began to be read like a machine'),
  (4, 'tr', 'Aydınlanma', 'Sınıflandırma, ölçüm, elektrik: doğa bir makine gibi okunmaya başlandı'),
  (4, 'ru', 'Просвещение', 'Классификация, измерение, электричество: природу стали читать как машину'),
  (4, 'ky', 'Агартуу доору', 'Классификация, өлчөө, электр: табият машина сыяктуу окула баштады'),
  (5, 'en', 'The Nineteenth Century', 'Energy, evolution, germs, electromagnetism: the foundations of the modern world'),
  (5, 'tr', '19. Yüzyıl', 'Enerji, evrim, mikroplar, elektromanyetizma: modern dünyanın temelleri'),
  (5, 'ru', 'XIX век', 'Энергия, эволюция, микробы, электромагнетизм: основы современного мира'),
  (5, 'ky', 'XIX кылым', 'Энергия, эволюция, микробдор, электромагнетизм: заманбап дүйнөнүн негиздери'),
  (6, 'en', 'The Age of Modern Physics', 'The atom was split, spacetime was bent, certainty ended'),
  (6, 'tr', 'Modern Fizik Çağı', 'Atom parçalandı, uzay-zaman büküldü, kesinlik bitti'),
  (6, 'ru', 'Эпоха современной физики', 'Атом расщепили, пространство-время искривили, определённость закончилась'),
  (6, 'ky', 'Заманбап физика доору', 'Атом бөлүндү, мейкиндик-убакыт ийилди, так билүү аяктады'),
  (7, 'en', 'The Information Age', 'Transistor, DNA, space, the internet: science became everyday life'),
  (7, 'tr', 'Bilgi Çağı', 'Transistör, DNA, uzay, internet: bilim gündelik hayat oldu'),
  (7, 'ru', 'Информационная эпоха', 'Транзистор, ДНК, космос, интернет: наука стала повседневностью'),
  (7, 'ky', 'Маалымат доору', 'Транзистор, ДНК, космос, интернет: илим күнүмдүк жашоого айланды'),
  (8, 'en', 'Today', 'Genome, Higgs, gravitational waves, AI: the story continues'),
  (8, 'tr', 'Bugün', 'Genom, Higgs, kütleçekim dalgaları, yapay zekâ: hikâye sürüyor'),
  (8, 'ru', 'Сегодня', 'Геном, Хиггс, гравитационные волны, ИИ: история продолжается'),
  (8, 'ky', 'Бүгүн', 'Геном, Хиггс, гравитациялык толкундар, жасалма интеллект: окуя уланууда')
on conflict (era_id, locale) do update set name = excluded.name, tagline = excluded.tagline;

-- ---------- disciplines ----------
insert into disciplines (id, slug, color, icon) values
  (1, 'mathematics', 'discipline-mathematics', 'sigma'),
  (2, 'physics',     'discipline-physics',     'atom'),
  (3, 'astronomy',   'discipline-astronomy',   'telescope'),
  (4, 'chemistry',   'discipline-chemistry',   'flask'),
  (5, 'biology',     'discipline-biology',     'leaf'),
  (6, 'medicine',    'discipline-medicine',    'heart-pulse'),
  (7, 'earth',       'discipline-earth',       'globe'),
  (8, 'technology',  'discipline-technology',  'cog')
on conflict (id) do update set slug = excluded.slug, color = excluded.color, icon = excluded.icon;

insert into discipline_translations (discipline_id, locale, name) values
  (1, 'en', 'Mathematics'), (1, 'tr', 'Matematik'), (1, 'ru', 'Математика'), (1, 'ky', 'Математика'),
  (2, 'en', 'Physics'), (2, 'tr', 'Fizik'), (2, 'ru', 'Физика'), (2, 'ky', 'Физика'),
  (3, 'en', 'Astronomy & Space'), (3, 'tr', 'Astronomi ve Uzay'), (3, 'ru', 'Астрономия и космос'), (3, 'ky', 'Астрономия жана космос'),
  (4, 'en', 'Chemistry'), (4, 'tr', 'Kimya'), (4, 'ru', 'Химия'), (4, 'ky', 'Химия'),
  (5, 'en', 'Biology'), (5, 'tr', 'Biyoloji'), (5, 'ru', 'Биология'), (5, 'ky', 'Биология'),
  (6, 'en', 'Medicine'), (6, 'tr', 'Tıp'), (6, 'ru', 'Медицина'), (6, 'ky', 'Медицина'),
  (7, 'en', 'Earth & Climate'), (7, 'tr', 'Yer Bilimleri ve İklim'), (7, 'ru', 'Науки о Земле и климат'), (7, 'ky', 'Жер илимдери жана климат'),
  (8, 'en', 'Technology & Engineering'), (8, 'tr', 'Teknoloji ve Mühendislik'), (8, 'ru', 'Технологии и инженерия'), (8, 'ky', 'Технология жана инженерия')
on conflict (discipline_id, locale) do update set name = excluded.name;

-- ---------- sample events (English; summaries + why_it_matters; bodies to be written via /com_event) ----------
-- Helper: insert event + translation + disciplines in one go.
create or replace function seed_event(
  p_slug text, p_year int, p_precision year_precision, p_importance int, p_disciplines text[],
  p_title text, p_summary text, p_why text, p_if text
) returns void language plpgsql as $$
declare eid uuid;
begin
  insert into events (slug, year, precision, importance, status, source_locale)
  values (p_slug, p_year, p_precision, p_importance, 'published', 'en')
  on conflict (slug) do update set year = excluded.year, precision = excluded.precision, importance = excluded.importance
  returning id into eid;
  insert into event_translations (event_id, locale, title, summary, why_it_matters, if_you_were_there, status)
  values (eid, 'en', p_title, p_summary, p_why, p_if, 'human')
  on conflict (event_id, locale) do update set title = excluded.title, summary = excluded.summary,
    why_it_matters = excluded.why_it_matters, if_you_were_there = excluded.if_you_were_there;
  delete from event_disciplines where event_id = eid;
  insert into event_disciplines (event_id, discipline_id, is_primary)
  select eid, d.id, (d.slug = p_disciplines[1]) from disciplines d where d.slug = any (p_disciplines);
end $$;

select seed_event('thales-natural-explanations', -585, 'circa', 5, array['physics','astronomy'],
  'Thales looks for natural causes',
  'A man in Miletus proposes that the world can be explained without gods. The story that he predicted an eclipse is probably legend, but the habit of asking "why" is real.',
  'It marks the moment explanation moved from myth to nature. Every later science inherits this habit.',
  'Almost everyone around you believed storms, plagues and eclipses were messages from the gods.');

select seed_event('euclid-elements', -300, 'circa', 5, array['mathematics'],
  'Euclid writes the Elements',
  'Thirteen books that build all of geometry from a handful of definitions and five postulates. It stayed a textbook for over two thousand years.',
  'It showed that knowledge can be built step by step from agreed starting points. Newton, Spinoza and Lincoln all learned to argue from it.',
  'There was no such thing as a proof that everyone had to accept; arguments were settled by authority or rhetoric.');

select seed_event('archimedes-buoyancy-levers', -250, 'circa', 5, array['physics','mathematics'],
  'Archimedes: buoyancy, levers and the value of pi',
  'In Syracuse, Archimedes works out why things float, how levers multiply force, and squeezes pi between two numbers using polygons.',
  'He treated physical questions as mathematical ones, centuries before anyone else did it systematically.',
  'Nobody could say why a ship of wood floats while a coin sinks; "heaviness" was a property of the thing, not a comparison.');

select seed_event('eratosthenes-earth-circumference', -240, 'circa', 5, array['astronomy','earth'],
  'Eratosthenes measures the Earth',
  'Using the angle of a shadow in Alexandria and the distance to a well in Syene, a librarian computes the circumference of the planet to within a few percent.',
  'A single clever measurement replaced guesswork about the size of the world. Columbus, seventeen centuries later, used a worse estimate.',
  'Most people knew the Earth was round; almost no one had any idea how big it was.');

select seed_event('al-khwarizmi-algebra', 820, 'circa', 5, array['mathematics'],
  'Al-Khwarizmi founds algebra',
  'In Baghdad, a scholar from Khwarezm writes a book on "restoring and balancing" equations. Its title gives us the word algebra; his name gives us algorithm.',
  'Algebra turned specific arithmetic tricks into general methods. Every equation you have ever solved descends from this book.',
  'Calculations were done in words and with counting boards; there was no symbol for an unknown quantity.');

select seed_event('ibn-al-haytham-optics', 1021, 'circa', 5, array['physics'],
  'Ibn al-Haytham explains vision with experiments',
  'In Cairo, working in a darkened room, Ibn al-Haytham shows that we see because light enters the eye, not because the eye sends out rays, and insists that claims be tested.',
  'His Book of Optics is one of the first sustained uses of controlled experiment. Kepler and Galileo read it in Latin.',
  'The learned view, from Euclid and Ptolemy, was that the eye emitted rays that touched objects.');

select seed_event('ulugh-beg-observatory', 1420, 'exact', 5, array['astronomy'],
  'Ulugh Beg builds the Samarkand observatory',
  'A ruler-astronomer in Samarkand builds a giant sextant and, with his team, catalogues over a thousand stars with naked-eye precision unmatched until Tycho Brahe.',
  'It was the finest observatory of its age and proof that careful instruments beat inherited tables. Its catalogue was still used in Europe centuries later.',
  'Star positions came from Ptolemy, already twelve centuries old and drifting further from the sky each year.');

select seed_event('copernicus-heliocentrism', 1543, 'exact', 5, array['astronomy'],
  'Copernicus puts the Sun at the center',
  'Published as he lay dying, On the Revolutions argues that the Earth moves around the Sun. The idea was old; the full mathematical system was new.',
  'It began the long demotion of humanity from the center of the universe and forced physics to explain a moving Earth.',
  'Common sense and every authority agreed: the ground does not move, and the heavens turn around us.');

select seed_event('newton-principia', 1687, 'exact', 5, array['physics','astronomy','mathematics'],
  'Newton publishes the Principia',
  'The fall of an apple and the orbit of the Moon obey one law. Sky and earth become one physics.',
  'For two and a half centuries, all of physics was built on this book. It made the universe look like a machine that could be understood.',
  'Nobody knew why planets kept moving; for most people the sky was still a different realm with different rules.');

select seed_event('transistor', 1947, 'exact', 5, array['physics','technology'],
  'The transistor is invented',
  'At Bell Labs, Bardeen, Brattain and Shockley make a tiny crystal amplify an electric signal. Every computer, phone and satellite descends from it.',
  'It turned quantum mechanics into a manufacturable switch. There are now more transistors on Earth than grains of sand on its beaches.',
  'Electronics meant hot, fragile glass vacuum tubes; a computer filled a room and failed every few hours.');

-- a few links so the chain view has something to show
insert into event_links (from_event_id, to_event_id, type, note)
select f.id, t.id, 'builds_on', n from (values
  ('newton-principia', 'copernicus-heliocentrism', 'A moving Earth needed a physics that could explain it'),
  ('newton-principia', 'euclid-elements', 'The Principia is written in the geometric style of the Elements'),
  ('newton-principia', 'archimedes-buoyancy-levers', 'Mathematical treatment of physical force'),
  ('copernicus-heliocentrism', 'ulugh-beg-observatory', 'Better tables exposed the strain in Ptolemy''s system'),
  ('ibn-al-haytham-optics', 'euclid-elements', 'Geometry of rays, corrected by experiment'),
  ('al-khwarizmi-algebra', 'euclid-elements', 'Geometric proofs of algebraic rules')
) as v(fs, ts, n)
join events f on f.slug = v.fs join events t on t.slug = v.ts
on conflict do nothing;

drop function seed_event(text, int, year_precision, int, text[], text, text, text, text);
