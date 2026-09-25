# Yol Haritası

Sıralı fazlar; sıra bağlayıcı, süre değil. Darboğaz kod değil, karar vermek ve içerik onaylamak.

| Faz    | Tema                        | Sonunda elimizde ne var                                                         |
| ------ | --------------------------- | ------------------------------------------------------------------------------- |
| **M1** | Temel                       | Küre + şerit, admin ekliyor sitede görünüyor, **50 olay**. 2026-09-24: 37.       |
| **Q**  | Doğruluk (şimdi, M1 ile)    | Hattın yazdığı her somut iddia kaynaklı; yayındakiler denetlenmiş; düzeltmeler açık. |
| **B**  | Otomasyon ve dil (kalan)    | Görsel yükleme; Kırgızca okuyucu.                                               |
| **C**  | Keşif, SEO, beta            | Çağ/disiplin sayfaları, arama, `about`, alan adı, 10 kişilik İngilizce beta (M2). |
| **D**  | Derinlik ve lansman         | Kişiler, zincir görünümü, Keşfet kanvası, v1.0 (M3).                            |

## Şimdi — sitede kırık olanlar (2026-09-24 UX denetimi)

Bunlar hata, özellik değil; plan onayı beklemeden düzeltilir (CLAUDE.md). Sırası etkiye göre.

- [ ] **Telefona tam boy Commons görseli gidiyor.** 98 gövde görselinin hiçbiri küçültülmüş değil,
      toplam 43 MB; Einstein sayfası 15,5 MB (tek portre 15 MB), El-Harezmi 10,9 MB. Yavaş hatta
      sayfa bitmez. Çözüm: render anında Commons `/thumb/…/800px-` adresi + `srcset`, width/height.
      (`EventDetail.tsx` kapak, `Markdown.tsx` figür.) Hat da ileride `commons.mjs`'ten boyutlu adres alsın.
- [ ] **Bağlantılı olaylarda "yaklaşık" kayboluyor**: `LinkedList` yılı `"exact"` diye biçimliyor
      (`EventDetail.tsx:37`); "yaklaşık MS 820" canlıda "MS 820". 4. ilkeyi çiğniyor. `get_event_detail`
      bağlantılarla `precision` döndürmeli → migration. Kişilerin doğum/ölüm yılı da aynı.
- [ ] **Kapak görseli 23/37 olayda gövdenin ilk figürüyle aynı**, alt alta iki kez görünüyor; üstelik
      kapak `loading="lazy"` ve `alt=""`. Tekrarı gizle, kapağı `fetchpriority=high` yükle.
