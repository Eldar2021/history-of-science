# Yol Haritası

Sıralı fazlar; sıra bağlayıcı, süre değil. Darboğaz kod değil, karar vermek ve içerik onaylamak.

| Faz    | Tema                       | Sonunda elimizde ne var                                                    |
| ------ | -------------------------- | -------------------------------------------------------------------------- |
| **M1** | Temel                      | Küre + şerit, admin ekliyor sitede görünüyor, **50 olay**. Son madde kaldı. |
| **A**  | Siteyi biçimlendirmek      | 50 olayla istenen hâlde bir site. İçerik donmuş.                           |
| **B**  | Otomasyon ve dil           | Gece taslak hattı, 4 dil çevirisi, görseller. İçerik yeniden akar.         |
| **C**  | SEO, erişilebilirlik, beta | Çağ/disiplin sayfaları, `about`, alan adı, 10 kişilik İngilizce beta (M2). |
| **D**  | Derinlik ve lansman        | Kişiler, bağlantılar, zincir görünümü, Keşfet kanvası, v1.0 (M3).          |

**İçerik dondurma kuralı (2026-09-04):** M1 için gereken 7 olay yazılır, 50'de durulur; Faz A boyunca
yeni olay yok. Önce kabuk doğru olsun, sonra içerik akar. Faz B hattı günde 2 taslak üretebilir.

## M1 — kalan tek madde

- [ ] **En az 50 yayınlanmış olay.** 43 var; +7 Aydınlanma olayı (`icerik.md`'deki liste).

## Faz A — kalanlar

- [ ] **Bulutta Auth ayarı**: Site URL ve redirect listesi Vercel adresi olsun. Kod ve yerel yapılandırma
      hazır (ADR-035); kalan tek şey Supabase panelindeki iki alan.
- [ ] Altı olayın yeri bir tarihçi kararına dayanıyor, kontrol edilmedi (liste migration 0004'ün başında).
- [ ] Uluğ Bey yılı buluttaki kayıtta: admin formundan `1420` / `1437` / yaklaşık.
- [ ] Analitik ve Sentry (hesap kararı, S12) — Faz C'den öne alınabilir.

## Faz B — içerik hattı, çeviri, görseller

- [ ] `backend/scripts/draft-next.ts`: `icerik.md`'deki listeden sıradaki olay → Claude API (web search) → 3+ kaynak
      → şablona göre İngilizce JSON → `status='review'`, `drafted_by='ai'`, `research_note`, `sources`.
- [ ] GitHub Actions cron (gece 03:00), `CONTENT_PIPELINE_ENABLED`, "kuyrukta 10+ varsa üretme". Telegram (S11).
- [ ] `/admin/review` onay kuyruğu: taslak + kaynaklar + araştırma notu; Yayınla / Düzenle / Reddet.
- [ ] İlk 10 taslağı elle tetikle, kaliteyi ölç, prompt'u ayarla.
- [ ] Çeviri: `web/lib/translate.ts` (Claude API, JSON şema, kaynak dili olaydan okur, ky için tr+ru referanslı),
      `/admin/translate/{id}` 4 dil yan yana, "Yayınla + çevir" tek tık, sitede `machine` rozeti.
- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak. Kırgızca terim sözlüğü ilk 30 terim; `check-i18n.ts`.

## Faz C — çağ/disiplin sayfaları, SEO, beta

- [ ] `/era/{slug}`, `/discipline/{slug}`. (`hreflang`, meta, `sitemap.xml`, `robots.txt`, OG görselleri
      ve yedekleme ADR-035 ile bitti.)
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
- [ ] Playwright + CI her PR'da. Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). `v1.0.0`, `CHANGELOG.md`.
- [ ] Lansman: Show HN, Reddit (r/HistoryOfScience, r/InternetIsBeautiful), Kırgız/Türk Telegram kanalları,
      bir öğretmene doğrudan yaz.

**M3 = v1.0**: 200+ olay İngilizce, 150+'si dört dilde (kalanlar `machine` rozetli); çağ, disiplin, kişi
sayfaları; zincir en az 20 olayda anlamlı; kanvas masaüstünde Z0-Z2; onay kuyruğundan 50+ olay geçmiş; OG
görselleri; Lighthouse 90/95/95; gerçek alan adı.

## Kapsam kesme kuralı

Zaman daralırsa sırayla kes: 1. Kanvas Z3 + kişi çubukları. 2. Kişi sayfaları. 3. OG görselleri.
4. Kanvasın tamamı (lansman kanvassız, v1.1 olarak sonra). **Asla kesme**: admin otomatik yayın, içerik
hattı, 4 dil altyapısı, zincir görünümü, dürüstlük bandı, içerik doğruluğu.

## Sonrası

Dört dilli lansman · arama · Flutter (çevrimdışı, "bugün bilim tarihinde") · "Orada olsaydın" senaryoları ·
500 olay · ihtiyaç doğunca Go backend (ADR-002).
