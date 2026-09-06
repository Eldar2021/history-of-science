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
- **Hat**: `backend/scripts/pipeline/` yazıldı, **API anahtarı değil Claude Code aboneliği** kullanıyor
  (ADR-039). Deterministik parçalar (kuyruk, Commons lisansı, yükleyici, bildirim) yerelde çalıştı;
  `claude -p` çağıran koşu **henüz uçtan uca denenmedi**. Kurulum: `doc/hat-kurulum.md`.

## Açık işler

1. **Hattın ilk gerçek koşusu**: sen `backend/.env.pipeline`'ı yazınca (Adım 5, `hat-kurulum.md`)
   `run.sh` buluta bir olay yazar. Sıradaki gerçek olay üretimde **rank 2, Thales** — yereldeki
   "rank 3" fikstürlerden geliyor. İlk koşu izlenerek yapılmalı: prompt ilk kez sınanıyor.
2. **Video yolu hiç denenmedi.** Kanalı oEmbed ile doğrulanabilen iyi bir belgesel bulunan ilk olayda açılır.

## Kullanıcıdan bekleyen

1. **`doc/hat-kurulum.md`'yi uygula** — adım adım yazıldı. Özeti: Supabase'ten üç değer (Adım 1),
   `claude setup-token` (Adım 2), Telegram opsiyonel (Adım 3), GitHub secret'ları (Adım 4).
   **`ANTHROPIC_API_KEY` artık hiçbir yerde gerekmiyor** (ADR-039). Hiçbir token'ı Claude'a yapıştırma.
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
- Yerel DB'de 10 seed olayı `published` — bunlar içerik değil, **e2e fikstürü**. Karıştırma. Hattın
  kuyruk konumu da bu yüzden yerelde yanlış çıkar (yerelde "sıradaki" rank 3, üretimde rank 2);
  `next-event.mjs` hedefi yerel görürse uyarı basar.
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