- [ ] **Admin metinleri her ziyaretçi sayfasına gömülü**: `app/[locale]/layout.tsx` içindeki
      `NextIntlClientProvider` bütün mesajları alıyor (ky'de ~9 KB `admin`). Yalnızca açık ad alanları.
- [ ] Gövdedeki `##` başlıklar tam sayfada `h1`'in altında `h3` oluyor (`Markdown.tsx:59`), `h2` atlanıyor.

## M1 — kalan tek madde

- [ ] **En az 50 yayınlanmış olay.** Gecede bir olay; 2026-09-24'te 37/100, hepsi dört dilde.
      Bu hızla 50'ye ~2 hafta. Ama önce Faz Q'nun ilk iki maddesi: aynı hızla hatalı olay basmanın
      anlamı yok.

## Faz Q — doğruluk

**Neden şimdi**: yayındaki üç olayın bağımsız kontrolünde ~750 kelimede bir somut hata çıktı
(riskler.md R2). Hattın fact-checker adımı da senin onayın da bunları kaçırdı. Bu sitenin tek sermayesi
güven; 100 olayda ~200 hata bu sermayeyi yer. Hatalar hep aynı türden: hikâyeyi canlandırmak için
eklenen kaynaksız ayrıntı (yaş, tonaj, "dakikalar içinde", "yıkıldı", "hiç yoktu"). Yani sorun
araştırma değil, **yazarken süsleme**; ve bu önlenebilir.

- [ ] **Q1 İddia defteri.** `prompts/run.md`: gövdedeki her somut iddia (sayı, yaş, tarih, alıntı,
      "ilk / hiç / asla", süre) `research_note` içinde `iddia → kaynak URL` satırı olarak yazılır.
      Kaynağı olmayan ayrıntı kesilir ya da "anlatılana göre" diye işaretlenir. Alıntı ancak kaynağı
      varsa tırnak içinde durur. Yükleyici bu bölümün varlığını denetler.
- [ ] **Q2 Bağımsız doğrulayıcı.** Doğrulama ayrı bir `claude -p` çağrısında koşar (`prompts/verify.md`):
      yazarın bağlamını görmez, yalnızca taslağı ve iddia defterini. Yazan ve denetleyen aynı zihin
      olduğunda aynı körlüğü paylaşır — bugünkü fact-checker adımı yazarın oturumunda çalışıyor. Rapor
      taslağa `verification` alanı olarak girer; dört dile aynı düzeltme uygulanır.
- [ ] **Q3 Yayındaki 37 olayın denetimi.** Her olaya Q2'deki doğrulayıcı; bulgular
      `backend/content/audit/<slug>.md`. Düzeltme yolu: olayı admin'den `review`'a çek → hat taslağı
      düzeltip yükler → sen yeniden yayınlarsın (yükleyici yayınlanmışa dokunamaz, bu doğru). İlk yedi
      hata elimizde: Uluğ Bey, Haber-Bosch, Rutherford.
- [ ] **Q4 Onay ekranı `/admin/review`** (Faz B'den öne çekildi). Olay, yanında iddia defteri ve
      doğrulayıcının "bak buna" listesi, kaynaklar tıklanabilir; Yayınla / Geri gönder. Sen bilim
      insanı değilsin; onayın anlamlı olması için neye bakacağını ekran söylemeli.
- [ ] **Q5 Düzeltmeler sayfası.** Yayından sonra düzeltilen her hata herkese açık listelenir
      (`/corrections`, dört dil). 4. ilke; ayrıca bir okuyucunun hata bildirmesini ödüllendirir.
- [ ] **Q6 Kırgızca.** 21 `check` terimi ve bir Kırgızca okuyucu (S13 öne çekildi). Denetimde
      Kırgızca gövdelerde yazım hatası da çıktı ("Тихо Браненин"). Hiçbir çeviri `reviewed` değil.

**Ölçü**: Q1+Q2'den sonra yazılan 5 olayı Q3'teki gibi bağımsız denetle. Hedef: 2.000 kelimede birden az
somut hata. Tutmazsa hat gecede bir yerine iki gecede bir koşar ve kalan süre doğrulamaya gider.

## Faz B — kalan

- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak. (Hat Commons adresini doğrudan kullanıyor.)
- [ ] Video yolu hiç denenmedi: 37 olayda 0 video. Hat oEmbed ile doğrulanabilen bir belgesel bulursa açılır.

## Faz C — okuma, keşif, SEO, beta

Birincil okuyucu akşam telefonda 20 dakika kaydırıyor. Bugün bir olayı bitirince gidecek yeri yok ve
1.000-2.700 kelimeyi 15 px'te okuyor. Faz C'nin ilk yarısı bunu çözer.

- [ ] **Olayın sonu bir yere çıksın**: her olayın altında zamanda önceki/sonraki ve "zinciri sürdür".
      12/37 olayın "Dayanır" listesi boş; 4 olayın hiç bağlantısı yok (Pasteur, İbn Sina, transistör,
      İnsan Genomu — sonuncusu bu PR'daki bağlantı geçişiyle gelir).
- [ ] **Okuma konforu**: gövde 17 px / satır yüksekliği ~1.7, satır ~65ch, okuma süresi özetin altında,
      `hyphens: auto` (`lang` zaten doğru). Koyu tema kararı (ADR-029) değişmiyor; beta'da yorgunluk
      sorulur.
- [ ] **Makine çevirisi rozeti açıklansın**: rozet kısa bir açıklamaya ve İngilizce aslına bağlansın;
      dürüstlük metnine "taslakları yapay zekâ yazar, bir insan onaylar" cümlesi. Bugün İngilizce sayfa
      bunu hiç söylemiyor; 4. ilke gereği söylemeli.
- [ ] `/era/{slug}`, `/discipline/{slug}`; `/about` gerçek bir sayfa olsun (bugün URL'siz bir
      açılır pencere, ne bağlanabiliyor ne dizinleniyor). Sitemap bunları da taşısın.
- [ ] Article JSON-LD (tarih, görsel künyesi); `og:image:alt` olay başlığı olsun ("Uchkun" değil).
- [ ] Her sayfa 8 font dosyası ön yüklüyor; yalnızca o dilin alfabesi.
- [ ] Arama (Park'tan çıktı: 37 olayda bile küreden bir olayı bulmanın tek yolu kaydırmak).
      `event_translations.search` tsvector'ü hazır.
- [ ] `about` sayfası 4 dilde (neden, kaynak politikası, düzeltmeler, iletişim). Analitik/Sentry (S15).
- [ ] **Performans turu.** Canlı mobil Lighthouse 2026-09-05, 6 ölçüm: perf **83-92, ortalama 88**;
      LCP 3.2-4.0 s, render gecikmesi baskın. Erişilebilirlik/en iyi uygulamalar/SEO **100/100/100**.
      O ölçüm 2 olayla ve görselsiz yapıldı; görsel düzeltmesinden sonra olay sayfalarında
      (Einstein, Newton) yenilenmeli. Tek ölçüm 9 puan oynadığı için en az 5 tur.
      `cacheComponents` burada değerlendirilir (ADR-021).
- [ ] Alan adı (S14).

**M2**: 10 kişilik İngilizce kapalı beta, 1 hafta, geri bildirim formu. 3 büyük sorun → Faz D'nin başı.

## Faz D — kişiler, zincir, kanvas

- [ ] Beta'nın 3 büyük sorunu.
- [ ] `/chain/{slug}`: geriye akan zincir, 6 seviye (`get_chain` hazır). 2026-09-24'te 48 `builds_on`
      bağlantısı var; zincir ilk kez anlamlı. 5 vitrin zinciri elle kontrol (akıllı telefon, mRNA
      aşısı, GPS, penisilin, JWST).
- [ ] `/person/{slug}`: 37 olayda 200+ kişi kaydı var, veri hazır; admin'de `people` düzenleme.
- [ ] `profiles` self-update policy; `editor` hesapları + kısa rehber (S13).
- [ ] `/explore`: SVG + d3-zoom, `xScale` ortak, Z0-Z2 anlamsal zoom, disiplin şeritleri, `importance`
      tabanlı görünürlük. Masaüstü öncelikli; mobilde Z0.
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). `v1.0.0`, `CHANGELOG.md`.
- [ ] Lansman: Show HN, Reddit (r/HistoryOfScience, r/InternetIsBeautiful), Kırgız/Türk Telegram kanalları,
      bir öğretmene doğrudan yaz.

**M3 = v1.0**: 200+ olay, 150+'si dört dilde **ve denetlenmiş**; çağ, disiplin, kişi sayfaları; zincir en
az 20 olayda anlamlı; kanvas masaüstünde Z0-Z2; Lighthouse 90/95/95; gerçek alan adı.

## İşletme borcu

- [ ] **Yedeği geri yükle** (R10): boş bir projeye `roles → schema → data`. Hiç denenmedi.
- [ ] Actions Node 20 uyarısı: `checkout`, `setup-node`, `upload-artifact` v4 → güncel sürüm.
- [ ] `CLAUDE_CODE_OAUTH_TOKEN` bitiş tarihini `mimari.md`'ye yaz; bittiğinde gece koşusu düşer (R9).

## Kapsam kesme kuralı

Zaman daralırsa sırayla kes: 1. Kanvas Z3 + kişi çubukları. 2. Kişi sayfaları. 3. Kanvasın tamamı
(lansman kanvassız, v1.1 olarak sonra). **Asla kesme**: admin otomatik yayın, içerik
hattı, 4 dil altyapısı, zincir görünümü, dürüstlük bandı, içerik doğruluğu (Faz Q).

## Sonrası

Dört dilli lansman · Flutter (çevrimdışı, "bugün bilim tarihinde") · "Orada olsaydın" senaryoları ·
500 olay · ihtiyaç doğunca Go backend (ADR-002).
