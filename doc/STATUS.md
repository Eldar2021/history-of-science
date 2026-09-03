# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 4 (başladı 2026-09-03, dal `el/week-4-admin`). Hedef: admin + auth + RLS kanıtı + Playwright → **M1** (02'deki MVP kabul kriterleri).
- **Hafta 3 kapanış**: 5 kod kutucuğu bitti, PR #5 (`el/week-3-content`) `main`'e birleşti. 18 taslak (antik 10 + altın çağ 8) yerel ve bulut DB'de `draft`; RLS gizliyor. Kalan: hafta sonu kontrolü (kullanıcı).
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl` (Frankfurt), migration 0001+0002 uygulanmış; Vercel prod https://history-of-science.vercel.app bulut DB'yi okuyor. Yerel: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.
- **Sonraki adım**: Hafta 4 kod kutucukları sırayla (aşağıda). Admin formu gelince: 18 taslağı yayına al, üç seed olayının (El-Harezmi, İbn-i Heysem, Uluğ Bey) gövdesini taslaktan uygula.
- **Kullanıcıdan bekleyen**: (1) Bulut admin hesabı: Supabase panelinde Authentication → Add user (e-posta + şifre), sonra rolü `admin` yapılır. (2) Uluğ Bey yılı: seed `1420 exact` vs taslak `circa`+`1437`. (3) Hafta 3 hafta sonu kontrolü: arkadaşa telefonu ver, 2 dk izle. (4) "Kaydet → sitede anında" videosu (kod bitince). (5) +15 Bilimsel Devrim taslağının doğrulanması.
- **Bloklayan**: yok.

## Hafta 4 kutucukları

**Kod**

- [x] Supabase Auth + `profiles.role` + RLS kanıtı: `/admin/login` (e-posta + şifre, server action `signIn`/`signOut`, `lib/auth.ts` `getStaff`/`requireStaff` ikinci kilit), admin kök layout `app/admin/layout.tsx` (dil ön eksiz; UI dili `profiles.ui_locale` → `NEXT_LOCALE` çerezi → en, `i18n/request.ts`), `components/admin/AdminShell.tsx`, `lib/fonts.ts` iki kök layout'un ortak fontu, `messages/*.json` `admin` ad alanı 4 dilde. Yerel admin: `backend/scripts/create-admin.mjs <email> <şifre>` (service key ile Auth admin API + rol; `admin@uchkun.local` oluşturuldu). Kanıt `backend/scripts/rls-proof.sh` (anon key ile REST/RPC: yayınsız satır 0, silinmiş 0, çeviri/kaynak sızmıyor, `profiles` gizli, anon insert 401, taslak slug `get_event_detail` null; bir olay geçici `draft` yapılınca `get_timeline` 28→27). Not: yerel DB'de 28 olayın tamamı `published` (kullanıcı yerelde yayınlamış); bulutta 18 hâlâ `draft`. (2026-09-03)
- [x] `proxy.ts` admin koruması: `/admin*` her istekte Supabase oturumu yeniler (`lib/supabase/session.ts` `refreshSession`, `getUser()` + `profiles.role`); anonim → **302** `/admin/login?next=…`, rolsüz hesap → `?error=forbidden`, env yoksa `?error=noEnv`; girişli staff `/admin/login`'e gelirse panele. Site rotaları next-intl'de kaldı. Headless Chrome: anonim yönlendirme, yanlış şifre hatası, giriş, `next` korunumu, çıkış doğrulandı. (2026-09-03)
- [x] `/admin/events` liste + form: liste (yıl `formatYear` admin dilinde, başlık + slug, durum rozeti, hazırlayan insan/Claude, 4 dil rozeti: yazıldı/otomatik/yok, güncelleme; `?status=` süzgeci: tümü/taslak/inceleme/yayın/silinmiş); `new` ve `[id]` formu P0 alanlarla (yıl + bitiş yılı canlı MÖ/MS önizlemeli, kesinlik, önem 1-5 açıklamalı, başlık 80 ve özet 200 yumuşak sayaç, gövde markdown, neden önemli, orada olsaydın, disiplin çipleri, kaynak dil, slug otomatik/transliterasyonlu, durum). Tek seferde bir dil düzenlenir: `?locale=` sekmeleri (∅ = o dilde yok), kayıt `event_translations` upsert `status='human'`. Dosyalar: `lib/admin/{slug,eventForm,events}.ts` (`slugify` Kiril/Kırgız/Türkçe transliterasyon 5 test, `readEventForm`/`validateEventForm` 6 test), `app/admin/events/{page,actions,new/page,[id]/page}.tsx`, `components/admin/{EventForm,StatusBadge}.tsx`, `app/admin/not-found.tsx`, `admin.events` mesajları 4 dilde. Headless Chrome: doğrulama hataları girilen değerleri koruyor (`key=version` ile form yeniden kurulur), yeni olay `published` kaydedildi → çağ trigger'la atandı, en+tr çevirisi, birincil disiplin; `/en/event/...` ve `/tr/event/...` doğru başlıkla açıldı. (2026-09-03)
- [x] Kaydet → sitede anında (**ADR-021**): ziyaretçi okumaları çerezsiz anon client (`lib/supabase/anon.ts`) + `unstable_cache` etiketleri `timeline` / `event:{slug}` (`lib/cache-tags.ts`, yedek 300 sn); `saveEvent` action'ı `updateTag` ile düşürür (slug değişince eskisi de). Timeline sayfaları artık **SSG** (●), önceden `cookies()` yüzünden dinamikti. `next build` + `next start` kanıtı: `/en/timeline` x-nextjs-cache HIT 8 ms → admin'den yayınlı olay kaydı 135 ms → ilk istekte MISS + yeni olay listede, başlık düzenlemesi olay sayfasında anında, `draft`'a çekince 404. `cacheComponents` Hafta 8'e ertelendi. Video: kullanıcı (Vercel'de aynı akış). (2026-09-03)
- [ ] Yumuşak silme. Admin UI 4 dilde (`messages/admin.*.json`).
- [ ] Playwright: "admin ekler, sitede görünür".

**İçerik**

- [ ] +15 olay → 50 (Bilimsel Devrim'e kadar).

**Kilometre taşı M1**

- [ ] 02'deki MVP kabul kriterleri yeşil. Sadece kullanıcının bildiği URL'de.

## Hafta 3 kutucukları

**Kod**

- [x] Olay detay: masaüstü yan panel, mobil sheet, doğrudan URL tam sayfa; geri tuşu konumu korur. Migration `0002_event_detail.sql` (`get_event_detail(slug, locale)` tek JSON + `event_title` yardımcısı, anon'da taslak null), `lib/queries/event.ts`, `components/event/{EventDetail,DetailPanel}.tsx`, `app/[locale]/event/[slug]`, `app/[locale]/timeline/@panel/(..)event/[slug]` intercepting rota, `lib/content/markdown.ts` (### başlık + paragraf + _em_/**strong**, 5 test), kartlar tıklanabilir, `not-found.tsx`. Headless Chrome: panel/sheet açılır, Esc ve geri tuşu kapatır, kaydırma konumu birebir korunur, taslak 404. (2026-09-03)
- [x] Ana sayfa + "Zamana düş" sayaç geçişi + reduced-motion: `components/FallLink.tsx` (CTA, sessionStorage bayrağı) + `components/timeline/FallOverlay.tsx` (tam ekran örtü, 2026 → ilk olay ya da `?year=`, `--duration-fall` 1.5 s ease-out, `formatYear` ile MÖ/MS; reduced-motion'da sayaç yok, 250 ms fade). `lib/timeline/fall.ts` (`easeOut`, `parseDuration`; 4 test). Paylaşılan timeline linki düz açılır, bayrak yalnızca CTA'dan gelir. Bulunan hata: minifier `1500ms`→`1.5s` yazıyor, `parseFloat` 1.5 ms okuyordu. (2026-09-03)
- [x] Minimap (gerçek ölçek, `xScale` ile) + tıklayınca atlama: `components/timeline/Minimap.tsx` tek SVG, `lib/timeline/minimap.ts` (yoğunluk kutuları karekök ölçekli, en yakın olay; 6 test). Mobilde alt şerit, masaüstünde sağ sütun; çağ çizgileri, ekrandaki yıl bandı, canlı imleç (passive scroll + rAF); tıklama/sürükleme en yakın olaya kaydırır, reduced-motion'da anında. `aria-label` yılı söyler. Headless Chrome iki boyutta doğrulandı. Sol çağ sütunu (masaüstü 3 sütun) yapılmadı; sticky çağ pill'i şimdilik yeterli. (2026-09-03)
- [x] Disiplin filtre çipleri, URL senkron: `components/timeline/DisciplineFilter.tsx` + `lib/timeline/filter.ts` (5 test). `?d=physics,astronomy` seçilmeyenleri 0.3 soluklaştırır; "Sadece bunlar" çipi `&only=1` ile gizler, boş kalan çağ bölümleri de gizlenir; "Temizle"; boş sonuç mesajı; `?year=` korunur; yenilemede URL'den geri yüklenir. Sapma: 05'teki "ikinci tık = sadece bunlar" yerine ayrı çip (ikinci tıkın seçimi kaldırmasıyla çakışıyordu). (2026-09-03)
- [x] **Dürüstlük bandı** alt bilgide, 4 dilde, "Hata bildir" mailto (olay bilgisi otomatik): `components/HonestyBand.tsx` konu satırına olay başlığı + yıl, gövdeye sayfa URL'si; adres `NEXT_PUBLIC_REPORT_EMAIL` (Vercel prod/preview/dev + `.env.local` = Gmail), `NEXT_PUBLIC_SITE_URL` Vercel prod'a eklendi. (2026-09-03)

**İçerik**

- [~] +10 olay (İslam Altın Çağı, Orta Asya vurgusu): 11 taslak `backend/content/drafts/` (Brahmagupta, El-Harezmi, El-Farabi, İbn-i Heysem, İbn Sina, El-Biruni, Ömer Hayyam, Fibonacci, Roger Bacon, Uluğ Bey, Gutenberg), 4 paralel `content-writer` ajanı, her biri 5-7 kaynak + `verify_note_tr`. Üçü (El-Harezmi, İbn-i Heysem, Uluğ Bey) seed'de yayında olan olayların tam gövdesi; loader yayınlanmışa dokunmadığı için bunlar admin formu (Hafta 4) ya da elle SQL ister. `backend/scripts/check-drafts.mjs` (yeni, bağımlılıksız): 21 taslak 0 hata; 10 gövde 610-652 kelime (üst sınır 600, kısaltma kararı incelemede). Kullanıcı onayladı (2026-09-03); 18 taslak (antik 10 + altın çağ 8) yerel ve **bulut** DB'ye `draft` olarak yüklendi (73 bağlantı), RLS gizliyor. `drafts-to-sql.mjs` düzeltildi: önceden yayınlanmış slug'ın çeviri/disiplin/kaynak satırlarını üzerine yazıyordu, artık her adım `status='draft'` korumalı. Üç seed olayının (El-Harezmi, İbn-i Heysem, Uluğ Bey) gövdesi bekliyor: admin formu ya da elle SQL. (2026-09-03)

**Hafta sonu kontrolü**

- [ ] Bir arkadaşa telefonu ver, 2 dakika sessiz izle, not al. (kullanıcı)

## Hafta 2 kutucukları

**Kod**

- [x] Dikey akış, 3 boyutta olay kartı (landmark / standart / küçük not), sticky çağ başlığı, zaman boşluğu işareti (konsept 1d-1g). `components/timeline/{EventCard,EraHeader,TimeGap}.tsx`, `getDisciplines(locale)` ile çevrili çipler. (2026-09-03)
- [x] Sabit üst çubuk + canlı yıl göstergesi (IntersectionObserver, odometer, `aria-live`). `components/timeline/YearIndicator.tsx`; headless Chrome ile kaydırma testi geçti. (2026-09-03)
- [x] `formatYear` 4 dil × 4 kesinlik × MÖ/MS, Vitest (Hafta 1'de yapıldı, 38 test).
- [x] Tasarım token'ları (`tokens.json` → `globals.css`), her iki tema; sistem tercihi + anahtar (`components/ThemeToggle.tsx`, `lib/theme.ts` flaş önleyici script, localStorage). (2026-09-03)
- [x] `?year=` derin bağlantı (`components/timeline/DeepLink.tsx`, en yakın olaya atlar; sayfa statik kalır). (2026-09-03)
- [x] `xScale(year, zoom, pan)` ölçek fonksiyonu (`lib/timeline/xScale.ts`, 13 test: sıfır yılı yok, tersi, zoom/pan, Z0-Z3, imleç etrafında zoom). (2026-09-03)

**Tasarım**

- [x] Birincil tema seçildi: **açık** (S15, ADR-020, 2026-09-03). CSS varsayılanı açık, karanlık sistem tercihi/`data-theme`; anahtar başlıkta, iki tema ekran görüntüsüyle doğrulandı.

**İçerik**

- [~] +10 olay İngilizce (antik dünya): 10 taslak `backend/content/drafts/*.json` (Pisagor, Demokritos, Hipokrat, Platon, Aristoteles, Hipparkos, Batlamyus, Galen, Hypatia, Aryabhata), her biri 5-7 kaynak ve Türkçe doğrulama notuyla. Yerel DB'ye `draft` olarak yüklendi (`backend/scripts/drafts-to-sql.mjs`, 37 bağlantı dahil); RLS gizliyor. **Kullanıcı doğrulaması ve yerel yayın kararı bekliyor.** (2026-09-03)

**Hafta sonu kontrolü**

- [x] `/en/timeline` konsepteki gibi akıyor; yıl göstergesi kaydırdıkça güncelleniyor; `?year=1687` Newton kartına düşüyor (headless Chrome, 2026-09-03).

## Hafta 1 kutucukları

- [x] `web/`: Next.js **16.3** (15 değil) + TS + Tailwind v4 + next-intl 4.14 kuruldu; `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `proxy.ts` (Next 16'da middleware yerine), `app/[locale]/layout.tsx`, `messages/{en,ru,ky,tr}.json`. Sayfalar: `app/[locale]/page.tsx` (hero), `app/[locale]/timeline/page.tsx` (düz liste, çağ başlıkları, zaman boşluğu, rozetler), `components/{SiteHeader,LocaleSwitcher,HonestyBand}.tsx`, `lib/supabase/{server,client,types}.ts`, `lib/queries/{timeline,types}.ts`, `lib/fixtures/timeline.ts` (env yoksa 10 olay).
- [x] `backend/supabase/`: `config.toml` (`supabase init`), `migrations/0001_init.sql` (tam şema, RLS, `get_timeline`, `get_chain`, arama trigger'ı, era auto-assign) **yerelde çalıştırıldı ve doğrulandı**. Bulut projesi henüz bağlanmadı (MCP/OAuth kullanıcıya bağlı).
- [x] `backend/supabase/seed.sql`: 8 çağ + 8 disiplin 4 dilde, 10 İngilizce örnek olay, 6 bağlantı. Yerelde uygulandı.
- [x] `lib/i18n/formatYear.ts` + 38 birim testi (Hafta 2 maddesi, erken yapıldı).
- [x] Vercel bağlı, `main` push = deploy: https://history-of-science.vercel.app (2026-09-03). Proje `eldiiar1/history-of-science`, Root Directory `web`, Framework `nextjs` (import sırasında "Other" kalmıştı → 404; API ile düzeltildi). Ortam değişkeni yok, fixture verisiyle çalışıyor.
- [x] `CLAUDE.md`, `doc/STATUS.md`, `.claude/commands` (8 komut), `.claude/agents` (3 ajan), `.claude/settings.local.json`, `.mcp.json` (Supabase)
- [x] Tasarım: Claude Design konsepti incelendi, token'lar aktarıldı (ADR-019). Konsept: `resource/Design system conflict scope/Uchkun - Foundation.dc.html`; taban sistem `_ds/organic-*/` (yalnızca referans).
- [ ] İçerik: ilk 5 olay şablonla yazıldı ve doğrulandı (seed'de 10 olayın özetleri var; gövdeler `/com_event` ile yazılacak)

## Notlar / kararlar

- Yerel Docker **Colima** ile (`colima start`); Docker Desktop yok. Supabase CLI 2.116 Homebrew'dan kuruldu.
- Postgres'te `precision` anahtar kelime: `returns table` içinde `"precision"` diye tırnaklı. Yeni fonksiyonlarda da aynısı gerekir.
- Çağların kendi rengi yok (konsept); `era-*` token'ları adaçayına işaret ediyor. Explore kanvası turunda çağ paleti istenecek.
- Tailwind'de `text-base` yazı boyutu utility'sidir, renk değil; renk için `text-accent-ink` gibi token adları kullan.
- `04-mimari` ve `CLAUDE.md` artık Next 16 / `proxy.ts` diyor.

## Oturum günlüğü

### 2026-09-03 — 7. oturum: Hafta 3 kod kutucukları (tamamlandı)

- Migration `0002_event_detail.sql`: `get_event_detail(slug, locale)` tek JSON, `event_title` yardımcısı; anon rolüyle taslak null doğrulandı; `gen:types`.
- Olay detayı: `/[locale]/event/[slug]` tam sayfa + `timeline/@panel/(..)event/[slug]` intercepting rota (masaüstü yan panel, mobil sheet). `router.replace` ile kapatmak slot'u açık bırakıyor (Next yumuşak geçişte slot durumunu korur, `default.tsx` yalnızca sert yüklemede); panel yalnızca yumuşak geçişle açılabildiği için `router.back()` her zaman doğru.
- Dürüstlük bandı mailto: olay başlığı + yıl + URL, `NEXT_PUBLIC_REPORT_EMAIL` (Vercel prod/preview/dev + `.env.local`), `NEXT_PUBLIC_SITE_URL` Vercel prod.
- Disiplin çipleri (`?d=`, `&only=1`), SVG minimap (`xScale`), "Zamana düş" örtüsü. 5 commit.
- Bulunan tuzaklar: Vitest, Next'e bağımlı bileşeni çözemiyor → saf mantık `lib/timeline/*.ts`'de, testler orada. CSS minifier `1500ms`→`1.5s`, `parseFloat` ile süre 1.5 ms oluyordu → `parseDuration`. Puppeteer `click` elemanı görünür alana kaydırır; kaydırma konumu testlerinde `evaluate` ile tıklanmalı.
- Bulut: Supabase CLI girişli değil (OAuth tarayıcı ister); `backend/scripts/cloud-setup.sh` hazır, `backend/README.md` güncel. Vercel CLI girişli.
- `timeline-ux-reviewer` raporu (05/02/06'ya karşı, Lighthouse mobil yerel: timeline 84, olay 86): blocker yok. Aynı oturumda düzeltildi: panel içi bağlantılar `replace` (Esc/geri tek adımda kapatır), odak tuzağı (`inert` + odak iadesi), minimap `role=slider` + ok/Home/End tuşları, `@panel/loading.tsx` iskelet, mobilde bandın alt boşluğu, çipler `history.replaceState` (sunucu turu yok), başlık sırası h1→h2, arka plan düğmesi `aria-hidden`, dikey minimap `lg` ve üstü.
- Rapordan ertelenenler: **Lighthouse mobil 84 < 85** (374 KB font, 8 dosya; `latin-ext` Türkçe için şart → Hafta 8 performans turunda ağırlık/eksen kısıtı, ADR gerekebilir); `event_links.type='enables'` hiçbir listede okunmuyor (0001'de enum'da yok, 04 "tek yön saklanır" diyor; 02:88 ile çelişki, Hafta 4 migration'ında karar); `<time>` negatif yıl için geçersiz `dateTime`; rozetler tıklanamıyor (05:128); kart klavye gezintisi `↑/↓/Enter/[ ]`, yıl girme, `min=4` anahtarı, 30 kartlık artımlı yükleme (200 olayda LCP), `hreflang`; `revalidate=300` `cookies()` yüzünden etkisiz (anonim okumaları cookie'siz client'a taşımak TTFB kazandırır).
- İçerik turu (aynı gün, `/com_event`): 11 İslam Altın Çağı taslağı, `check-drafts.mjs` repo'ya alındı, üç eski taslakta `ibn-sina-canon?` / `brahmagupta-zero?` bağlantıları çözüldü. Uluğ Bey taslağı kaynak çelişkisi yüzünden `circa` + `year_end 1437` seçti; seed `1420 exact`, karar kullanıcıda. Britannica yine 403, ajanlar arama özetine dayandı.
- Yarım kalan: taslak doğrulaması (antik 10 + altın çağ 11), hafta sonu kontrolü (kullanıcı), masaüstü sol çağ sütunu (isteğe bağlı, Hafta 4+).

### 2026-09-03 — 6. oturum: içerik taslakları (Hafta 2 içerik kutucuğu)

- `/com_event` ile antik listeden 10 olay, 4 paralel `content-writer` ajanıyla: Pisagor, Demokritos, Hipokrat, Platon, Aristoteles, Hipparkos, Batlamyus, Galen, Hypatia, Aryabhata → `backend/content/drafts/*.json` (+ `backend/content/README.md`). Her taslak 5-7 kaynak, `verify_note_tr`, `status: draft`; DB'ye yazılmadı.
- Doğrulama betiği (scratchpad, `check-drafts.py`): alanlar, uzunluklar, disiplin/bağlantı slug'ları, kaynak sayısı. Hafta 5'te `backend/scripts/` içine TS olarak taşınabilir.
- Sorunlar: Britannica doğrudan çekilemiyor (403), ajanlar arama özetlerine dayandı → kullanıcı elle açmalı. 12 ileri bağlantı `?` ile işaretli (hedef olaylar yazılmamış). Empedokles ve Zhang Heng bu turda yazılmadı.
- Yarım kalan: taslakların insan doğrulaması ve DB yüklemesi (kullanıcı kararı).

### 2026-09-03 — 5. oturum: Hafta 2 kod kutucukları (tamamlandı)

- Kartlar 3 boyutta, sticky çağ pill'i, zaman boşluğu, çevrili disiplin çipleri (`getDisciplines`); canlı yıl göstergesi; `?year=` derin bağlantı; `lib/timeline/xScale.ts` + 13 test; tema anahtarı (`lib/theme.ts` + `components/ThemeToggle.tsx`). 6 commit.
- Doğrulama: headless Chrome (puppeteer-core, scratchpad'de; projeye bağımlılık eklenmedi). Playwright Hafta 4'te gelecek.
- Bulunan sorunlar: React Compiler lint kuralları (render'da değişken atama, effect'te setState) iki yerde tasarımı değiştirdi: gap'ler önceden hesaplanıyor, tema `useSyncExternalStore` ile. `"use client"` modülünden sabit export server'a taşınamıyor → `lib/theme.ts`.
- Yarım kalan: yok. İçerik kutucuğu (+10 antik olay) bekliyor; masaüstü 3 sütunlu düzen (sol çağ listesi, sağ minimap) Hafta 3'te minimapla birlikte.

### 2026-09-03 — 4. oturum (kısa): Hafta 2 açılışı

- `el/week-2-timeline-mvp` dalı `el/try-planning` üzerinden açıldı. Kod yazılmadı.
- Hafta 2 kutucukları STATUS'a kopyalandı; plan sunuldu: (1) 3 boyutta kart + sticky çağ pill + zaman boşluğu, `getDisciplines(locale)` ile çevrili çip adları; (2) üst çubuk + canlı yıl (IntersectionObserver, odometer, aria-live); (3) `?year=`; (4) `xScale.ts` + test; (5) tema anahtarı (`data-theme` + localStorage + inline script). Varsayımlar: zaman boşluğu bu hafta yalnızca "~N yıl geçti"; liste sunucuda render, yalnızca yıl göstergesi/tema client.
- Kullanıcı onayı gelmedi; sonraki oturum bu planla başlar.

### 2026-09-03 — 3. oturum: tasarım token'ları + yerel Supabase

- Konsept dosyaları okundu; `tokens.json` çıkarıldı, `globals.css` iki temayla yeniden yazıldı, fontlar Golos Text + Literata (`cyrillic-ext`, `Ңөү` fontTools ile woff2'de doğrulandı). ADR-019.
- Ana sayfa CTA renk hatası düzeltildi (`text-base` → `text-accent-ink`).
- Supabase CLI kuruldu, Colima başlatıldı, `supabase init` + `supabase start`; `0001_init.sql`'de `"precision"` düzeltmesi; seed uygulandı; RLS anonim testi geçti; `gen:types`; `.env.local`.
- Site DB'ye karşı `next start` ile doğrulandı. `.mcp.json` eklendi; MCP bu oturumda bağlı değildi.

### 2026-09-03 — Hafta 1 kod (tamamlandı, iki oturumda)

- Next.js 16 iskeleti + next-intl 4 dil altyapısı + mesaj dosyaları + placeholder CSS token'ları.
- `0001_init.sql`, `seed.sql`, `backend/README.md`.
- `formatYear` + 38 test; vitest (`vitest.config.mts`), scripts, `.env.example`.
- Supabase server/client, `getTimeline`/`getEras` (env yoksa fixture), ana sayfa, timeline düz liste, SiteHeader, LocaleSwitcher, HonestyBand.
- `npm run check` ve `next build` yeşil; `next start` smoke testi: yönlendirme ve ky/tr render doğru.
- Kullanıcı Claude Design konseptini `resource/Design system conflict scope/` altına getirdi; henüz incelenmedi (Hafta 2 ilk iş).

### 2026-09-02 — Planlama + kurulum

- 12 doküman yazıldı (`doc/`), kullanıcının 10 sorusu ve 9 risk cevabı işlendi, ADR-001..018.
- Kararlar: isim Uchkun; İngilizce önce yayın; Keşfet kanvası 3 ayda; gece otomatik içerik hattı + sabah insan onayı; admin 4 dilde; iki tema eşit; modern telefonlar; dürüstlük bandı.
- `CLAUDE.md`, `doc/STATUS.md`, `.claude/commands`, `.claude/agents` oluşturuldu.
- Hafta 1 koduna başlandı (aşağıya bak, oturum sonunda güncellenir).
