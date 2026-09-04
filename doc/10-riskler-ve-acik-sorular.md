# 10 — Riskler, açık sorular, park

Cevaplanmış sorular ve çözülmüş riskler buradan çıkarılır; kararları `09`'da, uygulaması kodda.

## Açık sorular

| #   | Soru                                                                 | Ne zaman | Not                                           |
| --- | -------------------------------------------------------------------- | -------- | --------------------------------------------- |
| S11 | Bildirim kanalı: Telegram bot mu, e-posta mı?                        | Faz B    | Öneri Telegram (ücretsiz, anlık)              |
| S12 | Hata bildirimi nereye düşsün: e-posta mı, admin'de "bildirimler" mi? | Faz C    | Öneri: ikisi; e-posta yedek                   |
| S13 | Kırgızca öğretmen ve Rusça gözden geçirici ne zaman başlasın?        | Faz D    | İngilizce beta bitince; `editor` hesabı       |
| S14 | Alan adı hangisi?                                                    | Faz C    | uchkun.science / .kg / .org — müsaitlik       |
| S17 | Faz A'da siteyi ne yapacağız?                                        | **şimdi** | Kullanıcının fikirleri var, kendisi getirecek |

## Canlı riskler

### R1 — İçerik üretimi kodun gerisinde kalır

**Şimdilik askıda**: içerik 50 olayda bilerek donduruldu (`08`). Risk Faz B'de geri gelir.
**Çözüm**: otomatik içerik hattı (ADR-014, Faz B). Olay başına senin zamanın ~10 dakika.
**Kalan risk**: taslak kalitesi düşükse onay yerine yeniden yazmak gerekir. **Sinyal**: reddetme oranı
%30 üstü. **Plan**: ilk 10 taslaktan sonra prompt'u ayarla, kaynak eşiğini 3'ten 4'e çıkar.

### R12 — Faz A açık uçlu (yeni, 2026-09-04)

İçerik donduruldu ve fazın kapsamı "kullanıcının fikirleri" (S17). Kapsam yazılı olmadığı sürece bu faz
süresiz uzayabilir ve site 50 olayda takılı kalır. **Sinyal**: S17 bir hafta içinde bir listeye
dönüşmezse. **Plan**: fikirler geldiğinde `08`'e madde madde yazılır, kesme kuralına dahil edilir.

### R2 — Tarihsel hata yayınlanır

**Çözüm**: dürüstlük bandı her sayfada (yayında) + iki kaynak kuralı + hattın araştırma notu (çelişkileri
listeler). Düzeltmeler `about` sayfasında şeffaf liste olacak (Faz C).

### R3 — Kırgızca çeviri kalitesi

**Çözüm**: Claude çevirir (tr+ru referanslı) → sen okursun → Kırgızca öğretmen terimleri kontrol eder →
`reviewed`. **Kalan**: öğretmenin zamanı. Haftada 5-10 olay ile başla; birikirse `machine` rozetli kalır,
sorun değil.

### R9 — Claude API maliyeti / bağımlılığı

Hat + çeviri ayda ~10-15 $. Model adı tek yerden okunur; `CONTENT_PIPELINE_ENABLED` kapatma anahtarı var.

### R10 — Keşfet kanvası zamanında bitmez

**Sinyal**: Faz D'nin kanvas işi sonunda Z0-Z2 masaüstünde çalışmıyorsa. **Plan**: lansmanı kanvassız yap (Akış modu
tamdır), kanvası v1.1 olarak 2 hafta sonra çıkar. Lansman metninde "yakında: Keşfet" de; merak yaratır.

### R5 — Kapsam şişer

Kural: yeni fikir → aşağıdaki Park listesine, ayda bir bakılır. Kanvas zaten alındı; başka büyük özellik
3 ayda yok.

### R6 — Motivasyon

Planın yardımı: Faz C'deki beta, her sabah gelen yeni taslak (küçük ama sürekli ilerleme hissi), haftada bir
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
- Quiz / "bu çağda hangisi yoktu?" oyunu.
- Arama (v1.0'dan çıkarıldı, 4. ay).
- Go backend'e geçiş (ADR-002).

## Neden

"Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım."

Bu siteyi açan bir lise öğrencisi, Uluğ Bey'in Semerkant'ta çıplak gözle Tycho'dan 150 yıl önce yıldızları
ölçtüğünü kendi dilinde okuyacak. Belki bir gün ekoloji meselesini çözen kişi o olur, belki olmaz. Ama
merakı bizim yüzümüzden sönmüş olmayacak. Haftada bir olay. Devam.
