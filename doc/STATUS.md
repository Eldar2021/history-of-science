# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 1 (başladı 2026-09-02). Oturum 2026-09-03'te kullanıcının token limiti nedeniyle yarıda kesildi.
- **Sonraki adım (kod)**: `web/` içinde henüz YOK olan dosyaları yaz, sonra `npm run check` ve `npm run dev` ile `/en/timeline` doğrula:
  1. `lib/supabase/server.ts` + `client.ts` (`@supabase/ssr`, Next 16'da `cookies()` async)
  2. `lib/queries/timeline.ts`: env yoksa `lib/fixtures/timeline.ts` (seed'deki 10 olay, İngilizce) döner; varsa `supabase.rpc('get_timeline', {p_locale})`
  3. `app/[locale]/page.tsx` (hero: `home.question`, `home.lead`, `home.cta` → `/timeline`) ve `app/[locale]/timeline/page.tsx` (düz liste: yıl `formatYear`, başlık, özet, disiplin çipleri, fallback rozeti)
  4. `components/LocaleSwitcher.tsx` (client; `usePathname`/`useRouter` from `@/i18n/navigation`) ve `components/HonestyBand.tsx`
  5. `npm run check` (tsc + eslint + vitest); eslint vitest.config/proxy için ayar gerekebilir
- **Sonraki adım (tasarım)**: Kullanıcı Claude Design konseptini `resource/Design system conflict scope/` altına koydu (`Uchkun - Foundation.dc.html` + `_ds/.../styles.css`, `_ds_manifest.json`). Bir sonraki oturumda: `styles.css` ve manifest'i oku, token'ları `web/app/globals.css` içindeki placeholder `:root` değişkenlerine aktar, `resource/design/tokens.json` olarak da kaydet. Klasörü `resource/design/` olarak yeniden adlandırmayı öner.
- **Kullanıcıdan bekleyen**: Supabase bulut projesi (backend/README.md adımları), Vercel bağlantısı, Docker + `brew install supabase/tap/supabase` (yerel DB için).
- **Bloklayan**: yok. DB olmadan da fixture ile site çalışacak şekilde tasarlandı.

## Hafta 1 kutucukları

- [~] `web/`: Next.js **16.3** (15 değil) + TS + Tailwind v4 + next-intl 4.14 kuruldu; `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `proxy.ts` (Next 16'da middleware yerine), `app/[locale]/layout.tsx` (Inter + Playfair Display, cyrillic-ext), `messages/{en,ru,ky,tr}.json`, `app/globals.css` placeholder token'lar. **Sayfalar henüz yok** (yukarıdaki 3. madde). Eski `app/layout.tsx` ve `app/page.tsx` silindi.
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

### 2026-09-03 — Hafta 1 kod (yarım)
- Next.js 16 iskeleti + next-intl 4 dil altyapısı + mesaj dosyaları + placeholder CSS token'ları.
- `0001_init.sql`, `seed.sql`, `backend/README.md`.
- `formatYear` + testler; vitest, scripts, `.env.example`.
- Yarım kalan: Supabase client, timeline sorgusu + fixture, `[locale]/page.tsx`, `[locale]/timeline/page.tsx`, LocaleSwitcher, HonestyBand, `npm run check` hiç çalıştırılmadı (sadece vitest).
- Kullanıcı Claude Design konseptini `resource/` altına getirdi; incelenmedi.

### 2026-09-02 — Planlama + kurulum

- 12 doküman yazıldı (`doc/`), kullanıcının 10 sorusu ve 9 risk cevabı işlendi, ADR-001..018.
- Kararlar: isim Uchkun; İngilizce önce yayın; Keşfet kanvası 3 ayda; gece otomatik içerik hattı + sabah insan onayı; admin 4 dilde; iki tema eşit; modern telefonlar; dürüstlük bandı.
- `CLAUDE.md`, `doc/STATUS.md`, `.claude/commands`, `.claude/agents` oluşturuldu.
- Hafta 1 koduna başlandı (aşağıya bak, oturum sonunda güncellenir).
