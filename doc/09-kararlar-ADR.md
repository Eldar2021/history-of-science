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

## ADR-006: Timeline ölçeği olay sıralı + gerçek ölçekli minimap
**Tarih**: 2026-09-02 · **Durum**: Kabul
- **Karar**: Ana akış olayları eşit aralıkla dizer, büyük boşluklarda "zaman boşluğu" işareti; minimap gerçek ölçek.
- **Gerekçe**: 05-timeline-ux'teki değerlendirme. Doğrusal ölçek kullanılamaz, logaritmik anlaşılmaz, kanvas riskli.
- **Sonuçlar**: Yakınlaştırılabilir kanvas 6. ay+ için not.

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

## ADR-009: Kaynak dil Türkçe (geçici)
**Tarih**: 2026-09-02 · **Durum**: Öneri, senin onayını bekliyor
- **Karar**: `source_locale` varsayılanı `tr`. Sen Türkçe yazarsın, hat diğer üçüne çevirir.
- **Gerekçe**: Ses tonu en doğal ana dilinde çıkar. İngilizce ile daha rahatsan `en` yap; kod değişmez.

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
