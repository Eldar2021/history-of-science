# 10 — Riskler ve Açık Sorular

## Senin cevaplaman gereken sorular (Hafta 1)

Her biri tek satır cevap ister. Cevapları bu dosyaya yaz; ben okuyup ilgili ADR'yi güncelleyeyim.

| # | Soru | Seçenekler | Öneri | Cevabın |
|---|------|-----------|-------|---------|
| S1 | Sitenin adı? | Uchkun / Kıvılcım / Eureka / Lumen / başka | Uchkun | |
| S2 | Kaynak dil (sen hangi dilde yazacaksın)? | tr / en | tr | |
| S3 | Admin arayüzü dili? | tr / en | tr | |
| S4 | Alan adı var mı, hangisi? | .kg / .com / .org / .science | isim seçince bakarız | |
| S5 | Haftada kaç saat ayırabilirsin? | 5 / 10-15 / 25+ | plan 10-15'e göre | |
| S6 | Kırgızca ana dil gözden geçirici tanıyor musun? | evet/hayır/bulurum | 2. ay sonuna kadar bul | |
| S7 | Rusça gözden geçirici? | evet/hayır | 3. ay | |
| S8 | Tasarım aracı? | Claude Design / Figma Make / Figma elle | Claude Design ile başla | |
| S9 | Hedef lansman kitlesi ilk kim? | Kırgızistan / Türkiye / global | Kırgızistan + Türkiye (ana dil avantajı) | |
| S10 | Karanlık tema ana tema, tamam mı? | evet/hayır | evet | |

## Riskler

Olasılık × etki sırasıyla. Her riskin bir erken uyarı sinyali ve bir planı var.

### R1 — İçerik üretimi kodun gerisinde kalır (Yüksek olasılık, yüksek etki)
- **Neden**: Kod Claude ile hızlı; her olayı doğrulamak, dört dile bakmak insan zamanı ister. 200 olay × 30 dk = 100 saat.
- **Sinyal**: Hafta 4'te 50 olay yoksa.
- **Plan**: Hedefi 200'den 120'ye indir, ama zincirlerin anlamlı olduğu 5 vitrin yolunu koru. Olay başına gövdeyi 300 kelimeye kıs. Claude'un ilk taslağını doğrudan kullan, sadece kaynak ve yılı doğrula.

### R2 — Tarihsel hata yayınlanır (Orta olasılık, yüksek etki)
- **Neden**: Ne sen ne ben tarihçiyiz. Popüler efsaneler (Newton'un elması, Galileo'nun Pisa kulesi) kaynaklarda bile dolaşır.
- **Sinyal**: Kaynak alanı boş yayın; "ilk kez", "tek başına" gibi mutlak ifadeler.
- **Plan**: İki kaynak kuralı; "efsane" olanı efsane diye yaz; `about`'ta hata bildirim yolu; düzeltmeleri şeffaf logla. Hata utanç değil, sitenin dürüstlük vaadinin parçası.

### R3 — Kırgızca çeviri kalitesi düşük kalır (Yüksek olasılık, orta etki)
- **Neden**: Düşük kaynaklı dil; LLM çıktısı Rusça kalıplarla bozuk olabilir.
- **Sinyal**: Kırgızca okuyan beta kullanıcısı "Rusçadan çevrilmiş gibi" derse.
- **Plan**: Rozetle yayınla (ADR-008), sözlük büyüt, tr+ru referanslı çeviri, ana dil gözden geçirici (S6). Bulunamazsa: Kırgızca sadece özet + başlık insan onaylı, gövde makine.

### R4 — Timeline performansı mobilde çöker (Orta, orta)
- **Neden**: Kaydırma dinleyicileri, animasyonlar, 200 kart, görseller.
- **Sinyal**: Lighthouse mobil 80 altı; eski Android'de takılma.
- **Plan**: Sanallaştırma (sadece görünen kartları render), animasyonları kıs, görselleri küçült. 05'teki bütçeler.

### R5 — Kapsam şişer (Yüksek, orta)
- **Neden**: Bu proje bir hayal; her hafta yeni bir fikir gelir ("bir de quiz olsa", "bir de harita").
- **Sinyal**: 08'deki haftalık kutucuklar dışında iş yapılıyorsa.
- **Plan**: Yeni fikir → bu dosyanın altındaki "Park" listesine. Ayda bir bakılır. 3 aya kadar hiçbiri alınmaz.

### R6 — Motivasyon düşer (Orta, yüksek)
- **Neden**: Solo proje, 12 hafta uzun, 6. haftada "kimse görmüyor" hissi.
- **Sinyal**: Bir hafta sıfır commit ve sıfır olay.
- **Plan**: Hafta 4'te admin→site videosu; Hafta 8'de 10 kişilik beta (dış göz); her hafta 1 olay kuralı. Sitenin "neden"ini (bu dosyanın en altı) tekrar oku.

### R7 — Ücretsiz katman sınırları (Düşük, düşük)
- **Neden**: Supabase free projesi 1 hafta hareketsiz kalınca duraklatılır; Vercel Hobby ticari kullanım yasak.
- **Plan**: Haftalık bir cron (`translate-missing`) projeyi canlı tutar. Reklam/gelir yok, Hobby uygun. Büyürse 25+20 $/ay.

### R8 — Görsel telif (Düşük, yüksek)
- **Plan**: ADR-011 zorunlu alanlar; sadece Commons kamu malı / CC. Şüphede görselsiz kart.

### R9 — Claude API maliyeti/bağımlılığı (Düşük, düşük)
- **Plan**: Aylık 10 $ altı. Çeviri hattı model adını tek yerden okur; model değişimi bir satır.

## Park (3 aydan sonra bakılacak fikirler)

Buraya her yeni fikri ekle; kodlama. Tarihle.

- 2026-09-02: "Orada olsaydın" etkileşimli senaryolar.
- 2026-09-02: Yakınlaştırılabilir kanvas modu.
- 2026-09-02: "Geriye sar" modu (bugünden geçmişe).
- 2026-09-02: Paralel disiplin şeritleri ("1905'te biyoloji ne yapıyordu?").
- 2026-09-02: Flutter uygulaması, çevrimdışı okuma, günlük bildirim.
- 2026-09-02: Sesli anlatım (her olay 2 dk).
- 2026-09-02: Öğretmen sunum modu.
- 2026-09-02: Kullanıcı olay önerisi + editör onayı.
- 2026-09-02: Harita görünümü (keşifler nerede oldu; Orta Asya'nın görünürlüğü için güçlü).
- 2026-09-02: Quiz / "bu çağda hangisi yoktu?" oyunu.

## Neden (motivasyon düşünce oku)

"Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım."

Bu siteyi açan bir lise öğrencisi, Uluğ Bey'in Semerkant'ta çıplak gözle Tycho'dan 150 yıl önce yıldızları ölçtüğünü
kendi dilinde okuyacak. Belki bir gün ekoloji meselesini çözen kişi o olur, belki olmaz. Ama merakı bizim yüzümüzden
söndü olmayacak. Haftada bir olay. Devam.
