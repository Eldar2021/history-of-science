# 06 — i18n (en, ru, ky, tr)

## İki ayrı katman

| Katman       | Ne                                         | Nerede                       | Kim çevirir                  |
| ------------ | ------------------------------------------ | ---------------------------- | ---------------------------- |
| **UI metni** | Buton, menü, rozet, hata, boş durum, admin | `web/messages/{locale}.json` | Claude bir kez, sen bakarsın |
| **İçerik**   | Olay, çağ, disiplin, kişi metinleri        | Veritabanı `*_translations`  | Admin + Claude API hattı     |

Karıştırma: UI metni veritabanına, içerik JSON'a gitmez. Dört dosya birebir aynı anahtarları taşır.

## URL

- Her sayfa dil ön ekli: `/tr`, `/ky/event/newton-principia`. Ön eksiz `/` → `Accept-Language`, yoksa `en`.
- Admin dil ön eksiz (`/admin`); arayüz dili `profiles.ui_locale` → `NEXT_LOCALE` çerezi → `en`.
- Slug dilden bağımsız, İngilizce (ADR-005). `hreflang` 4 dil + `x-default` (Faz C).

## Yıl gösterimi

Tek fonksiyon `web/lib/i18n/formatYear.ts`, birim testli. Yaklaşık yıl tam kelimeyle; `formatYearParts`
yılı küçük punto "qualifier" + büyük punto "value" diye böler (ADR-004).

| Dil | MÖ             | MS (1000 öncesi) | Yaklaşık       | Örnek                     |
| --- | -------------- | ---------------- | -------------- | ------------------------- |
| en  | `585 BCE`      | `499 CE`         | `around`       | `around 300 BCE`, `1687`  |
| tr  | `MÖ 585`       | `MS 499`         | `yaklaşık`     | `yaklaşık MÖ 300`, `1687` |
| ru  | `585 до н. э.` | `499 н. э.`      | `около`        | `около 300 до н. э.`      |
| ky  | `б.з.ч. 585`   | `б.з. 499`       | `болжол менен` | `болжол менен б.з.ч. 300` |

- MS 1000'den sonra çağ etiketi yok. Çağ kısaltmasının açılımı (`eraNote`) `<time>` tooltip'i.
- `decade`: `1830s` / `1830'lar` / `1830-е` / `1830-жылдар` (Türkçe ünlü uyumu test edilir).
- `century`: `5th century BCE` / `MÖ 5. yüzyıl` / `V век до н. э.` / `б.з.ч. V кылым`.
- Aralık: `1925 - 1927`, `MÖ 300 - MÖ 250`. Basit tire. Yaklaşık aralıkta qualifier bir kez.

## Dil tuzakları

- **Türkçe İ/ı**: `toUpperCase()` yasak. `toLocaleUpperCase('tr')` ya da CSS `text-transform` + doğru `lang`.
- **`<html lang>`** her sayfada doğru; tireleme ve ekran okuyucu buna bakar.
- **Metin uzunluğu**: ru ve ky İngilizce'den ~%30 uzun; buton ve çipler en uzun dille test edilir.
- **Sayılar**: `Intl.NumberFormat`; yıllarda `tabular-nums`. UI'da tırnak kullanma.
- **Font**: bir alt kümeyi "desteklemek" her glifi doğru çizmek değil (Golos Text `ğ`'yi breve'siz
  çiziyordu). Her font `Ңөү` ve `değil Çağı` ile test edilir. Mevcut: Onest + Literata.

## Kırgızca

En değerli ve en zor dil: kaynak az. Alfabe Kiril + `Ң ң`, `Ө ө`, `Ү ү`. Bilim terimleri çoğunlukla
Rusçadan ödünç; terim sözlüğü (`backend/scripts/glossary.ky.json`, Faz B) her çeviri isteğine verilir.
Claude Kırgızcada zayıf: taslağı **Türkçe ve Rusça çevirileri görerek** üretir, `machine` rozetiyle
yayınlanır, sen okursun, Kırgızca öğretmen terimleri kontrol eder → `reviewed`. Ses: samimi ama saygılı.

## Rusça, Türkçe, İngilizce

- **ru**: en geniş Orta Asya kitlesi, kalite yüksek olmalı. Yerleşik yazım (Ньютон, Аль-Хорезми). Nötr anlatım.
- **tr**: senin sesin; kendi yazdığın olaylarda `source_locale = 'tr'`. Yerleşik yazım (Kopernik, Öklid,
  Batlamyus, İbn-i Heysem, Uluğ Bey).
- **en**: vitrin, SEO, `x-default`, hattın kaynak dili. Amerikan yazım. **BCE/CE, BC/AD değil.**

Yayın sırası İngilizce önce (ADR-013); kaynak dil olay başına (ADR-009).

## Çeviri hattı (Faz B)

Server action → Claude API: alanlar (`title, summary, body, why_it_matters, if_you_were_there`), ses tonu
kuralları (03), terim sözlüğü, yerleşik isim yazımları, hedef dil; ky için ru+tr referans. Yıl ve sayı
çevrilmez (formatlama sitede). Çıktı JSON şemayla doğrulanır, boş alan gelirse kaydedilmez. Her çeviri
`status='machine'`; admin düzeltince `reviewed`. Toplu işler: `translate-missing.ts` (gece),
`check-i18n.ts` (eksik anahtar / eksik dil raporu).

## Açık test maddeleri

- [ ] `/` → `/ky` yönlendirmesi ky-KG tarayıcıda. Dil değiştirince aynı olay sayfasında kalınıyor.
- [ ] En uzun UI metni (ru/ky) butonlardan taşmıyor.
- [ ] `hreflang` ve `<html lang>` her sayfada doğru (Faz C).
