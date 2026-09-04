# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: Faz A. Kullanıcı kararı (2026-09-04): **içerik durdu**, önce site tam bitsin; 43 olay test
  için yeter. Site bitince tüm odak veri toplamaya geçer.
- **Yayında** (`main`): https://history-of-science.vercel.app — küre + zaman şeridi, olay detayı, 4 dil,
  `/admin`, kaydet → sitede anında. 43 olay, 150 bağlantı.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. `el/markdown-body` PR'ını merge et, canlıda dene: bir olayın gövdesini markdown'a çevir, admin'den
   dört dili tek formda doldur, kaynak/kişi/bağlantı/görsel ekle.
2. Faz A'nın kalanı `yol-haritasi.md`'de; ilk sırada canlıda Lighthouse mobil (artık KaTeX stil
   dosyası da olay sayfasına biniyor, ~28 KB ham — ölçümde buna bak).

## Kullanıcıdan bekleyen

- **Uluğ Bey, bulutta**: admin formundan Yıl `1420`, Bitiş `1437`, Kesinlik `yaklaşık`. Yerel `seed.sql`
  düzeltildi ama bulut verisini yalnızca sen yazabilirsin.

**Bloklayan**: yok.

## Yaşayan notlar

- Admin'de **bir dili boşaltmak o çeviriyi silmez** (ADR-034). Silmek isteyen için ayrı bir eylem lazım;
  bugüne kadar ihtiyaç olmadı.
- `saveEvent` işlem değil: yarıda kalan kayıt aynı formdan tekrar kaydedince onarılır (ADR-034).
- Liste araması, eksik dil filtresi ve sıralama bellekte çalışıyor; olay sayısı bir sayfayı aşarsa
  SQL'e taşınmalı (`lib/admin/events.ts`).

- İçerik durduruldu (kullanıcı, 2026-09-04): Faz A bitene kadar yeni olay yok. 50 olay hedefi ve
  kalan Aydınlanma listesi `icerik.md`'de duruyor.
- Bulut Auth Site URL'i hâlâ localhost → şifre sıfırlama bağlantısı localhost'a gidiyor (`yol-haritasi.md`, Faz A).
- Yerel DB'de 10 seed olayı `published`; bulutta 43 olayın hepsi yayında, taslak yok.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum

### 2026-09-04 — 15. oturum
- Admin refactor (ADR-034). Form artık **dört dili birden** taşıyor: sekmeler client'ta, tek kaydetme
  metin taşıyan bütün dilleri yazar. Eski davranış (dil linki = tam sayfa gezinme) kaydedilmemiş yazıyı
  sessizce siliyordu; o gitti. Yeni olayda da sekmeler var.
- Admin'e **kaynak, kişi, builds_on bağlantısı ve kapak görseli** editörleri eklendi — bunların hiçbiri
  formda yoktu, 43 olayınki `drafts-to-sql.mjs` ile girilmişti.
- `/admin` panosu doldu: durum sayıları, dil başına eksik çeviri, son düzenlenen 5. Liste arama +
  "şu dili olmayanlar" + sıralama aldı. Kaydet/sil/geri al listeye dönüyor; "Kaydet ve kal" ikinci düğme.
- Admin site diline geçti (pill, kart, `text-label` başlık, `rounded-lg` alan).
- Kapak görseli artık tam https adresi de kabul ediyor (`lib/media.ts`).

### 2026-09-04 — 14. oturum
- Kullanıcı mobilde test etti, küre onaylandı; PR #12 merge edildi. İçerik durduruldu.
- Olay gövdesi tam Markdown (ADR-033): `react-markdown` + GFM + KaTeX, render sunucuda. Ayrıştırıcı
  site paketine girmiyor (ölçüldü); okuyucuya binen tek şey KaTeX CSS'i. `> [!NOTE]` kutuları,
  tek satırlık YouTube adresi gömülü oynatıcı, künyeli görsel `figure`.
- Admin gövde alanı Write/Preview sekmeli, önizleme siteyle aynı bileşen; künyesiz görsel uyarı verir
  ama kaydı engellemez (kullanıcı kararı). `/admin/help/markdown` canlı kılavuz, 4 dilde.
- Detay paneli `Sheet.tsx`'in diline geçti: saydam, bulanık, telefonda tutamaç.
- Uluğ Bey `1420 circa – 1437` oldu; `seed_event` artık `year_end` alıyor. Dosyanın sonundaki
  `drop function` imzası da güncellendi — yoksa `db reset` patlıyor.

### 2026-09-04 — 13. oturum
- Küre WebGL2 shader'a taşındı, `sphere.ts` yedek; doku Blue Marble NG batimetrili; kart daha şeffaf,
  kuyruksuz. PR #12. Bulunan hata: `dispose()` bağlamı düşürüyordu, StrictMode ikinci mount'u ölü
  bağlam alıyordu.
- Doküman temizliği: eski `00` ve `11`, `resource/`, `/com_week` silindi; ADR 024-032 tek ADR'ye
  katlandı; kalan dokümanlar kısaltıldı ve **numaraları bırakıp ada geçtiler** (`doc/mimari.md` gibi).
  Kullanıcı: "site hazır, sadece veri kaldı".
