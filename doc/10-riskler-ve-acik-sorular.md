# 10 — Riskler ve Açık Sorular

## Cevaplanan sorular (2026-09-02)

| #   | Soru                      | Cevabın                                                              | Nereye işlendi                                          |
| --- | ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| S1  | Sitenin adı?              | **Uchkun / Учкун**                                                   | ADR-012, 01, 07, README                                 |
| S2  | Kaynak dil?               | Kırgızca ve Türkçe yazarım; arada İngilizce terim kalabilir          | ADR-009, 04 (`source_locale` olay başına), 06           |
| S3  | Admin dili?               | en, ky, tr, ru; dördü de                                             | ADR-018, 02, 06                                         |
| S4  | Alan adı?                 | Henüz yok, sonra                                                     | 8. haftada seçilir; adaylar uchkun.science / .kg / .org |
| S5  | Haftada kaç saat?         | 10-15                                                                | 08 plan buna göre; değişmedi                            |
| S6  | Kırgızca gözden geçirici? | Çoğunlukla ben; bilim terimleri için Kırgızca öğretmen tanıdığım var | 06, ADR-018 (`editor` rolü)                             |
| S7  | Rusça gözden geçirici?    | Var                                                                  | 06                                                      |
| S8  | Tasarım aracı?            | Claude Design                                                        | 07                                                      |
| S9  | İlk lansman kitlesi?      | İngilizce önce (veri hazır, hızlı yayın), sonra ky, tr, ru           | ADR-013, 08 yeniden düzenlendi                          |
| S10 | Karanlık tema ana mı?     | İkisini de görüp seçeceğim                                           | ADR-015, 07 iki tema eşit                               |
| S15 | Birincil tema?            | **Açık tema** (2026-09-03)                                           | ADR-020, globals.css varsayılanı                        |

## Kalan açık sorular

| #   | Soru                                                                 | Ne zaman | Not                                            |
| --- | -------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| S11 | Bildirim kanalı: Telegram bot mu, e-posta mı?                        | Hafta 5  | Öneri Telegram (ücretsiz, anlık)               |
| S12 | Hata bildirimi nereye düşsün: e-posta mı, admin'de "bildirimler" mi? | Hafta 7  | Öneri: ikisi; e-posta yedek                    |
| S13 | Kırgızca öğretmen ve Rusça gözden geçirici ne zaman başlasın?        | Hafta 9  | İngilizce beta bitince; onlara `editor` hesabı |
| S14 | Alan adı hangisi?                                                    | Hafta 8  | Müsaitlik kontrolü                             |

## Riskler (cevaplarınla güncellendi)

### R1 — İçerik üretimi kodun gerisinde kalır

- **Senin çözümün, artık plan**: Otomatik içerik hattı (ADR-014). Claude her gece 1-2 olay için kaynak toplar, şablona göre İngilizce taslak yazar, onay kuyruğuna koyar, Telegram'dan haber verir. Sen sabah okur, düzeltir, yayınlarsın. Olay başına senin zamanın 10 dk.
- **Kalan risk**: Taslak kalitesi düşük çıkarsa onay yerine yeniden yazmak gerekir. Sinyal: reddetme oranı %30 üstü. Plan: prompt ve şablonu ilk 10 taslaktan sonra ayarla; kaynak eşiğini 3'ten 4'e çıkar.

### R2 — Tarihsel hata yayınlanır

- **Senin çözümün, artık plan**: Dürüstlük bandı her sayfada (ADR-017): "Bu siteyi yapan kişi tarihçi ya da bilim insanı değil. Bir hata gördüyseniz lütfen bildirin; düzeltmekten mutluluk duyarız." + "Hata bildir" bağlantısı.
- **Ek**: İki kaynak kuralı ve otomatik hattın araştırma notu (çelişkileri listeler) kalır. Düzeltmeler `about` sayfasında "düzeltmeler" listesinde şeffaf.

### R3 — Kırgızca çeviri kalitesi

- **Senin çözümün, artık plan**: Claude çevirir → sen okursun → Kırgızca öğretmen tanıdığın terimleri kontrol eder → `reviewed`. Öğretmene `editor` rolü, admin arayüzü Kırgızca.
- **Kalan**: Öğretmenin zamanı. Haftada 5-10 olay ile başla; birikirse `machine` rozetli kalır, sorun değil.

### R4 — Mobil performans

