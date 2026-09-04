# Mimari

Çalışan sistemin haritası. Ayrıntı kodda; burada kodda görünmeyen "neden"ler, şema özeti ve tuzaklar var.

## Yığın

| Katman                | Seçim                                       | Neden                                              |
| --------------------- | ------------------------------------------- | -------------------------------------------------- |
| Frontend + admin      | Next.js 16 App Router + TypeScript          | SSR/ISR ile SEO, server action ile admin, tek repo |
| Stil                  | Tailwind v4 + `app/globals.css` token'ları  | Token'lar tek yerde; tek koyu tema (ADR-029)       |
| i18n                  | next-intl 4                                 | `/tr`, `/ky` ön ekli rotalar                       |
| Veri + Auth + Storage | Supabase (Postgres)                         | Ücretsiz katman, RLS, Flutter SDK'sı var           |
| Sorgu                 | Supabase JS client + Postgres fonksiyonları | Çeviri birleştirmeyi SQL çözer                     |
| Çeviri / içerik hattı | Claude API                                  | Faz B                                              |
| Hosting               | Vercel (web) + Supabase (veri)              | `main` push = deploy                               |

**Ayrı backend yok** (ADR-002). İş mantığı Postgres fonksiyonlarında ve `backend/scripts` içinde;
Supabase'e özgü tek şey Auth ve Storage.

## Klasörler

```
web/
├── app/
│   ├── [locale]/          # page (küre + şerit), event/[slug], @panel (kesişen rota: panel / sheet)
│   ├── admin/             # dil ön eki yok, korumalı: login, events, events/new, events/[id]
│   └── globals.css        # tasarım token'ları, tek kaynak
├── components/            # globe/ (Globe, GlobeHome, EventStrip, TimeRibbon), event/, admin/, Site*
├── lib/
│   ├── supabase/          # server, client, anon (çerezsiz), session, types (üretilmiş)
│   ├── i18n/              # formatYear, formatPlace — tek doğruluk noktaları
│   ├── globe/             # projection, sphere (CPU yedek), webgl, strip, layout, events — saf, Vitest
│   ├── timeline/xScale.ts # zaman ölçeği; şerit ve ileride Keşfet kanvası
│   ├── queries/           # timeline, event; cache-tags
│   └── admin/             # slug, eventForm, events
├── messages/{en,ru,ky,tr}.json   # UI metinleri (`admin` ad alanı dahil)
├── proxy.ts               # Next 16'da middleware.ts yerine: locale + admin koruması
└── e2e/                   # Playwright

backend/
├── supabase/migrations/   # 0001_init, 0002_event_detail, 0003_event_place, 0004_event_place_data
├── supabase/seed.sql
├── content/drafts/        # olay taslakları (JSON) → drafts-to-sql.mjs
└── scripts/               # create-admin, cloud-admin-password, cloud-setup, rls-proof, check-drafts
```

## Veri modeli

Gerçek kaynak `backend/supabase/migrations/`. Her varlığın dilden bağımsız bir tablosu ve bir
`*_translations` tablosu var (ADR-003). `locale_code`: `en | ru | ky | tr`.

| Tablo                                           | Taşıdığı                                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `eras`, `era_translations`                      | 8 çağ: slug, start_year, end_year, sort_order, color · name, tagline, description                                                          |
| `disciplines`, `discipline_translations`        | 8 disiplin: slug, color, icon · name                                                                                                       |
| `events`                                        | slug, year, year_end, `"precision"`, era_id, importance 1-5, status, drafted_by, research_note, source_locale, görsel + lisans, `lat`/`lng`/`place_precision`, created/updated/deleted_at |
| `event_translations`                            | title, summary, body (markdown), why_it_matters, if_you_were_there, `place_name`, status, search (tsvector)                                |
| `event_disciplines`                             | olay ↔ disiplin                                                                                                                            |
| `people`, `person_translations`, `event_people` | Faz D                                                                                                                                      |
| `event_links`                                   | from → to + `link_type`; yalnızca `builds_on` saklanır (ADR-007)                                                                            |
| `sources`                                       | event_id, title, url, kind                                                                                                                 |
| `profiles`                                      | auth.users'a bağlı: `role` (admin/editor/viewer), `ui_locale`                                                                              |

Enum'lar: `year_precision` (exact/circa/decade/century), `place_precision` (exact/city/region/continent/
unknown), `content_status` (draft/review/published), `author_kind` (human/ai), `translation_status`
(machine/human/reviewed), `link_type`. Yıl ve yer kuralları ADR-004 ve ADR-025.

