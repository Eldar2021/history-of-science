# Uchkun (Учкун) — Bilim Tarihi Timeline

Dört dilli (en, ru, ky, tr) bilim tarihi timeline sitesi. Kullanıcı (Eldiiar) bilim insanı değil; Türkçe/Kırgızca yazar.
**Her oturumun başında `/com_read_doc` çalıştır** ya da en azından `doc/STATUS.md` ve `doc/00-README.md` oku.
Kullanıcıyla Türkçe konuş. Kod, commit mesajları ve kod yorumları İngilizce.

## Yapı

- `doc/`: tek gerçek kaynak. 00 rehber, 01 vizyon, 02 spec, 03 içerik, 04 mimari, 05 timeline UX, 06 i18n, 07 tasarım promptu, 08 yol haritası, 09 ADR, 10 riskler, 11 Claude ile çalışma, STATUS güncel durum.
- `web/`: Next.js 16 App Router, TypeScript, Tailwind v4, next-intl. Site (`/[locale]/...`) + admin (`/admin`).
- `backend/supabase/`: SQL migration'lar, seed, `backend/scripts/` (içerik hattı, çeviri, kontroller). Supabase (Postgres, Auth, Storage).
- `mobile/`: Flutter, 5. ay+. Şimdilik boş.
- `resource/`: tasarım, fontlar, görsel kaynak listesi.

## Kurallar

- Şema değişikliği = yeni migration dosyası (`backend/supabase/migrations/NNNN_*.sql`) + `npm run gen:types` (web).
- Yıl formatlama sadece `web/lib/i18n/formatYear.ts`. Negatif yıl = MÖ, sıfır yılı yok.
- Zaman ölçeği tek fonksiyon `web/lib/timeline/xScale.ts`; minimap ve Keşfet kanvası bunu paylaşır.
- UI metni `web/messages/{locale}.json`; içerik veritabanında. Kodda sabit kullanıcı metni yok.
- Taslak (`draft`) ve onay bekleyen (`review`) içerik RLS ile gizli; frontend'deki `status` filtresi ikinci kilit.
- İçerik hattı (`backend/scripts/draft-next.ts`) yalnızca `status='review'` yazar. `published` yazan her kod insan eylemine bağlı olmalı.
- Türkçe büyük harf: `toUpperCase()` yasak; `toLocaleUpperCase('tr')` ya da hiç.
- Her yeni font `Ңөү` (Kırgızca harfler) ile test edilir.
- Görsel eklenirken atıf + lisans + kaynak URL zorunlu.
- Commit: `type(scope): summary` İngilizce. Örn. `feat(timeline): sticky year indicator`.
- Yeni özellik veya şema değişikliğinde önce plan özeti, onay, sonra kod. Bug/stil için doğrudan.
- Her önemli karar `doc/09-kararlar-ADR.md`'ye ADR olarak. Eskisini silme, geçersiz işaretle.

## Komutlar (web/ içinde, kurulduktan sonra)

- `npm run dev` — site
- `npm run check` — typecheck + lint + unit test
- `npm run gen:types` — Supabase tiplerini üret
- `cd ../backend && supabase start` — yerel DB; `supabase db reset` — migration + seed baştan

## Slash komutları (.claude/commands)

- `/com_read_doc` oturum başı bağlam · `/com_week N` haftayı başlat · `/com_wrapup` oturum sonu (STATUS + commit)
- `/com_event` olay taslağı yaz · `/com_adr` karar ekle · `/com_migration` şema değişikliği · `/com_check` kalite kontrol · `/com_i18n_check` dil kontrolü
