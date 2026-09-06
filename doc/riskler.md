# Riskler, açık sorular, park

Cevaplanan soru ve çözülen risk buradan çıkar; kararı `kararlar.md`'de, uygulaması kodda.

## Açık sorular

| #   | Soru                                                    | Ne zaman | Not                                     |
| --- | ------------------------------------------------------- | -------- | --------------------------------------- |
| S12 | Hata bildirimi nereye: e-posta mı, admin "bildirimler"? | Faz C    | Öneri ikisi; e-posta yedek              |
| S13 | Kırgızca öğretmen ve Rusça gözden geçirici ne zaman?    | Faz D    | İngilizce beta bitince; `editor` hesabı |
| S14 | Alan adı hangisi?                                       | Faz C    | uchkun.science / .kg / .org             |
| S15 | Analitik ve Sentry ne zaman, hangisi?                   | Ertelendi | Kullanıcı 2026-09-05: şimdilik yok      |

## Canlı riskler

- **R1 İçerik kodun gerisinde kalır.** Artık **canlı risk**: teknik taraf bitti, darboğaz içerik.
  Faz B'de hat ile çözülür; sinyal: reddetme oranı %30 üstü → prompt'u ayarla, kaynak eşiğini 4'e çıkar.
- **R2 Tarihsel hata yayınlanır.** Dürüstlük bandı + iki kaynak kuralı + araştırma notu. Düzeltmeler
  `about` sayfasında listelenecek (Faz C).
- **R3 Kırgızca çeviri kalitesi.** Claude (tr+ru referanslı) → kullanıcı okur → öğretmen terimleri kontrol
  eder → `reviewed`. Birikirse `machine` rozetli kalır, sorun değil.
- **R9 Claude API maliyeti.** Tavan kalkınca gövdeler uzadı: tahmin olay başına 1-3 $, 100 olay için
  100-300 $. İlk 3 olaydan sonra gerçeği ölç. Model adı tek yerden; `CONTENT_PIPELINE_ENABLED`.
- **R10 Veritabanı kaybı.** Ücretsiz katmanda PITR yok. Gece yedeği kuruldu, 2026-09-05'te elle
  çalıştırılıp artefaktı indirildi. **Kalan risk: geri yükleme hiç denenmedi.** Denenmemiş
  yedek yedek sayılmaz; ilk fırsatta boş bir projeye `roles → schema → data` sırasıyla yüklenmeli.
- **R5 Kapsam şişer.** Yeni fikir → Park; ayda bir bakılır. Kanvas dışında büyük özellik yok.

## Park

- Uzun gövdede bölüm çapaları / içindekiler. 2026-09-06'da 1131 kelime telefonda okundu, gerekmedi;
  gövdeler 2000 kelimeyi aşarsa yeniden bakılır.
- Zaman boşluğu işaretine tek cümlelik anlatı notu ("Optik iyi cam ve matbaayı bekledi"); `gaps` tablosu gerekir.
- Disiplin filtresi ve minimap şeridin üstünde (eski `/timeline`'dan).
- "Orada olsaydın" etkileşimli senaryolar · "Geriye sar" modu · Sesli anlatım · Öğretmen sunum modu.
- Kullanıcı olay önerisi + editör onayı · Quiz · Arama · Flutter, çevrimdışı, günlük bildirim.
- Go backend'e geçiş (ADR-002).