### Okuma fonksiyonları

- `get_timeline(locale)`: yayınlanmış olaylar + istenen dilde çeviri, yoksa `source_locale` çevirisi ve
  `is_fallback = true`. Yer alanları da burada; ana sayfa tek çağrıyla beslenir.
- `get_event_detail(slug, locale)`: olay + çeviri + disiplinler + kişiler + bağlantılar (iki yönlü) +
  kaynaklar, tek JSON. Anon rolde taslak `null`.
- `get_chain(slug, locale, depth)`: `builds_on` zinciri, derinlik 6, döngü koruması (Faz D).
- Çağ ataması yıl üzerinden trigger ile otomatik.

### Güvenlik (RLS)

- İçerik tablolarında `select` herkese açık ama yalnızca `status = 'published' and deleted_at is null`
  (ADR-010). `insert/update/delete` yalnızca `profiles.role in ('admin','editor')`.
- `/admin` ayrıca `proxy.ts` ile korunur: anonim → **302** `/admin/login?next=…`, rolsüz → `?error=forbidden`.
- Storage bucket `images`: public read, admin write. Claude API anahtarı yalnızca sunucuda.
- Kanıt: `backend/scripts/rls-proof.sh` anon key ile REST/RPC'yi dener.
- **Bilinen açık**: `profiles` yazma yalnızca admin; `editor` kendi `ui_locale`'ini değiştiremez (Faz D).

## Ana sayfa küresi (ADR-024)

İki kanvas üst üste. Altta WebGL2 (`lib/globe/webgl.ts`): diskin her pikseli için ters ortografik
izdüşüm, eşlek dikdörtgen dokudan mipmap'li okuma, tek ışık, suda parıltı, limbde ince atmosfer. Üstte
Canvas 2D: yıldızlar, gidilen yol (büyük daire yayları), pinler, belirsizlik çemberleri; pointer olayları
burada. WebGL2 yoksa ya da bağlam kaybolursa üst kanvas küreyi `sphere.ts` ile kendisi çizer (dönerken
%55 çözünürlük). Geometri `projection.ts`, saf ve test edilebilir.

Doku NASA Blue Marble NG batimetrili: `earth-2048.jpg` (262 KB) ilk boyamada; `earth-4096.jpg` (907 KB)
yalnızca küre çapı 1024 aygıt pikselinden büyükse, `saveData` kapalıysa ve `deviceMemory ≥ 4` ise
arkadan yüklenip devralır. Animasyon karesi yalnızca kamera dönerken ya da küre elle çevrilirken çalışır.
Seçim kaydırmanın kendisine değil `scroll-snap`'in oturmasına bağlı: her kaydırma karesinde kamera
istemek telefonu tıkatır.

## Olay gövdesi: Markdown (ADR-033)

`event_translations.body` GitHub-flavoured Markdown. Tek renderer `components/content/Markdown.tsx`;
onu site (`EventDetail`, sunucuda), admin önizlemesi ve `/admin/help/markdown` paylaşır. Sunucu
bileşeni olduğu için ayrıştırıcı site paketine girmez — client tarafına yalnızca admin rotalarından
girer. Ham HTML kapalı. GFM'nin üstündeki üç sözleşme `lib/content/remarkUchkun.ts`'te:
`> [!NOTE]` kutusu, tek başına satırdaki YouTube adresi, tek başına satırdaki künyeli görsel.
Formül `remark-math` + `rehype-katex` ile; KaTeX stil dosyası olay sayfasına biner (~28 KB ham).

## Admin (ADR-034)

`/admin` pano (durum sayıları, dil başına eksik çeviri, son düzenlenenler) · `/admin/events` liste
(arama, durum filtresi, "şu dili olmayanlar", sıralama) · olay formu · `/admin/help/markdown`.

Form tek bir client bileşeni ve **dört dili birden** taşır: her dilin alanları DOM'da durur, sekme
yalnızca görüneni seçer, kaydetme metin taşıyan bütün dilleri yazar. Tekrarlanan satırlar (kaynak,
kişi, bağlantı) aynı alan adı altında paralel dizi gönderir — `getAll` sırayı korur, o yüzden **her
satır her alanını basmak zorundadır**. Doğrulama `lib/admin/eventForm.ts`'te ve saftır; yazma sırası
`app/admin/events/actions.ts`'te: olay → çeviriler → disiplinler → kaynaklar → kişiler → bağlantılar.
Bağlantı hedefleri hiçbir şey yazılmadan önce çözülür. Kaydet/sil/geri al listeye döner ve
`revalidatePath` ile client router'ın kopyasını düşürür.

