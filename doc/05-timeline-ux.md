# 05 — Timeline UX

Bu doküman sitenin kalbini, timeline'ı tasarlar. "Kullanıcı sanki timeline'a düşmüş gibi" hissini nasıl vereceğimizi
ve bilim tarihinin en büyük görselleştirme problemini nasıl çözeceğimizi anlatır.

## Problem 1: Zaman yoğunluğu

MÖ 600'den 2026'ya 2600 yıl var. Olaylar dağılımı kabaca:

| Dönem | Yıl sayısı | Olay payı (tahmini) |
|-------|-----------|---------------------|
| MÖ 600 – 1400 | 2000 | %15 |
| 1400 – 1800 | 400 | %20 |
| 1800 – 1900 | 100 | %20 |
| 1900 – 2026 | 126 | %45 |

Doğrusal ölçekte (1 yıl = 1 piksel) antik dünya 2000 piksel boş, 20. yüzyıl 126 piksele 90 olay sıkışır. Kullanılamaz.

### Değerlendirilen çözümler

| Yaklaşım | Artı | Eksi | Karar |
|----------|------|------|-------|
| Doğrusal ölçek | Dürüst | Kullanılamaz | Hayır |
| Logaritmik ölçek | Hepsi sığar | Kimse anlamaz; "1900 ile 2000 neden 1400-1900'dan geniş?" | Hayır |
| **Yakınlaştırılabilir kanvas (ChronoZoom tarzı)** | Etkileyici, gerçek ölçeği hissettirir, keşif hissi | Karmaşık, mobilde dikkat ister | **Evet, 3. ayda "Keşfet" modu olarak** (bkz. aşağıda) |
| **Olay sıralı akış + zaman boşluğu işaretleri** | Anlatıya uygun, mobilde doğal, basit | Gerçek ölçeği hissettirmez | **Evet (ana görünüm)** |
| **Gerçek ölçekli minimap** | Sıkışmayı hissettirir | Tek başına yetmez | **Evet (yardımcı)** |

### Seçilen çözüm: iki katman + kanvas modu

Site iki görünüm sunar. **Akış** (varsayılan, özellikle mobil): aşağıdaki iki katman. **Keşfet** (kanvas): gerçek ölçekli, yakınlaştırılabilir harita. İkisi aynı veriyi, aynı URL parametrelerini (`year`, `d`, `min`) kullanır; kullanıcı bir tıkla geçer, konumu kaybetmez.

**Ana akış (dikey)**: Olaylar kronolojik sırada, eşit aralıklı kartlar. Zaman **olay sayısıyla** akar, yılla değil.
İki olay arasında büyük yıl farkı varsa araya bir **zaman boşluğu işareti** girer:

```
        ●  MS 160 — Galen anatomisi
        │
        ┆   ~ 340 yıl geçti ~
        ┆   Roma çöktü, kütüphaneler dağıldı. Bilgi Bağdat'ta yeniden toplanacak.
        │
        ●  499 — Aryabhata
```

Bu işaret hem dürüstlüğü korur (uzun sessizlikler görünür) hem anlatı fırsatı verir ("neden 340 yıl hiçbir şey olmadı?").
Eşik: 50 yıldan büyük boşluklarda görünür; 1800'den sonra hiç çıkmaz.

**Minimap (yatay, sabit)**: Ekranın altında (mobil) ya da sağında (masaüstü) ince bir şerit. Gerçek ölçekli:
MÖ 600 solda, 2026 sağda. Her olay minicik bir nokta. Kullanıcı kaydırdıkça bir imleç şeritte ilerler.
Antik çağda imleç kıpırdamaz gibi, 20. yüzyılda uçar gibi hareket eder. **"Bakın nasıl hızlandı" hissi buradan gelir.**
Şerite tıklayınca o yıla atlanır.

## Problem 2: "Timeline'a düşmüş gibi"

Giriş deneyimi:

1. Ana sayfa: Karanlık, sakin. Tek cümle: "Buraya nasıl geldik?" Altında büyük bir "Zamana düş" butonu.
2. Butona basınca: Sayfa geçişi yok. Ekran hafifçe kararır, yıl sayacı `2026`dan geriye hızla akar (2000... 1500... 800... MÖ 585), sayaç yavaşlayıp durur, ilk olay belirir. 1.5 saniye. `prefers-reduced-motion` açıksa sadece fade.
3. Kullanıcı artık timeline'da, MÖ 585'te, Thales'in yanında.

Alternatif giriş: URL ile `?year=1687` gelen kullanıcı doğrudan o yıla düşer, sayaç ordan başlar.

## Ekran düzeni

### Mobil (birincil)

```
┌─────────────────────────┐
│ [≡]   1687     [TR ▾]   │  ← sabit üst çubuk: menü, canlı yıl, dil
├─────────────────────────┤
│  ◆ Bilimsel Devrim      │  ← çağ başlığı (sticky, kaydırdıkça değişir)
│                         │
│  ●━ 1665                │
│  │  ┌─────────────────┐ │
│  │  │ [görsel]        │ │
│  │  │ Hooke:          │ │
│  │  │ "Micrographia"  │ │
│  │  │ özet 1-2 cümle  │ │
│  │  │ ●biyoloji       │ │
│  │  └─────────────────┘ │
│  │                      │
│  ●━ 1676                │
│  │  ┌─────────────────┐ │
│  ...                    │
├─────────────────────────┤
│ ▁▁▁▁▁▂▂▃▅▇█  ●          │  ← minimap: gerçek ölçek, imleç
└─────────────────────────┘
```

### Masaüstü

Üç sütun: sol dar sütun çağ listesi (atlama), orta geniş timeline (kartlar çizginin iki yanına dönüşümlü),
sağ dikey minimap + disiplin filtreleri. Çok geniş ekranda orta sütun 720px'i geçmez; okuma genişliği önemli.

## Olay kartı

- Yıl büyük, tabular rakamlarla (`font-variant-numeric: tabular-nums`), MÖ/MS etiketi dile göre.
- Başlık, özet (2 satır, sonrası kırpılır), disiplin çipleri (renkli nokta + isim), varsa küçük görsel.
- Önem 5 kartlar daha büyük, görsel tam genişlik; önem 1-2 kartlar tek satır ("küçük not").
- Tıklama: detay **yan panel** (masaüstü) veya **tam ekran sheet** (mobil) olarak açılır, URL `/event/{slug}` olur,
  arka planda timeline kalır. Geri tuşu paneli kapatır, kaydırma konumu korunur. Doğrudan URL ile gelen için aynı bileşen tam sayfa render olur.

## Navigasyon

| Eylem | Nasıl |
|-------|-------|
| Çağa atla | Üst menü / sol sütun; smooth scroll, yıl sayacı animasyonla o yıla gider |
| Yıla atla | Minimap'e tıkla; ya da yıl göstergesine tıkla → "Yıl gir" alanı |
| Disiplin filtrele | Çipler; seçilmeyenler solar (opacity 0.3), kaybolmaz; "sadece bunlar" için ikinci tık |
| Önem filtresi | "Sadece dönüm noktaları" anahtarı → önem 4-5 |
| Klavye | `↑/↓` olaylar arası, `Enter` aç, `Esc` kapat, `[`/`]` çağ atla |
| Paylaş | Her kartta paylaş ikonu → `/{dil}/event/{slug}` kopyalar |
| Rastgele | "Beni şaşırt" → rastgele önem 4+ olaya git (küçük, eğlenceli, P2) |

Filtreler URL'de yaşar: `/tr/timeline?d=physics,astronomy&min=4&year=1687`. Paylaşınca aynı görünüm açılır.

## Kaydırma ve yıl göstergesi

- Görünür alanın ortasındaki karta göre yıl göstergesi güncellenir (`IntersectionObserver`, `rootMargin` ile orta şerit).
- Yıl değişirken rakamlar "sayaç" gibi döner (odometer efekti), hızlı kaydırmada sadeleşir.
- Çağ değişince üst çubukta çağ adı kısa süre belirir ve solar.

