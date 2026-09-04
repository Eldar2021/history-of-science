# STATUS — Güncel Durum

> `/com_read_doc` bunu oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Kural: biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: M1'in son maddesi → sonra **Faz A** (siteyi 50 olayla biçimlendirmek, `08`). Hafta numaraları
  bırakıldı. Dal `el/ne-home-rdesign`, **PR #9 açık, kullanıcı review edip merge edecek.**
- **Yayında** (`main`): https://history-of-science.vercel.app — timeline, olay detayı, minimap, disiplin
  filtresi, dürüstlük bandı, 4 dil, `/admin`, kaydet→sitede anında. 43 olay, 150 bağlantı.
- **PR #9'da bekleyen** (henüz canlıda değil): ana sayfa küresi. NASA Blue Marble dokulu küre, 43 olayın
  yer verisi, kızıl işaretler, belirsizlik çemberleri, elle çevirme, gidilen yolun yayları, "Turu oynat",
  tam ekran gökyüzü, **tek koyu tema** (açık tema kaldırıldı).
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004 (yer verisi uygulandı).
  Vercel prod, `main` push = deploy. Bulut admin: `eldiiaralmazbekov@gmail.com`; şifre
  `backend/scripts/cloud-admin-password.sh <email>`. Yerel admin `admin@uchkun.local` /
  `uchkun-local-admin` (`create-admin.mjs` ile yeniden üretilebilir).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. **PR #9** — kullanıcı review edip merge edecek.
2. **M1'in son maddesi**: +7 Aydınlanma olayı → 50 yayınlanmış olay (`03`'teki liste: Linnaeus, Franklin,
   oksijen, Herschel, Lavoisier, Jenner, Volta). Diğer 8 kabul kriteri yeşil.
3. **Faz A** — kapsamı kullanıcıdan bekleniyor (S17). Bilinen işler `08`'de; ilki **canlıda Lighthouse
   mobil ölçümü**, çünkü küre 905 KB doku + piksel piksel çizen bir renderer getirdi ve sonucu diğer
   her şeyi etkileyebilir.

## Kullanıcıdan bekleyen

- **S17: Faz A'da siteyi ne yapacağız?** Kullanıcının fikirleri var, kendisi getirecek. Geldiğinde
  `08`'deki Faz A bölümü ona göre yeniden yazılır. (Açık uçlu kalması R12 riski.)
- **Uluğ Bey yılı**: seed'de `1420 exact`, taslakta `circa` + `1437`. Admin formundan düzeltilebilir.
- **Beta / "monkey test"**: birlikte yapılacak, tarih kullanıcıdan. Video zorunlu değil.

**Bloklayan**: yok.

## Yaşayan notlar

- **İçerik 50 olayda donduruldu** (kullanıcı kararı, `08`). Faz A boyunca yeni olay yok.
- Bulut Auth'un Site URL'i hâlâ localhost → **şifre sıfırlama bağlantısı localhost'a gidiyor.** Faz A.
- Bulut `era_translations`'ta Türkçe yazım hatası: `İslam Altın Çagı ve Orta Çag` (`ğ` düşmüş).
- Migration 0004'ün başında altı olayın yeri "bir tarihçi kararına dayanıyor" diye listeli; kontrol
  edilmedi.
- Ana sayfa şu an bir **çıkmaz**: zaman çizelgesine bağlantı yok (kullanıcı kararı, ADR-027). Beta'da
  sorun çıkarsa ilk geri alınacak şey.
- Yerel Docker **Colima** ile; Docker Desktop yok. Supabase CLI Homebrew'dan.
- Yerel DB'de 10 seed olayı `published` (yer verisi dahil); bulutta 43 olayın hepsi yayında, taslak yok.
- Vercel preview'ları **giriş korumalı**: otomatik tarayıcı `vercel curl` ile HTML alabiliyor ama sayfayı
  çalıştıramıyor. Canlı davranışı görmek için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` ile iki `NEXT_PUBLIC_SUPABASE_*` değişkenini alıp `next start`).
- **`supabase db push` bu ortamda engelli** (üretim verisine yazıyor); kullanıcı kendi çalıştırır.
- Puppeteer/headless testte: `click` elemanı görünür alana kaydırır, kaydırma konumu testlerinde
  `evaluate` ile tıkla. Next route announcer `role=alert` taşır → `main [role=alert]` diye daralt.
  Başlıktaki "Çıkış" düğmesi `button[type=submit]` seçicisine takılır → `main form` kullan.
- Diğer teknik tuzaklar `04`'ün ilgili bölümlerinde (Postgres `"precision"`, CSS minifier `1.5s`,
  `updateTag`, `NextResponse.redirect` 307, `sr-only` + `not-sr-only` konumlandırmayı bozar).

## Son oturum

### 2026-09-04 — 11. oturum: ana sayfa küresi, baştan sona
- Yer verisi: migration 0003 (şema + `place_needs_coords`) ve 0004 (43 olayın yeri, tek kopya bir
  fonksiyonda — `db reset` migration'ları seed'den önce çalıştırdığı için). `formatPlace.ts` yer metninin
  tek kaynağı; belirsizlik ayrı not satırı, çünkü "Semerkant civarı" dört dilde gramerli kurulamıyor
  (ADR-025). Admin formuna yer alanları.
- Küre: Canvas 2D, çalışma zamanında sıfır bağımlılık. Önce nokta haritası yazıldı, kullanıcı canlıda
  denedi ("2D duruyor, kıtalarda hata var") → NASA Blue Marble fotoğrafına geçildi (ADR-026). NASA'nın
  12,9 MB'lık modeli ve iframe reddedildi, gerekçesi ADR'de.
- Kullanıcı geri bildirimiyle: kızıl işaretler (ADR-028, ADR-025'in "kırmızı olmasın" maddesini geçersiz
  kılar), siyah gökyüzü + yıldızlar, tam ekran + saydam başlık (ADR-027), tek koyu tema (ADR-029,
  ADR-020 ve ADR-022 geçersiz), 4096'lık doku yalnızca ekran ve cihaz kaldırıyorsa.
- Yaylar: iz geçmişe değil aktif olaya bağlı, yani paylaşılan bağlantı da aynı yolu gösteriyor.
- Bulunan ve düzeltilen kendi hatalarım: `!== null` `undefined`'ı geçiriyordu (canlıda boş siyah küre),
  çizim döngüsü sürüklemede uyanmıyordu, `sr-only` başlığı wordmark'ın üstüne bindiriyordu.
- Dokümanlar bu oturumun sonunda güncel duruma çekildi: hafta numaraları bırakıldı, fazlar geldi,
  içerik dondurma kuralı yazıldı, biten maddeler silindi, ADR-020/022 "geçersiz" olarak kısaltıldı.
