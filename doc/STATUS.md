# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: İçerik sıfırlandı (ADR-036) ve yeniden toplanıyor. Teknik taraf bitti.
- **Yayında**: 1 olay — Newton, dört dilde, 3 künyeli görselle. Yeni tarifin ilk örneği ve doğrulaması.
- **Üretim kuyruğu**: `backend/content/top100.json`. Sıradaki olay = "listede olup veritabanında
  olmayan en düşük `rank`" — imleç dosyası yok, o yüzden paralel koşular birbirini ezmez.
  Yükleyici `backend/scripts/draft-to-sql.mjs`, sözleşme doğrulaması içinde.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.
- **Açık PR**: [#17](https://github.com/Eldar2021/history-of-science/pull/17) `el/panel-width-and-fixtures`
  — fixture geri düşüşü kalktı, panel genişleyebiliyor, Kırgızca sözlük. Merge senden.

## Açık işler

1. **Gece hattı**: `backend/scripts/pipeline/`, cron `0 16 * * *` (Bişkek 22:00) + elle tetikleme.
   Araştır → yaz → düşmanca doğrula → Commons'tan görsel (lisans API'den) → tr/ru/ky → `review` yaz →
   Telegram **haber** ver. Liste bitince yazmaz, "uzatalım mı?" der. Kırgızca sözlük hazır:
   `backend/scripts/glossary.ky.json`, her ky çeviri isteğine verilecek.
2. **Video yolu hiç denenmedi.** Kanalı oEmbed ile doğrulanabilen iyi bir belgesel bulunan ilk olayda açılır.

## Kullanıcıdan bekleyen

1. **Telegram botu**: @BotFather'dan token + chat id. Token'ı Claude'a verme, GitHub secret olarak gir.
2. **GitHub secrets**: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (yedek zaten `SUPABASE_DB_URL` kullanıyor, o ayrı).
3. **Kırgızca sözlükte 21 giriş `"confidence": "check"`** — Claude'un tahmini, Kırgızca bilen birinin
   onayı gerekiyor (теңдеме, айлана, кан айлануу, тукум куучулук, Улукбек…). Hat başlamadan önce
   bakılırsa bütün olaylar doğru terimle doğar.
4. Canlıda şifre sıfırlama hiç denenmedi. Gerçek e-posta yollar ve bulut admin şifresini değiştirir,
   o yüzden sende; yerelde uçtan uca çalıştığı görüldü.

**Bloklayan**: yok.

## Yaşayan notlar

- **Silinen 43 olayın tek kopyası** `backend/backup/2026-09-05T18-22-35Z/` (gitignore'da, 572 KB).
  İçeriği sayılarak doğrulandı: 43 olay, 150 bağlantı, 273 kaynak. **Silme.**
  Dump `COPY` değil çok satırlı `INSERT` üretiyor — satır sayarken buna dikkat.
  **Geri yükleme hâlâ hiç denenmedi** (`roles.sql` → `schema.sql` → `data.sql`); denenmemiş yedek
  yedek sayılmaz.
- Kutu anahtar sözcükleri **İngilizce**: `note, tip, important, warning, caution, theory`. Türkçe
  karşılığı yok; kutunun içi hedef dilde yazılır.
- Doğrudan SQL yazmak uygulamanın önbelleğini **atlar**; geri düşüş 300 saniye. Admin'den yayınlamak
  `updateTag` çağırdığı için anında etki eder. `sitemap.xml` saatte bir yenilenir.
- Admin'de **bir dili boşaltmak o çeviriyi silmez** (ADR-034). `saveEvent` işlem değil: yarıda kalan
  kayıt aynı formdan tekrar kaydedince onarılır.
- Liste araması, eksik dil filtresi ve sıralama bellekte çalışıyor; olay sayısı bir sayfayı aşarsa
  SQL'e taşınmalı (`lib/admin/events.ts`).
- Yerel DB'de 10 seed olayı `published` — bunlar içerik değil, **e2e fikstürü**. Karıştırma.
- e2e spec **dosyaları paralel** koşar ve aynı veritabanını paylaşır: `admin-publish` yayınlarken olay
  sayısı 11 olur. Olay sayısına dayanan iddia yazma (`2 of 10` yerine `/^2 of /`). Ayrıca tuşa basan
  test önce hidrasyonu beklemeli; `?event=` efektinin oturması iyi bir işaret.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum — 2026-09-06

STATUS'taki üç madde tek PR'da bitti (#17, dört commit, CI'da check yeşil, e2e koşuyordu):

- **Fixture geri düşüşü silindi** (ADR-037). `lib/fixtures/timeline.ts` yok; `lib/supabase/env.ts` tek
  kapı. Env eksikse build patlar, uydurma olay yayınlanamaz.
- **Panel masaüstünde genişleyebiliyor** (ADR-038): `components/event/DetailPanel.tsx` +
  `panelWidthStore.ts`, sınırlar `lib/panelWidth.ts`, `event.resizePanel` dört dilde.
- **`backend/scripts/glossary.ky.json`** yazıldı: 98 terim + 21 ad, 21'i `"confidence": "check"`.
  **Yarım kalan tek şey bu**: o 21 girişi Kırgızca bilen biri onaylamalı.
- Yolda çıkan: `the arrow keys do the same as the buttons` testi beş koşunun ikisinde düşüyordu
  (hidrasyondan önce tuşa basıyor). Düzeltildi; paralel admin spec'i yüzünden olay sayısına dayanan
  iddialar da regexp'e çevrildi.
- Kullanıcı uzun gövdeyi telefonda okudu: iyiydi, bölüm çapağı gerekmedi. Okuma deneyimi maddesi kapandı.
