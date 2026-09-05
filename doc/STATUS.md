# STATUS — Güncel Durum

> `/com_read_doc` oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: İçerik **sıfırlandı ve yeniden toplanıyor** (ADR-036). Teknik taraf bitti (2026-09-05).
- **Neden sıfırlandı**: 43 olayın 43'ü yalnızca İngilizceydi, gövdeler 550-652 kelimeye (600 tavanına)
  sıkışmıştı, 0 görsel / 0 video / 0 formül / 0 kutu vardı ve `people` tablosu boştu. ADR-033'ün
  araçları bu olaylar yazıldıktan sonra gelmişti.
- **Yeni hat**: `backend/content/top100.json` üretim kuyruğu (rank = sıra, importance = ağırlık,
  ayrı şeyler). Sıradaki olay "listede karşılığı veritabanında olmayan en düşük rank" — imleç dosyası
  yok. Yükleyici `backend/scripts/draft-to-sql.mjs`, doğrulama içinde.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin `eldiiaralmazbekov@gmail.com`; şifre `backend/scripts/cloud-admin-password.sh
  <email>`. Yerel admin `admin@uchkun.local` / `uchkun-local-admin` (`create-admin.mjs`).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. **Gece hattı** (bir sonraki oturum): `backend/scripts/pipeline/`, GitHub Actions cron `0 16 * * *`
   (Bişkek 22:00) + `workflow_dispatch`, Telegram **haber** bildirimi. Adımlar: araştır → yaz →
   düşmanca doğrula → Commons'tan görsel (lisans API'den) → tr/ru/ky çevir → `review` yaz → haber ver.
   Liste bitince yazmaz, "uzatalım mı?" der.
2. **`glossary.ky.json`** hattan **önce**: uzun gövde kötü Kırgızcayı büyütür (`i18n.md`).
3. Uzun gövde için okuma deneyimi: 1000+ kelimede bölüm çapaları / içindekiler gerekebilir.
   Newton yayınlandıktan sonra telefonda bakıp karar ver.