## Durumlar

| Durum | Görünüm |
|-------|---------|
| Yükleniyor | Kart iskeletleri (skeleton), çizgi görünür, minimap boş |
| Bu dilde çeviri yok | Kaynak dilde içerik + "Bu içerik henüz Kırgızca değil" rozeti; tıklayınca "Yakında" |
| Makine çevirisi | Küçük "otomatik çeviri" rozeti, tıklayınca kısa açıklama |
| Filtre sonucu boş | "Bu çağda bu disiplinde olay yok. Belki de bu yüzden ilginç?" + filtreyi kaldır |
| Görsel yok | Disiplin renginde, yıl büyük yazılı üretilmiş kart |
| Çevrimdışı | Servis çalışanı (P2); ilk sürümde standart hata |

## Erişilebilirlik

- Timeline semantik olarak `<ol>`; her olay `<li>` + `<article>`. Ekran okuyucu "liste, 200 öğe" der, kaydırma efektlerine bağımlı değil.
- Yıl göstergesi `aria-live="polite"`, ama her kaydırmada değil, durunca duyurur.
- Kontrast: karanlık temada metin/arka plan 7:1 hedef (AAA), en az 4.5:1.
- Odak halkaları görünür, klavyeyle her şey yapılır.
- Renk tek başına anlam taşımaz: disiplin çipinde isim de var.
- `prefers-reduced-motion`: sayaç animasyonu, paralaks, "düşüş" geçişi kapanır.

## Performans

