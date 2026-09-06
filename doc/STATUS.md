# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: İçerik sıfırlandı (ADR-036) ve yeniden toplanıyor. Teknik taraf bitti.
- **İçerik**: 2/100. Newton **yayında**, Thales **incelemede** (hattın yazdığı ilk olay).
- **Üretim kuyruğu**: `backend/content/top100.json`. Sıradaki olay = "listede olup veritabanında
  olmayan en düşük `rank`" — imleç dosyası yok, o yüzden paralel koşular birbirini ezmez.
  Yükleyici `backend/scripts/draft-to-sql.mjs`, sözleşme doğrulaması içinde.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.
- **Hat çalışıyor** (ADR-039): her gece 16:00 UTC, `backend/scripts/pipeline/`, **API anahtarı değil
  Claude Code aboneliği**. İlk gerçek koşu 2026-09-06'da 21 dakikada Thales'i yazdı. Sırlar ve durdurma
  `mimari.md`'de.

## Açık işler

1. **İlk üç olaydan sonra prompt'u ayarla.** Elimizde bir örnek var (Thales: 1241 kelime, 3 görsel,
   6 kaynak, fact-checker beş düzeltme yaptırdı). Reddetme oranı %30'u aşarsa `prompts/run.md`
   sıkılaştırılır (riskler.md R1).
2. **Video yolu hiç denenmedi.** Kanalı oEmbed ile doğrulanabilen iyi bir belgesel bulunan ilk olayda açılır.

## Kullanıcıdan bekleyen

1. **Thales'i oku ve karar ver** (`/admin`, `status=review`). Hattın ilk ürünü; yayınlarsan tarif
   tutuyor demektir. Tutulmanın önceden bilinip bilinmediği tartışması gövdede belirsiz işaretli.
2. **Kırgızca sözlükte 21 giriş `"confidence": "check"`** — Claude'un tahmini, Kırgızca bilen birinin
   onayı gerekiyor (теңдеме, айлана, кан айлануу, тукум куучулук, Улукбек…). Hat başlamadan önce
   bakılırsa bütün olaylar doğru terimle doğar.
3. Canlıda şifre sıfırlama hiç denenmedi. Gerçek e-posta yollar ve bulut admin şifresini değiştirir,
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
  kuyruk konumu da bu yüzden yerelde yanlış çıkar (yerelde "sıradaki" rank 3, üretimde rank 2);
  `next-event.mjs` hedefi yerel görürse uyarı basar.
- e2e spec **dosyaları paralel** koşar ve aynı veritabanını paylaşır: `admin-publish` yayınlarken olay
  sayısı 11 olur. Olay sayısına dayanan iddia yazma (`2 of 10` yerine `/^2 of /`). Ayrıca tuşa basan
  test önce hidrasyonu beklemeli; `?event=` efektinin oturması iyi bir işaret.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum — 2026-09-06 (ikinci)

- **Gece hattı kuruldu ve çalıştı.** Kullanıcı ölçülen API'ye ayrı para ödemeyi reddetti; hat Claude Code
  aboneliğine bağlandı (ADR-039). Deterministik iş modelden ayrıldı: kuyruk, Commons lisansı, sözleşme
  doğrulaması ve veritabanına yazma saf Node — koşu model süresini yalnızca araştırma, yazma ve çeviriye
  harcıyor. Liste bitmişse ya da kuyruk doluysa koşu modele hiç gitmeden çıkıyor.
- **İlk CI koşusu düştü**: model talimat yerine selam verdi, sanki eline hiç görev geçmemiş gibi. Prompt
  stdin'e alındı, talimatın başına "bu mesaj görevin, kimse klavyede değil" cümlesi kondu ve koşu artık
  prompt'un kaç bayt verildiğini loga basıyor. Üç değişiklik birlikte gitti, **hangisinin çözdüğü ayırt
  edilmedi**; tekrar düşerse log tek satırda söyleyecek.
- Hattın kendi raporuna güvenilmiyor: koşu sonunda olayın veritabanında `review` olduğu ayrıca
  sorgulanıyor. Düşen koşuyu yakalayan buydu.
- **Doküman budaması**: ADR-038 silindi (tamamen koda gömülü), ADR-014 mekaniği ADR-039'a devretti,
  024/033/034/036/037'nin tarih anlatan bölümleri kısaldı — `kararlar.md` 253 → 207 satır.
  `hat-kurulum.md` işini bitirdi ve silindi; sırlar ve durdurma `mimari.md`'ye taşındı.
  README'nin "İngilizce önce yayınlanır" ilkesi düzeltildi: hat dört dili tek koşuda yazıyor.
