# STATUS — Güncel Durum

> `/com_read_doc` bunu oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Kural: biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: Ay 1 bitiyor → Hafta 5 (otomatik içerik hattı). Dal `el/week-5-fixes`.
- **Yayında**: https://history-of-science.vercel.app — timeline, olay detayı, minimap, disiplin filtresi,
  dürüstlük bandı, 4 dil, `/admin` (giriş + olay listesi + form + yumuşak silme + admin dil seçici),
  kaydet→sitede anında. 43 olay, 150 bağlantı.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001 + 0002. Vercel prod, `main` push =
  deploy. Bulut admin: `eldiiaralmazbekov@gmail.com` (`profiles.role='admin'`); şifre
  `backend/scripts/cloud-admin-password.sh <email>`. Yerel admin `admin@uchkun.local` /
  `uchkun-local-admin` (`create-admin.mjs` ile yeniden üretilebilir).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. **M1'in son maddesi**: +7 Aydınlanma olayı → 50 yayınlanmış olay (03'teki liste: Linnaeus, Franklin,
   oksijen, Herschel, Lavoisier, Jenner, Volta). Diğer 8 kabul kriteri yeşil (`08`).
2. `el/week-5-fixes` için PR aç ve merge et; sonra canlıda Lighthouse mobil yeniden ölç.
3. Hafta 5 kutucukları (`08`): içerik hattı, cron, Telegram, `/admin/review`, bulut Auth Site URL +
   `/admin/reset-password`.

## Kullanıcıdan bekleyen

- **Uluğ Bey yılı**: seed'de `1420 exact`, taslakta `circa` + `1437`. Admin formundan düzeltilebilir.
- **Ana sayfa fikri** (S16): kullanıcının bir fikri var, kendi içinde değerlendiriyor. **Sorulmadan ana
  sayfayı yeniden tasarlama.** Yeniden tasarım Hafta 8'de planlandı.
- **Beta / "monkey test"**: birlikte yapılacak, tarih kullanıcıdan. Video zorunlu değil.

**Bloklayan**: yok.

## Yaşayan notlar

- Yerel Docker **Colima** ile; Docker Desktop yok. Supabase CLI Homebrew'dan.
- Bulut Auth'un Site URL'i hâlâ localhost → şifre sıfırlama bağlantısı localhost'a gidiyor (Hafta 5).
- Yerel DB'de 28 seed olayının tamamı `published`; bulutta da 43 olayın hepsi yayında, taslak yok.
- Puppeteer/headless testte: `click` elemanı görünür alana kaydırır, kaydırma konumu testlerinde
  `evaluate` ile tıkla. Next route announcer `role=alert` taşır → `main [role=alert]` diye daralt.
  Başlıktaki "Çıkış" düğmesi `button[type=submit]` seçicisine takılır → `main form` kullan.
- Diğer teknik tuzaklar `04`'ün ilgili bölümlerinde (Postgres `"precision"`, CSS minifier `1.5s`,
  `updateTag`, `NextResponse.redirect` 307).

## Son oturum

### 2026-09-04 — 10. oturum: site düzeltmeleri + doküman temizliği
- Üç kullanıcı hatası düzeltildi: (1) `c. 585 BCE` → `around 585 BCE`, yıl `formatYearParts` ile
  qualifier + value diye bölündü, çağ kısaltmasına tooltip ve timeline'da tek satırlık açıklama
  (ADR-023). (2) Karanlık tema kendiliğinden açılıyor ve yenilemede atlıyordu → `prefers-color-scheme`
  kaldırıldı, açık tema tek varsayılan (ADR-022). (3) Landmark kartlar `bg-raised`, standart kartlar
  `bg-elevated` idi → hepsi `bg-elevated`, hiyerarşiyi boyut ve gölge taşıyor.
- `doc/` küçültüldü (169 KB → ~60 KB): 01 vizyon `README.md`'ye taşındı; 02 spesifikasyon (kabul
  kriterleri `08`'e), 05 timeline UX ve 07 tasarım promptu silindi; 03, 04, 06, 08, 09, 10, 11 ve STATUS
  kısaltıldı, bitmiş maddeler çıkarıldı. Numaralarda boşluk bırakıldı ki referanslar kırılmasın.
- Yarım kalan: +7 Aydınlanma olayı, PR, canlı Lighthouse ölçümü.
