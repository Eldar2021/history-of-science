# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 4 (başladı 2026-09-03, dal `el/week-4-admin`). Hedef: admin + auth + RLS kanıtı + Playwright → **M1** (02'deki MVP kabul kriterleri).
- **Hafta 4 kod: 6/6 bitti**, PR #6 `main`'e merge edildi, admin canlıda. Devam dalı `el/week-4-fix` (perf düzeltmeleri + taslaklar, push edildi, PR yok). Yerel `main` origin'den 2 commit ileride (aynı commit'ler dalda; PR merge edilince eşitlenir). Kalan: +7 olay → 50, hafta sonu kontrolü, video.
- **M1 durumu (02 kabul kriterleri)**: ✓ yıl göstergesi, ✓ detay + geri tuşu, ✓ `/admin` anonim 302, ✓ kaydet → anında, ✓ taslak RLS ile gizli (`rls-proof.sh`), ✓ 4 dil rotası + "bu dilde yok" rozeti. ✗ **50 yayınlı olay**: 43 yayında; +7 Aydınlanma olayı (Linnaeus, Franklin, oksijen, Herschel, Lavoisier, Jenner, Volta) gerekir. ✓ **Lighthouse mobil 85+**: canlı timeline 93 (2026-09-03); olay sayfası canlıda 80'di (dinamik render) → `generateStaticParams` ile 112 sayfa prerender, yerel üretimde timeline 100 / olay 100, CLS 0.139 → 0.021 (filtre çipi iskeleti). Merge sonrası canlıda yeniden ölç.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001+0002 (Hafta 4 migration istemedi). Vercel prod https://history-of-science.vercel.app; PR merge edilince admin canlıya çıkar, ek ortam değişkeni gerekmez (service key yalnızca betiklerde). Yerel: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`; yerel admin `admin@uchkun.local` / `uchkun-local-admin` (create-admin.mjs ile yeniden üretilebilir).
- **Sonraki adım**: (1) PR aç/merge → Vercel. (2) Merge sonrası https://history-of-science.vercel.app/admin/login ile gir → `/admin/events`'te 18 taslağı gözden geçirip yayınla; El-Harezmi, İbn-i Heysem, Uluğ Bey gövdelerini `backend/content/drafts/*.json`'dan forma yapıştır. (3) `/com_event` ile +15 Bilimsel Devrim olayı (03 listesi). (4) Lighthouse mobil yeniden ölç. (5) Hafta 5: içerik hattı.
- **Bulut admin hesabı var**: `eldiiaralmazbekov@gmail.com`, `profiles.role='admin'` (2026-09-03, `supabase db query --linked` ile doğrulandı). Şifre: `backend/scripts/cloud-admin-password.sh eldiiaralmazbekov@gmail.com` (anahtarı CLI'dan alır, şifreyi gizli sorar). E-posta sıfırlama bağlantısı localhost'a gidiyor → Hafta 5: bulut Auth Site URL + redirect listesi Vercel adresi, `/admin/reset-password` sayfası.
- **Kullanıcıdan bekleyen**: (1) PR merge. (2) "Kaydet → sitede anında" videosu: prod'da `/admin/events/new` → yayınla → `/en/timeline` yenile. (3) Uluğ Bey yılı: seed `1420 exact` vs taslak `circa`+`1437` (artık admin formundan düzeltilebilir). (4) Hafta 3 hafta sonu kontrolü (arkadaşa telefon). (5) +15 taslağın doğrulanması (yazılınca).
- **Kullanıcı geri bildirimi (2026-09-03)**: site çalışıyor ama "çok ham"; ana sayfa ilgi çekici değil. Kullanıcının ana sayfa için bir fikri var, kendi içinde değerlendiriyor; sorulmadan ana sayfayı yeniden tasarlama. Hafta sonu kontrolü ve beta testleri ("monkey test") daha sonra birlikte yapılacak; video zorunlu değil.
- **Bloklayan**: yok.

## Hafta 4 kutucukları

**Kod**

- [x] Supabase Auth + `profiles.role` + RLS kanıtı: `/admin/login` (e-posta + şifre, server action `signIn`/`signOut`, `lib/auth.ts` `getStaff`/`requireStaff` ikinci kilit), admin kök layout `app/admin/layout.tsx` (dil ön eksiz; UI dili `profiles.ui_locale` → `NEXT_LOCALE` çerezi → en, `i18n/request.ts`), `components/admin/AdminShell.tsx`, `lib/fonts.ts` iki kök layout'un ortak fontu, `messages/*.json` `admin` ad alanı 4 dilde. Yerel admin: `backend/scripts/create-admin.mjs <email> <şifre>` (service key ile Auth admin API + rol; `admin@uchkun.local` oluşturuldu). Kanıt `backend/scripts/rls-proof.sh` (anon key ile REST/RPC: yayınsız satır 0, silinmiş 0, çeviri/kaynak sızmıyor, `profiles` gizli, anon insert 401, taslak slug `get_event_detail` null; bir olay geçici `draft` yapılınca `get_timeline` 28→27). Not: yerel DB'de 28 olayın tamamı `published` (kullanıcı yerelde yayınlamış); bulutta 18 hâlâ `draft`. (2026-09-03)
- [x] `proxy.ts` admin koruması: `/admin*` her istekte Supabase oturumu yeniler (`lib/supabase/session.ts` `refreshSession`, `getUser()` + `profiles.role`); anonim → **302** `/admin/login?next=…`, rolsüz hesap → `?error=forbidden`, env yoksa `?error=noEnv`; girişli staff `/admin/login`'e gelirse panele. Site rotaları next-intl'de kaldı. Headless Chrome: anonim yönlendirme, yanlış şifre hatası, giriş, `next` korunumu, çıkış doğrulandı. (2026-09-03)
- [x] `/admin/events` liste + form: liste (yıl `formatYear` admin dilinde, başlık + slug, durum rozeti, hazırlayan insan/Claude, 4 dil rozeti: yazıldı/otomatik/yok, güncelleme; `?status=` süzgeci: tümü/taslak/inceleme/yayın/silinmiş); `new` ve `[id]` formu P0 alanlarla (yıl + bitiş yılı canlı MÖ/MS önizlemeli, kesinlik, önem 1-5 açıklamalı, başlık 80 ve özet 200 yumuşak sayaç, gövde markdown, neden önemli, orada olsaydın, disiplin çipleri, kaynak dil, slug otomatik/transliterasyonlu, durum). Tek seferde bir dil düzenlenir: `?locale=` sekmeleri (∅ = o dilde yok), kayıt `event_translations` upsert `status='human'`. Dosyalar: `lib/admin/{slug,eventForm,events}.ts` (`slugify` Kiril/Kırgız/Türkçe transliterasyon 5 test, `readEventForm`/`validateEventForm` 6 test), `app/admin/events/{page,actions,new/page,[id]/page}.tsx`, `components/admin/{EventForm,StatusBadge}.tsx`, `app/admin/not-found.tsx`, `admin.events` mesajları 4 dilde. Headless Chrome: doğrulama hataları girilen değerleri koruyor (`key=version` ile form yeniden kurulur), yeni olay `published` kaydedildi → çağ trigger'la atandı, en+tr çevirisi, birincil disiplin; `/en/event/...` ve `/tr/event/...` doğru başlıkla açıldı. (2026-09-03)
- [x] Kaydet → sitede anında (**ADR-021**): ziyaretçi okumaları çerezsiz anon client (`lib/supabase/anon.ts`) + `unstable_cache` etiketleri `timeline` / `event:{slug}` (`lib/cache-tags.ts`, yedek 300 sn); `saveEvent` action'ı `updateTag` ile düşürür (slug değişince eskisi de). Timeline sayfaları artık **SSG** (●), önceden `cookies()` yüzünden dinamikti. `next build` + `next start` kanıtı: `/en/timeline` x-nextjs-cache HIT 8 ms → admin'den yayınlı olay kaydı 135 ms → ilk istekte MISS + yeni olay listede, başlık düzenlemesi olay sayfasında anında, `draft`'a çekince 404. `cacheComponents` Hafta 8'e ertelendi. Video: kullanıcı (Vercel'de aynı akış). (2026-09-03)
- [x] Yumuşak silme + admin 4 dilde: `deleteEvent`/`restoreEvent` action'ları (`deleted_at`, `updateTag`), düzenleme sayfasında onaylı "Bu olayı sil" (`components/admin/ConfirmButton.tsx`), silinmişte turuncu şerit + "Geri al", listede `?status=deleted` süzgeci ve bildirim. Admin dili: başlıkta seçici (`components/admin/UiLocaleSelect.tsx` → `app/admin/actions.ts` `setUiLocale`, `profiles.ui_locale`). Sapma: ayrı `messages/admin.*.json` yerine mevcut `messages/{locale}.json` içinde `admin` ad alanı (98 anahtar, 4 dilde birebir eşit; tek yükleme noktası). Headless Chrome: iptal → kalır, onay → liste + bildirim, sitede 404, geri al → 200; tr/ky/en arayüz değişimi. Not: `profiles` yazma politikası yalnızca admin; `editor` rolü kendi `ui_locale`'ini değiştiremez → Hafta 9 editör hesaplarıyla birlikte migration (self-update policy). (2026-09-03)
- [x] Playwright: `@playwright/test` 1.62, `web/playwright.config.ts` (üretim `next build` + `next start` 3300, Chrome kanalı: indirme yok; `PW_BROWSER=chromium` seçeneği), `e2e/global-setup.ts` `create-admin.mjs` ile `e2e-admin@uchkun.local`, `e2e/admin-publish.spec.ts` 4 test: anonim `/admin/events` → 302 login; yanlış şifre hatası; **admin yayınlı olay ekler → çerezsiz ziyaretçi bağlamında `/en/timeline` ve `/en/event/{slug}`'da hemen görünür**; taslağa çekince 404 + listeden düşer; `afterAll` service key ile siler. `npm run e2e` (CLAUDE.md'ye eklendi). Yan kazanım: form alanları `htmlFor`/`id` + `aria-describedby` (ipucu metni erişilebilir adı şişiriyordu). (2026-09-03)

**İçerik**

- [~] +15 olay → 50: 15 Bilimsel Devrim taslağı (Vesalius, Tycho, Gilbert, Kepler, Galileo, Napier, F. Bacon, Harvey, Descartes, Torricelli, Royal Society, Boyle, Hooke, Leeuwenhoek, Rømer) 5 paralel `content-writer` ajanıyla; iki ajan oturum limitine takıldı ama dosyalar tamdı, mekanik hatalar (kaynak türü, 2 özet) elle düzeltildi. `check-drafts.mjs`: 43 taslak 0 hata, gövdeler 560-650 kelime. Ayrıca yayınlı 7 seed olayının (Thales, Öklid, Arşimet, Eratosthenes, Kopernik, Newton, transistör) boş gövdesi `fill-stubs-sql.mjs` ile taslaktan dolduruldu (6-7 kaynak, bağlantılar). Yerel ve **bulut**: 28 yayın + 15 `draft`, 150 bağlantı. Kullanıcı kararıyla 15'i de yayınlandı (2026-09-03, 2'si admin'den, 13'ü SQL): bulut ve yerel **43 yayın, 0 taslak**, anon `get_timeline` 43, canlı tr/ky/ru 43 (en ISR 5 dk içinde). `verify_note_tr` notları `events.research_note`'ta. 50 için 7 olay daha gerekir (Aydınlanma'dan: Linnaeus, Franklin, oksijen, Herschel, Lavoisier, Jenner, Volta). (2026-09-03)

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

