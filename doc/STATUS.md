# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: Teknik taraf bitti (2026-09-05). Sıradaki iş **içerik**: +7 Aydınlanma olayı → 50.
- **Yayında** (`main`): https://history-of-science.vercel.app — küre + zaman şeridi, olay detayı, 4 dil,
  `/admin`, kaydet → sitede anında. 43 olay, 150 bağlantı. Her PR'da CI, her gece veritabanı yedeği.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. **+7 Aydınlanma olayı** → 50 yayınlanmış olay (`icerik.md`'deki liste, `/com_event`).
2. Faz A'nın kalan iki maddesi `yol-haritasi.md`'de; ikisi de içerik doğruluğu işi.

## Kullanıcıdan bekleyen

- **Uluğ Bey, bulutta**: admin formundan Yıl `1420`, Bitiş `1437`, Kesinlik `yaklaşık`.
- Canlıda şifre sıfırlama hiç denenmedi. Denemek gerçek bir e-posta yollar ve bulut admin şifresini
  değiştirir, o yüzden sana bırakıldı; yerelde uçtan uca çalıştığı görüldü.

**Bloklayan**: yok.

## Yaşayan notlar

- Admin'de **bir dili boşaltmak o çeviriyi silmez** (ADR-034). Silmek isteyen için ayrı bir eylem lazım;
  bugüne kadar ihtiyaç olmadı.
- `saveEvent` işlem değil: yarıda kalan kayıt aynı formdan tekrar kaydedince onarılır (ADR-034).
- Liste araması, eksik dil filtresi ve sıralama bellekte çalışıyor; olay sayısı bir sayfayı aşarsa
  SQL'e taşınmalı (`lib/admin/events.ts`).
- Gece yedeği 2026-09-05'te elle çalıştırılıp artefaktı indirildi. **Geri yükleme hiç denenmedi** —
  yedeğin gerçek sınavı odur (`roles.sql` → `schema.sql` → `data.sql`).
- Yerel DB'de 10 seed olayı `published`; bulutta 43 olayın hepsi yayında, taslak yok.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum

### 2026-09-05 — 16. oturum
- Teknik açıkların turu (ADR-035). **CI** (her PR'da check + e2e) ve **gece yedeği** (dump → 90 günlük
  artefakt) eklendi; ikisi de yoktu. Elle yedek: `backend/scripts/backup.sh`.
- **Hata sınırı**: `[locale]/error.tsx` dört dilde, `global-error.tsx` son çare. Tarayıcıda denendi.
- **Keşfedilebilirlik**: `sitemap.xml` (44 sayfa × 4 dil = 176 URL, `hreflang` + `x-default`), `robots.txt`, canonical,
  OG kartları (`next/og`, Literata). Adres tek yerden: `lib/site.ts`.
- **Şifre sıfırlama uçtan uca çalışıyor**: forgot → e-posta (Mailpit) → `/api/auth/callback` → yeni şifre
  → o şifreyle giriş. Aynı şifre denenirse ayrı mesaj. Yerel `config.toml`'un izin listesi de düzeltildi.
- **Erişilebilirlik**: atlama bağlantısı; görünen metin ile erişilebilir ad uyuşmazlığı giderildi
  (dil düğmesi, olay kartı). Kontrast tablosu ölçüldü, hepsi AA.
- **Küre dokusu WebP** (JPEG arkada): 262→176 KB ve 907→587 KB.
- Ölçüm (merge sonrası, 6 tur): canlı mobil a11y/best-practices/SEO **100/100/100**, performans
  **83-92 (ort. 88)**. Tek Lighthouse turu 9 puan oynuyor — merge öncesi elde tek okuma vardı (94),
  o yüzden gerileme olduğu **gösterilemedi**; WebP dokusu aynı build'de A/B ile elendi.