4. Video yolu hiç denenmedi. Kanalı doğrulanabilen (oEmbed) iyi bir belgesel bulunan ilk olayda açılacak.
5. **Fixture geri düşüşü üretimde sessiz** (2026-09-06'da canlıda görüldü). `lib/queries/event.ts` ve
   `timeline.ts`, `hasSupabaseEnv()` yanlışsa hata vermek yerine `lib/fixtures/timeline.ts`'i sunuyor.
   Olay sayfaları `generateStaticParams` ile build'de basıldığı için, değişkensiz bir build **sahte
   olayları statik sayfa olarak** yayınlıyor; `revalidate = 300` dolana kadar öyle kalıyorlar.
   Canlıda `/en/event/newton-principia` 200 + doğru başlık + gövdesiz döndü, 5 dakika sonra 404 oldu.
   Fixture'ın `importance` değerleri de şemaya uymuyor (transistor = 7, izin verilen aralık 1-5).
   Karar gerek: fixture yalnızca teste mi ait olmalı, yoksa üretimde env eksikse sayfa çökmeli mi?

## Kullanıcıdan bekleyen

1. **Bulut içeriğini sil**: `backend/supabase/snippets/reset-content.sql` → Supabase Studio SQL editor.
   Öncesi/sonrası sayılarını basar. Studio betiği **tek seferde** çalıştırır: sonuçlar olan biteni gösterir,
   karar verme noktası değil — çalıştırmadan önce tarayıcıdaki proje ref'inin `hsllmvouqayaccubodcl`
   olduğunu doğrula (diğer proje `uro-go`). Yerelde denendi, cascade'ler doğru.
2. **Newton'u buluta yükle**: `node backend/scripts/draft-to-sql.mjs backend/content/drafts/newton-principia.json`
   çıktısını Studio'da çalıştır. `status='review'` gelir; admin'den okuyup **Yayınla**'ya sen basarsın.
3. **Telegram botu**: @BotFather'dan token + chat id. Token'ı bana verme, GitHub secret olarak gir.
4. **GitHub secrets**: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (yedek zaten `SUPABASE_DB_URL` kullanıyor, o ayrı).
5. Canlıda şifre sıfırlama hiç denenmedi. Gerçek e-posta yollar ve bulut admin şifresini değiştirir,
   o yüzden sende; yerelde uçtan uca çalıştığı görüldü.

**Bloklayan**: 1 ve 2 yapılmadan site boş kalır (şu an bulutta hâlâ eski 43 olay duruyor).

## Yaşayan notlar

- **Yedek 2026-09-06'da alındı ve içeriği doğrulandı**: 43 olay, 43 çeviri, 150 bağlantı, 273 kaynak,
  8 çağ + 8 disiplin (4 dilde). `backend/backup/2026-09-05T18-22-35Z/` (gitignore'da).
  Dump `COPY` değil çok satırlı `INSERT` üretiyor — satır sayarken buna dikkat.
  **Geri yükleme hâlâ hiç denenmedi** (`roles.sql` → `schema.sql` → `data.sql`).
- Kutu anahtar sözcükleri **İngilizce**: `note, tip, important, warning, caution, theory`. Türkçe
  karşılıkları yok; kutunun içi hedef dilde yazılır.
- Admin'de **bir dili boşaltmak o çeviriyi silmez** (ADR-034). `saveEvent` işlem değil: yarıda kalan
  kayıt aynı formdan tekrar kaydedince onarılır.
- Liste araması, eksik dil filtresi ve sıralama bellekte çalışıyor; olay sayısı bir sayfayı aşarsa
  SQL'e taşınmalı (`lib/admin/events.ts`).
- Yerel DB'de 10 seed olayı `published` — bunlar içerik değil, **e2e fikstürü**. Karıştırma.
- `supabase db push` bu ortamda engelli (üretime yazar); kullanıcı kendi çalıştırır.
- Vercel preview'ları giriş korumalı; canlı davranış için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` → `next start`). Teknik tuzaklar `mimari.md`'nin sonunda.

## Son oturum

### 2026-09-06 — 17. oturum
- Plan değişti (ADR-036): içerik sıfırlanıyor, gece hattı kuruluyor, kelime tavanı kalkıyor.
- Yedek alındı ve **içeriği sayılarak doğrulandı**. Silme SQL'i yazıldı ve **yerelde denendi**.
- `top100.json` (100 olay) + `extension-queue.json` (35 yedek). Puanlar küresel ölçeğe çekildi;
  çağ-içi puanlarla sıralayınca listeye tek bir "3" giremiyor ve Hypatia, El-Farabi, Ömer Hayyam,
  Noether, Bell Burnell, Zhang Heng kesiliyordu. Altısı da listede. İlk 9 olay 8 çağın hepsine dokunuyor.
- `icerik.md` yeni tarife göre yazıldı: tavan yok, dolgu yasak, gövde araçları (künyeli görsel, video,
  kutu, formül) tabloyla. Lisans **Commons API'sinden** okunur, modelin sözüne güvenilmez.
- **Newton dört dilde yazıldı** (en 1131, ru 997, ky 939, tr 859 kelime; eski tavan 600'dü).
  3 künyeli görsel (lisanslar Commons API'den), 3 kutu, 1 formül. Olgular Wikipedia + MacTutor'dan
  teyit edildi; kahvehane bahsinin Halley'in kendi anlatısı olduğu gövdede söylendi. 5 Temmuz 1686'nın
  basım değil `imprimatur` tarihi olduğu not edildi (yaygın karışıklık).
- Yeni yükleyici `draft-to-sql.mjs`: sözleşme doğrulaması içinde (kasten bozulmuş taslakla denendi,
  6 hatanın 6'sını yakaladı). Dört dil de gerçek remark + KaTeX'ten geçirildi, hatasız.
- Eski format silindi: 42 taslak, `drafts-to-sql.mjs`, `check-drafts.mjs`, `fill-stubs-sql.mjs`.
- `npm run check` temiz (145 test).
