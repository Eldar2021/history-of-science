# 09 — Kararlar (ADR: Architecture Decision Records)

Her önemli karar burada, tarih ve gerekçeyle. Bir karar değişirse eskisini silme; "Geçersiz, bkz. ADR-N" yaz.
Format: Bağlam → Karar → Gerekçe → Sonuçlar → Alternatifler.

---

## ADR-001: Önce web, mobil sonra
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Bağlam**: Flutter biliyorsun; `mobile/` klasörü var. Ama SEO, paylaşılabilirlik, admin paneli ve tek kod tabanı ilk 3 ay için kritik.
- **Karar**: İlk 3 ay yalnızca mobil uyumlu web. Flutter uygulaması 4. ay+.
- **Gerekçe**: Bir link paylaşmak uygulama indirtmekten 100 kat kolay. Google'da bulunmak için web şart. Veri katmanı (Supabase) Flutter'a hazır olduğundan sonra eklemek ucuz.
- **Sonuçlar**: `mobile/` boş kalır. Tasarım mobil-önce yapılır ki geçiş doğal olsun.

## ADR-002: Next.js 15 App Router + Supabase, ayrı backend yok
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Bağlam**: Solo geliştirici, sıfır bakım, ücretsiz katman, admin yazınca anında yayın.
- **Karar**: Next.js (site + admin) + Supabase (Postgres, Auth, Storage). Backend mantığı server action + RLS + Postgres view/fonksiyon.
- **Gerekçe**: İki servis, ikisi de yönetilen. Ayrı API sunucusu bakım yükü ve deploy karmaşıklığı getirir, 3 ayda değer katmaz.
- **Sonuçlar**: `backend/` klasörü SQL migration + script'lerden ibaret. Flutter Supabase SDK ile aynı veriye bağlanır.
- **Alternatifler**: Payload CMS (admin UI hazır gelir; timeline'a özel modeli eğmek gerekir). Hafta 4 sonunda admin UI beklenenden 2 kat uzun sürdüyse yeniden değerlendir.
- **Gelecek yolu (kararın)**: Ücretsiz katman yetmezse veya kontrol istenirse Go ile kendi backend. Hazırlık: iş mantığı Postgres'te ve script'lerde, Supabase'e özgü yalnızca Auth/Storage. Geçiş: Go API aynı Postgres'e bağlanır.

## ADR-003: Çeviriler veritabanında, dil başına satır
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Her varlık için `*_translations (id, locale, ...)` tablosu. JSON sütunu değil.
- **Gerekçe**: Dil başına arama (`tsvector`), eksik dil raporu, satır bazlı çeviri durumu (`machine/reviewed`) SQL ile kolay. JSON sütunu bunların hepsini zorlaştırır.
- **Sonuçlar**: Sorgular join ister; view'larla soyutlanır.

## ADR-004: Yıl = tamsayı, negatif = MÖ, sıfır yılı yok
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: `year integer`; MÖ 585 = -585; MÖ 1 = -1; MS 1 = 1. Sıralama ve karşılaştırma doğrudan tamsayı.
- **Gerekçe**: Tarih tipi (`date`) MÖ'yi ve belirsizliği kötü taşır. Aya/güne ihtiyaç yok; olduğunda gövde metninde yazılır.
- **Sonuçlar**: `formatYear` tek doğruluk noktası. "0 yılı" hesaplarında (aradaki yıl sayısı) 1 düzeltmesi uygulanır; test edilir.

## ADR-005: Slug dilden bağımsız, İngilizce
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: `/ky/event/newton-principia`. Dil başına slug yok.
- **Gerekçe**: Dil değiştirince aynı sayfada kalmak, `hreflang` eşleştirme, paylaşım linklerinin sadeliği. Dil başına slug'ın SEO faydası bu ölçekte önemsiz.

## ADR-006: İki görünüm: olay sıralı Akış + gerçek ölçekli yakınlaştırılabilir Keşfet kanvası
**Tarih**: 2026-09-02 (güncellendi aynı gün) · **Durum**: Kabul
- **Karar**: Varsayılan görünüm Akış: olaylar eşit aralıklı, büyük boşluklarda "zaman boşluğu" işareti, altta gerçek ölçekli minimap. İkinci görünüm Keşfet: gerçek ölçekli, anlamsal yakınlaştırmalı kanvas, disiplin şeritli. 3. ayda (Hafta 11-12) gelir.
- **Gerekçe**: Senin kararın: kanvas "olmalı, çok kullanışlı ve etkileyici". Katılıyorum; riski sıralamayla yönetiyoruz: Akış önce (kanvas gecikirse site çalışır), kanvas sonra. Minimap ve kanvas aynı ölçek fonksiyonunu paylaşır; kod tekrarı yok.
- **Sonuçlar**: `importance` alanı zorunlu ve anlamlı olmalı (zoom seviyesinde görünürlüğü belirler). Arama v1.0'dan çıkarıldı (kanvasa yer açmak için).

## ADR-007: Bağlantılar tek yönlü saklanır (`builds_on`)
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: `event_links` sadece "A, B'ye dayanır" saklar; "B, A'yı mümkün kıldı" aynı satırın ters okunuşudur.
- **Gerekçe**: Çift kayıt tutarsızlık doğurur. UI iki yönü de sorgu ile üretir.
- **Sonuçlar**: `enables` enum değeri UI/ API katmanında anlam taşır, tabloda `builds_on` olarak yazılır. `contradicts` ve `parallel` simetriktir; küçük id'den büyüğe tek satır.

## ADR-008: Makine çevirisi gizlenmez, rozetle yayınlanır
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: `status='machine'` çeviriler sitede görünür, küçük "otomatik çeviri" rozeti ile.
- **Gerekçe**: Dürüstlük ilkesi. Kırgızca ve Rusça okuyucuya "hiç yok"tansa "var ama otomatik" daha faydalı. Rozet geri bildirim daveti.
- **Sonuçlar**: Rozet tasarımı gerekir. Gözden geçirilince kaybolur.

## ADR-009: Kaynak dil olay başına; Claude taslakları `en`, senin yazdıkların `ky`/`tr`
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: `events.source_locale` olay başına. Otomatik içerik hattı İngilizce üretir. Sen Kırgızca ve Türkçe yazarsın; içinde çevrilmemiş İngilizce terim olabilir.
- **Gerekçe**: Kaynaklar İngilizce; hızlı yayın için İngilizce önce. Senin sesin ky/tr'de en doğal.
- **Sonuçlar**: Çeviri hattı kaynak dili olaydan okur. Sözlük İngilizce terimleri de kapsar.

## ADR-010: Taslaklar veritabanı seviyesinde gizli (RLS)
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Anonim rolün `select` politikası `status='published' and deleted_at is null` koşullu.
- **Gerekçe**: Frontend'de bir `where` unutulsa bile taslak sızmaz. Güvenlik tek noktaya (kod) değil veriye bağlı.
- **Sonuçlar**: Admin önizleme (P2) için ayrı, kimlik doğrulamalı sorgu gerekir.

## ADR-011: Görsel lisans alanları zorunlu
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Görsel yüklenirse atıf + lisans + kaynak URL boş bırakılamaz.
- **Gerekçe**: Telif sorunu siteyi kapatabilir. Sonradan toplamak imkânsız.

---

## ADR-012: İsim Uchkun / Учкун
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Site adı Uchkun (Kırgızca "kıvılcım"). Latin ve Kiril yazımı birlikte kullanılır.
- **Sonuçlar**: Alan adı sonra (uchkun.science / .kg / .org). Tasarım promptu wordmark ister.

## ADR-013: İngilizce önce yayın, sonra ky, tr, ru
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Kapalı beta ve lansman İngilizce içerikle. Diğer üç dil makine çevirisiyle rozetli, insan onayı sırayla.
- **Gerekçe**: Kaynaklar İngilizce, otomatik hat İngilizce üretir, hızlı yayın. Kırgızca öğretmen ve Rusça gözden geçirici hazır; onlar İngilizce yayından sonra devreye girer.
- **Sonuçlar**: Tasarım ve veri modeli baştan dört dilli; sadece içerik sırası değişir.

## ADR-014: Otomatik içerik hattı (Claude her gece taslak, insan onayı şart)
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: GitHub Actions cron + `backend/scripts/draft-next.ts` + Claude API (web search). Sonuç `status='review'`, `drafted_by='ai'`, kaynaklar ve araştırma notuyla. Telegram bildirimi. Yayın kararı yalnızca insan.
- **Gerekçe**: R1 (içerik darboğazı) için senin önerin. Doğrulama süresi olay başına 45 dk'dan 10 dk'ya iner.
- **Sonuçlar**: `events.status` üç değer: draft/review/published. `/admin/review` kuyruğu. Kapatma anahtarı ve "kuyrukta 10+ varsa üretme" kuralı.

## ADR-015: İki tema eşit üretilir, birincil sonra seçilir
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Claude Design karanlık ve aydınlık temayı eşit ağırlıkta üretir; sen görüp birincili seçersin. Diğeri anahtarla kalır.

## ADR-016: Hedef cihaz modern telefonlar; eski Android hedeflenmez
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Son 4-5 yılın cihazları hedef. Eski Android için özel optimizasyon yok. Lighthouse 90 hedefi kalır (modern cihazda akıcılık göstergesi).

## ADR-017: Dürüstlük bandı her sayfada
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Alt bilgide 4 dilde: "Bu siteyi yapan kişi tarihçi ya da bilim insanı değil. Bir hata gördüyseniz lütfen bildirin; düzeltmekten mutluluk duyarız." + "Hata bildir" bağlantısı (olay sayfasında olay bilgisini otomatik ekler).
- **Gerekçe**: R2 için senin önerin. Zayıflık değil güven kaynağı; hata bildirimi ücretsiz editör kazandırır.

## ADR-018: Admin arayüzü 4 dilde
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Admin de `messages/*.json` ile en/ky/tr/ru. Kırgızca öğretmen ve Rusça gözden geçirici `editor` rolüyle kendi dillerinde çalışır.

## ADR-019: Tasarım sistemi: Organic tabanı + Uchkun Foundation; Literata + Golos Text; karanlık tema CSS varsayılanı
**Tarih**: 2026-09-03 · **Durum**: Kabul
- **Bağlam**: Claude Design konsepti `resource/Design system conflict scope/` altına geldi. İki parça var: `_ds/organic-*/` genel "Organic" taban sistemi (krem zemin, terracotta + adaçayı vurgu, OKLCH tonal rampalar, 1.10× yoğunluk, 16px köşe) ve onun üstüne kurulan `Uchkun - Foundation.dc.html` (gözlemevi/gece teması, Literata + Golos Text, 8 disiplin rengi iki temada, tip ölçeği, hareket süreleri). Organic'in kendi fontları (Caprasimo, Figtree) Kiril taşımaz; Foundation bunları geçersiz kılar.
- **Karar**: Token kaynağı Foundation'ın 1b panosudur; `resource/design/tokens.json` olarak çıkarıldı ve `web/app/globals.css`'e elle aktarıldı. Fontlar Inter + Playfair Display yerine **Golos Text (gövde) + Literata (yıl, çağ, başlık)**, ikisi de `cyrillic-ext` alt kümesiyle (Ң Ө Ү). Boşluk ölçeği Tailwind'de tek düğme: `--spacing: 0.275rem` (4.4px). ~~Karanlık tema CSS varsayılanı; birincil tema seçimi (S15) hâlâ açık.~~ Geçersiz, bkz. ADR-020: birincil tema açık. Çağlar için ayrı renk yok; çağ etiketleri adaçayı (`--sage`), `era-*` token'ları şimdilik ona işaret eder.
- **Gerekçe**: Konsept 07'deki yönü (gözlemevi, tek vurgu, tabular rakam, en büyük tipografik öge yıl) karşılıyor ve WCAG değerlerini veriyor (karanlıkta AAA). Organic'in geometrisini (yuvarlak köşeler, pill) korumak konseptle tutarlı. `Ңөү` kontrolü iki fontta da alt küme tanımıyla sağlandı.
- **Sonuçlar**: `resource/design/tokens.json` ile `globals.css` birlikte güncellenir. Font değişince `Ңөү` görsel testi tekrar yapılır. Explore kanvası için çağ renk paleti ayrı bir tasarım turunda istenir. Organic'in `styles.css`'i doğrudan kullanılmaz; yalnızca referans.
- **Alternatifler**: Organic'i olduğu gibi kullanmak (Kiril yok, elendi); Inter + Playfair'de kalmak (konseptten sapar, elendi).

## ADR-020: Birincil tema açık ("gözlem defteri"); karanlık ikinci tema
**Tarih**: 2026-09-03 · **Durum**: Kabul
- **Bağlam**: ADR-015 iki temayı eşit üretip birincili sonra seçmeyi söylüyordu (S15). Konsept panosu iki temayı da verdi.
- **Karar (kullanıcı)**: Birincil tema **açık**: krem kâğıt (#f5ead8), koyu mürekkep, terracotta vurgu. CSS varsayılanı açık; karanlık tema sistem tercihi (`prefers-color-scheme: dark`) ve `data-theme="dark"` ile gelir. Tema anahtarı Hafta 2'de.
- **Gerekçe**: Kullanıcı tercihi. Açık temada gövde metni 15.4:1, ikincil 5.6:1; `text-muted` (3.7:1) yalnızca etiketlerde kullanılır, gövdede kullanılmaz.
- **Sonuçlar**: `web/app/globals.css` ve `resource/design/tokens.json` güncellendi. Vurgu rengi kâğıt üstünde 3:1: buton/çizgi için yeterli, metin için `--accent-text` (#8c491a) kullanılır. Karanlık tema ikinci sınıf değildir; her bileşen iki temada test edilir.
- **Alternatifler**: Karanlık birincil (konsept panosunun önerisi; elendi).

## Şablon (yeni karar için)

```
## ADR-0NN: Başlık
**Tarih**: YYYY-MM-DD · **Durum**: Öneri | Kabul | Geçersiz (bkz. ADR-0MM)
- **Bağlam**:
- **Karar**:
- **Gerekçe**:
- **Sonuçlar**:
- **Alternatifler**:
```
