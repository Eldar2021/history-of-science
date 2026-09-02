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
| Yakınlaştırılabilir kanvas (ChronoZoom tarzı) | Etkileyici | Karmaşık, mobilde zor, 3 ayda riskli | 6. ay+ için not |
| **Olay sıralı akış + zaman boşluğu işaretleri** | Anlatıya uygun, mobilde doğal, basit | Gerçek ölçeği hissettirmez | **Evet (ana görünüm)** |
| **Gerçek ölçekli minimap** | Sıkışmayı hissettirir | Tek başına yetmez | **Evet (yardımcı)** |

### Seçilen çözüm: iki katman

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
- Kaydırma dinleyicileri `passive`, `requestAnimationFrame` ile birleştirilir.

## "Buraya nasıl geldik?" zincir görünümü (P1, 10. hafta)

Olay detayında bir buton: **"Buraya nasıl geldik?"**. Açılan görünüm:

- Seçilen olay üstte. Altında `builds_on` bağlantıları, her biri kendi altında kendi bağlantılarıyla, 6 seviye derinliğe kadar.
- Görsel: dikey ağaç değil, **geriye akan nehir**: her seviye bir satır, yıl sola yazılı, kartlar küçük, çizgiler kavisli.
- Her düğüme tıkla → o olay odağa gelir, zincir yeniden çizilir.
- Ters yön: "Bu neyi mümkün kıldı?" aynı görünümün ileri hali.
- Mobilde: akordeon gibi, seviye seviye açılır.

Veri yoksa buton görünmez; zinciri 1 seviyeden kısa olay için gösterme.

## Sonraki adımlar (3 ay sonrası)

- Yakınlaştırılabilir kanvas modu (masaüstü): önem seviyesi zoom'a bağlı görünür/kaybolur.
- "Geriye sar" modu: bugünden başla, geriye kaydır, her olayda "bu olmasaydı..." notu.
- Paralel şeritler: 4 disiplini yan yana koyup aynı yılları hizalayan görünüm ("1905'te biyoloji ne yapıyordu?").
