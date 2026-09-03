# 06 — i18n Stratejisi (en, ru, ky, tr)

## İki ayrı katman

| Katman | Ne | Nerede yaşar | Kim çevirir |
|--------|----|--------------|-------------|
| **UI metinleri** | Buton, menü, rozet, hata mesajı, boş durum (~150 anahtar) | `web/messages/{locale}.json`, kodla birlikte | Bir kez Claude, sen gözden geçirirsin |
| **İçerik** | Olay, çağ, disiplin, kişi metinleri | Veritabanı `*_translations` tabloları | Admin + Claude API hattı |

Karıştırma: UI metni veritabanına, içerik JSON'a gitmez.

## URL yapısı

- Her sayfa dil ön ekli: `/tr/timeline`, `/ky/event/newton-principia`.
- Ön eksiz `/` → tarayıcı dili (`Accept-Language`) ile eşleşen dile 302; eşleşme yoksa `en`.
  Sıra: `ky`, `tr`, `ru`, `en` (tr-TR, ru-RU, ky-KG, en-*). Kullanıcı elle dil seçince çerezde kalır.
- Admin dil ön eksiz: `/admin`. Admin arayüzü de 4 dilde (kararın); dil tercihi profilde saklanır, aynı `messages/*.json` mekanizması. Ek maliyet: ~80 anahtar daha.
- `hreflang` etiketleri her sayfada 4 dil + `x-default`. SEO için şart.
- Slug dilden bağımsız, İngilizce: `/ky/event/newton-principia`. Dil başına slug 4 kat karmaşıklık, sıfır kazanç.

## Yıl gösterimi

En kritik lokalizasyon detayı. Yanlış yapılırsa site amatör görünür.

| Dil | MÖ | MS | Yaklaşık | Örnek |
|-----|----|----|----------|-------|
| en | `585 BCE` | `1687` (etiketsiz) | `c. 300 BCE` | `c. 300 BCE`, `1687` |
| tr | `MÖ 585` | `1687` | `MÖ y. 300` | `MÖ y. 300`, `1687` |
| ru | `585 до н. э.` | `1687` | `ок. 300 до н. э.` | `ок. 300 до н. э.` |
| ky | `б.з.ч. 585` | `1687` | `болжол м. б.з.ч. 300` | Kırgız tarih literatüründe "б.з.ч." (биздин заманга чейин) yaygın; doğrula |

Kurallar:
- MS 1000'den sonra etiket yok. MS 1-999 için `MS 499` / `499 CE` / `499 н. э.` / `б.з. 499`.
- `decade` kesinlik: `1830'lar` / `1830s` / `1830-е` / `1830-жылдар`.
- `century` kesinlik: `MÖ 5. yüzyıl` / `5th century BCE` / `V век до н. э.` / `б.з.ч. V кылым`.
- Tek fonksiyon: `formatYear(year, precision, locale)`. Birim testli. Dilden bağımsız kod bu fonksiyon dışında yıl formatlamaz.
- Aralıklar: `1925-1927`, `MÖ 300 - MÖ 250`. En dash (–) değil, basit tire; Cyrillic klavyede sorun çıkarmasın.

## Sayı, tarih ve büyük harf tuzakları

- **Türkçe İ/ı**: JavaScript `toUpperCase()` "i" → "I" yapar, Türkçe'de "İ" olmalı. Her zaman `toLocaleUpperCase('tr')` ya da CSS `text-transform` + `lang="tr"`. En temizi büyük harfe hiç çevirmemek.
- **`lang` niteliği**: `<html lang="ky">` her sayfada doğru olmalı; tireleme, tırnak işaretleri, ekran okuyucu buna bakar.
- **Tırnak**: tr `“ ”`, ru `« »`, ky `« »`, en `“ ”`. İçerikte yazar tutarlı olsun; UI'da tırnak kullanma.
- **Sayılar**: 1.000 (tr) vs 1,000 (en) vs 1 000 (ru). Sitede büyük sayı az; olduğunda `Intl.NumberFormat`.
- **Metin uzunluğu**: Rusça ve Kırgızca İngilizce'den ~%30 uzun. Buton ve çip tasarımı en uzun dille test edilir. "Zamana düş" → "Убакытка секир" gibi.

## Yayın sırası ve kaynak dil (kararların)

- **İngilizce önce.** Kaynaklar İngilizce, Claude'un otomatik içerik hattı İngilizce taslak üretir, hızlı yayına çıkarız. Kapalı beta (8. hafta) İngilizce.
- **Sonra ky, tr, ru.** Makine çevirisi rozetle hemen; insan onayı sırayla: ky (sen + Kırgızca öğretmen tanıdığın), tr (sen), ru (tanıdığın gözden geçirici).
- **Kaynak dil olay başına.** Claude taslakları `en`; senin kendi yazdıkların `ky` ya da `tr`. İçinde çevrilmemiş İngilizce terim olabilir; sorun değil, çeviri hattı ve sözlük bunu çözer. Formda "kaynak dil" alanı.
- Sen ky/tr yazınca → en/ru makine çevirisi; en'i sen kontrol edersin.