- **Kararın**: Eski Android'leri hedeflemiyoruz (ADR-016). Modern telefonlar için Lighthouse 90 hedefi kalır. Keşfet kanvası mobilde sıkıştırmayla çalışır; yavaşlarsa kartlar yerine noktalar.

### R5 — Kapsam şişer

- **Kararın**: "Bu noktaya geldiysek başarmışızdır." Katılıyorum. Kural yine kalsın: yeni fikir → aşağıdaki Park listesine, ayda bir bakılır. Kanvas zaten alındı; başka büyük özellik 3 ayda yok.

### R6 — Motivasyon

- Bu sende. Planın yardımı: Hafta 4 videosu, Hafta 8 beta, her sabah Telegram'dan gelen yeni taslak (küçük ama sürekli ilerleme hissi), haftada bir olay kuralı.

### R7 — Ücretsiz katman sınırları

- **Kararın**: Şimdilik Supabase, ileride Go backend. ADR-002'ye geçiş yolu eklendi: iş mantığı Postgres ve script'lerde kalır ki Go'ya geçiş sadece API katmanını değiştirsin.

### R8 — Görsel telif (sade açıklama)

İnternetteki her fotoğrafın bir sahibi vardır. Bir haber sitesinden ya da kitaptan alınmış bir Einstein fotoğrafını izinsiz koyarsan, sahibi siteyi kapattırabilir ya da tazminat isteyebilir. Güvenli olanlar:

- **Kamu malı**: yazarı 70+ yıl önce ölmüş eserler; eski portreler, kitap kapakları, çizimler. Serbest.
- **CC lisanslı**: sahibi "adımı yazın, kullanın" demiş. Serbest, atıf şart.
- **NASA / ESA** görselleri: çoğunlukla serbest, kontrol edilir.
- Wikimedia Commons bunların hepsini lisansıyla listeler; oradan alırız.
  Plan (ADR-011): admin formunda görsel eklerken kaynak + lisans + kimin alanları zorunlu. Şüphede görselsiz kart (disiplin renginde, yıl büyük). Böylece hiç risk yok.

### R9 — Claude API maliyeti/bağımlılığı

- Otomatik hatla aylık 10-15 $. Model adı tek yerden okunur. Kapatma anahtarı var.

### R10 — Keşfet kanvası zamanında bitmez (yeni)

- **Neden**: Kanvas 3 aya alındı; 11-12. haftalar dolu.
- **Sinyal**: Hafta 11 sonunda Z0-Z2 masaüstünde çalışmıyorsa.
- **Plan**: Lansmanı kanvassız yap (Akış modu tamdır), kanvası v1.1 olarak 2 hafta sonra çıkar. Lansman metninde "yakında: Keşfet" de; merak yaratır.

## Park (3 aydan sonra bakılacak fikirler)

- 2026-09-03: Zaman boşluğu işaretine tek cümlelik anlatı notu ("Optik iyi cam ve matbaayı bekledi"). Şema alanı yok; `eras` ya da ayrı `gaps` tablosu + çeviri gerekir. Hafta 3-4'te değerlendir.

- 2026-09-02: "Orada olsaydın" etkileşimli senaryolar.
- 2026-09-02: "Geriye sar" modu (bugünden geçmişe).
- 2026-09-02: Flutter uygulaması, çevrimdışı okuma, günlük bildirim.
- 2026-09-02: Sesli anlatım (her olay 2 dk).
- 2026-09-02: Öğretmen sunum modu.
- 2026-09-02: Kullanıcı olay önerisi + editör onayı.
- 2026-09-02: Harita görünümü (keşifler nerede oldu; Orta Asya'nın görünürlüğü için güçlü).
- 2026-09-02: Quiz / "bu çağda hangisi yoktu?" oyunu.
- 2026-09-02: Arama (v1.0'dan çıkarıldı, 4. ay).
- 2026-09-02: Go backend'e geçiş (ihtiyaç doğunca).

## Neden (motivasyon düşünce oku)

"Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım."

Bu siteyi açan bir lise öğrencisi, Uluğ Bey'in Semerkant'ta çıplak gözle Tycho'dan 150 yıl önce yıldızları ölçtüğünü
kendi dilinde okuyacak. Belki bir gün ekoloji meselesini çözen kişi o olur, belki olmaz. Ama merakı bizim yüzümüzden
söndü olmayacak. Haftada bir olay. Devam.