- İlk boyama: 30 kart HTML'de. Devamı kaydırdıkça 30'ar.
- Görseller `loading="lazy"`, ilk 3 kart hariç.
- Minimap tek `<svg>`; 200 nokta için sorun yok, 2000 için `<canvas>`.
- Hedef cihaz: son 4-5 yılın telefonları (kararın: eski Android'leri hedeflemiyoruz). Yine de Lighthouse mobil 90 hedefi kalır; o skor modern cihazlarda da akıcılığın göstergesi.
- Kaydırma dinleyicileri `passive`, `requestAnimationFrame` ile birleştirilir.

## "Buraya nasıl geldik?" zincir görünümü (P1, 10. hafta)

Olay detayında bir buton: **"Buraya nasıl geldik?"**. Açılan görünüm:

- Seçilen olay üstte. Altında `builds_on` bağlantıları, her biri kendi altında kendi bağlantılarıyla, 6 seviye derinliğe kadar.
- Görsel: dikey ağaç değil, **geriye akan nehir**: her seviye bir satır, yıl sola yazılı, kartlar küçük, çizgiler kavisli.
- Her düğüme tıkla → o olay odağa gelir, zincir yeniden çizilir.
- Ters yön: "Bu neyi mümkün kıldı?" aynı görünümün ileri hali.
- Mobilde: akordeon gibi, seviye seviye açılır.

Veri yoksa buton görünmez; zinciri 1 seviyeden kısa olay için gösterme.

## Keşfet modu: yakınlaştırılabilir kanvas (P1, 11-12. hafta)

Kararın: bu olmalı. Haklısın; gerçek ölçek üzerinde yakınlaşıp uzaklaşmak, "antik çağ ne kadar uzun sürdü, 20. yüzyıl ne kadar sıkışık" hissini hiçbir şey kadar vermez. Riskini yönetmek için akış modu önce yapılır (kanvas gecikirse site yine çalışır), kanvas 3. ayda gelir.

### Temel fikir: anlamsal yakınlaştırma (semantic zoom)

Harita uygulamasındaki gibi: uzaktan sadece ülkeler, yaklaşınca şehirler, daha yaklaşınca sokaklar.

| Zoom seviyesi | Ekranda görünen aralık | Ne görünür |
|---------------|------------------------|------------|
| Z0 Evren | 2600 yılın tamamı | 8 çağ blok olarak, önem 5 olaylar nokta + kısa etiket, minimap gibi yoğunluk şeridi |
| Z1 Çağ | ~300-600 yıl | Önem 4-5 kartlar (küçük), disiplin şeritleri renkli |
| Z2 Yüzyıl | ~100 yıl | Önem 3-5 kartlar, başlıklar okunur |
| Z3 On yıl | ~10-30 yıl | Tüm olaylar, özetler görünür, kişiler yaşam çubukları olarak |

Önem alanı (`importance`) burada hayati: hangi olayın hangi zoom'da belireceğini belirler. Bu yüzden admin formunda zorunlu.

### Düzen

- Yatay eksen zaman, gerçek ölçek. Dikey eksen disiplinler: 8 yatay şerit (lane), her biri kendi renginde. Bir olay birden fazla disiplindeyse birincil şeritte durur, diğerlerine ince çizgiyle bağlanır.
- Üstte sabit yıl cetveli; zoom'a göre yüzyıl / on yıl / yıl işaretleri.
- Bağlantılar (`builds_on`) yakınlaşınca ince kavisli çizgiler olarak belirir; bir olaya tıklayınca onun zinciri vurgulanır, gerisi solar. Bu, "Buraya nasıl geldik?" görünümünün kanvas hali.
- Kişiler Z3'te yaşam süresi çubuğu olarak (Newton 1643-1727) kendi şeridinin altında.

### Etkileşim

- Masaüstü: tekerlek = yakınlaş (imleç noktasına doğru), sürükle = kaydır, çift tık = bir seviye yakınlaş, `+`/`-` tuşları.
- Mobil: iki parmak sıkıştır, tek parmak sürükle. Alt köşede "Akışa dön" butonu. Küçük ekranda Z0 ve Z1 sadece nokta gösterir, kartlar Z2'den itibaren.
- Olaya tıkla: aynı yan panel / sheet (akış modundakiyle aynı bileşen).
- Çağ bloğuna tıkla: o çağa yumuşak zoom.
- URL: `/tr/explore?year=1687&zoom=2&d=physics`. Paylaşılabilir.
- Animasyon: zoom geçişleri 300 ms, olaylar seviye değiştirirken fade; `prefers-reduced-motion` ile anında.

### Teknik yol

- Render: tek `<svg>` içinde `d3-zoom` (yalnızca zoom/pan hesabı için, 10 KB) + React ile çizim. 200-500 olay için SVG yeterli; 2000+ olayda `<canvas>`a geçilir, API aynı kalır.
- Görünür pencere dışındaki olaylar render edilmez (virtualization); zoom değişince görünür küme yeniden hesaplanır (`year` sıralı dizi üstünde ikili arama).
- Etiket çakışması: aynı şeritte yakın olaylar zoom seviyesine göre ya kümelenir ("+4") ya da dikey ofsetle yayılır. v1'de kümeleme, v2'de akıllı yerleşim.
- Ölçek fonksiyonu tek: `xScale(year, zoom, pan)`; minimap da aynı fonksiyonu kullanır. Böylece minimap, kanvasın "her zaman Z0'da duran" hali olur; kod tekrarı yok.
- Erişilebilirlik: kanvas görsel bir katmandır; aynı içerik akış modunda `<ol>` olarak zaten var. Kanvas sayfası ekran okuyucuya "akış moduna geç" bağlantısı sunar.

### Aşamalar

- **v1 (Hafta 11)**: masaüstü, Z0-Z2, disiplin şeritleri, önem tabanlı görünürlük, tıklayınca panel, URL senkron.
- **v1.1 (Hafta 12)**: mobil sıkıştırma, Z3 + kişiler, bağlantı çizgileri, kümeleme.
- **v2 (4. ay+)**: akıllı etiket yerleşimi, canvas render, "zinciri vurgula" modu, mini tur ("bu dört noktayı gez").

## Sonraki adımlar (3 ay sonrası)

- "Geriye sar" modu: bugünden başla, geriye kaydır, her olayda "bu olmasaydı..." notu.
- Paralel şeritler artık kanvasın parçası; ayrı görünüm gerekmez.
- Harita görünümü: keşifler nerede oldu (Orta Asya'nın görünürlüğü için güçlü).
