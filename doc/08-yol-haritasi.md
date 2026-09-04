# 08 — Yol Haritası

Tempo varsayımı haftada 10-15 saat; darboğaz kod değil, karar vermek ve içerik onaylamak.

**Hafta numaraları bırakıldı (2026-09-04).** Ana sayfa küresi Hafta 8'den öne alınıp Hafta 5'te yapıldı,
içerik ise donduruldu — numaralar gerçeği anlatmıyordu. Yerine sıralı fazlar var. Sıra bağlayıcı, süre
değil.

| Faz     | Tema                       | Sonunda elimizde ne var                                                     |
| ------- | -------------------------- | --------------------------------------------------------------------------- |
| **M1**  | Temel                      | Akış timeline'ı, admin ekliyor sitede görünüyor, 50 olay. **Son madde kaldı.** |
| **A**   | Siteyi biçimlendirmek      | 50 olayla, kullanıcının istediği hâlde bir site. İçerik donmuş.              |
| **B**   | Otomasyon ve dil           | Gece taslak hattı, 4 dil çevirisi, görseller. İçerik yeniden akmaya başlar.  |
| **C**   | SEO, erişilebilirlik, beta | Çağ/disiplin sayfaları, `about`, alan adı, 10 kişilik İngilizce beta (M2).   |
| **D**   | Derinlik ve lansman        | Kişiler, bağlantılar, zincir görünümü, Keşfet kanvası, v1.0 (M3).            |

## İçerik dondurma kuralı (2026-09-04, kullanıcı kararı)

M1 için gereken 7 olay yazılır, **50'de durulur.** Faz A boyunca yeni olay eklenmez.

Gerekçe: 43 olayla bile sitenin ne olmak istediği belli değil. Olay sayısını artırmak siteyi
iyileştirmiyor, yalnızca aynı kabuğu daha çok dolduruyor. Önce kabuk doğru olsun, sonra içerik akar —
o zaman her yeni olay hazır bir yere düşer. Otomatik hat (Faz B) zaten günde 2 taslak üretebilir; asıl
kıt kaynak olay sayısı değil, **hangi sitede duracakları.**

---

## M1 — MVP kabul kriterleri

- [x] Zaman çizelgesi açılıyor, çağlarıyla ve gerçek ölçekli zaman şeridiyle (ADR-030'dan sonra
      ana sayfanın ayağında, `/tr` — `/tr/timeline` oraya yönleniyor).
