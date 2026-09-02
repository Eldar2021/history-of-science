# 04 — Mimari

## Yönlendirici kısıtlar

1. **Tek geliştirici + Claude.** Bakımı sıfıra yakın olmalı. Gece 3'te patlayan sunucu istemiyoruz.
2. **Admin kaydeder, site anında değişir.** Deploy olmadan.
3. **Dört dil, veritabanında.** Çeviriler kodda değil, veride.
4. **Ücretsiz katmanda başla.** İlk yıl 0-10 $/ay.
5. **Mobil uygulamaya kapı açık.** Flutter biliyorsun; backend'e Flutter'dan da erişilebilmeli.
6. **SEO.** Olay sayfaları Google'da çıkmalı; sunucu tarafı render şart.

## Seçilen yığın (stack)

| Katman                      | Seçim                                          | Neden                                                                       |
| --------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| Frontend + Admin            | **Next.js 15 (App Router) + TypeScript**       | SSR/ISR ile SEO, sunucu eylemleri ile admin, tek repo                       |
| Stil                        | **Tailwind CSS v4** + kendi tasarım token'ları | Hızlı, tutarlı, Claude ile üretmesi kolay                                   |
| Animasyon                   | **Motion (framer-motion)**                     | Timeline geçişleri, kaydırma bağlı efektler                                 |
| i18n                        | **next-intl**                                  | App Router ile en olgun, `/tr`, `/ky` gibi ön ek rotalar                    |
| Veritabanı + Auth + Storage | **Supabase (Postgres)**                        | Ücretsiz katman, RLS ile güvenlik, Flutter SDK'sı var, yönetim paneli hazır |
| ORM / sorgu                 | **Supabase JS client** (+ Postgres view'ları)  | Prisma eklemeye gerek yok; view'lar çeviri birleştirmeyi çözer              |
| Çeviri                      | **Claude API** (`claude-sonnet-5`)             | Admin'den tek tıkla 4 dile taslak çeviri                                    |
| Görsel                      | Supabase Storage + `next/image`                | Otomatik boyutlandırma                                                      |
| Arama                       | Postgres `tsvector` (dil başına)               | Küçük veri; Algolia'ya gerek yok                                            |
| OG görsel                   | `next/og` (Satori)                             | Deploy'suz, dinamik                                                         |
| Hosting                     | **Vercel** (web) + Supabase (veri)             | Her ikisi ücretsiz katman; Git push = deploy                                |
| Analitik                    | Plausible veya Umami (self-host değil, bulut)  | Çerezsiz, GDPR uyumlu                                                       |
| Hata izleme                 | Sentry ücretsiz katman                         | P1                                                                          |

### Değerlendirilip elenenler

- **Ayrı Node/Go backend**: 3 ay solo için fazla. Supabase RLS + Next.js server actions aynı işi görür. İhtiyaç doğarsa `backend/` klasöründe Supabase Edge Functions veya ayrı API eklenir; Postgres şeması zaten ortak.
- **Git tabanlı içerik (MDX)**: Admin paneli şartı var; markdown dosyası düzenlemek admin değil. Ayrıca 4 dil × 200 olay = 800 dosya.
- **Headless CMS (Sanity, Payload, Strapi)**: Güçlü ama i18n ve olay-bağlantısı gibi özel modeli eğip bükmek gerekir; Supabase ile şemayı tam kontrol ederiz. Payload'ı ikinci aday olarak not ediyorum: admin UI'ı yazmak çok zaman alırsa 09-kararlar'da yeniden değerlendir.
- **WordPress**: Hayır. Timeline UX'i için savaşmak gerekir.
- **Firebase**: İlişkisel veri (bağlantılar, çeviriler) için Postgres çok daha rahat.

## Klasör yapısı

```
history-of-science/
├── web/                     # Next.js uygulaması (site + admin)
│   ├── app/
│   │   ├── [locale]/        # Ziyaretçi siteleri: /tr, /en, /ru, /ky
│   │   │   ├── page.tsx     # Ana sayfa
│   │   │   ├── timeline/
│   │   │   ├── event/[slug]/
│   │   │   ├── era/[slug]/
│   │   │   ├── discipline/[slug]/
│   │   │   ├── person/[slug]/
│   │   │   ├── chain/[slug]/
│   │   │   └── about/
│   │   ├── admin/           # Dil ön eki yok, korumalı
│   │   │   ├── login/
│   │   │   ├── events/
│   │   │   ├── people/
│   │   │   └── translate/[id]/
│   │   ├── og/[slug]/route.tsx
│   │   └── api/revalidate/route.ts
│   ├── components/
│   │   ├── timeline/        # Timeline'a özel: EraHeader, EventCard, YearIndicator, Minimap, TimeGap
│   │   ├── ui/              # Buton, çip, rozet, dialog
│   │   └── admin/
│   ├── lib/
│   │   ├── supabase/        # server.ts, client.ts, types.ts (üretilmiş)
│   │   ├── i18n/            # next-intl yapılandırması, yıl formatlama
│   │   ├── translate.ts     # Claude API çeviri
│   │   └── queries/         # getTimeline, getEvent, getChain ...
│   ├── messages/            # UI çevirileri: en.json, ru.json, ky.json, tr.json
│   ├── middleware.ts        # locale yönlendirme + admin koruması
│   └── ...
├── backend/                 # Veri katmanı
│   ├── supabase/
│   │   ├── migrations/      # SQL, sıralı: 0001_init.sql ...
│   │   ├── seed/            # seed.sql ve/veya seed.ts (çekirdek olaylar)
│   │   └── config.toml
│   └── scripts/             # toplu çeviri, içe aktarma, tutarlılık kontrolü
├── mobile/                  # Flutter (4. ay+). Supabase Flutter SDK ile aynı veriye bağlanır.
├── resource/                # Tasarım dosyaları, logo, font lisansları, görsel kaynak listesi
└── doc/                     # Bu dokümanlar
```

## Veri modeli

Çeviri deseni: her varlığın dilden bağımsız bir tablosu ve bir `*_translations` tablosu var. `locale` sütunu
`'en' | 'ru' | 'ky' | 'tr'` ile sınırlı. Yıl tamsayı; negatif = MÖ (astronomik yıl numaralaması kullanmıyoruz;
MÖ 1 = -1, MÖ 585 = -585. Sıfır yılı yok, uygulama katmanı bunu bilir).

```sql
create type locale_code as enum ('en', 'ru', 'ky', 'tr');
create type year_precision as enum ('exact', 'circa', 'decade', 'century');
create type content_status as enum ('draft', 'published');
create type translation_status as enum ('machine', 'human', 'reviewed');
create type link_type as enum ('builds_on', 'enables', 'contradicts', 'parallel');

create table eras (
  id          smallint primary key,
  slug        text unique not null,
  start_year  integer not null,
  end_year    integer,                -- null = bugün
  sort_order  smallint not null,
  color       text not null           -- tasarım token'ı adı, hex değil
);
create table era_translations (
  era_id      smallint references eras(id) on delete cascade,
  locale      locale_code not null,
  name        text not null,
  tagline     text,
  description text,
  primary key (era_id, locale)
);

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

create table events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  year          integer not null,
  year_end      integer,
  precision     year_precision not null default 'exact',
  era_id        smallint references eras(id),
  importance    smallint not null default 3 check (importance between 1 and 5),
  status        content_status not null default 'draft',
  source_locale locale_code not null default 'tr',   -- hangi dilde yazıldı
  image_path    text,
  image_credit  text,
  image_license text,
  image_source_url text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz                          -- yumuşak silme
);
create index on events (year) where status = 'published' and deleted_at is null;

create table event_translations (
  event_id        uuid references events(id) on delete cascade,
  locale          locale_code not null,
  title           text not null,
  summary         text not null,
  body            text,                 -- markdown
  why_it_matters  text,
  if_you_were_there text,
  status          translation_status not null default 'human',
  search          tsvector,             -- trigger ile dolar
  updated_at      timestamptz not null default now(),
  primary key (event_id, locale)
);

create table event_disciplines (
  event_id      uuid references events(id) on delete cascade,
  discipline_id smallint references disciplines(id),
  primary key (event_id, discipline_id)
);

create table people (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  birth_year integer,
  death_year integer,
  image_path text,
  image_credit text,
  image_license text
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
  role      text,                       -- 'discoverer', 'contributor', 'critic' ...
  primary key (event_id, person_id)
);

-- "Buraya nasıl geldik?" zincirinin verisi
create table event_links (
  from_event_id uuid references events(id) on delete cascade,
  to_event_id   uuid references events(id) on delete cascade,
  type          link_type not null,
  note          text,                   -- kısa açıklama, dilden bağımsız (P2: çevirili)
  primary key (from_event_id, to_event_id, type),
  check (from_event_id <> to_event_id)
);
-- Anlam: from --builds_on--> to  : "from", "to"ya dayanır.
-- 'enables' ters yönün aynısıdır; tek yön saklanır (builds_on), UI iki yönde okur.

create table sources (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  title    text not null,
  url      text,
  kind     text                         -- 'encyclopedia', 'book', 'paper', 'article'
);

create table profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'   -- 'admin' | 'editor' | 'viewer'
);
```

### Okuma view'ları

Frontend'in çeviri birleştirmeyle uğraşmaması için Postgres view'ları:

- `v_timeline(locale)`: fonksiyon. Yayınlanmış olaylar + istenen dilde çeviri; yoksa `source_locale` çevirisi ve `is_fallback = true`.
- `v_event_detail(slug, locale)`: olay + çeviri + disiplinler + kişiler + bağlantılar (iki yönlü) + kaynaklar, tek JSON.
- `v_chain(slug, locale, depth)`: `with recursive` ile `builds_on` zinciri, derinlik 6 ile sınırlı, döngü koruması.

### Güvenlik (RLS)

- `events`, `event_translations` ve tüm içerik tabloları: `select` herkese, ama **sadece** `status = 'published' and deleted_at is null` satırlar. Taslaklar veritabanı seviyesinde görünmez; frontend'de hata yapsak bile sızmaz.
- `insert/update/delete`: sadece `profiles.role in ('admin','editor')`.
- Admin sayfaları Next.js `middleware.ts` ile de korunur (çift kilit).
- Storage bucket `images`: public read, admin write.
- Claude API anahtarı sadece sunucu tarafında (server action), tarayıcıya asla gitmez.

## Admin → site otomatik yayın akışı

```
Admin formu kaydet (server action)
  → Supabase'e yaz
  → revalidateTag('timeline') + revalidateTag(`event:${slug}`)
  → ISR önbelleği düşer
  → Sonraki ziyaretçi taze sayfayı görür (ms içinde)
```

Yedek: sayfalar `revalidate = 300` (5 dk) ile de kendini yeniler; revalidate çağrısı unutulsa bile içerik 5 dk içinde görünür.
Supabase Studio'dan elle düzenleme yapılırsa Database Webhook → `/api/revalidate` (gizli anahtarla) aynı işi görür.

## Çeviri hattı

1. Admin bir olayı `source_locale` dilinde yazar, kaydeder.
2. "Diğer dillere çevir" → server action → Claude API'ye şu bağlamla gider: alanlar, ses tonu kuralları (03-icerik), terim sözlüğü (06-i18n), hedef dil.
3. Dönen 3 çeviri `status = 'machine'` ile kaydedilir.
4. Admin çeviri ekranında yan yana görür, düzeltir → `status = 'reviewed'`.
5. Sitede `machine` olanlar küçük "otomatik çeviri" rozeti ile gösterilir. Gizlenmez; dürüstlük ilkesi.

Maliyet: 600 kelimelik olay × 3 dil ≈ 5-8 bin token ≈ birkaç cent. 200 olay için 10 $'ın altında.

## Performans stratejisi

- Timeline sayfası sunucuda render; ilk 30 olay HTML'de, gerisi kaydırdıkça (`IntersectionObserver` + server action ile sayfalama). 200 olay için tümünü tek seferde göndermek de kabul edilebilir (~100 KB JSON), ölçüp karar veririz.
- Görseller: `next/image`, WebP/AVIF, `sizes` doğru; kart görselleri 400px, detay 1200px.
- Fontlar: `next/font` ile self-host, `font-display: swap`, sadece Latin + Cyrillic alt kümeleri.
- JS bütçesi: timeline sayfası ilk yükte 150 KB gzip altı. Animasyon kütüphanesi lazy.
- `prefers-reduced-motion` saygı görür.

## Ortam değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # sadece sunucu, sadece revalidate/seed scriptleri
ANTHROPIC_API_KEY=                # sadece sunucu
REVALIDATE_SECRET=                # webhook için
NEXT_PUBLIC_SITE_URL=
```

## Geliştirme akışı

- `supabase start` ile yerel Postgres (Docker), migration'lar `backend/supabase/migrations`.
- `supabase gen types typescript` → `web/lib/supabase/types.ts` (her şema değişiminde).
- Branch: `main` = üretim (Vercel prod). Feature branch → PR → Vercel preview URL → merge.
- Commit mesajları İngilizce, kısa: `feat(timeline): sticky year indicator`.
- Test: Playwright ile 3 kritik akış (timeline yüklenir, olay açılır, admin ekler ve sitede görünür). Birim test için zorlamıyoruz; yıl formatlama gibi saf fonksiyonlara Vitest.

## Maliyet tahmini (aylık)

| Kalem         | 0-6 ay             | 1000 günlük ziyaretçi sonrası                                                        |
| ------------- | ------------------ | ------------------------------------------------------------------------------------ |
| Vercel Hobby  | 0 $                | Pro 20 $ (ticari kullanım gerekirse)                                                 |
| Supabase Free | 0 $                | Pro 25 $ (500 MB DB aşılınca; olay verisi çok küçük, görseller Storage'da 1 GB free) |
| Claude API    | ~5 $               | ~5 $                                                                                 |
| Alan adı      | ~1 $               | ~1 $                                                                                 |
| Plausible     | 0 $ (deneme) / 9 $ | 9 $                                                                                  |

İlk yıl toplam: 100 $'ın altında.