### 2026-09-03 — 9. oturum: içerik turu + Lighthouse + bulut girişi
- Bulut admin hesabı zaten vardı (kullanıcının Gmail'i); e-posta sıfırlama bağlantısı localhost'a gidiyordu (bulut Auth Site URL yerel, sıfırlama sayfası yok → Hafta 5). `backend/scripts/cloud-admin-password.sh` ile şifre CLI anahtarıyla belirlendi, giriş başarılı. PR #6 kullanıcı tarafından merge edildi; admin canlıda.
- `/com_event`: 5 paralel `content-writer` ajanı, 22 olay (7 seed gövdesi + 15 Bilimsel Devrim). İki ajan oturum limitine takıldı ama dosyaları yazmıştı; mekanik hatalar elle düzeltildi (kaynak türü `museum/primary` → `other/paper`, iki özet kısaltıldı). `fill-stubs-sql.mjs` yazıldı (iki hata bulundu ve düzeltildi: kaynaklardan yalnız ilki giriyordu, research_note gövdeden sonra yazılıyordu). Yerel + bulut: kullanıcı kararıyla hepsi yayında, **43 olay**, 150 bağlantı; anon RLS kanıtı bulutta geçti.
- Lighthouse mobil canlı: timeline 93 (M1 yeşil), olay sayfası 80 → `generateStaticParams` ile 112 sayfa prerender, filtre çipi iskeleti ile CLS 0.139 → 0.021; yerel üretimde 100/100. `el/week-4-fix` dalında, merge bekliyor.
- Yarım kalan: +7 Aydınlanma olayı (50 için), M1 kutucuğu, hafta sonu kontrolü/beta testi (birlikte), ana sayfa fikri (kullanıcıdan gelecek).

### 2026-09-03 — 8. oturum: Hafta 4 kod kutucukları (tamamlandı)

- Auth: `/admin/login` + server action'lar, admin kök layout (dil ön eksiz, dili `profiles.ui_locale`'den), `proxy.ts` her `/admin` isteğinde oturum yeniler ve 302 ile korur; `lib/auth.ts` ikinci kilit. `backend/scripts/create-admin.mjs` (service key ile Auth admin API) ve `rls-proof.sh` (anon key ile sızma testi; bir olay geçici draft yapılınca timeline 28→27, detay null).
- Admin: liste + süzgeç, P0 formu (`useActionState`, `key=version` ile değerler korunur), dil sekmeleri, slug transliterasyonu, yumuşak silme/geri alma, admin dil seçici. 98 admin anahtarı 4 dilde (ayrı dosya yerine `admin` ad alanı).
- Önbellek (**ADR-021**): ziyaretçi okumaları çerezsiz anon client + `unstable_cache` etiketleri; `updateTag` ile kaydet → anında. Timeline sayfaları yeniden SSG. `cacheComponents` Hafta 8'e.
- Playwright: 4 test, üretim build'e karşı, Chrome kanalı. `npm run e2e`.
- Bulunan tuzaklar: `NextResponse.redirect` varsayılanı 307 (spec 302 → açıkça verildi). Headless testte `button[type=submit]` başlıktaki "Çıkış" düğmesini yakaladı → `main form`. Next route announcer `role=alert` taşıyor → `main [role=alert]`. Etiket içindeki ipucu metni erişilebilir adı bozuyordu → `aria-describedby`. `revalidateTag` Next 16'da ikinci argüman ister; server action'da `updateTag`.
- Yarım kalan: içerik (+15), M1'in 50 olay ve Lighthouse maddeleri, PR. `editor` rolü kendi `ui_locale`'ini yazamıyor (Hafta 9 migration).

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
