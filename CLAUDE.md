# Uchkun (Учкун) — Bilim Tarihi Timeline

Dört dilli (en, ru, ky, tr) bilim tarihi sitesi: ana sayfa bir küre + zaman şeridi, olay sayfaları,
`/admin`. Kullanıcı (Eldiiar) bilim insanı değil; Türkçe/Kırgızca yazar. **Kullanıcıyla Türkçe konuş.**
Kod, commit mesajları ve kod yorumları İngilizce.

**Her oturumun başında `/com_read_doc`** (STATUS + git). Diğer dokümanları işe göre aç:

| Dosya                              | Ne zaman                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `doc/STATUS.md`                    | Her oturum: neredeyiz, ne bekliyor, son oturum        |
| `doc/03-icerik-stratejisi.md`      | Olay yazarken: çağlar, şablon, ses tonu, kalan liste  |
| `doc/04-mimari.md`                 | Kod yazarken: şema, RLS, önbellek, küre, tuzaklar     |
| `doc/06-i18n-stratejisi.md`        | Dil işi: yıl tablosu, Kırgızca, çeviri hattı          |
| `doc/08-yol-haritasi.md`           | Faza başlarken                                       |
| `doc/09-kararlar-ADR.md`           | Bir kararı sorgularken                               |
| `doc/10-riskler-ve-acik-sorular.md`| Açık sorular, park edilmiş fikirler                   |

Vizyon ve ürün ilkeleri kök `README.md`'de. `doc/` çalışan hafızadır, arşiv değil: **biten iş
dokümandan silinir**; geçmişin cevabı `git log`.

## Yapı

- `web/`: Next.js 16 App Router, TypeScript, Tailwind v4, next-intl. Site (`/[locale]`) + admin (`/admin`).
- `backend/supabase/`: migration'lar ve seed. `backend/scripts/`: admin oluşturma, RLS kanıtı, taslak → SQL.
  `backend/content/drafts/`: olay taslakları (JSON).
- `mobile/`: Flutter, sonra. Boş.

## Kurallar

- Şema değişikliği = yeni migration (`backend/supabase/migrations/NNNN_*.sql`) + `npm run gen:types` (web).
- Yıl formatlama sadece `web/lib/i18n/formatYear.ts`; yer metni sadece `formatPlace.ts`. Negatif yıl = MÖ,
  sıfır yılı yok. Yer belirsizliği veride enum (`place_precision`), sözcük UI'dan; `place_name` çıplak ad.
- Zaman ölçeği tek fonksiyon `web/lib/timeline/xScale.ts`; zaman şeridi ve ileride Keşfet kanvası paylaşır.
- UI metni `web/messages/{locale}.json`; içerik veritabanında. Kodda sabit kullanıcı metni yok.
  Yeni admin ekranı dört dilde eklenir.
- Taslak (`draft`) ve onay bekleyen (`review`) içerik RLS ile gizli; frontend'deki `status` filtresi ikinci kilit.
- `published` yazan her kod insan eylemine bağlı olmalı; içerik hattı yalnızca `status='review'` yazar.
- Tasarım token'ları `web/app/globals.css`, tek tema (koyu). Fontlar Onest + Literata; her yeni font
  `Ңөү` **ve** `değil Çağı` ile görsel olarak test edilir.
- Türkçe büyük harf: `toUpperCase()` yasak; `toLocaleUpperCase('tr')` ya da hiç.
- Görsel eklenirken atıf + lisans + kaynak URL zorunlu.
- Commit: `type(scope): summary` İngilizce. Feature branch → PR → merge; `main` = üretim.
- Yeni özellik veya şema değişikliğinde önce plan özeti, onay, sonra kod. Bug/stil için doğrudan.
- İçerik doğrulama kullanıcının: Claude taslak yazar ve kaynak önerir, yayın kararı insan.
- Her önemli karar `doc/09`'a ADR. Karar değişirse yeni ADR; eskisi silinir ya da "Geçersiz, bkz. ADR-N".
  Koda tamamen gömülmüş ADR silinir.

## Komutlar (web/ içinde)

- `npm run dev` — site · `npm run check` — typecheck + lint + unit test
- `npm run e2e` — Playwright (üretim build + yerel Supabase + kurulu Chrome; `e2e/`)
- `npm run gen:types` — Supabase tipleri
- `colima start` → `cd backend && supabase start` — yerel DB; `supabase db reset` — migration + seed baştan

## Slash komutları (.claude/commands)

`/com_read_doc` oturum başı · `/com_wrapup` oturum sonu (STATUS + commit) · `/com_event` olay taslağı ·
`/com_adr` karar · `/com_migration` şema · `/com_check` kalite · `/com_i18n_check` dil kontrolü.
Ajanlar (`.claude/agents/`): `content-writer`, `fact-checker`, `timeline-ux-reviewer`.