- [x] Olaya tıklayınca detay açılıyor, geri tuşu aynı olaya dönüyor.
- [x] `/admin` sadece giriş yapmış admin'e açık; anonim istek 302 ile login'e gidiyor.
- [x] Admin'de kaydedince sitede anında görünüyor, deploy gerekmeden.
- [x] Taslaklar sitede ve API'de görünmüyor (RLS ile veritabanı seviyesinde).
- [x] Dört dil rotası çalışıyor; çeviri yoksa kaynak dil + "bu dilde henüz yok" rozeti.
- [x] Mobil Lighthouse performans 85+ (93 canlı, üretim build'de 100) — küre ve şeritten sonra
      yeniden ölçülecek, aşağıda.
- [ ] **En az 50 yayınlanmış olay.** 43 var; +7 Aydınlanma olayı gerekiyor (`03`'teki liste).

Kalan tek madde içerik. Bitince M1 yeşil ve içerik donar.

---

## Faz A — Siteyi 50 olayla istediğimiz hâle getirmek

**Kapsam açıldı (2026-09-04, kullanıcının fikirleri, S17 kapandı):** siteyi tek biçime indirmek.
İlk ve en büyük madde bitti — zaman çizelgesi ana sayfanın kendisi oldu, `/timeline` silindi
(ADR-030). Kalanlar aşağıda.

### Bilinen, kapatılması gereken işler

- [ ] **Golos Text Türkçe `ğ`'yi düşürüyor** — gövde/UI fontu `ğ` yerine düz `g` çiziyor (Literata
      doğru çiziyor, Kırgızca `Ң Ө Ү` ikisinde de doğru). Dört dil eşit vatandaş ilkesine aykırı.
      Seçenekler: sans'ı değiştirmek (ADR-019 revizyonu), ya da `ğ` için font yığınına yedek koymak.
      **Not**: STATUS'taki "bulut `era_translations`'ta `Çagı` yazım hatası" büyük olasılıkla bu;
      yerel seed'de `Çağı` doğru yazılmış ama ekranda `Çagı` görünüyor. Fontu düzeltmeden veriye
      dokunma.
- [ ] **Canlıda Lighthouse mobil ölçümü.** Küre 905 KB'lık bir doku ve piksel piksel çizen bir renderer
      getirdi; üstüne şerit geldi. Bütçeyi bozup bozmadığını bilmiyoruz; Faz A'nın sıradaki işi bu.
- [ ] Şeridi gerçek telefonda dene: kaydırma-seçim eşiği ve tutamakla açma yalnızca emülatörde
      denendi (ADR-030).
- [ ] Disiplin filtresi ve minimap `/timeline` ile gitti. Geri isteniyorsa şeridin üstüne.
- [ ] Bulut Auth ayarı: Site URL ve redirect listesi Vercel adresi olsun; `/admin/reset-password`
      sayfası. **Şu an şifre sıfırlama bağlantısı localhost'a gidiyor** — şifre unutulursa girilemez.
- [ ] Bulut `era_translations`'ta Türkçe çağ adını **gözle değil SQL ile** doğrula. Ekranda görülen
      `Çagı`/`Çag` büyük olasılıkla fontun `ğ`'yi düşürmesi (yukarıdaki madde); yerel seed doğru.
      Gerçekten bozuksa düzelt, değilse dokunma.
- [ ] Altı olayın yeri bir tarihçi kararına dayanıyor, kontrol edilmedi: copernicus (Frombork/Nürnberg),
      roger-bacon (Paris/Oxford), aryabhata, ibn-sina, al-biruni, tycho. Liste migration 0004'ün başında.
- [ ] Uluğ Bey yılı çelişkisi: seed `1420 exact`, taslak `circa 1437`. Admin formundan düzeltilir.
- [ ] Erişilebilirlik geçişi (klavye, odak, `aria-live`, kontrast) — tek koyu temada baştan.

## Faz B — İçerik hattı, çeviri, görseller

İçerik burada yeniden akmaya başlar.

- [ ] `backend/scripts/draft-next.ts`: `03`'teki kalan listeden sıradaki olay → Claude API (web search) →
      3+ kaynak → şablona göre İngilizce JSON taslak → `status='review'`, `drafted_by='ai'`,
      `research_note`, `sources`.
- [ ] GitHub Actions cron (gece 03:00), `CONTENT_PIPELINE_ENABLED`, "kuyrukta 10+ varsa üretme".
- [ ] Telegram bot bildirimi (S11).
- [ ] `/admin/review` onay kuyruğu: taslak + kaynaklar + araştırma notu; Yayınla / Düzenle / Reddet.
- [ ] İlk 10 taslağı elle tetikle, kaliteyi ölç, prompt'u ayarla. Reddetme oranı %30 üstündeyse kaynak
      eşiğini yükselt.
- [ ] `web/lib/translate.ts` (Claude API, JSON şema doğrulama, kaynak dili olaydan okur, Kırgızca için
      tr+ru referanslı).
- [ ] `/admin/translate/{id}`: 4 dil yan yana, "Çevir", `machine`/`reviewed`, `editor` rolü sadece burada.
- [ ] "Yayınla + çevir" tek tık. Sitede `machine` rozeti.
- [ ] Görsel yükleme: Storage, zorunlu atıf/lisans/kaynak (ADR-011).
- [ ] Kırgızca terim sözlüğü ilk 30 terim; `check-i18n.ts`.

## Faz C — Çağ/disiplin sayfaları, SEO, beta

- [ ] `/era/{slug}`, `/discipline/{slug}`.
- [ ] `hreflang`, `<html lang>`, meta 4 dilde, `sitemap.xml`, `robots.txt`, dinamik OG görselleri.
- [ ] Analitik (Plausible/Umami), Sentry.
- [ ] `about` sayfası (neden, kaynak politikası, düzeltmeler listesi, iletişim) 4 dilde.
- [ ] Alan adı seç ve bağla (S14), yedekleme.
- [ ] Performans turu: Lighthouse mobil 90+; `cacheComponents` + `"use cache"` geçişini değerlendir
      (ADR-021).

**M2**: 10 kişilik İngilizce kapalı beta, 1 hafta, geri bildirim formu. 3 büyük sorun → Faz D'nin başı.

## Faz D — Kişiler, bağlantılar, zincir, kanvas

- [ ] Beta'nın 3 büyük sorunu.
- [ ] `people` CRUD, `/person/{slug}`, olay-kişi ilişkisi.
- [ ] `event_links`: admin'de arayıp bağlama; detayda "Dayanır / Mümkün kıldı".
- [ ] Migration: `profiles` self-update policy (editör kendi `ui_locale`'ini yazabilsin).
- [ ] Kırgızca öğretmen ve Rusça gözden geçirici için `editor` hesapları + kısa rehber (S13).
- [ ] `/chain/{slug}`: geriye akan nehir, 6 seviye; mobil akordeon; ileri yön. `get_chain` hazır.
      Olay detayında büyük buton; veri yoksa buton görünmez.
- [ ] 5 vitrin zinciri elle kontrol: akıllı telefon, mRNA aşısı, GPS, penisilin, JWST.
- [ ] `/explore`: SVG + d3-zoom, `xScale` ortak, Z0-Z2 anlamsal zoom, 8 disiplin şeridi, `importance`
      tabanlı görünürlük, kümeleme ("+4"), görünür pencere dışını render etme. Tıklayınca aynı panel;
      URL `?year&zoom&d`; Akış ↔ Keşfet geçişi konumu korur. Masaüstü öncelikli; mobilde Z0.
- [ ] Kanvas v1.1: Z3 + kişi yaşam çubukları, bağlantı çizgileri, mobil cila.
- [ ] Klavye kısayolları, gerçek cihaz testi (modern iPhone/Android, Firefox/Safari).
- [ ] Playwright + CI (GitHub Actions) her PR'da.
- [ ] Son Lighthouse turu (perf 90+, a11y 95+, SEO 95+). Yedekten geri yükleme provası.
      `v1.0.0` etiketi, `CHANGELOG.md`.
- [ ] Lansman metni: senin hikâyen + "yakında: 4 dil tam onaylı". Hacker News "Show HN", Reddit
      (r/HistoryOfScience, r/InternetIsBeautiful), LinkedIn, X, Kırgız/Türk Telegram kanalları.
      Bir öğretmene doğrudan yaz. Bir hafta sonra: geri bildirim + analitik → 3 büyük sorun.

**M3 = v1.0 kabul kriterleri**

- [ ] 200+ yayınlanmış olay İngilizce; 150+'si dört dilde (kalanlar `machine` rozetli).
- [ ] Çağ, disiplin, kişi sayfaları çalışıyor.
- [ ] Zincir görünümü en az 20 olay için anlamlı zincir üretiyor.
- [ ] Keşfet kanvası masaüstünde Z0-Z2, mobilde sıkıştırma ile çalışıyor.
- [ ] Onay kuyruğundan en az 50 olay geçmiş.
- [ ] OG görselleri otomatik; Twitter/WhatsApp/Telegram önizlemesi düzgün.
- [ ] Lighthouse: performans 90+, erişilebilirlik 95+, SEO 95+.
- [ ] Gerçek alan adında, HTTPS ile yayında; `about` sayfasında kaynak politikası ve iletişim.

Not: 200 olay hedefi içerik dondurmasından **önce** konmuştu. Faz A ne kadar sürerse M3'ün olay sayısı
o kadar geriye kayar; hedefi düşürmek yerine tarihi kaydırıyoruz, çünkü 200 olay v1.0'ın "bu bir
ansiklopedi değil ama ciddi" iddiasını taşıyan şey.

---

## Ritüel

1. Faz B'den sonra her sabah 20 dk: Telegram bildirimi → `/admin/review` → onayla / düzelt / reddet.
2. Bir iş bitince `08`'den silinir; kanıtı `git log`'da.
3. Bitmeyen bir iş ertelendiyse nedeni bir cümleyle `10`'a ya da `09`'a yazılır.

## Kapsam kesme kuralı

Zaman daralırsa sırayla kes, sırayla geri ekle:

1. Kanvas Z3 + kişi çubukları. 2. Kişi sayfaları. 3. OG görselleri. 4. Kanvasın tamamı (lansman Akış ile,
   kanvas v1.1 olarak 2 hafta sonra).

**Asla kesme**: admin otomatik yayın, otomatik içerik hattı, 4 dil altyapısı, zincir görünümü,
dürüstlük bandı, içerik doğruluğu.

## Sonrası

- ky/tr/ru gözden geçirme biter → dört dilli lansman. Arama. Kanvas v2.
- Flutter mobil uygulama (Supabase Flutter SDK, çevrimdışı, "bugün bilim tarihinde" bildirimi).
- "Orada olsaydın" senaryoları. Kullanıcı olay önerisi. 500 olay.
- **İhtiyaç doğunca**: Go backend'e geçiş (ADR-002).
