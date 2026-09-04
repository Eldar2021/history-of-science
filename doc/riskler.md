# Riskler, açık sorular, park

Cevaplanan soru ve çözülen risk buradan çıkar; kararı `kararlar.md`'de, uygulaması kodda.

## Açık sorular

| #   | Soru                                                    | Ne zaman | Not                                     |
| --- | ------------------------------------------------------- | -------- | --------------------------------------- |
| S11 | Bildirim kanalı: Telegram bot mu, e-posta mı?           | Faz B    | Öneri Telegram (ücretsiz, anlık)        |
| S12 | Hata bildirimi nereye: e-posta mı, admin "bildirimler"? | Faz C    | Öneri ikisi; e-posta yedek              |
| S13 | Kırgızca öğretmen ve Rusça gözden geçirici ne zaman?    | Faz D    | İngilizce beta bitince; `editor` hesabı |
| S14 | Alan adı hangisi?                                       | Faz C    | uchkun.science / .kg / .org             |

## Canlı riskler

- **R1 İçerik kodun gerisinde kalır.** Şimdilik askıda (50'de dondu). Faz B'de hat ile çözülür; sinyal:
  reddetme oranı %30 üstü → prompt'u ayarla, kaynak eşiğini 4'e çıkar.
- **R2 Tarihsel hata yayınlanır.** Dürüstlük bandı + iki kaynak kuralı + araştırma notu. Düzeltmeler
  `about` sayfasında listelenecek (Faz C).
- **R3 Kırgızca çeviri kalitesi.** Claude (tr+ru referanslı) → kullanıcı okur → öğretmen terimleri kontrol
  eder → `reviewed`. Birikirse `machine` rozetli kalır, sorun değil.
- **R9 Claude API maliyeti.** Hat + çeviri ayda ~10-15 $. Model adı tek yerden; `CONTENT_PIPELINE_ENABLED`.
- **R5 Kapsam şişer.** Yeni fikir → Park; ayda bir bakılır. Kanvas dışında büyük özellik yok.

## Park

- Zaman boşluğu işaretine tek cümlelik anlatı notu ("Optik iyi cam ve matbaayı bekledi"); `gaps` tablosu gerekir.
- Disiplin filtresi ve minimap şeridin üstünde (eski `/timeline`'dan).
- "Orada olsaydın" etkileşimli senaryolar · "Geriye sar" modu · Sesli anlatım · Öğretmen sunum modu.
- Kullanıcı olay önerisi + editör onayı · Quiz · Arama · Flutter, çevrimdışı, günlük bildirim.
- Go backend'e geçiş (ADR-002).
