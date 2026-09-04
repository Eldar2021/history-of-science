# STATUS — Güncel Durum

> `/com_read_doc` bunu oturum başında okur, `/com_wrapup` oturum sonunda günceller.
> **Kural: biten madde buradan silinir.** Geçmişin cevabı `git log`. Tarihler mutlak (YYYY-MM-DD).

## Şu an

- **Faz**: M1'in son maddesi (7 olay) + **Faz A** sürüyor. PR #11 merge edildi; küre WebGL'e
  taşındı (ADR-032); dal `el/globe-webgl`, PR açık, review + merge bekliyor.
- **Yayında** (`main`): https://history-of-science.vercel.app — küre, ayağında zaman çizelgesi
  şeridi, olay detayı, 4 dil, `/admin`, kaydet→sitede anında. 43 olay, 150 bağlantı. `/timeline`
  silindi, adresi `/`'a yönleniyor (ADR-030). Site çubuğu, sheet'ler ve Onest fontu da yayında.
- **Bulut**: Supabase **uchkun** `hsllmvouqayaccubodcl`, migration 0001-0004. Vercel prod, `main`
  push = deploy. Bulut admin: `eldiiaralmazbekov@gmail.com`; şifre
  `backend/scripts/cloud-admin-password.sh <email>`. Yerel admin `admin@uchkun.local` /
  `uchkun-local-admin` (`create-admin.mjs` ile yeniden üretilebilir).
- **Yerel**: `colima start` → `cd backend && supabase start` → `cd web && npm run dev`.

## Açık işler

1. **Küre WebGL PR'ını (`el/globe-webgl`, ADR-032) merge et, canlıda telefonla dene.** Kullanıcının ilk iki
   şikâyeti (sürüklerken bozulma, cansız okyanus) bununla kapanmalı; kapanmazsa shader ayarları
   (`ATMOSPHERE`, parıltı katsayısı, `AMBIENT`) `lib/globe/webgl.ts`'te.
2. **M1'in son maddesi**: +7 Aydınlanma olayı → 50 yayınlanmış olay (`03`'teki liste).
3. **Faz A'nın kalanı** `08`'de; sıradaki büyük madde **canlıda Lighthouse mobil ölçümü** (küre
   907 KB doku, artık ekran kartında çiziliyor; üstüne şerit geldi).

## Kullanıcıdan bekleyen

- **Uluğ Bey yılı**: seed'de `1420 exact`, taslakta `circa` + `1437`. Admin formundan düzeltilebilir.
- **Beta / "monkey test"**: birlikte yapılacak, tarih kullanıcıdan. Video zorunlu değil.

**Bloklayan**: yok.

## Yaşayan notlar

- **İçerik 50 olayda donduruldu** (kullanıcı kararı, `08`). Faz A boyunca yeni olay yok.
- Bulut Auth'un Site URL'i hâlâ localhost → **şifre sıfırlama bağlantısı localhost'a gidiyor.** Faz A.
- Migration 0004'ün başında altı olayın yeri "bir tarihçi kararına dayanıyor" diye listeli; kontrol
  edilmedi.
- Ana sayfa artık çıkmaz değil: zaman çizelgesinin kendisi (ADR-030). Disiplin filtresi, minimap,
  sabit yıl göstergesi ve zaman boşluğu işaretleri `/timeline` ile gitti; geri istenirse `08`'de.
- Yerel Docker **Colima** ile; Docker Desktop yok. Supabase CLI Homebrew'dan.
- Yerel DB'de 10 seed olayı `published` (yer verisi dahil); bulutta 43 olayın hepsi yayında, taslak yok.
- Vercel preview'ları **giriş korumalı**: otomatik tarayıcı `vercel curl` ile HTML alabiliyor ama sayfayı
  çalıştıramıyor. Canlı davranışı görmek için yerel üretim build'ini bulut Supabase'e bağla
  (`vercel env pull` ile iki `NEXT_PUBLIC_SUPABASE_*` değişkenini alıp `next start`).
- **`supabase db push` bu ortamda engelli** (üretim verisine yazıyor); kullanıcı kendi çalıştırır.
- Headless Chrome'da WebGL için `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`
  bayrakları şart; yoksa bağlam kaybolmuş gelir ve küre CPU yedeğine düşer (test yine geçer).
