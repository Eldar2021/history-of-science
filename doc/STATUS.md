# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 3 (başladı 2026-09-03, dal `el/week-3-event-detail`). Hedef: olay detayı, giriş geçişi, minimap, filtreler; M1'e giden yol (Hafta 4 sonu).
- **Hafta 2 kalan**: içerik kutucuğu (10 antik taslak) kullanıcı doğrulaması bekliyor; kod ve tasarım kapandı, PR #3 `main`'e birleşti.
- **Sonraki adım**: Hafta 3 kod kutucukları sırayla (aşağıda). İlk iş: olay detayı için `get_event_detail(slug, locale)` migration'ı (0002) + `/[locale]/event/[slug]` sayfası + timeline üstünde panel/sheet.
- **Kullanıcıdan bekleyen**: (0) 10 antik olay taslağını doğrula (`backend/content/drafts/`, `verify_note_tr`); yerelde `published`'a çevirme kararı. (1) Supabase MCP OAuth (`/mcp`) ya da `supabase login` + `supabase link --project-ref jnclaqxvfitggyprasxw`; bulut şeması hâlâ uygulanmadı. (2) İsteğe bağlı: `resource/Design system conflict scope/` klasörünü yeniden adlandır. (3) Hafta sonu kontrolü: bir arkadaşa telefonu ver, 2 dakika izle.
- **Bloklayan**: yok. Yerel geliştirme: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Hafta 3 kutucukları

**Kod**

- [x] Olay detay: masaüstü yan panel, mobil sheet, doğrudan URL tam sayfa; geri tuşu konumu korur. Migration `0002_event_detail.sql` (`get_event_detail(slug, locale)` tek JSON + `event_title` yardımcısı, anon'da taslak null), `lib/queries/event.ts`, `components/event/{EventDetail,DetailPanel}.tsx`, `app/[locale]/event/[slug]`, `app/[locale]/timeline/@panel/(..)event/[slug]` intercepting rota, `lib/content/markdown.ts` (### başlık + paragraf + *em*/**strong**, 5 test), kartlar tıklanabilir, `not-found.tsx`. Headless Chrome: panel/sheet açılır, Esc ve geri tuşu kapatır, kaydırma konumu birebir korunur, taslak 404. (2026-09-03)
- [ ] Ana sayfa + "Zamana düş" sayaç geçişi + reduced-motion.
- [ ] Minimap (gerçek ölçek, `xScale` ile) + tıklayınca atlama.
- [x] Disiplin filtre çipleri, URL senkron: `components/timeline/DisciplineFilter.tsx` + `lib/timeline/filter.ts` (5 test). `?d=physics,astronomy` seçilmeyenleri 0.3 soluklaştırır; "Sadece bunlar" çipi `&only=1` ile gizler, boş kalan çağ bölümleri de gizlenir; "Temizle"; boş sonuç mesajı; `?year=` korunur; yenilemede URL'den geri yüklenir. Sapma: 05'teki "ikinci tık = sadece bunlar" yerine ayrı çip (ikinci tıkın seçimi kaldırmasıyla çakışıyordu). (2026-09-03)
- [x] **Dürüstlük bandı** alt bilgide, 4 dilde, "Hata bildir" mailto (olay bilgisi otomatik): `components/HonestyBand.tsx` konu satırına olay başlığı + yıl, gövdeye sayfa URL'si; adres `NEXT_PUBLIC_REPORT_EMAIL` (Vercel prod/preview/dev + `.env.local` = Gmail), `NEXT_PUBLIC_SITE_URL` Vercel prod'a eklendi. (2026-09-03)

**İçerik**

- [ ] +10 olay (İslam Altın Çağı, Orta Asya vurgusu).

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
