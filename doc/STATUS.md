# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 1 (başladı 2026-09-02). Hafta 1 kod tarafı büyük ölçüde tamam (2026-09-03).
- **Doğrulandı**: `npm run check` (tsc + eslint + 38 test) yeşil; `next build` başarılı; `next start` ile `/` → `/ky` yönlendirmesi (Accept-Language), `/ky/timeline` ve `/tr/timeline` doğru yıl formatları ve çağ adlarıyla render ediyor. DB olmadan fixture ile çalışıyor.
- **Sonraki adım (kod, Hafta 2'ye geçiş)**: Tasarım konseptini entegre et: `resource/Design system conflict scope/_ds/*/styles.css` + `_ds_manifest.json` oku → `web/app/globals.css` placeholder token'larını değiştir, `resource/design/tokens.json` yaz, fontları konsepte göre güncelle (`app/[locale]/layout.tsx`), `Ңөү` kontrolü. Sonra Hafta 2 kutucukları: 3 boyutta kart, sticky çağ başlığı, canlı yıl göstergesi (IntersectionObserver), `?year=` derin bağlantı, `lib/timeline/xScale.ts`.
- **Küçük iş**: Timeline'da "zaman boşluğu" satırının render edilip edilmediğini tarayıcıda doğrula (curl testinde yakalanamadı; mantık `app/[locale]/timeline/page.tsx` içinde `showGap`).
- **Kullanıcıdan bekleyen**: Docker + `brew install supabase/tap/supabase`, Supabase bulut projesi (backend/README.md), Vercel bağlantısı, `.env.local` (`.env.example`'dan). Klasörü `resource/design/` olarak yeniden adlandırma önerisi.
- **Bloklayan**: yok.

## Hafta 1 kutucukları

- [x] `web/`: Next.js **16.3** (15 değil) + TS + Tailwind v4 + next-intl 4.14 kuruldu; `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `proxy.ts` (Next 16'da middleware yerine), `app/[locale]/layout.tsx` (Inter + Playfair Display, cyrillic-ext), `messages/{en,ru,ky,tr}.json`, `app/globals.css` placeholder token'lar. Sayfalar tamam: `app/[locale]/page.tsx` (hero), `app/[locale]/timeline/page.tsx` (düz liste, çağ başlıkları, zaman boşluğu, rozetler), `components/{SiteHeader,LocaleSwitcher,HonestyBand}.tsx`, `lib/supabase/{server,client}.ts`, `lib/queries/{timeline,types}.ts`, `lib/fixtures/timeline.ts` (env yoksa 10 olay).
- [x] `backend/supabase/migrations/0001_init.sql`: tam şema, RLS, `get_timeline(locale)`, `get_chain(slug, locale, depth)`, arama trigger'ı, era auto-assign. **Henüz bir DB'de çalıştırılmadı** (CLI yok); ilk `supabase db reset`'te SQL hatası çıkabilir, düzelt.
- [x] `backend/supabase/seed.sql`: 8 çağ + 8 disiplin 4 dilde, 10 İngilizce örnek olay (özet + neden önemli + orada olsaydın; gövdeler boş), 6 bağlantı. `backend/README.md` kurulum adımları.
- [x] `lib/i18n/formatYear.ts` + 32+ birim testi (Hafta 2 maddesi, erken yapıldı). `vitest.config.ts`, `.env.example`, `package.json` scriptleri (`check`, `test`, `typecheck`, `gen:types`).
- [ ] Vercel bağlı, `main` push = deploy (kullanıcı)
- [x] `CLAUDE.md`, `doc/STATUS.md`, `.claude/commands` (8 komut), `.claude/agents` (content-writer, fact-checker, timeline-ux-reviewer), `.claude/settings.local.json`
- [x] Tasarım: Claude Design konsepti geldi → `resource/Design system conflict scope/` (henüz incelenmedi, token'lar aktarılmadı)
- [ ] İçerik: ilk 5 olay şablonla yazıldı ve doğrulandı (seed'de 10 olayın özetleri var; gövdeler `/com_event` ile yazılacak)

## Notlar / kararlar (ADR'ye taşınacak)
- Next.js 16 kuruldu; dokümanlar "15" diyor, davranış aynı (App Router). `middleware.ts` yerine `proxy.ts`. Bir sonraki oturumda 04/CLAUDE.md'de "15" → "16" güncelle (ADR gerekmez).
- Geist fontu Kiril desteklemediği için Inter + Playfair Display'e geçildi; tasarım konsepti başka font seçtiyse ona uyulur.

## Oturum günlüğü

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
