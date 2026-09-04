# 09 — Kararlar (ADR)

Yalnızca **hâlâ bağlayıcı** kararlar; koda gömülmüş olanlar silindi (son temizlik 2026-09-04: ADR-012,
015, 017, 019, 020, 022, 023, 026, 027, 028, 030, 031, 032; küre serisi ADR-024'e, yıl yazımı ADR-004'e,
tema ADR-029'a katlandı; font ve token kuralları `CLAUDE.md`'de). Bir karar değişirse yeni ADR yazılır,
eskisi silinir ya da "Geçersiz, bkz. ADR-N" olur. Format: Bağlam → Karar → Gerekçe → Sonuçlar.

## ADR-001: Önce web, mobil sonra

Yalnızca mobil uyumlu web; Flutter uygulaması ihtiyaç doğunca. Link paylaşmak uygulama indirtmekten
kolay, Google'da bulunmak için web şart. Veri katmanı Flutter'a hazır; `mobile/` boş kalır.

## ADR-002: Next.js + Supabase, ayrı backend yok

Backend mantığı server action + RLS + Postgres fonksiyonları. **Gelecek yolu**: ücretsiz katman yetmezse
Go ile kendi backend; iş mantığı Postgres'te ve script'lerde tutulduğu için aynı Postgres'e bağlanır.

## ADR-003: Çeviriler veritabanında, dil başına satır

Her varlık için `*_translations (id, locale, ...)`, JSON sütunu değil: dil başına arama, eksik dil raporu
ve satır bazlı çeviri durumu (`machine`/`reviewed`) SQL ile kolay olsun diye.

## ADR-004: Yıl = tamsayı, negatif = MÖ, sıfır yılı yok

MÖ 585 = -585; MÖ 1 = -1; MS 1 = 1. `formatYear.ts` tek doğruluk noktası; aradaki yıl sayısında
1 düzeltmesi. Yaklaşık yıl tam kelimeyle (`around`/`yaklaşık`), kısaltmayla değil; `formatYearParts`
qualifier + value diye böler, yıl sayfanın en büyük ögesi kalır. BCE/CE, BC/AD değil.

## ADR-005: Slug dilden bağımsız, İngilizce

`/ky/event/newton-principia`. Dil değiştirince aynı sayfada kalmak ve `hreflang` için.

## ADR-006: Keşfet kanvası ikinci görünüm, ölçek fonksiyonu ortak

Ana sayfadaki zaman şeridi ve ileride gerçek ölçekli Keşfet kanvası (Faz D) aynı `lib/timeline/xScale.ts`'i
kullanır. `importance` alanı zorunlu ve anlamlı olmalı: zoom seviyesinde görünürlüğü o belirler.

## ADR-007: Bağlantılar tek yönlü saklanır (`builds_on`)

`event_links` sadece "A, B'ye dayanır" saklar; ters yön aynı satırın okunuşu. `contradicts` ve `parallel`
simetriktir: küçük id'den büyüğe tek satır.

## ADR-008: Makine çevirisi gizlenmez, rozetle yayınlanır

`status='machine'` çeviriler "otomatik çeviri" rozetiyle görünür. "Hiç yok"tansa "var ama otomatik".

## ADR-009: Kaynak dil olay başına

`events.source_locale`. Hat İngilizce üretir; kullanıcı Kırgızca/Türkçe yazar. Çeviri hattı buradan okur.

## ADR-010: Taslaklar veritabanı seviyesinde gizli (RLS)

Anonim `select` yalnızca `status='published' and deleted_at is null`. Frontend filtresi ikinci kilit.

## ADR-011: Görsel lisans alanları zorunlu

Atıf + lisans + kaynak URL boş bırakılamaz. Sonradan toplamak imkânsız.

## ADR-013: İngilizce önce yayın, sonra ky, tr, ru

Kaynaklar İngilizce, hat İngilizce üretir. Diğer üç dil rozetli makine çevirisiyle, insan onayı sırayla.

## ADR-014: Otomatik içerik hattı — Claude taslak yazar, insan onayı şart

GitHub Actions cron + `draft-next.ts` + Claude API (web search) → `status='review'`, `drafted_by='ai'`,
kaynaklar ve araştırma notu. **Script asla `published` yazmaz.** Kapatma anahtarı ve "kuyrukta 10+ varsa
üretme" kuralı. (Faz B)

