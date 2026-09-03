# 10 — Riskler, açık sorular, park

Cevaplanmış sorular ve çözülmüş riskler buradan çıkarılır; kararları `09`'da, uygulaması kodda.

## Açık sorular

| #   | Soru                                                                 | Ne zaman | Not                                           |
| --- | -------------------------------------------------------------------- | -------- | --------------------------------------------- |
| S11 | Bildirim kanalı: Telegram bot mu, e-posta mı?                        | Hafta 5  | Öneri Telegram (ücretsiz, anlık)              |
| S12 | Hata bildirimi nereye düşsün: e-posta mı, admin'de "bildirimler" mi? | Hafta 7  | Öneri: ikisi; e-posta yedek                   |
| S13 | Kırgızca öğretmen ve Rusça gözden geçirici ne zaman başlasın?        | Hafta 9  | İngilizce beta bitince; `editor` hesabı       |
| S14 | Alan adı hangisi?                                                    | Hafta 8  | uchkun.science / .kg / .org — müsaitlik       |
| S16 | Ana sayfa nasıl olsun?                                               | Hafta 8  | Kullanıcının bir fikri var, kendisi getirecek |

## Canlı riskler

### R1 — İçerik üretimi kodun gerisinde kalır

**Çözüm**: otomatik içerik hattı (ADR-014, Hafta 5). Olay başına senin zamanın ~10 dakika.
**Kalan risk**: taslak kalitesi düşükse onay yerine yeniden yazmak gerekir. **Sinyal**: reddetme oranı
%30 üstü. **Plan**: ilk 10 taslaktan sonra prompt'u ayarla, kaynak eşiğini 3'ten 4'e çıkar.

### R2 — Tarihsel hata yayınlanır

**Çözüm**: dürüstlük bandı her sayfada (yayında) + iki kaynak kuralı + hattın araştırma notu (çelişkileri
listeler). Düzeltmeler `about` sayfasında şeffaf liste olacak (Hafta 8).

### R3 — Kırgızca çeviri kalitesi

**Çözüm**: Claude çevirir (tr+ru referanslı) → sen okursun → Kırgızca öğretmen terimleri kontrol eder →
`reviewed`. **Kalan**: öğretmenin zamanı. Haftada 5-10 olay ile başla; birikirse `machine` rozetli kalır,
sorun değil.

### R9 — Claude API maliyeti / bağımlılığı

Hat + çeviri ayda ~10-15 $. Model adı tek yerden okunur; `CONTENT_PIPELINE_ENABLED` kapatma anahtarı var.

### R10 — Keşfet kanvası zamanında bitmez

**Sinyal**: Hafta 11 sonunda Z0-Z2 masaüstünde çalışmıyorsa. **Plan**: lansmanı kanvassız yap (Akış modu
tamdır), kanvası v1.1 olarak 2 hafta sonra çıkar. Lansman metninde "yakında: Keşfet" de; merak yaratır.

### R11 — Site "ham" görünüyor (yeni, 2026-09-03)

Kullanıcı geri bildirimi: site çalışıyor ama ana sayfa ilgi çekici değil. **Plan**: ana sayfa Hafta 8'de
kökten değişecek (S16). Ondan önce beta testine çıkarma.

### R5 — Kapsam şişer

Kural: yeni fikir → aşağıdaki Park listesine, ayda bir bakılır. Kanvas zaten alındı; başka büyük özellik
3 ayda yok.

### R6 — Motivasyon

Planın yardımı: Hafta 8 beta, her sabah gelen yeni taslak (küçük ama sürekli ilerleme hissi), haftada bir
olay kuralı.

## Park (3 aydan sonra bakılacak fikirler)

- Zaman boşluğu işaretine tek cümlelik anlatı notu ("Optik iyi cam ve matbaayı bekledi"). Şema alanı yok;
  `eras` ya da ayrı `gaps` tablosu + çeviri gerekir.
- "Orada olsaydın" etkileşimli senaryolar.
- "Geriye sar" modu (bugünden geçmişe).
- Flutter uygulaması, çevrimdışı okuma, günlük bildirim.
- Sesli anlatım (her olay 2 dakika).
- Öğretmen sunum modu.
- Kullanıcı olay önerisi + editör onayı.
- Harita görünümü (keşifler nerede oldu; Orta Asya'nın görünürlüğü için güçlü).
- Quiz / "bu çağda hangisi yoktu?" oyunu.
- Arama (v1.0'dan çıkarıldı, 4. ay).
- Tema için üçüncü "sistem" durumu (ADR-022'de varsayılan olmaktan çıkarıldı).
- Go backend'e geçiş (ADR-002).

## Neden

"Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım."

Bu siteyi açan bir lise öğrencisi, Uluğ Bey'in Semerkant'ta çıplak gözle Tycho'dan 150 yıl önce yıldızları
ölçtüğünü kendi dilinde okuyacak. Belki bir gün ekoloji meselesini çözen kişi o olur, belki olmaz. Ama
merakı bizim yüzümüzden sönmüş olmayacak. Haftada bir olay. Devam.
