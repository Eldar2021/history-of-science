# 04 — Mimari

Şu an çalışan sistemin haritası. Ayrıntı kodda; burada yalnızca kodda görünmeyen "neden"ler ve henüz
yazılmamış parçaların planı var.

## Yığın

| Katman                | Seçim                                       | Neden                                              |
| --------------------- | ------------------------------------------- | -------------------------------------------------- |
| Frontend + admin      | Next.js 16 App Router + TypeScript          | SSR/ISR ile SEO, server action ile admin, tek repo |
| Stil                  | Tailwind v4 + `app/globals.css` token'ları  | Token'lar tek yerde, tema anahtarı runtime         |
| i18n                  | next-intl 4                                 | `/tr`, `/ky` ön ekli rotalar, App Router uyumlu    |
| Veri + Auth + Storage | Supabase (Postgres)                         | Ücretsiz katman, RLS, Flutter SDK'sı var           |
| Sorgu                 | Supabase JS client + Postgres fonksiyonları | Çeviri birleştirmeyi SQL çözer                     |
| Çeviri                | Claude API (`claude-sonnet-5`)              | Admin'den tek tıkla 4 dile taslak (Hafta 6)        |
| Görsel                | Supabase Storage + `next/image`             | Hafta 6                                            |
| OG görsel             | `next/og` (Satori)                          | Hafta 7                                            |
| Hosting               | Vercel (web) + Supabase (veri)              | Git push = deploy                                  |

**Ayrı backend yok** (ADR-002). İş mantığı Postgres fonksiyonlarında ve `backend/scripts` içinde tutulur;
Supabase'e özgü tek şey Auth ve Storage. İleride Go backend gerekirse aynı Postgres'e bağlanır.

## Klasörler

```
web/
├── app/
│   ├── [locale]/          # ziyaretçi: page (ana), timeline, event/[slug]
│   │   └── timeline/@panel/(..)event/[slug]   # kesişen rota: masaüstü panel / mobil sheet
│   ├── admin/             # dil ön eki yok, korumalı: login, events, events/new, events/[id]
│   └── globals.css        # tasarım token'ları + tema
├── components/            # timeline/, event/, admin/ ve ortak
├── lib/
│   ├── supabase/          # server.ts, client.ts, anon.ts (çerezsiz), types.ts (üretilmiş)
│   ├── i18n/formatYear.ts # yıl metninin tek kaynağı
│   ├── timeline/          # xScale, minimap, filter, fall — saf mantık, Vitest burada
│   ├── admin/             # slug, eventForm, events
│   ├── queries/           # getTimeline, getEras, getDisciplines, getEventDetail
│   └── cache-tags.ts
├── messages/{en,ru,ky,tr}.json   # UI metinleri (`admin` ad alanı dahil)
├── proxy.ts               # Next 16'da middleware.ts yerine: locale + admin koruması
└── e2e/                   # Playwright

backend/
├── supabase/migrations/   # 0001_init.sql, 0002_event_detail.sql
├── supabase/seed.sql
├── content/drafts/        # olay taslakları (JSON)
└── scripts/               # create-admin, cloud-admin-password, rls-proof, drafts-to-sql, check-drafts
```

## Veri modeli

Gerçek kaynak `backend/supabase/migrations/`. Desen: her varlığın dilden bağımsız bir tablosu ve bir
`*_translations` tablosu var (ADR-003). `locale_code` enum: `en | ru | ky | tr`.

| Tablo                                           | Taşıdığı                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eras`                                          | 8 çağ: slug, start_year, end_year, sort_order, color (token adı)                                                                                                    |
| `era_translations`                              | name, tagline, description                                                                                                                                          |
| `disciplines`                                   | 8 disiplin: slug, color, icon                                                                                                                                       |
| `discipline_translations`                       | name                                                                                                                                                                |
| `events`                                        | slug, year, year_end, `"precision"`, era_id, importance 1-5, status, drafted_by, research_note, source_locale, görsel + lisans alanları, created/updated/deleted_at |
| `event_translations`                            | title, summary, body (markdown), why_it_matters, if_you_were_there, status, search (tsvector)                                                                       |
| `event_disciplines`                             | olay ↔ disiplin                                                                                                                                                     |
| `people`, `person_translations`, `event_people` | Hafta 9                                                                                                                                                             |
| `event_links`                                   | from → to + `link_type`; yalnızca `builds_on` saklanır (ADR-007)                                                                                                    |
| `sources`                                       | event_id, title, url, kind                                                                                                                                          |
| `profiles`                                      | auth.users'a bağlı: `role` (admin/editor/viewer), `ui_locale`                                                                                                       |

Enum'lar: `year_precision` (exact/circa/decade/century), `content_status` (draft/review/published),
`author_kind` (human/ai), `translation_status` (machine/human/reviewed), `link_type`.

**Yıl tamsayıdır, negatif = MÖ, sıfır yılı yoktur** (ADR-004). Formatlama yalnızca `formatYear.ts`'de.

**Tuzak**: Postgres'te `precision` anahtar kelime. `returns table` içinde `"precision"` diye tırnaklı
yazılır; yeni fonksiyonlarda da aynısı gerekir.

### Okuma fonksiyonları

- `get_timeline(locale)`: yayınlanmış olaylar + istenen dilde çeviri; yoksa `source_locale` çevirisi ve
  `is_fallback = true`.
- `get_event_detail(slug, locale)`: olay + çeviri + disiplinler + kişiler + bağlantılar (iki yönlü) +
  kaynaklar, tek JSON. Anon rolde taslak `null` döner.
- `get_chain(slug, locale, depth)`: `builds_on` zinciri, derinlik 6, döngü koruması (Hafta 10'da kullanılacak).
- Çağ ataması yıl üzerinden trigger ile otomatik.

### Güvenlik (RLS)

- İçerik tablolarında `select` herkese açık ama **yalnızca** `status = 'published' and deleted_at is null`
  satırlar (ADR-010). Frontend'deki `status` filtresi ikinci kilit, birincil değil.
- `insert/update/delete`: yalnızca `profiles.role in ('admin','editor')`.
- `/admin` ayrıca `proxy.ts` ile korunur (çift kilit): her istekte oturum yenilenir, anonim → **302**
  `/admin/login?next=…`, rolsüz hesap → `?error=forbidden`. `NextResponse.redirect` varsayılanı 307'dir,
  302 açıkça verilir.
- Storage bucket `images`: public read, admin write.
- Claude API anahtarı yalnızca sunucuda.
- Kanıt: `backend/scripts/rls-proof.sh` anon key ile REST/RPC'yi dener; yayınsız satır 0, `profiles` gizli,
  anon insert 401.
- **Bilinen açık**: `profiles` yazma politikası yalnızca admin, yani `editor` rolü kendi `ui_locale`'ini
  değiştiremez. Hafta 9'da editör hesaplarıyla birlikte self-update policy migration'ı gerekir.

## Admin → site anında yayın (ADR-021)

```
Admin formu kaydet (server action)
  → Supabase'e yaz
  → updateTag('timeline') + updateTag(`event:${slug}`)   # slug değiştiyse eskisi de
  → veri önbelleği düşer
  → sonraki ziyaretçi taze sayfayı görür