- Playwright yerelde **kurulu Chrome'u** kullanıyor (`channel: "chrome"`), indirilmiş chromium yok;
  ekran görüntüsü betiği `web/` içinden çalıştırılmalı, yoksa `playwright` çözülmüyor.
- Puppeteer/headless testte: `click` elemanı görünür alana kaydırır, kaydırma konumu testlerinde
  `evaluate` ile tıkla. Next route announcer `role=alert` taşır → `main [role=alert]` diye daralt.
  Başlıktaki "Çıkış" düğmesi `button[type=submit]` seçicisine takılır → `main form` kullan.
- Diğer teknik tuzaklar `04`'ün ilgili bölümlerinde (Postgres `"precision"`, CSS minifier `1.5s`,
  `updateTag`, `NextResponse.redirect` 307, `sr-only` + `not-sr-only` konumlandırmayı bozar).

## Son oturum

### 2026-09-04 — 13. oturum: küre ekran kartında, batimetrili doku, kuyruksuz kart

- Kullanıcı: kart daha şeffaf ve kuyruksuz olsun; küre çevrilirken bozuluyor; NASA'nın küresi gibi
  okyanus derinlikleri görünsün; performans çok önemli.
- Sebep: CPU renderer dönerken %55 çözünürlük + en yakın piksel. Çözüm ADR-032: aynı izdüşüm
  WebGL2 shader'da, iki kanvas üst üste, `sphere.ts` yedek. Doku Blue Marble NG batimetrili
  (Temmuz 2004), aynı boyut bütçesi.
- Bulunan kendi hatam: `dispose()` `loseContext` çağırıyordu, StrictMode'un ikinci mount'u ölü
  bağlam alıyordu; kaldırıldı.
- Doğrulama: `npm run check` temiz; Playwright ekran görüntüleri masaüstü + iPhone + sürükleme
  ortası (tam çözünürlük); e2e 17/17 geçti.

### 2026-09-04 — 12. oturum: tek stil, zaman çizelgesi ana sayfaya taşındı

- Kullanıcının fikri: ayrı timeline sayfası yerine ana sayfaya carousel. Tartışıldı, üç soru
  soruldu (NASA atfı mı küre mi · okuma yüzeyi hangisi · `/timeline` ne olacak), plan onaylandı.
- `EventStrip` + `TimeRibbon`: şerit her olayı taşıyor, küre yalnızca yeri olanları. Aradaki köprü
  `lib/globe/strip.ts`'teki `globeIndex`; yeri olmayan olayda küre yerinde kalıyor ve `trailTo` ile
  gidilen yol silinmiyor. Ölçek duygusu için `xScale` tabanlı oransal şerit — eşit genişlikte elli
  kart 2600 yılı düzleştiriyordu.
- Seçim kaydırmanın kendisine değil `scroll-snap`'in oturmasına bağlı: küre piksel piksel çiziyor,
  her kaydırma karesinde kamera istemek telefonu tıkatırdı.
- `HonestyBadge`: native `<dialog>` (odak tuzağı ve Esc bedava), içinde itiraf + hata bildirme +
  NASA atfı. Paragraf bandı diğer sayfalarda aynen duruyor.
- `/timeline` ve parçaları silindi; `next.config` 308 yönlendirmesi. `nav.timeline` ve `timeline`
  ad alanı gitti, iki çeviri rozeti `event`'e taşındı.
- Bulunan ve düzeltilen kendi hatam: karttaki `onFocus` seçim yapınca fare tıklaması "zaten aktif"
  sayılıp olay sayfasına gidiyordu; `:focus-visible` ile klavyeye daraltıldı (e2e yakaladı).
- **Yan bulgu ve düzeltmesi**: Golos Text `ğ` yerine düz `g` çiziyordu. Altı font yan yana denendi,
  gövde fontu **Onest** oldu (ADR-031). "Bulutta yazım hatası" sanılan şey büyük olasılıkla buydu.
- İkinci oturum yarısı: site çubuğu yeniden yazıldı (bayrak+kod dil rozeti, alttan açılan sheet'ler,
  Hakkında ve İletişim, mobilde menü), ana kart cam oldu ve küçüldü, şerit artık yumuşak büyüyor.
  Bulunan iki hata: dil değiştirince `?event=` düşüyordu; iç içe sheet'lerde `<dialog>`'un close
  olayı devir teslimi de kapanma sanıyordu.
