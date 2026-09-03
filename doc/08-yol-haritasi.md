# 08 — Yol Haritası (kalan haftalar)

Hafta 1-4 bitti; kanıtı kodda ve git geçmişinde. Kalan plan aşağıda. Tempo varsayımı haftada 10-15 saat;
darboğaz kod değil, karar vermek ve içerik onaylamak.

| Ay    | Tema                | Sonunda elimizde ne var                                                         |
| ----- | ------------------- | ------------------------------------------------------------------------------- |
| **1** | Temel               | Akış timeline'ı, admin ekliyor sitede görünüyor, 50 olay. **Neredeyse bitti.**  |
| **2** | Otomasyon ve dil    | Gece taslak hattı, 4 dil çevirisi, 120 olay, İngilizce kapalı beta (10 kişi).   |
| **3** | Derinlik ve lansman | Kişiler, bağlantılar, zincir görünümü, Keşfet kanvası, 200 olay, v1.0 lansmanı. |

---

## M1 — MVP kabul kriterleri (Hafta 4)

- [x] `/tr/timeline` açılıyor, dikey akışta çağ başlıklarıyla.
- [x] Kaydırınca sabit yıl göstergesi güncelleniyor.
- [x] Olaya tıklayınca detay açılıyor, geri tuşu timeline'da aynı konuma dönüyor.
- [x] `/admin` sadece giriş yapmış admin'e açık; anonim istek 302 ile login'e gidiyor.
- [x] Admin'de kaydedince sitede anında görünüyor, deploy gerekmeden.
- [x] Taslaklar sitede ve API'de görünmüyor (RLS ile veritabanı seviyesinde).
- [x] Dört dil rotası çalışıyor; çeviri yoksa kaynak dil + "bu dilde henüz yok" rozeti.
- [x] Mobil Lighthouse performans 85+ (timeline 93 canlı, üretim build'de 100).
- [ ] **En az 50 yayınlanmış olay.** 43 var; +7 Aydınlanma olayı gerekiyor (03'teki liste).

Kalan tek madde içerik. Bitince M1 yeşil.

---

## Hafta 5: Otomatik içerik hattı

- [ ] `backend/scripts/draft-next.ts`: 03'teki kalan listeden sıradaki olay → Claude API (web search) →
      3+ kaynak → şablona göre İngilizce JSON taslak → `status='review'`, `drafted_by='ai'`,
      `research_note`, `sources`.
- [ ] GitHub Actions cron (gece 03:00), `CONTENT_PIPELINE_ENABLED`, "kuyrukta 10+ varsa üretme".
- [ ] Telegram bot bildirimi (S11).
- [ ] `/admin/review` onay kuyruğu: taslak + kaynaklar + araştırma notu; Yayınla / Düzenle / Reddet.
- [ ] Bulut Auth ayarı: Site URL ve redirect listesi Vercel adresi olsun; `/admin/reset-password` sayfası.
      (Şu an şifre sıfırlama bağlantısı localhost'a gidiyor.)
- [ ] İlk 10 taslağı elle tetikle, kaliteyi ölç, prompt'u ayarla. Reddetme oranı %30 üstündeyse kaynak
      eşiğini yükselt.
- [ ] İçerik: hat günde 2 taslak; hafta sonunda ~60 olay.

## Ana sayfa: küre (ADR-024, ADR-025)

Hafta 8'den öne alındı; kullanıcı 2026-09-04'te karar verdi. Sıra bağlayıcı: her adım bir öncekine dayanır.

- [x] Şema: `lat`, `lng`, `place_precision`, `place_name` + `place_needs_coords` (0003), ilk 43 olayın
      yeri (0004), `get_timeline`/`get_event_detail` yer alanlarını döndürür.
- [x] `formatPlace.ts`: yer metninin tek kaynağı; belirsizlik ayrı not satırı (ADR-025).
- [x] `/admin` olay formunda yer alanları; "tek bir yer yok" seçilince koordinat alanları kapanır.
- [x] Küre bileşeni: NASA Blue Marble dokusu giydirilmiş küre (ADR-026), `lat/lng`'ye yumuşak kamera
      geçişi, olayın yeri hep merkezde. Canvas 2D, **çalışma zamanında sıfır bağımlılık**.
- [x] Pinler: disiplin rengi; `region`/`continent` için kesikli belirsizlik çemberi (en az 22 piksel,
      yoksa görünmüyor); `unknown` küreye hiç girmiyor.
- [x] Kart + merkeze bakan kuyruk; karta tıklama mevcut yandan sheet'i açar (`@panel` kesişen rota).
- [x] İleri/geri, klavye okları; yıl + `n/toplam` + çağ adı. Sayaç sabit genişlikte ve çağ adı ayrı
      satırda: metin değişince düğmeler yerinden oynamıyor.
- [x] Küreyi elle çevirme (fare ve dokunma). Yatay kaydırmayı bu aldığı için "kaydırınca sonraki olay"
      kalktı. Elle çevrilince kartın kuyruğu gizleniyor (artık pini göstermiyor) ve "Yere geri dön"
      düğmesi çıkıyor.
- [x] Derin bağlantı `?event=slug`; tur `replaceState` kullanır, geri tuşu ana sayfadan çıkar,
      olay açmak gerçek bir geçmiş kaydı bırakır.
- [x] Mobil: küre küçük ve üstte, kart ortada (kullanıcı kararı).
- [x] Yedekler: ilk olay sunucudan gerçek HTML (sayfa hâlâ statik), `prefers-reduced-motion` açıksa
      kamera anında gider. WebGL yedeği **gerekmedi**: Canvas 2D her yerde çalışıyor, kaybedilecek
      bağlam ve yüklenecek kütüphane yok — statik küre görseli fikri bu yüzden düştü.
- [ ] Gidilen yolun küre üzerinde soluk yaylar olarak birikmesi; varsayılanı kapalı "Turu oynat".
      (`greatCirclePath` yazıldı ve test edildi, çizim kaldı.)
- [x] Tasarım: tam ekran gökyüzü, yıldız alanı, saydam başlık, yarı saydam kart, tek satırlık
      dürüstlük bandı (ADR-027).
- [ ] Canlıda Lighthouse mobil ölçümü (küre bütçeyi bozmamalı).

## Hafta 6: Çeviri hattı ve görseller

- [ ] `web/lib/translate.ts` (Claude API, JSON şema doğrulama, kaynak dili olaydan okur, Kırgızca için
      tr+ru referanslı).
- [ ] `/admin/translate/{id}`: 4 dil yan yana, "Çevir", `machine`/`reviewed`, `editor` rolü sadece burada.
- [ ] "Yayınla + çevir" tek tık. Sitede `machine` rozeti.
- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak (ADR-011).
- [ ] Kırgızca terim sözlüğü ilk 30 terim; `check-i18n.ts`.
- [ ] İçerik: ~75 olay, tüm yayınlanmışlara makine çevirisi, 20 olaya görsel (Commons).

## Hafta 7: Çağ ve disiplin sayfaları, SEO

- [ ] `/era/{slug}`, `/discipline/{slug}`.
- [ ] `hreflang`, `<html lang>`, meta 4 dilde, `sitemap.xml`, `robots.txt`, dinamik OG görselleri.
- [ ] Analitik (Plausible/Umami), Sentry.
- [ ] Erişilebilirlik geçişi (klavye, odak, `aria-live`, kontrast).
- [ ] İçerik: ~90 olay, 8 çağın kapak metni.

## Hafta 8: İngilizce kapalı beta

- [ ] Alan adı seç ve bağla (S14), yedekleme.
- [ ] Performans turu: Lighthouse mobil 90+; `cacheComponents` + `"use cache"` geçişini değerlendir (ADR-021).
- [ ] `about` sayfası (neden, kaynak politikası, düzeltmeler listesi, iletişim) 4 dilde.
- [ ] İçerik: ~120 olay.

**M2**: 10 kişilik İngilizce kapalı beta, 1 hafta, geri bildirim formu. 3 büyük sorun → Hafta 9.

## Hafta 9: Beta düzeltmeleri, kişiler, bağlantılar

- [ ] Beta'nın 3 büyük sorunu.
- [ ] `people` CRUD, `/person/{slug}`, olay-kişi ilişkisi.
- [ ] `event_links`: admin'de arayıp bağlama; detayda "Dayanır / Mümkün kıldı".
- [ ] Migration: `profiles` self-update policy (editör kendi `ui_locale`'ini yazabilsin).
- [ ] Kırgızca öğretmen ve Rusça gözden geçirici için `editor` hesapları + kısa rehber (S13).
- [ ] İçerik: ~140 olay, 40 kişi, ilk 120 olay için bağlantılar (~3/olay).

## Hafta 10: "Buraya nasıl geldik?" zinciri

- [ ] `/chain/{slug}`: geriye akan nehir, 6 seviye; mobil akordeon; ileri yön. `get_chain` hazır.
- [ ] Olay detayında büyük buton. Veri yoksa buton görünmez.
- [ ] İçerik: ~160 olay. 5 vitrin zinciri elle kontrol: akıllı telefon, mRNA aşısı, GPS, penisilin, JWST.

## Hafta 11: Keşfet kanvası v1

- [ ] `/explore`: SVG + d3-zoom, `xScale` ortak, Z0-Z2 anlamsal zoom, 8 disiplin şeridi, `importance`
      tabanlı görünürlük, kümeleme ("+4"), görünür pencere dışını render etme.
- [ ] Tıklayınca aynı panel; URL `?year&zoom&d`; Akış ↔ Keşfet geçişi konumu korur.
- [ ] Masaüstü öncelikli; mobilde Z0 + sıkıştırma.
- [ ] İçerik: ~180 olay.

## Hafta 12: Kanvas v1.1, cila, lansman

- [ ] Kanvas: Z3 + kişi yaşam çubukları, bağlantı çizgileri, mobil cila.
- [ ] Klavye kısayolları, gerçek cihaz testi (modern iPhone/Android, Firefox/Safari).
- [ ] Playwright + CI (GitHub Actions) her PR'da.
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). Yedekten geri yükleme provası.
      `v1.0.0` etiketi, `CHANGELOG.md`.
- [ ] İçerik: 200 olay, 300+ bağlantı, en ve tr `reviewed`.
- [ ] Lansman metni: senin hikâyen + "yakında: 4 dil tam onaylı". Hacker News "Show HN", Reddit
      (r/HistoryOfScience, r/InternetIsBeautiful), LinkedIn, X, Kırgız/Türk Telegram kanalları.
      Bir öğretmene doğrudan yaz. Bir hafta sonra: geri bildirim + analitik → 3 büyük sorun.

**M3 = v1.0 kabul kriterleri**

- [ ] 200+ yayınlanmış olay İngilizce; 150+'si dört dilde (kalanlar `machine` rozetli).
- [ ] Çağ, disiplin, kişi sayfaları çalışıyor.
- [ ] Zincir görünümü en az 20 olay için anlamlı zincir üretiyor.
- [ ] Keşfet kanvası masaüstünde Z0-Z2, mobilde sıkıştırma ile çalışıyor.
- [ ] Onay kuyruğundan en az 50 olay geçmiş.
- [ ] OG görselleri otomatik; Twitter/WhatsApp/Telegram önizlemesi düzgün.
- [ ] Lighthouse: performans 90+, erişilebilirlik 95+, SEO 95+.
- [ ] Gerçek alan adında, HTTPS ile yayında; `about` sayfasında kaynak politikası ve iletişim.

---

## Haftalık ritüel

1. Her sabah 20 dk: Telegram bildirimi → `/admin/review` → onayla / düzelt / reddet.
2. Pazartesi 10 dk: `/com_week N` ile haftayı aç.
3. Cuma 10 dk: bitmeyenleri taşı, nedenini bir cümleyle `10`'a ya da `09`'a yaz.
4. Sıfır onaylı hafta "hat bozuk ya da ben yokum" sinyalidir.

## Kapsam kesme kuralı

Zaman daralırsa sırayla kes, sırayla geri ekle:

1. Kanvas Z3 + kişi çubukları. 2. Kişi sayfaları. 3. OG görselleri. 4. Kanvasın tamamı (lansman Akış ile,
   kanvas v1.1 olarak 2 hafta sonra).

**Asla kesme**: admin otomatik yayın, otomatik içerik hattı, 4 dil altyapısı, zincir görünümü,
dürüstlük bandı, içerik doğruluğu.

## 3 aydan sonrası

- **4. ay**: ky/tr/ru gözden geçirme biter → dört dilli lansman. Arama. Kanvas v2.
- **5. ay**: Flutter mobil uygulama (Supabase Flutter SDK, çevrimdışı, "bugün bilim tarihinde" bildirimi).
- **6. ay**: "Orada olsaydın" senaryoları. Kullanıcı olay önerisi. 500 olay.
- **İhtiyaç doğunca**: Go backend'e geçiş (ADR-002).
