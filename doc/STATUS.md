# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: M1 (50 olay) + **Faz Q (doğruluk)**. Teknik taraf bitti; darboğaz artık hız değil doğruluk.
- **İçerik**: 2026-09-24'te **37/100 yayında**, hepsi dört dilde, hepsi önem 5. 85 görsel, 69 kutu,
  0 video, 48 `builds_on` bağlantısı. EN gövdeler 965-2709 kelime. Çevirilerin hiçbiri `reviewed` değil.
- **Doğruluk**: yayındaki üç olayın bağımsız denetimi ~750 kelimede bir somut hata buldu (riskler.md R2).
  Plan `yol-haritasi.md` Faz Q.
- **Üretim kuyruğu**: `backend/content/top100.json`, sıradaki rank 38 (Mendeleyev). Yükleyici
  `backend/scripts/draft-to-sql.mjs`, sözleşme doğrulaması içinde.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.
- **Hat çalışıyor** (ADR-039): `backend/scripts/pipeline/`, **API anahtarı değil Claude Code
  aboneliği**. 18 günde 1 düşen koşu (09-18: arka plan ajanı 600 sn'de bitmedi; `run.md` artık
  fact-checker'ı ön planda koşturuyor). Sırlar ve durdurma `mimari.md`'de.

## Açık işler

1. **Sitede kırık olanlar** (`yol-haritasi.md` "Şimdi"): önce 15 MB'lık Commons görselleri, sonra
   bağlantılı yıllarda kaybolan "yaklaşık" (migration ister). Bir sonraki iş.
2. **Faz Q1 + Q2**: iddia defteri ve bağımsız doğrulayıcı.
3. **Faz Q3**: yayındaki 37 olayın denetimi; ilk yedi hata elimizde (Uluğ Bey, Haber-Bosch, Rutherford).

## Kullanıcıdan bekleyen

1. **Üç olaydaki yedi hatayı düzelt ya da Q3'ü bekle.** Bulgular kaynaklarıyla
   `backend/content/audit/` altında (Uluğ Bey, Haber-Bosch, Rutherford).
2. **Q1/Q2 gelene kadar yeni olayları nasıl yayınlayacağın**: benim önerim araştırma notundaki
   "kontrol et" maddelerini okumadan yayınlamamak.
3. **Kırgızca sözlükte 21 giriş `"confidence": "check"`** ve bir Kırgızca okuyucu (S13).
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
- Yerel DB'de 10 seed olayı `published` — bunlar içerik değil, **e2e fikstürü**. Karıştırma. Hattın
  kuyruk konumu da bu yüzden yerelde yanlış çıkar; `next-event.mjs` hedefi yerel görürse uyarı basar.
- Bulut veritabanına bu makineden erişim yok (`backend/.env.pipeline` yok, Supabase MCP yetkisiz).
  Yayındaki durumu canlı site ve `sitemap.xml` söyler.
- e2e spec **dosyaları paralel** koşar ve aynı veritabanını paylaşır: `admin-publish` yayınlarken olay
  sayısı 11 olur. Olay sayısına dayanan iddia yazma (`2 of 10` yerine `/^2 of /`). Ayrıca tuşa basan
  test önce hidrasyonu beklemeli; `?event=` efektinin oturması iyi bir işaret.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum — 2026-09-24

- STATUS 18 gün eskiydi ("2/100"); gerçek 37/100 yayında. Dokümanlar gerçeğe çekildi, biten maddeler
  silindi (Faz A satırı, Thales onayı, "prompt'u ilk üç olaydan sonra ayarla", Claude API anıştırmaları,
  olmayan `check-i18n.ts`). Plan: `yol-haritasi.md`, yeni **Faz Q**.
- **Model sabitlendi** (PR #21): workflow `PIPELINE_MODEL` vermiyordu, hangi modelin yazdığı belli
  değildi. Artık `claude-opus-5-5`; repo değişkeni ezer.
- **Bağlantı hatası**: yükleyici her gece tek dosya yüklediği için sonradan gelen hedefler hiç
  bağlanmıyordu (Newton → Kepler, Newton → Galileo, DNA → Mendel, İnsan Genomu → DNA canlıda yoktu).
  `run.sh` artık her koşu sonunda bütün taslaklar üzerinden bağlantı geçişi yapıyor; ilk gece koşusunda
  dördü de gelmeli. Uluğ Bey'in iki `builds_on` slug'ı yanlıştı (hiç bağlanamazdı); yükleyici artık
  bilinmeyen slug'ı reddediyor.
- **Doğruluk denetimi** (3 olay): 7 hata + 4 abartı. Bulgular `backend/content/audit/`.
