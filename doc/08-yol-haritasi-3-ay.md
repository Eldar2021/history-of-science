# 08 — 3 Aylık Yol Haritası (12 hafta)

## Tempo varsayımı

Haftada **10-15 saat** senin zamanın (akşamlar + hafta sonu bir gün). Claude Code ile kod yazma hızı yüksek;
darboğaz kod değil, **karar vermek ve içerik yazmak**. Plan buna göre: her hafta bir kod hedefi + bir içerik hedefi.

Haftada 25+ saat ayırabiliyorsan bu plan 8 haftaya sığar; 5 saat ayırabiliyorsan 5 aya yayılır. Sıra değişmez.

## Üç ayın büyük resmi

| Ay | Tema | Sonunda elimizde ne var |
|----|------|-------------------------|
| **1** | Temel | Çalışan timeline, admin ekliyor sitede görünüyor, 50 olay, tek dil. Sadece sen görüyorsun. |
| **2** | Dil ve içerik | Dört dil, çeviri hattı, 110 olay, çağ/disiplin sayfaları, gerçek alan adında **kapalı beta** (10 kişi). |
| **3** | Derinlik ve lansman | Kişiler, bağlantılar, "Buraya nasıl geldik?" zinciri, arama, 200 olay, **v1.0 açık lansman**. |

---

## AY 1 — Temel

### Hafta 1: Kararlar, iskelet, tasarım başlangıcı

