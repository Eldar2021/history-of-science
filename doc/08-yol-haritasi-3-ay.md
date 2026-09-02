# 08 — 3 Aylık Yol Haritası (12 hafta)

Güncellendi 2026-09-02, kararlarınla: İngilizce önce, otomatik içerik hattı, Keşfet kanvası 3. ayda, admin 4 dilde,
dürüstlük bandı, iki tema. Arama v1.0'dan çıktı.

## Tempo varsayımı

Haftada **10-15 saat** (cevabın). Claude Code ile kod hızlı; darboğaz karar vermek ve içerik onaylamak.
Otomatik içerik hattı sayesinde içerik yükün olay başına ~10 dakikaya iner. Her hafta bir kod hedefi + bir içerik hedefi.

## Üç ayın büyük resmi

| Ay | Tema | Sonunda elimizde ne var |
|----|------|-------------------------|
| **1** | Temel | Çalışan Akış timeline'ı, admin ekliyor sitede görünüyor, 50 İngilizce olay. Sadece sen görüyorsun. |
| **2** | Otomasyon ve dil | Claude her gece taslak hazırlıyor, sen onaylıyorsun; 4 dil altyapısı; 120 olay; **İngilizce kapalı beta** (10 kişi). |
| **3** | Derinlik ve lansman | Kişiler, bağlantılar, "Buraya nasıl geldik?" zinciri, **Keşfet kanvası**, 200 olay, **v1.0 İngilizce lansman**; ky/tr/ru gözden geçirme sürüyor. |

---

## AY 1 — Temel

### Hafta 1: İskelet, şema, tasarım başlangıcı