## Kırgızca özel notlar

Kırgızca bu projede en değerli ve en zor dil. İkisi de aynı sebepten: kaynak az.

- **Alfabe**: Kiril + `Ң ң`, `Ө ө`, `Ү ү`. Seçilen her font bu üç harfi **gerçekten** içermeli. Kontrol: font örnek metni `Ңөү` içersin. Inter, Manrope, Golos Text, Noto Sans, PT Sans içerir. Bazı süslü display fontlar içermez → başlık fontu için Playfair Display (içerir) ya da Cormorant (içerir) test edilir.
- **Terminoloji**: Bilim terimleri Kırgızcada çoğu zaman Rusçadan ödünç. "Kuantum" → "квант", "hücre" → "клетка" mı "жасуу" mu? Bir **terim sözlüğü** (`backend/scripts/glossary.ky.json`) tutulur; Claude'a çeviri isteğinde bu sözlük verilir. Sözlük ilk 50 olayla birlikte büyür.
- **Makine çevirisi kalitesi**: Claude Kırgızcada Türkçe ve Rusçadan zayıf. Süreç: Claude Kırgızca taslağı **Türkçe ve Rusça çevirileri de görerek** üretir (üç kaynak, tutarlılık artar). `machine` rozeti ile yayınlanır. Sonra sen okursun, bilim terimleri için Kırgızca öğretmen tanıdığın kontrol eder → `reviewed`. Öğretmen için `/admin/translate` ekranına `editor` rolü (sadece çeviri düzenler, yayınlayamaz).
- **Ses tonu**: Kırgızca metinde resmi "сиз" değil, samimi ama saygılı anlatıcı sesi. Sözlükte örnek cümleler.

## Rusça notlar

- Rusça okuyucu Orta Asya'nın en geniş kitlesi. Rusça çeviri kalitesi yüksek olmalı; Claude iyi. Rusça gözden geçiricin var; ona da `editor` rolü.
- Bilim insanı adları: Rusça yazımı yerleşik olanları kullan (Ньютон, Эйнштейн, Аль-Хорезми). Tutarlılık için `people` tablosunda her dilde ad.
- "Вы" değil anlatıcı "мы" ve "ты" arasında: okuyucuya doğrudan sesleniş yerine nötr anlatım tercih.

## Türkçe notlar

- Ses: senin sesin. Kendi yazdığın olaylarda kaynak dillerden biri (`source_locale = 'tr'`).
- Bilim insanı adları: yerleşik Türkçe yazım (Kopernik, Öklid, Batlamyus, İbn-i Heysem, Uluğ Bey).

## İngilizce notlar

- Uluslararası vitrin, SEO'nun büyük kısmı, `x-default`. **İlk yayın dili.** Otomatik içerik hattının kaynak dili.
- Amerikan yazım (color, center). BCE/CE kullan, BC/AD değil.

## Çeviri hattı detayı

Claude API çağrısı (server action, `web/lib/translate.ts`):

```
Sistem: Sen bilim tarihi sitesinin çevirmenisin. Ses tonu: [03-icerik kuralları özet].
        Terim sözlüğü (hedef dil): [glossary]. Yerleşik isim yazımları: [people tablosundan].
        Yıl ve sayıları çevirme, formatlama sitede yapılıyor. Markdown yapısını koru.
Kullanıcı: Kaynak dil: tr. Hedef: ky. Ayrıca referans olarak ru çevirisi: [...]
        Alanlar (JSON): { title, summary, body, why_it_matters, if_you_were_there }
Çıktı: Aynı anahtarlarla JSON.
```

- Model: `claude-sonnet-5` (kalite/maliyet dengesi). Kırgızca için `claude-opus-5` denenir, fark ölçülür.
- Çıktı JSON şeması doğrulanır; boş alan gelirse kaydetme, hata göster.
- Sıra: önce en ve ru, sonra ky (en+ru+tr'yi referans alarak).
- Her çeviri `status='machine'` ile yazılır; admin "Onayla" deyince `reviewed`.

## Toplu işler (`backend/scripts/`)

- `translate-missing.ts`: çevirisi olmayan yayınlanmış olayları bulur, çevirir. Gece çalıştırılır, günde bir.
- `check-i18n.ts`: UI JSON'larında eksik anahtar var mı, veritabanında hangi olay hangi dilde eksik; rapor basar.
- `glossary-extract.ts`: onaylanmış çevirilerden terim çiftleri çıkarıp sözlüğe önerir (P2).

## Test listesi

- [ ] `/` → `/ky` yönlendirmesi ky-KG tarayıcıda çalışıyor.
- [ ] Dil değiştirince aynı olay sayfasında kalınıyor.
- [ ] `formatYear` 4 dil × 4 kesinlik × MÖ/MS = 32 durum birim testli.
- [ ] `Ңөү` her fontta doğru render oluyor (ekran görüntüsü testi).
- [ ] En uzun UI metni (genelde ru/ky) butonlardan taşmıyor.
- [ ] `hreflang` ve `<html lang>` her sayfada doğru.
- [ ] Çeviri yokken fallback + rozet görünüyor.