```

Ziyaretçi okumaları **çerezsiz anon client** ile yapılır (`lib/supabase/anon.ts`): RLS ziyaretçi olarak
uygulanır, giriş yapmış admin de sitede taslak görmez. Okumalar `unstable_cache` ile `timeline` ve
`event:{slug}` etiketlerinde; yedek `revalidate: 300`. Böylece Supabase Studio'dan elle yapılan değişiklik
en geç 5 dakikada görünür. Olay sayfaları `generateStaticParams` ile önceden render edilir.

`cacheComponents` + `"use cache"` geçişi Hafta 8'e ertelendi; `unstable_cache` bir gün kaldırılırsa
yalnızca `lib/queries/` içindeki dört fonksiyon değişir.

## Otomatik içerik hattı (Hafta 5, henüz yok)

```
Her gece 03:00 (GitHub Actions cron)
  → backend/scripts/draft-next.ts
  → 03'teki kalan listeden sıradaki 1-2 olayı seçer (önem 5 → 4 → 3, çağ dengesi)
  → Claude API (web search): 3+ kaynak, yıl çelişkilerini not, 03 şablonuna göre İngilizce JSON taslak,
    disiplin / önem / kişi / bağlantı önerileri
  → Supabase'e status='review', drafted_by='ai', research_note ve sources dolu
  → Telegram bildirimi
Sabah: /admin/review → oku, düzelt, Yayınla / Reddet
```

- Script **asla `published` yazmaz**; yayın kararı hep insan (ADR-014).
- Kapatma anahtarı `CONTENT_PIPELINE_ENABLED=false`. Kuyrukta 10'dan fazla bekleyen varsa üretmez.
- Maliyet: taslak başına ~30-50 bin token, ayda ~60 taslak ≈ 5-10 $.

## Çeviri hattı (Hafta 6, henüz yok)

1. Olay `source_locale` dilinde var (Claude taslağı `en`, senin yazdığın `ky`/`tr`).
2. "Diğer dillere çevir" → server action → Claude API: alanlar, ses tonu kuralları (03), terim sözlüğü
   ve yerleşik isim yazımları (06), hedef dil.
3. Dönen çeviriler `status='machine'` kaydedilir. Sıra: önce `en` ve `ru`, sonra `ky` (en+ru+tr referanslı).
4. Admin çeviri ekranında düzeltir → `reviewed`.
5. Sitede `machine` olanlar "otomatik çeviri" rozetiyle görünür, gizlenmez (ADR-008).

## Ortam değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # yalnızca sunucu ve betikler
ANTHROPIC_API_KEY=                # sunucu ve GitHub Actions
TELEGRAM_BOT_TOKEN= / TELEGRAM_CHAT_ID=
CONTENT_PIPELINE_ENABLED=true
REVALIDATE_SECRET=                # opsiyonel Supabase webhook
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_REPORT_EMAIL=         # dürüstlük bandındaki mailto
```

## Geliştirme akışı

- Yerel Docker **Colima** (`colima start`), Docker Desktop yok. Supabase CLI Homebrew'dan.
- `cd backend && supabase start` yerel Postgres; `supabase db reset` migration + seed baştan.
- Şema değişikliği = yeni `backend/supabase/migrations/NNNN_*.sql` + `cd web && npm run gen:types`.
- Branch: `main` = üretim (Vercel prod). Feature branch → PR → preview → merge.
- `npm run check` (typecheck + lint + Vitest) ve `npm run e2e` (Playwright, üretim build'e karşı) PR öncesi yeşil.
- Vitest Next'e bağımlı bileşenleri çözemiyor → saf mantık `lib/` altında, testler orada.

## Performans

Hedef modern telefonlar (ADR-016), Lighthouse mobil 90+. Timeline ve olay sayfaları statik/ISR. Fontlar
`next/font` ile self-host, Latin + Cyrillic alt kümesi. Görseller `next/image`, ilk üç kart hariç lazy.
Kaydırma dinleyicileri `passive` + `requestAnimationFrame`. `prefers-reduced-motion` saygı görür.

**Tuzak**: CSS minifier `1500ms` yerine `1.5s` yazar; süreyi `parseFloat` ile okuma, `parseDuration` kullan.