## ADR-016: Hedef cihaz modern telefonlar

Son 4-5 yılın cihazları; eski Android için özel optimizasyon yok. Lighthouse mobil 90 hedefi.

## ADR-018: Admin arayüzü 4 dilde

`messages/{locale}.json` `admin` ad alanı. Yeni admin ekranı dört dilde eklenir, sonradan çevrilmez.

## ADR-021: Site okumaları etiketli veri önbelleğinde; `cacheComponents` ertelendi

Ziyaretçi okumaları çerezsiz anon client ile (`lib/supabase/anon.ts`), `unstable_cache` + `timeline` ve
`event:{slug}` etiketleri, yedek `revalidate: 300`; admin kaydetme `updateTag` çağırır. `cacheComponents`
tüm render modelini değiştirdiği için Faz C performans turuna ertelendi; geçilirse yalnızca `lib/queries/`
değişir.

## ADR-024: Ana sayfa = küre + zaman şeridi

**2026-09-04 · Kabul** (eski 024, 026, 027, 028, 030, 032'nin toplamı)

- **Karar**: Ana sayfa tam ekran bir gökyüzü; NASA Blue Marble (batimetrili) fotoğrafını giyen bir küre
  ve ayağında gerçek ölçekli zaman şeridi + olay kartları. Olayın yeri **her zaman merkezde**; giriş
  animasyonu yok; her olay derin bağlantılı (`?event=slug`). `/timeline` yok, ana sayfaya yönlenir.
  Küre WebGL2 shader'da çizilir (`lib/globe/webgl.ts`), WebGL yoksa `sphere.ts` CPU yedeği; pinler, yol
  ve belirsizlik çemberleri Canvas 2D'de. İşaretler kızıl + koyu konturlu (fotoğrafta bulunmayan tek renk);
  belirsizliği renk değil **kesikli çizgi** taşır. Dürüstlük bandı ana sayfada "!" rozetinin arkasında,
  diğer sayfalarda paragraf. Doku kaynağı ve lisansı `Globe.tsx` ve `lib/report.ts`'te.
- **Gerekçe**: Site "ne zaman"a cevap veriyordu; bilim tarihinin en çarpıcı hikâyesi coğrafi (İskenderiye
  → Bağdat → Semerkant → Londra). Elli olay dikey akışta boş görünüyordu; yatay şerit dolu hissettirir.
  Üç.js gibi bir katman yok: ~200 satır shader.
- **Sonuçlar / beta sinyalleri**: "Dürüstlük bandını görmedim" gelirse rozet paragrafa döner. Disiplin
  filtresi, minimap ve zaman boşluğu işaretleri `/timeline` ile gitti; istenirse şeridin üstüne. Şerit
  gerçek telefonda denenmedi. Lighthouse bu renderer ile ölçülmeli.

## ADR-025: Yer belirsizliği yıl belirsizliğinin desenini izler

`place_precision`: `exact` · `city` · `region` · `continent` · `unknown`. Belirsizlik veride, sözcük
UI'dan (`messages/*.json`); `place_name` çıplak ad ("Semerkant"). `unknown` ise koordinat olamaz, değilse
zorunlu (`place_needs_coords`). Kürede `exact`/`city` nokta, `region`/`continent` kesikli çember (en az
22 px), `unknown` pin yok. Yer metnini biçimleyen tek yer `formatPlace.ts`.

## ADR-029: Tek tema, koyu

Açık tema, tema düğmesi ve `data-theme` silindi; `globals.css` yalnızca koyu paleti tanımlar. Kullanıcı
kararı. **Karşı görüş (kayda geçsin)**: koyu zeminde uzun metin birçok kişi için daha yorucudur
(astigmat, halation); olay sayfaları uzun metin taşıyor. Beta'da okuma yorgunluğu geri bildirimi gelirse
ilk bakılacak yer burası; açık palet `git log`'da, geri getirmek bir commit.

---

## Şablon

```
## ADR-0NN: Başlık
**YYYY-MM-DD · Kabul | Geçersiz (bkz. ADR-0MM)**
- **Bağlam**:
- **Karar**:
- **Gerekçe**:
- **Sonuçlar**:
```
