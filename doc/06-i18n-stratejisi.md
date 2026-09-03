# 06 — i18n (en, ru, ky, tr)

## İki ayrı katman

| Katman       | Ne                                         | Nerede                       | Kim çevirir                  |
| ------------ | ------------------------------------------ | ---------------------------- | ---------------------------- |
| **UI metni** | Buton, menü, rozet, hata, boş durum, admin | `web/messages/{locale}.json` | Claude bir kez, sen bakarsın |
| **İçerik**   | Olay, çağ, disiplin, kişi metinleri        | Veritabanı `*_translations`  | Admin + Claude API hattı     |

Karıştırma: UI metni veritabanına, içerik JSON'a gitmez. Dört dosya birebir aynı anahtarları taşır.

## URL

- Her sayfa dil ön ekli: `/tr/timeline`, `/ky/event/newton-principia`.
- Ön eksiz `/` → `Accept-Language` ile eşleşen dile 302; eşleşme yoksa `en`. Elle seçim çerezde kalır.
- Admin dil ön eksiz (`/admin`); arayüz dili `profiles.ui_locale` → `NEXT_LOCALE` çerezi → `en`.
- **Slug dilden bağımsız, İngilizce** (ADR-005): `/ky/event/newton-principia`. Dil değiştirince aynı
  sayfada kalınır.
- `hreflang` 4 dil + `x-default`, her sayfada (Hafta 7).

## Yıl gösterimi

En kritik lokalizasyon detayı. Tek fonksiyon: `web/lib/i18n/formatYear.ts`, birim testli. Kodun başka
hiçbir yeri yıl formatlamaz.

Yaklaşık yıl **tam kelimeyle** yazılır, kısaltmayla değil (ADR-023): okuyucu bilim insanı değil.
Fonksiyon yılı iki parçaya böler — küçük punto "qualifier" ve büyük punto "value" — böylece yıl sayfanın
en büyük tipografik ögesi olarak kalır.

| Dil | MÖ             | MS (1000 öncesi) | Yaklaşık (qualifier) | Örnek                     |
| --- | -------------- | ---------------- | -------------------- | ------------------------- |
| en  | `585 BCE`      | `499 CE`         | `around`             | `around 300 BCE`, `1687`  |
| tr  | `MÖ 585`       | `MS 499`         | `yaklaşık`           | `yaklaşık MÖ 300`, `1687` |
| ru  | `585 до н. э.` | `499 н. э.`      | `около`              | `около 300 до н. э.`      |
| ky  | `б.з.ч. 585`   | `б.з. 499`       | `болжол менен`       | `болжол менен б.з.ч. 300` |

- MS 1000'den sonra çağ etiketi yok, sadece sayı.
- Çağ kısaltmasının açılımı (`eraNote`) her dilde fonksiyondan döner: `<time>` üzerinde tooltip olur ve
  timeline'da olay sayısının yanında bir kez yazılır ("BCE = before the common era").
- `decade`: `1830s` / `1830'lar` / `1830-е` / `1830-жылдар`. Türkçe ünlü uyumu test edilir.
- `century`: `5th century BCE` / `MÖ 5. yüzyıl` / `V век до н. э.` / `б.з.ч. V кылым`.
- Aralık: `1925 - 1927`, `MÖ 300 - MÖ 250`. Basit tire, en dash değil. Yaklaşık aralıkta qualifier bir kez.

## Dil tuzakları

- **Türkçe İ/ı**: `toUpperCase()` yasak, "i" → "I" yapar. `toLocaleUpperCase('tr')` ya da hiç büyütme.
  En temizi CSS `text-transform` + doğru `lang`.
- **`<html lang>`** her sayfada doğru olmalı; tireleme ve ekran okuyucu buna bakar.
- **Metin uzunluğu**: Rusça ve Kırgızca İngilizce'den ~%30 uzun. Buton ve çip en uzun dille test edilir.
- **Sayılar**: `Intl.NumberFormat`. Yıllarda `tabular-nums` şart, sayaç zıplamasın.
- **Tırnak**: UI'da tırnak kullanma; içerikte yazar tutarlı olsun.

## Kırgızca