**Kod**
- [ ] `web/`: Next.js 15 + TypeScript + Tailwind v4 + next-intl; 4 dil rotası çalışıyor; admin de aynı i18n altyapısında.
- [ ] `backend/supabase/`: bulut projesi + yerel `supabase start`; `0001_init.sql` (04-mimari şeması, `status` üç değerli, `drafted_by`, `source_locale`).
- [ ] Seed: 8 çağ, 8 disiplin, 4 dilde adları; 10 örnek olay (İngilizce).
- [ ] Vercel bağlı; `main` push = deploy.
- [ ] `CLAUDE.md` (11'deki şablon).

**Tasarım**
- [ ] 07'deki promptu Claude Design'a ver. İki tema, dokuz ekran. Henüz seçme.

**İçerik**
- [ ] İlk 5 olayı 03'teki şablonla İngilizce yaz (Claude taslak, sen doğrula): Thales, Öklid, Arşimet, Eratosthenes, El-Harezmi. Şablonu test etmek için.

**Hafta sonu kontrolü**: `/en/timeline` 10 olayı düz liste olarak gösteriyor.

### Hafta 2: Akış timeline'ı MVP

**Kod**
- [ ] Dikey akış, 3 boyutta olay kartı, sticky çağ başlığı, zaman boşluğu işareti.
- [ ] Sabit üst çubuk + canlı yıl göstergesi.
- [ ] `formatYear` 4 dil × 4 kesinlik × MÖ/MS, Vitest.
- [ ] Tasarım token'ları (`tokens.json` → `globals.css`), **her iki tema**; sistem tercihi + anahtar.
- [ ] `?year=` derin bağlantı.
- [ ] `xScale(year, zoom, pan)` ölçek fonksiyonu (minimap ve ileride kanvas ortak kullanır).

**Tasarım**
- [ ] İki temayı gerçek kodda gör, **birincil temayı seç** (S15). Token'ları `resource/design/`e kaydet.

**İçerik**
- [ ] +10 olay İngilizce (antik dünya).

### Hafta 3: Olay detayı, giriş, minimap

**Kod**
- [ ] Olay detay: masaüstü yan panel, mobil sheet, doğrudan URL tam sayfa; geri tuşu konumu korur.
- [ ] Ana sayfa + "Zamana düş" sayaç geçişi + reduced-motion.
- [ ] Minimap (gerçek ölçek, `xScale` ile) + tıklayınca atlama.
- [ ] Disiplin filtre çipleri, URL senkron.
- [ ] **Dürüstlük bandı** alt bilgide, 4 dilde, "Hata bildir" mailto (olay bilgisi otomatik).

**İçerik**
- [ ] +10 olay (İslam Altın Çağı, Orta Asya vurgusu).

**Hafta sonu kontrolü**: Bir arkadaşa telefonu ver, 2 dakika sessiz izle, not al.

### Hafta 4: Admin ve otomatik yayın

**Kod**
- [ ] Supabase Auth, `profiles.role` (admin/editor), RLS (taslak ve review sızmıyor; anonim istekle kanıtla).
- [ ] `middleware.ts` admin koruması.
- [ ] `/admin/events` liste (yıl, başlık, durum, hazırlayan, dil durumu); `/admin/events/new` ve `/{id}` form (P0 alanlar + kaynak dil + önem).
- [ ] Server action → kaydet → `revalidateTag` → sitede anında. Videoya çek.
- [ ] Yumuşak silme. Admin UI 4 dilde (`messages/admin.*.json`).
- [ ] Playwright: "admin ekler, sitede görünür".

**İçerik**
- [ ] +15 olay → 50 (Bilimsel Devrim'e kadar).

**Kilometre taşı M1**: 02'deki MVP kabul kriterleri yeşil. Sadece senin bildiğin URL'de.

---

## AY 2 — Otomasyon ve dil

### Hafta 5: Otomatik içerik hattı

**Kod**
- [ ] `backend/scripts/draft-next.ts`: çekirdek listeden sıradaki olayı seç → Claude API (web search) → 3+ kaynak → şablona göre İngilizce JSON taslak → `status='review'`, `drafted_by='ai'`, `research_note`, `sources`.
- [ ] GitHub Actions cron (her gece 03:00), `CONTENT_PIPELINE_ENABLED`, "kuyrukta 10+ varsa üretme".
- [ ] Telegram bot bildirimi (S11).
- [ ] `/admin/review` onay kuyruğu: taslak + kaynaklar + araştırma notu; Yayınla / Düzenle / Reddet.
- [ ] İlk 10 taslağı elle tetikle, kaliteyi ölç, prompt'u ayarla. Reddetme oranı %30 üstündeyse kaynak eşiğini yükselt.

**İçerik**
- [ ] Hat çalışmaya başlar: günde 2 taslak. Sen sabah 20 dakika onay.
- [ ] Hafta sonunda ~60 olay.

### Hafta 6: Çeviri hattı ve görseller

**Kod**
- [ ] `web/lib/translate.ts` (Claude API, JSON şema doğrulama, kaynak dili olaydan okur, Kırgızca için tr+ru referanslı).
- [ ] `/admin/translate/{id}`: 4 dil yan yana, "Çevir", `machine/reviewed`, `editor` rolü sadece burada düzenler.
- [ ] Sitede fallback + "bu dilde henüz yok" + "otomatik çeviri" rozetleri.
- [ ] "Yayınla + çevir" tek tık.
- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak; görselsiz kart.
- [ ] Kırgızca terim sözlüğü ilk 30 terim; `check-i18n.ts`.

**İçerik**
- [ ] Hat sürüyor → ~75 olay. Tüm yayınlanmışlara makine çevirisi.
- [ ] 20 olaya görsel (Commons).

### Hafta 7: Çağ ve disiplin sayfaları, SEO

**Kod**
- [ ] `/era/{slug}`, `/discipline/{slug}`.
- [ ] `hreflang`, `<html lang>`, meta 4 dilde, `sitemap.xml`, `robots.txt`, dinamik OG görselleri.
- [ ] Analitik (Plausible/Umami), Sentry.
- [ ] Erişilebilirlik geçişi (klavye, odak, `aria-live`, kontrast).

**İçerik**
- [ ] Hat sürüyor → ~90 olay. 8 çağın kapak metinleri (İngilizce + çeviri).

### Hafta 8: İngilizce kapalı beta

**Kod**
- [ ] Alan adı seç ve bağla (S14), üretim Supabase projesi, yedekleme.
- [ ] Performans turu: Lighthouse mobil 90+; font alt kümeleri; JS bütçesi.
- [ ] `about` sayfası (neden, kaynak politikası, düzeltmeler listesi, iletişim) 4 dilde.

**İçerik**
- [ ] Hat sürüyor → ~120 olay.

**Kilometre taşı M2**: 10 kişilik İngilizce kapalı beta, 1 hafta, geri bildirim formu. 3 büyük sorun → Hafta 9.

---

## AY 3 — Derinlik ve lansman

### Hafta 9: Beta düzeltmeleri, kişiler, bağlantılar, gözden geçiriciler başlar

**Kod**
- [ ] Beta'nın 3 büyük sorunu.
- [ ] `people` CRUD, `/person/{slug}`, olay-kişi ilişkisi (hat kişi önerilerini de üretir).
- [ ] `event_links`: admin'de arayıp bağlama; detayda "Dayanır / Mümkün kıldı".
- [ ] Kırgızca öğretmen ve Rusça gözden geçirici için `editor` hesapları; kısa kullanım rehberi (S13).

**İçerik**
- [ ] Hat sürüyor → ~140 olay. 40 kişi. İlk 120 olay için bağlantılar (~3/olay; hat öneriyor, sen onaylıyorsun).
- [ ] Gözden geçiriciler başlar: önem 5 olaylardan itibaren.

### Hafta 10: "Buraya nasıl geldik?" zinciri

**Kod**
- [ ] `v_chain` recursive sorgu (derinlik 6, döngü koruması).
- [ ] `/chain/{slug}`: geriye akan nehir; mobil akordeon; ileri yön.
- [ ] Detayda büyük buton.

**İçerik**
- [ ] Hat sürüyor → ~160 olay. 5 vitrin zinciri elle kontrol: akıllı telefon, mRNA aşısı, GPS, penisilin, JWST.

### Hafta 11: Keşfet kanvası v1

**Kod**
- [ ] `/explore`: SVG + d3-zoom, `xScale` ortak, Z0-Z2, 8 disiplin şeridi, önem tabanlı görünürlük, kümeleme ("+4"), görünür pencere dışını render etme.
- [ ] Tıklayınca aynı panel; URL `?year&zoom&d`; Akış ↔ Keşfet geçişi konumu korur.
- [ ] Masaüstü öncelikli; mobilde Z0 + sıkıştırma ile temel.

**İçerik**
- [ ] Hat sürüyor → ~180 olay.

### Hafta 12: Kanvas v1.1, cila, lansman

**Kod**
- [ ] Kanvas: Z3 + kişi yaşam çubukları, bağlantı çizgileri, mobil sıkıştırma cilası.
- [ ] Klavye kısayolları, gerçek cihaz testi (modern iPhone/Android, masaüstü Firefox/Safari).
- [ ] Playwright 3 akış + CI (GitHub Actions) her PR'da.
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). Yedekten geri yükleme provası. `v1.0.0` etiketi, `CHANGELOG.md`.

**İçerik**
- [ ] → 200 olay. Bağlantılar 300+. Türkçe ve İngilizce `reviewed` (sen). ky/ru gözden geçirme sürüyor, `machine` rozetli olanlar kalabilir.

**Lansman (İngilizce)**
- [ ] Lansman metni: senin hikâyen ("o yüzyıla gitsem hiçbir şey yapamazdım") + "yakında: 4 dil tam onaylı".
- [ ] Hacker News "Show HN", Reddit (r/HistoryOfScience, r/InternetIsBeautiful), LinkedIn, Twitter/X, Telegram kanalları (Kırgız/Türk teknoloji toplulukları; ky/tr içerik rozetli de olsa var).
- [ ] Bir öğretmene doğrudan yaz.
- [ ] Bir hafta sonra: geri bildirim + analitik → 3 büyük sorun listesi.

**Kilometre taşı M3 = v1.0**: 02'deki v1.0 kabul kriterleri yeşil. 200 olay, Akış + Keşfet, zincir, 4 dil altyapısı, İngilizce tam.

---

## Her hafta tekrarlanan ritüel

1. Her sabah 20 dk: Telegram bildirimi → `/admin/review` → onayla/düzelt/reddet.
2. Pazartesi 10 dk: bu haftanın kutucuklarını aç; 11'deki haftanın isteğini Claude Code'a ver.
3. Cuma 10 dk: bitmeyenleri taşı, nedenini 10-riskler'e ya da 09-kararlar'a bir cümleyle yaz.
4. Sıfır onaylı hafta "hat bozuk ya da ben yokum" sinyalidir.

## Kapsam kesme kuralı (zaman daralınca)

Sırayla kes, sırayla geri ekle:
1. Kanvas Z3 + kişi çubukları (v1.1'e kalır).
2. Kişi sayfaları (adlar kartta metin kalır).
3. OG görselleri (statik tek görsel).
4. Kanvasın tamamı (lansman Akış ile; kanvas 2 hafta sonra v1.1, R10).
5. **Asla kesme**: admin otomatik yayın, otomatik içerik hattı, 4 dil altyapısı, zincir görünümü, dürüstlük bandı, içerik doğruluğu.

## 3 aydan sonrası (4-6. ay, taslak)

- **4. ay**: ky/tr/ru gözden geçirme tamamlanır → dört dilli lansman (Kırgız ve Türk basını/toplulukları). Arama. Kanvas v2 (akıllı etiket yerleşimi, zinciri vurgula).
- **5. ay**: Flutter mobil uygulama (Supabase Flutter SDK, çevrimdışı, "bugün bilim tarihinde" bildirimi). Harita görünümü.
- **6. ay**: "Orada olsaydın" senaryoları. Kullanıcı olay önerisi. 500 olay hedefi (hat günde 2 → ayda 60 sürdürür).
- **İhtiyaç doğunca**: Go backend'e geçiş (ADR-002 yolu).
