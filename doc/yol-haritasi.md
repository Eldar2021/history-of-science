# Yol Haritası

Sıralı fazlar; sıra bağlayıcı, süre değil. Darboğaz kod değil, karar vermek ve içerik onaylamak.

| Faz    | Tema                       | Sonunda elimizde ne var                                                    |
| ------ | -------------------------- | -------------------------------------------------------------------------- |
| **M1** | Temel                      | Küre + şerit, admin ekliyor sitede görünüyor, **50 olay**. İçerik yeniden toplanıyor. |
| **A**  | Siteyi biçimlendirmek      | Kabuk bitti (2026-09-05): CI, yedek, SEO, erişilebilirlik. İçerik akabilir. |
| **B**  | Otomasyon ve dil           | Gece hattı çalışıyor (2026-09-06). Kalan: onay kuyruğu, görsel yükleme.    |
| **C**  | SEO, erişilebilirlik, beta | Çağ/disiplin sayfaları, `about`, alan adı, 10 kişilik İngilizce beta (M2). |
| **D**  | Derinlik ve lansman        | Kişiler, bağlantılar, zincir görünümü, Keşfet kanvası, v1.0 (M3).          |

## M1 — kalan tek madde

- [ ] **En az 50 yayınlanmış olay.** İçerik 2026-09-06'da sıfırlandı (ADR-036); sıra
      `backend/content/top100.json`. Hat kurulunca gecede bir olay.

Faz A'nın kalan iki maddesi düştü: ikisi de silinen olaylara bağlıydı (altı olayın yer doğrulaması,
Uluğ Bey'in yılı). Yeniden yazıldıklarında hat zaten yeri ve yılı kaynakla birlikte üretiyor.

## Faz B — içerik hattı, çeviri, görseller

Hat 2026-09-06'da kuruldu ve ilk olayını yazdı (ADR-039); her gece bir olay `review`'a düşüyor.

- [ ] `/admin/review` onay kuyruğu: taslak + kaynaklar + araştırma notu; Yayınla / Düzenle / Reddet.
      Şimdilik olay listesindeki `status` filtresi bu işi görüyor.
- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak. (Hat şimdilik Commons adresini doğrudan
      kullanıyor, kova yolu değil.)
- [ ] Kırgızca sözlükteki 21 `confidence: check` girişi onaylansın — hattın her olayda çarptığı yer.

## Faz C — çağ/disiplin sayfaları, SEO, beta

- [ ] `/era/{slug}`, `/discipline/{slug}`.
- [ ] Analitik (Plausible/Umami), Sentry. `about` sayfası 4 dilde (neden, kaynak politikası, düzeltmeler, iletişim).
- [ ] **Performans turu.** Canlı mobil Lighthouse 2026-09-05, 6 ölçüm: perf **83-92, ortalama 88**;
      LCP 3.2-4.0 s, render gecikmesi baskın. Erişilebilirlik/en iyi uygulamalar/SEO **100/100/100**.
      Yani "mobil 90+" bütçesi ancak iyi bir turda tutuyor. Tek ölçüm 9 puan oynadığı için karar
      vermeden önce en az 5 tur al. Küre dokusunun WebP olması ölçülebilir fark yaratmadı (aynı
      build'de A/B: ikisi de aynı). `cacheComponents` de burada değerlendirilir (ADR-021).
- [ ] Alan adı (S14).

**M2**: 10 kişilik İngilizce kapalı beta, 1 hafta, geri bildirim formu. 3 büyük sorun → Faz D'nin başı.

## Faz D — kişiler, bağlantılar, zincir, kanvas

- [ ] Beta'nın 3 büyük sorunu.
- [ ] `people` CRUD, `/person/{slug}`; `event_links` admin'de arayıp bağlama, detayda "Dayanır / Mümkün kıldı".
- [ ] `profiles` self-update policy; `editor` hesapları + kısa rehber (S13).
- [ ] `/chain/{slug}`: geriye akan zincir, 6 seviye (`get_chain` hazır); 5 vitrin zinciri elle kontrol
      (akıllı telefon, mRNA aşısı, GPS, penisilin, JWST).
- [ ] `/explore`: SVG + d3-zoom, `xScale` ortak, Z0-Z2 anlamsal zoom, disiplin şeritleri, `importance`
      tabanlı görünürlük. Masaüstü öncelikli; mobilde Z0.
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). `v1.0.0`, `CHANGELOG.md`.
- [ ] Lansman: Show HN, Reddit (r/HistoryOfScience, r/InternetIsBeautiful), Kırgız/Türk Telegram kanalları,
      bir öğretmene doğrudan yaz.

**M3 = v1.0**: 200+ olay İngilizce, 150+'si dört dilde (kalanlar `machine` rozetli); çağ, disiplin, kişi
sayfaları; zincir en az 20 olayda anlamlı; kanvas masaüstünde Z0-Z2; onay kuyruğundan 50+ olay geçmiş;
Lighthouse 90/95/95; gerçek alan adı.

## Kapsam kesme kuralı

Zaman daralırsa sırayla kes: 1. Kanvas Z3 + kişi çubukları. 2. Kişi sayfaları. 3. Kanvasın tamamı
(lansman kanvassız, v1.1 olarak sonra). **Asla kesme**: admin otomatik yayın, içerik
hattı, 4 dil altyapısı, zincir görünümü, dürüstlük bandı, içerik doğruluğu.

## Sonrası

Dört dilli lansman · arama · Flutter (çevrimdışı, "bugün bilim tarihinde") · "Orada olsaydın" senaryoları ·
500 olay · ihtiyaç doğunca Go backend (ADR-002).
