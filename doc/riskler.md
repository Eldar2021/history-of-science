# Riskler, açık sorular, park

Cevaplanan soru ve çözülen risk buradan çıkar; kararı `kararlar.md`'de, uygulaması kodda.

## Açık sorular

| #   | Soru                                                    | Ne zaman  | Not                                     |
| --- | ------------------------------------------------------- | --------- | --------------------------------------- |
| S12 | Hata bildirimi nereye: e-posta mı, admin "bildirimler"? | Faz C     | Öneri ikisi; e-posta yedek              |
| S13 | Kırgızca ve Rusça gözden geçirici kim, ne zaman?        | Faz Q     | Öne çekildi: 143 çeviri `machine`       |
| S14 | Alan adı hangisi?                                       | Faz C     | uchkun.science / .kg / .org             |
| S15 | Analitik ve Sentry ne zaman, hangisi?                   | Ertelendi | Kullanıcı 2026-09-05: şimdilik yok      |

## Canlı riskler

- **R2 Tarihsel hata yayınlanır. Gerçekleşti.** 2026-09-24'te yayındaki üç olay (Uluğ Bey,
  Haber-Bosch, Rutherford) bağımsız kontrol edildi: ~5.200 İngilizce kelimede **7 somut hata** + 4
  abartı, yaklaşık 750 kelimede bir. Yıl, yer, kişi, görsel künyesi doğru; hatalar hikâyeyi canlandıran
  ayrıntılarda (bir çocuğun yaşı, "yıkıldı" efsanesi, üretim tonajı, "hiç dedektör yoktu"). Hattın kendi
  fact-checker adımı ve insan onayı ikisini de kaçırdı; hata dört dile aynen kopyalanıyor. Plan: Faz Q.
- **R1 İçerik hızı** artık risk değil: 18 günde 37 olay. Darboğaz hız değil doğruluk (R2).
- **R3 Kırgızca çeviri kalitesi.** Claude (tr+ru referanslı) → kullanıcı okur → öğretmen terimleri kontrol
  eder → `reviewed`. Birikirse `machine` rozetli kalır, sorun değil.
- **R9 Hattın kotası ve token'ı.** Para riski ADR-039 ile bitti (abonelik, ölçülen API değil). Kalan iki
  şey: koşular Max kotasından yiyor, ve `CLAUDE_CODE_OAUTH_TOKEN` süresi dolarsa gece koşusu
  "authentication" hatasıyla düşer — `claude setup-token` ile yenilenir, başka bir şey bozulmaz.
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
- Kullanıcı olay önerisi + editör onayı · Quiz · Flutter, çevrimdışı, günlük bildirim.
- Go backend'e geçiş (ADR-002).