## Admin → site anında yayın (ADR-021)

```
Admin formu kaydet (server action) → Supabase'e yaz → updateTag('timeline') + updateTag(`event:${slug}`)
  (slug değiştiyse eskisi de) → veri önbelleği düşer → sonraki ziyaretçi taze sayfayı görür
```

Ziyaretçi okumaları çerezsiz anon client ile (`lib/supabase/anon.ts`), `unstable_cache` + etiketler, yedek
`revalidate: 300` (Studio'dan elle değişiklik en geç 5 dk'da görünür). Olay sayfaları `generateStaticParams`.

## Ortam değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL= / NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # yalnızca sunucu ve betikler
NEXT_PUBLIC_SITE_URL= / NEXT_PUBLIC_REPORT_EMAIL=   # dürüstlük bandındaki mailto
ANTHROPIC_API_KEY= / TELEGRAM_BOT_TOKEN= / TELEGRAM_CHAT_ID= / CONTENT_PIPELINE_ENABLED=   # Faz B
```

## İşletme (ADR-035)

| Ne          | Nerede                                                | Not                                                        |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| CI          | `.github/workflows/ci.yml`                            | Her PR: `npm run check` + yerel Supabase'li Playwright      |
| Yedek       | `.github/workflows/backup.yml`, `scripts/backup.sh`   | Gece 02:00 UTC, 90 gün artefakt; `SUPABASE_DB_URL` sırrı    |
| Hata sayfası| `app/[locale]/error.tsx`, `app/global-error.tsx`      | İlki dört dilde, ikincisi son çare İngilizce                |
| Keşif       | `app/sitemap.ts`, `app/robots.ts`, `lib/site.ts`      | 44 URL, `hreflang` + `x-default`, canonical                 |
| Paylaşım    | `app/[locale]/opengraph-image.tsx` (+ olay için)      | `next/og`, Literata (OFL) `web/assets`'ten, 1200×630        |
| Şifre kurtarma | `/admin/forgot-password` → e-posta → `/api/auth/callback` → `/admin/reset-password` | Auth izin listesi uygulamanın adresini içermeli |

Adres tek yerden: `lib/site.ts` içindeki `SITE_ORIGIN` (`NEXT_PUBLIC_SITE_URL`, yoksa üretim adresi).
Metadata, sitemap, robots, OG ve hata bildirimi mailto'su hepsi onu okur.

## Geliştirme akışı

- Yerel Docker **Colima**, Docker Desktop yok. Supabase CLI Homebrew'dan. `supabase db reset` migration + seed.
- Şema değişikliği = yeni migration + `npm run gen:types`.
- `main` = üretim (Vercel). Feature branch → PR → preview (giriş korumalı) → merge.
- `npm run check` ve `npm run e2e` (Playwright, üretim build + yerel Supabase + kurulu Chrome) PR öncesi yeşil.
- Vitest Next'e bağımlı bileşenleri çözemiyor → saf mantık `lib/` altında, testler orada.
- Performans: hedef modern telefon, Lighthouse mobil 90+. Fontlar `next/font` self-host (latin, latin-ext,
  cyrillic, cyrillic-ext). `prefers-reduced-motion` saygı görür.

## Tuzaklar

- Postgres'te `precision` anahtar kelime: `returns table` içinde `"precision"` diye tırnaklı.
- `NextResponse.redirect` varsayılanı 307; 302 açıkça verilir. Next 16'da `revalidateTag` ikinci argüman
  ister; server action içinde `updateTag`.
- CSS minifier `1500ms`'yi `1.5s` yazar; süreyi `parseFloat` ile okuma, `parseDuration` kullan.
- `sr-only` + `not-sr-only` konumlandırmayı bozar; sarmalayıcı konumlandırır.
- İç içe `<dialog>`: içtekinin `close` olayı dıştakine kabarır, devir teslim kapanma sanılır.
- Headless Chrome'da WebGL için `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`;
  yoksa bağlam kayıp gelir ve küre CPU yedeğine düşer (test yine geçer). Ekran görüntüsü betikleri `web/`
  içinden çalıştırılır, yoksa `playwright` çözülmez.
- Puppeteer/Playwright: `click` görünür alana kaydırır, kaydırma konumu testinde `evaluate` ile tıkla.
  Next route announcer `role=alert` taşır → `main [role=alert]`. Başlıktaki "Çıkış" `button[type=submit]`'e
  takılır → `main form`.
- WebGL `dispose()` bağlamı bilerek düşürmez: React StrictMode ikinci mount'u ölü bağlam alır.
