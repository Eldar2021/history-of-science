# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: Site teknik olarak hazır (kullanıcı, 2026-09-04). Kalan iş **içerik**: M1'in son maddesi
  (+7 olay → 50), sonra Faz A'nın küçük listesi (`08`).
- **Yayında** (`main`): https://history-of-science.vercel.app — küre + zaman şeridi, olay detayı, 4 dil,
  `/admin`, kaydet → sitede anında. 43 olay, 150 bağlantı.
- **Açık PR**: #12 `el/globe-webgl` — küre WebGL'de, batimetrili doku, kuyruksuz kart (ADR-024).
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. PR #12'yi merge et, canlıda telefonla dene (sürükleme, okyanus rengi, atmosfer kenarı; ayarlar
   `web/lib/globe/webgl.ts` başındaki sabitlerde).
2. **+7 Aydınlanma olayı** → 50 yayınlanmış olay (`03`'teki liste, `/com_event`).
3. Faz A'nın kalanı `08`'de; ilk sırada canlıda Lighthouse mobil.

## Kullanıcıdan bekleyen

- Uluğ Bey yılı (seed `1420 exact`, taslak `circa 1437`); admin formundan düzeltilir.
- Beta / "monkey test" tarihi. Video zorunlu değil.

**Bloklayan**: yok.

## Yaşayan notlar

- İçerik 50 olayda donduruldu; Faz A boyunca yeni olay yok.
- Bulut Auth Site URL'i hâlâ localhost → şifre sıfırlama bağlantısı localhost'a gidiyor (`08`, Faz A).
- Yerel DB'de 10 seed olayı `published`; bulutta 43 olayın hepsi yayında, taslak yok.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `04`'ün sonunda.

## Son oturum

### 2026-09-04 — 13. oturum
- Küre WebGL2 shader'a taşındı, `sphere.ts` yedek; doku Blue Marble NG batimetrili; kart daha şeffaf,
  kuyruksuz. PR #12. Bulunan hata: `dispose()` bağlamı düşürüyordu, StrictMode ikinci mount'u ölü
  bağlam alıyordu.
- Doküman temizliği: `doc/00`, `doc/11`, `resource/`, `/com_week` silindi; ADR 024-032 tek ADR'ye
  katlandı; 04/06/08/10/README/CLAUDE.md kısaltıldı. Kullanıcı: "site hazır, sadece veri kaldı".