**Kod**
- [ ] `web/`: Next.js 15 + TypeScript + Tailwind v4 + next-intl kurulumu; 4 dil rotası çalışıyor, "Merhaba" 4 dilde.
- [ ] `backend/supabase/`: proje oluştur (bulut) + yerel `supabase start`; `0001_init.sql` migration (04-mimari'deki şema).
- [ ] Seed: 8 çağ, 8 disiplin, 4 dilde adları; 10 örnek olay.
- [ ] Vercel'e bağla; `main` push = deploy. Preview URL çalışıyor.
- [ ] `CLAUDE.md` yaz (11-claude-ile-calisma'daki şablon).

**Tasarım**
- [ ] 07'deki promptu Claude Design'a ver. İlk konsepti al, 2-3 varyasyon iste. Henüz onaylama; hafta 2'de kodla karşılaştır.

**İçerik**
- [ ] 10-riskler'deki açık soruları cevapla (isim, kaynak dil, admin dili).
- [ ] İlk 5 olayı 03'teki şablonla yaz (Thales, Öklid, Arşimet, Eratosthenes, El-Harezmi). Şablonu test etmek için.

**Hafta sonu kontrolü**: `/tr/timeline` boş bir sayfada 10 olayı düz liste olarak gösteriyor. Çirkin ama çalışıyor.

### Hafta 2: Timeline MVP

**Kod**
- [ ] Timeline sayfası: dikey akış, olay kartları (3 boyut), çağ başlıkları (sticky), zaman boşluğu işareti.
- [ ] Sabit üst çubuk + canlı yıl göstergesi (`IntersectionObserver`).
- [ ] `formatYear` fonksiyonu 4 dil, birim testli.
- [ ] Tasarım token'ları (`tokens.json` → `globals.css`); karanlık tema.
- [ ] `?year=` derin bağlantı: sayfa o yıla kaydırılmış açılır.

**Tasarım**
- [ ] Konsepti onayla, token'ları çıkar, `resource/design/`e kaydet.

**İçerik**
- [ ] +10 olay (antik dünya tamamlanır).

**Hafta sonu kontrolü**: Telefonda timeline'ı kaydırınca yıl değişiyor, çağlar değişiyor, hoş görünüyor.

### Hafta 3: Olay detayı ve giriş deneyimi

**Kod**
- [ ] Olay detay: masaüstünde yan panel, mobilde sheet; `/event/{slug}` doğrudan açılınca tam sayfa.
- [ ] Geri tuşu davranışı: panel kapanır, kaydırma konumu korunur (paralel rotalar / intercepting routes).
- [ ] Ana sayfa + "Zamana düş" geçişi (sayaç animasyonu) + reduced-motion varyantı.
- [ ] Minimap (gerçek ölçekli SVG şerit) + tıklayınca atlama.
- [ ] Disiplin filtre çipleri; URL ile senkron.

**İçerik**
- [ ] +10 olay (İslam Altın Çağı, Orta Asya vurgusu).

**Hafta sonu kontrolü**: Bir arkadaşına telefonunu ver, hiçbir şey söyleme, 2 dakika izle. Nerede takıldı, not al.

### Hafta 4: Admin ve otomatik yayın

**Kod**
- [ ] Supabase Auth: e-posta/şifre, `profiles.role`, RLS politikaları (taslak sızmıyor; testle kanıtla).
- [ ] `middleware.ts`: `/admin` koruması.
- [ ] `/admin/events`: liste (yıl, başlık, durum, dil durumu sütunları).
- [ ] `/admin/events/new` ve `/{id}`: form (P0 alanlar), markdown önizleme, disiplin çoklu seçim, taslak/yayınla.
- [ ] Server action → kaydet → `revalidateTag` → sitede anında görünür. Bunu videoya çek; motivasyon için.
- [ ] Yumuşak silme ve geri alma.
- [ ] Playwright: "admin ekler, sitede görünür" testi.

**İçerik**
- [ ] +15 olay → toplam 50 (Bilimsel Devrim'e kadar).

**Kilometre taşı M1**: 02'deki MVP kabul kriterlerinin tamamı yeşil. Sadece senin bildiğin bir Vercel URL'sinde.

---

## AY 2 — Dil ve içerik

### Hafta 5: Çeviri hattı

**Kod**
- [ ] `web/lib/translate.ts`: Claude API ile alan alan çeviri, JSON şema doğrulama.
- [ ] `/admin/translate/{id}`: 4 dil yan yana, "Çevir" butonu, `machine/reviewed` durumu, kaydet.
- [ ] Sitede: fallback (kaynak dil) + "bu dilde henüz yok" rozeti; `machine` rozeti.
- [ ] UI metinleri 4 dilde tamamlandı (`messages/*.json`), `check-i18n.ts` script'i.
- [ ] Kırgızca terim sözlüğü ilk 30 terim.

**İçerik**
- [ ] 50 olayın tamamı 4 dile makine çevirisi. Türkçe ve İngilizce'yi sen gözden geçir (ru/ky `machine` kalabilir).

### Hafta 6: İçerik sprinti

**Kod** (hafif hafta, içerik ağırlıklı)
- [ ] Görsel yükleme: Supabase Storage, atıf/lisans zorunlu alanlar, `next/image`.
- [ ] Görselsiz olay için üretilmiş kart.
- [ ] Bug listesi temizliği.

**İçerik**
- [ ] +30 olay (Aydınlanma + 19. yüzyıl) → 80. Hepsi çevrilmiş.
- [ ] 8 çağın kapak metinleri 4 dilde.
- [ ] 20 olaya görsel (Wikimedia Commons, kamu malı).

### Hafta 7: Çağ ve disiplin sayfaları, SEO

**Kod**
- [ ] `/era/{slug}`, `/discipline/{slug}` sayfaları.
- [ ] `hreflang`, `<html lang>`, meta başlık/açıklama 4 dilde, `sitemap.xml`, `robots.txt`.
- [ ] `/og/{slug}` dinamik OG görselleri (yıl büyük, başlık, disiplin rengi).
- [ ] Plausible/Umami analitik.
- [ ] Erişilebilirlik geçişi: klavye, odak, `aria-live`, kontrast ölçümü.

**İçerik**
- [ ] +30 olay (Modern Fizik Çağı) → 110.

### Hafta 8: Kapalı beta

**Kod**
- [ ] Alan adı bağla, HTTPS, üretim Supabase projesi (yerelden ayrı), yedekleme açık.
- [ ] Performans turu: Lighthouse mobil 90+; JS bütçesi; font alt kümeleri.
- [ ] Sentry.
- [ ] Geri bildirim bağlantısı (`about` sayfası + her olayda "hata bildir" mailto).

**İçerik**
- [ ] `about` sayfası 4 dilde: neden, kaynak politikası, iletişim.

**Kilometre taşı M2**: 10 kişilik kapalı beta (en az 2'si Kırgızca, 2'si Rusça okuyan). Bir hafta kullanım, geri bildirim formu.
Beta'dan 3 en büyük sorunu seç; Hafta 9'a taşı.

---

## AY 3 — Derinlik ve lansman

### Hafta 9: Beta düzeltmeleri, kişiler, bağlantılar

**Kod**
- [ ] Beta'nın 3 büyük sorunu.
- [ ] `people`: admin CRUD, `/person/{slug}` sayfası, olay-kişi ilişkisi.
- [ ] `event_links`: admin'de olay arayıp bağlama; detayda "Dayanır / Mümkün kıldı" listeleri.

**İçerik**
- [ ] 40 kişi kaydı (4 dilde ad, kısa bio).
- [ ] İlk 110 olay için bağlantılar (ortalama 3/olay → ~300).

### Hafta 10: "Buraya nasıl geldik?" zinciri

**Kod**
- [ ] `v_chain` recursive sorgu (derinlik 6, döngü koruması).
- [ ] `/chain/{slug}` görünümü: geriye akan nehir; mobilde akordeon.
- [ ] İleri yön ("neyi mümkün kıldı").
- [ ] Detay sayfasında büyük buton (bağlantı yoksa gizli).

**İçerik**
- [ ] +40 olay (Bilgi Çağı) → 150. Çevir.
- [ ] 5 "vitrin zinciri" elle kontrol: akıllı telefon, mRNA aşısı, GPS, penisilin, JWST. Her biri 5+ seviye derinlikte anlamlı olsun.

### Hafta 11: Arama, cila, mobil QA

**Kod**
- [ ] Postgres `tsvector` arama, dil başına; `/search` sayfası; üst çubukta arama.
- [ ] Aydınlık tema + sistem tercihi + anahtar.
- [ ] Klavye kısayolları.
- [ ] Gerçek cihaz testi: eski Android (Chrome), iPhone Safari, masaüstü Firefox. Yavaş 3G simülasyonu.
- [ ] Playwright üç akış yeşil; CI'da (GitHub Actions) her PR'da koşuyor.

**İçerik**
- [ ] +50 olay (Bugün + eksik çağlar) → 200. Çevir. Bağla.
- [ ] Tüm `machine` Türkçe/İngilizce çevirileri `reviewed` yap. Rusça için bir okuyucu bul; Kırgızca için 10-riskler'e bak.

### Hafta 12: Lansman

**Kod**
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+).
- [ ] Yedek/geri alma provası: veritabanını yedekten geri yükle, çalıştığını gör.
- [ ] Sürüm etiketi `v1.0.0`; `CHANGELOG.md`.

**Lansman**
- [ ] Bir lansman metni 4 dilde (senin hikâyenle: "o yüzyıla gitsem hiçbir şey yapamazdım").
- [ ] Paylaşım: kişisel çevre, Kırgız/Türk teknoloji toplulukları, Telegram kanalları, LinkedIn, Reddit (r/HistoryOfScience, r/Kyrgyzstan), Hacker News "Show HN".
- [ ] Bir öğretmene doğrudan yaz: "sınıfta dener misin?"
- [ ] Geri bildirim toplama (form + analitik), bir hafta sonra 3 büyük sorun listesi.

**Kilometre taşı M3 = v1.0**: 02'deki v1.0 kabul kriterleri yeşil. 200 olay, 4 dil, zincir görünümü, yayında.

---

## Her hafta tekrarlanan ritüel (30 dk)

1. Pazartesi: bu haftanın kutucuklarını aç; Claude Code'a 11-claude'daki haftanın başlangıç isteğini ver.
2. Cuma: bitmeyenleri sonraki haftaya taşı, **neden** bitmediğini bir cümleyle 10-riskler'e ya da 09-kararlar'a yaz.
3. Her hafta en az 1 olay yayınla; sıfır olan hafta "proje öldü" sinyalidir. Küçük de olsa ilerle.

## Kapsam kesme kuralı (zaman daralınca)

Sırayla kes, sırayla geri ekle:
1. Aydınlık tema (karanlık yeter).
2. Arama (200 olayda çağ + filtre yeter).
3. Kişi sayfaları (kişi adları kartta metin olarak kalır).
4. OG görselleri (statik tek görsel).
5. **Asla kesme**: admin otomatik yayın, 4 dil, zincir görünümü, içerik doğruluğu.

## 3 aydan sonrası (4-6. ay, taslak)

- **4. ay**: Flutter mobil uygulama (Supabase Flutter SDK, çevrimdışı okuma, "bugün bilim tarihinde" bildirimi). `mobile/` klasörü.
- **5. ay**: "Orada olsaydın" etkileşimli senaryolar (3 tane). Yakınlaştırılabilir kanvas modu (masaüstü).
- **6. ay**: Kullanıcı katkısı (kaynaklı öneri formu, editör onayı). Öğretmen modu (sunum). 500 olay hedefi.
- **Sürekli**: haftada 5-10 olay, Kırgızca ana dil gözden geçiricisi, sesli anlatım denemesi.