En değerli ve en zor dil; ikisi de aynı sebepten: kaynak az.

- **Alfabe**: Kiril + `Ң ң`, `Ө ө`, `Ү ү`. Her yeni font `Ңөү` ile görsel olarak test edilir. Golos Text
  ve Literata (mevcut fontlar) `cyrillic-ext` alt kümesiyle içeriyor.
- **Terminoloji**: bilim terimleri çoğunlukla Rusçadan ödünç. Bir terim sözlüğü tutulur
  (`backend/scripts/glossary.ky.json`, Hafta 6) ve her çeviri isteğine verilir; ilk 50 olayla büyür.
- **Makine çevirisi**: Claude Kırgızcada Türkçe ve Rusçadan zayıf. Süreç: Claude Kırgızca taslağı
  **Türkçe ve Rusça çevirileri de görerek** üretir, `machine` rozetiyle yayınlanır, sonra sen okursun,
  bilim terimleri için Kırgızca öğretmen tanıdığın kontrol eder → `reviewed`.
- **Ses tonu**: resmi "сиз" değil, samimi ama saygılı anlatıcı.

## Rusça, Türkçe, İngilizce

- **ru**: Orta Asya'nın en geniş kitlesi, kalite yüksek olmalı; gözden geçirici var. Bilim insanı adlarında
  yerleşik yazım (Ньютон, Аль-Хорезми). Okuyucuya doğrudan sesleniş yerine nötr anlatım.
- **tr**: senin sesin; kendi yazdığın olaylarda `source_locale = 'tr'`. Yerleşik yazım (Kopernik, Öklid,
  Batlamyus, İbn-i Heysem, Uluğ Bey).
- **en**: uluslararası vitrin, SEO'nun büyük kısmı, `x-default`, ilk yayın dili, hattın kaynak dili.
  Amerikan yazım (color, center). **BCE/CE kullan, BC/AD değil.**

## Yayın sırası

İngilizce önce (ADR-013): kaynaklar İngilizce, hat İngilizce üretir, hızlı yayın. Sonra ky, tr, ru —
makine çevirisi rozetle hemen, insan onayı sırayla. Kaynak dil olay başına (`source_locale`, ADR-009).

## Çeviri isteği (Hafta 6)

```
Sistem: Sen bilim tarihi sitesinin çevirmenisin. Ses tonu: [03 kuralları özeti].
        Terim sözlüğü (hedef dil): [glossary]. Yerleşik isim yazımları: [people tablosundan].
        Yıl ve sayıları çevirme, formatlama sitede yapılıyor. Markdown yapısını koru.
Kullanıcı: Kaynak dil: tr. Hedef: ky. Referans olarak ru çevirisi: [...]
        Alanlar (JSON): { title, summary, body, why_it_matters, if_you_were_there }
Çıktı: Aynı anahtarlarla JSON.
```

Model `claude-sonnet-5`; Kırgızca için `claude-opus-5` denenir, fark ölçülür. Çıktı şeması doğrulanır;
boş alan gelirse kaydetme. Her çeviri `status='machine'` ile yazılır, admin onaylayınca `reviewed`.

## Toplu işler (`backend/scripts/`)

- `translate-missing.ts` — çevirisi olmayan yayınlanmış olayları çevirir, gece bir kez. (Hafta 6)
- `check-i18n.ts` — UI JSON'larında eksik anahtar, veritabanında hangi olay hangi dilde eksik. (Hafta 6)
- `glossary-extract.ts` — onaylanmış çevirilerden terim çifti önerir. (sonra)

## Test listesi

- [x] `formatYear` 4 dil × 4 kesinlik × MÖ/MS birim testli.
- [x] Çeviri yokken kaynak dil + "bu dilde henüz yok" rozeti görünüyor.
- [x] `Ңөү` mevcut iki fontta doğru render oluyor.
- [ ] `/` → `/ky` yönlendirmesi ky-KG tarayıcıda çalışıyor.
- [ ] Dil değiştirince aynı olay sayfasında kalınıyor.
- [ ] En uzun UI metni (genelde ru/ky) butonlardan taşmıyor.
- [ ] `hreflang` ve `<html lang>` her sayfada doğru. (Hafta 7)
