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

## Açık işler

1. **Gece hattı**: `backend/scripts/pipeline/`, cron `0 16 * * *` (Bişkek 22:00) + elle tetikleme.
   Araştır → yaz → düşmanca doğrula → Commons'tan görsel (lisans API'den) → tr/ru/ky → `review` yaz →
   Telegram **haber** ver. Liste bitince yazmaz, "uzatalım mı?" der. Kırgızca sözlük hazır:
   `backend/scripts/glossary.ky.json`, her ky çeviri isteğine verilecek.
2. **Uzun gövde okuma deneyimi**: masaüstünde panel genişliği artık okuyucunun (ADR-038). Telefonda
   1131 kelime hâlâ tek akış: bölüm çapaları / içindekiler gerekiyor mu, denenmedi.
3. **Video yolu hiç denenmedi.** Kanalı oEmbed ile doğrulanabilen iyi bir belgesel bulunan ilk olayda açılır.

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
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.
