# 09 — Kararlar (ADR)

Yalnızca **hâlâ bağlayıcı** kararlar. İşi bitmiş ve koda gömülmüş kararlar buradan çıkarıldı
(2026-09-04: ADR-012 isim, ADR-015 iki tema, ADR-017 dürüstlük bandı → `README.md`).
Bir karar değişirse yeni ADR yazılır, eskisi "Geçersiz, bkz. ADR-N" olur ya da silinir.

Format: Bağlam → Karar → Gerekçe → Sonuçlar.

---

## ADR-001: Önce web, mobil sonra

**2026-09-02 · Kabul** — İlk 3 ay yalnızca mobil uyumlu web; Flutter uygulaması 5. ay+.
Bir link paylaşmak uygulama indirtmekten 100 kat kolay; Google'da bulunmak için web şart. Veri katmanı
(Supabase) Flutter'a hazır olduğundan sonra eklemek ucuz. `mobile/` boş kalır, tasarım mobil-önce.

## ADR-002: Next.js + Supabase, ayrı backend yok

**2026-09-02 · Kabul** — Next.js (site + admin) + Supabase (Postgres, Auth, Storage). Backend mantığı
server action + RLS + Postgres fonksiyonları. İki servis, ikisi de yönetilen; ayrı API sunucusu 3 ayda
değer katmaz.
**Gelecek yolu**: ücretsiz katman yetmezse ya da kontrol istenirse Go ile kendi backend. Hazırlık: iş
mantığı Postgres'te ve script'lerde, Supabase'e özgü yalnızca Auth/Storage. Geçişte Go API aynı Postgres'e
bağlanır, Next.js sorguları oraya yönlenir.

## ADR-003: Çeviriler veritabanında, dil başına satır

**2026-09-02 · Kabul** — Her varlık için `*_translations (id, locale, ...)` tablosu, JSON sütunu değil.
Dil başına arama (`tsvector`), eksik dil raporu ve satır bazlı çeviri durumu (`machine`/`reviewed`) SQL
ile kolay olsun diye. Sorgular join ister; Postgres fonksiyonlarıyla soyutlanır.

## ADR-004: Yıl = tamsayı, negatif = MÖ, sıfır yılı yok

**2026-09-02 · Kabul** — MÖ 585 = -585; MÖ 1 = -1; MS 1 = 1. Tarih tipi MÖ'yi ve belirsizliği kötü taşır;
aya/güne ihtiyaç yok. `formatYear` tek doğruluk noktası. Aradaki yıl sayısında 1 düzeltmesi uygulanır
(`yearsBetween`), test edilir.

## ADR-005: Slug dilden bağımsız, İngilizce

**2026-09-02 · Kabul** — `/ky/event/newton-principia`. Dil başına slug yok: dil değiştirince aynı sayfada
kalmak, `hreflang` eşleştirmesi ve link sadeliği için. Dil başına slug'ın SEO faydası bu ölçekte önemsiz.

## ADR-006: İki görünüm — Akış ve gerçek ölçekli Keşfet kanvası

**2026-09-02 · Kabul** — Varsayılan Akış: olaylar eşit aralıklı, büyük boşluklarda "zaman boşluğu"
işareti, gerçek ölçekli minimap. İkinci görünüm Keşfet: gerçek ölçekli, anlamsal yakınlaştırmalı kanvas,
disiplin şeritli (Hafta 11-12).
Riski sıralamayla yönetiyoruz: Akış önce, kanvas gecikirse site çalışır. Minimap ve kanvas aynı ölçek
fonksiyonunu (`lib/timeline/xScale.ts`) paylaşır; kod tekrarı yok.
**Sonuç**: `importance` alanı zorunlu ve anlamlı olmalı — zoom seviyesinde görünürlüğü o belirler.

## ADR-007: Bağlantılar tek yönlü saklanır (`builds_on`)

**2026-09-02 · Kabul** — `event_links` sadece "A, B'ye dayanır" saklar; "B, A'yı mümkün kıldı" aynı
satırın ters okunuşudur. Çift kayıt tutarsızlık doğurur; UI iki yönü de sorguyla üretir. `contradicts` ve
`parallel` simetriktir: küçük id'den büyüğe tek satır.

## ADR-008: Makine çevirisi gizlenmez, rozetle yayınlanır

**2026-09-02 · Kabul** — `status='machine'` çeviriler sitede küçük "otomatik çeviri" rozetiyle görünür.
Dürüstlük ilkesi: Kırgızca ve Rusça okuyucuya "hiç yok"tansa "var ama otomatik" daha faydalı, rozet geri
bildirim davetidir. Gözden geçirilince rozet kaybolur.

## ADR-009: Kaynak dil olay başına

**2026-09-02 · Kabul** — `events.source_locale`. Otomatik hat İngilizce üretir; sen Kırgızca ve Türkçe
yazarsın, içinde çevrilmemiş İngilizce terim olabilir. Çeviri hattı kaynak dili olaydan okur.

## ADR-010: Taslaklar veritabanı seviyesinde gizli (RLS)

**2026-09-02 · Kabul** — Anonim rolün `select` politikası `status='published' and deleted_at is null`
koşullu. Frontend'de bir `where` unutulsa bile taslak sızmaz. Admin önizlemesi için ayrı, kimlik
doğrulamalı sorgu gerekir.

## ADR-011: Görsel lisans alanları zorunlu

**2026-09-02 · Kabul** — Görsel yüklenirse atıf + lisans + kaynak URL boş bırakılamaz. Telif sorunu siteyi
kapatabilir; sonradan toplamak imkânsız.

## ADR-013: İngilizce önce yayın, sonra ky, tr, ru

**2026-09-02 · Kabul** — Kapalı beta ve lansman İngilizce içerikle; diğer üç dil rozetli makine
çevirisiyle, insan onayı sırayla. Kaynaklar İngilizce, otomatik hat İngilizce üretir, hızlı yayın.
Tasarım ve veri modeli baştan dört dilli; yalnızca içerik sırası değişir.

## ADR-014: Otomatik içerik hattı — Claude taslak yazar, insan onayı şart

**2026-09-02 · Kabul** — GitHub Actions cron + `backend/scripts/draft-next.ts` + Claude API (web search).
Sonuç `status='review'`, `drafted_by='ai'`, kaynaklar ve araştırma notuyla. Telegram bildirimi.
**Yayın kararı yalnızca insan**: script asla `published` yazmaz. Doğrulama süresi olay başına 45 dakikadan
10 dakikaya iner. Kapatma anahtarı ve "kuyrukta 10+ varsa üretme" kuralı var.

## ADR-016: Hedef cihaz modern telefonlar

**2026-09-02 · Kabul** — Son 4-5 yılın cihazları hedef; eski Android için özel optimizasyon yok.
Lighthouse 90 hedefi kalır, modern cihazda akıcılığın göstergesi olarak.

## ADR-018: Admin arayüzü 4 dilde

**2026-09-02 · Kabul** — Admin de `messages/{locale}.json` içindeki `admin` ad alanıyla en/ky/tr/ru.
Kırgızca öğretmen ve Rusça gözden geçirici `editor` rolüyle kendi dillerinde çalışsın diye. **Yeni admin
ekranı dört dilde eklenir**, sonradan çevrilmez.

## ADR-019: Tasarım sistemi — Uchkun Foundation, Literata + Golos Text

**2026-09-03 · Kabul** — Token kaynağı `resource/design/tokens.json`; oradan `web/app/globals.css`'e elle
aktarılır, ikisi birlikte güncellenir. Fontlar **Golos Text** (gövde) + **Literata** (yıl, çağ, başlık),
ikisi de `cyrillic-ext` alt kümesiyle (Ң Ө Ү). Boşluk ölçeği tek düğme: `--spacing: 0.275rem`.
Çağların kendi rengi yok; çağ etiketleri adaçayı (`--sage`). Font değişince `Ңөү` görsel testi tekrarlanır.
Keşfet kanvası için çağ renk paleti ayrı bir tasarım turunda istenecek.

## ADR-020: Birincil tema açık ("gözlem defteri")

**2026-09-03 · Kabul** — Krem kâğıt (#f5ead8), koyu mürekkep, terracotta vurgu. Karanlık tema ikinci sınıf
değildir; her bileşen iki temada test edilir. Açık temada gövde metni 15.4:1, ikincil 5.6:1; `text-muted`
(3.7:1) yalnızca etiketlerde, gövdede kullanılmaz. Vurgu rengi kâğıt üstünde 3:1 — buton ve çizgi için
yeterli, metin için `--accent-text` (#8c491a) kullanılır.
Karanlığa geçiş kuralı ADR-022 ile değişti.

## ADR-021: Site okumaları etiketli veri önbelleğinde; `cacheComponents` ertelendi

**2026-09-03 · Kabul** — (1) Ziyaretçi okumaları çerezsiz **anon client** ile (`lib/supabase/anon.ts`):
RLS ziyaretçi olarak uygulanır, giriş yapmış admin de sitede taslak görmez. (2) Bu okumalar
`unstable_cache` ile `timeline` ve `event:{slug}` etiketlerinde; yedek `revalidate: 300`. (3) Admin
kaydetme action'ı `updateTag` çağırır (slug değiştiyse eskisini de). (4) `cacheComponents` şimdilik
kapalı.
`cacheComponents` tüm uygulamanın render modelini değiştirir (her dinamik API Suspense sınırı ister,
kesişen rota ve derin bağlantılar yeniden test edilir). Hafta 8 performans turunda değerlendirilir;
geçilirse yalnızca `lib/queries/` içindeki dört fonksiyon değişir.
**Not**: Next 16'da `revalidateTag` ikinci argüman ister; server action içinde `updateTag` kullanılır.

## ADR-022: Açık tema tek varsayılan; işletim sistemi tercihi okunmuyor

**2026-09-04 · Kabul**

- **Bağlam**: ADR-020 açık temayı birincil yaptı ama karanlık tema `prefers-color-scheme: dark` ile de
  geliyordu. Sonuç: kullanıcının telefonu/masaüstü karanlıktaysa site karanlık açılıyordu ve işletim
  sistemi gün içinde tema değiştirdiğinde site kendiliğinden açıktan karanlığa atlıyordu.
- **Karar**: `prefers-color-scheme` medya sorgusu kaldırıldı. Açık tema tek varsayılan; karanlık tema
  yalnızca kullanıcı başlıktaki anahtara bastığında gelir (`data-theme="dark"` + `localStorage`).
- **Gerekçe**: Öngörülebilirlik. Sitenin kimliği "gözlem defteri"; ilk izlenim her ziyaretçide aynı olmalı.
  Kendiliğinden değişen tema hata gibi okunuyordu.
- **Sonuçlar**: Karanlık temayı isteyen her tarayıcıda bir kez anahtara basar, seçim orada kalır. Karanlık
  tema token'ları ve testleri aynen duruyor. Tercihi otomatik almak ileride istenirse ayrı bir "sistem"
  üçüncü durumu olarak eklenir, varsayılan olarak değil.

## ADR-023: Yıl metninde kısaltma yok; çağ kısaltması açıklanır

**2026-09-04 · Kabul**

- **Bağlam**: Site `c. 585 BCE` yazıyordu. "c." (circa) Britannica standardı ama sitenin kitlesi bilim
  insanı değil; kullanıcı bunu hata sandı. "BCE" de kendi başına okunmuyordu.
- **Karar**: (1) Yaklaşık yıl tam kelimeyle: `around` / `yaklaşık` / `около` / `болжол менен`.
  (2) `formatYearParts` yılı `qualifier` + `value` diye ikiye böler; kart ve detay `qualifier`'ı küçük
  puntoda üste koyar, böylece yıl sayfanın en büyük ögesi kalır ve telefonda satır kırılmaz.
  (3) Çağ kısaltması kısa kalır ama açılımı (`eraNote`) `<time>` üzerinde tooltip olur ve timeline'da
  olay sayısının yanında bir kez yazılır ("BCE = before the common era"). BCE/CE korunur, BC/AD'ye
  dönülmez.
- **Gerekçe**: 03'teki ses tonu kuralı — okuyucunun çözmesi gereken kısaltma kullanma. Tam kelime tek
  başına yılı iki satıra düşürüyordu; parçalara bölmek hem okunurluğu hem tipografik hiyerarşiyi korudu.
- **Sonuçlar**: `formatYear` hâlâ tek string döndürür (aria-label, sayfa başlığı, e-posta konusu için).
  Yeni yıl gösteren her yer `formatYearParts` kullanmalı. `06`'daki yıl tablosu güncellendi.

---

## ADR-024: Ana sayfa tam ekran bir küre; timeline'a kapı

**2026-09-04 · Kabul**

- **Bağlam**: Ana sayfa "herhangi bir site" gibi duruyordu (S16'dan beri kullanıcının açık şikâyeti).
  Site tek soruya cevap veriyordu: **ne zaman**. Bilim tarihinin en çarpıcı hikâyelerinden biri ise
  coğrafi: bilgi merkezinin İskenderiye → Bağdat → Semerkant → Mainz → Londra diye göç etmesi. Hiçbir
  zaman çizelgesi bunu gösteremez.
- **Karar**: Ana sayfa (`/[locale]`) tam ekran, stilize (dokusuz, noktalı) bir küre olur. Olayın yeri
  **her zaman ekranın merkezinde** durur; kart merkeze bakan kuyruklu bir balon olarak açılır; karta
  tıklamak mevcut yandan sheet'i açar. İleri/geri düğmeleri (+ klavye okları, mobilde kaydırma) 43+
  olayın tamamını kronolojik olarak dolaşır ve gidilen yol küre üzerinde soluk yaylar olarak birikir.
  Açılışta **giriş animasyonu yok**: küre ilk olayın yerine dönmüş hâlde gelir. Sinematik gezinti
  isteyen için varsayılanı kapalı bir "Turu oynat" düğmesi olur. Tek çıkış kapısı: "Tüm zaman
  çizelgesini keşfet" → `/[locale]/timeline`.
- **Gerekçe**: Kullanıcının ilk fikri 2026'dan MÖ 585'e geri sayan bir açılış animasyonu içeriyordu;
  tartışmada bundan vazgeçildi çünkü zorunlu bekleme ekranı en çok terk ettiren şeydir ve 2600 yılı
  lineer saymak 40 saniye sürüyordu. Stilize küre gerçekçi doku yerine seçildi: WebGL paketi ve 1-2 MB
  Dünya dokusu mobil performans bütçesini zorluyordu, ayrıca noktalı küre sitenin sade estetiğine ve
  açık temaya (ADR-020, ADR-022) daha iyi oturuyor — küre kendi koyu "uzay" bandında yaşar, sayfanın
  kalanı aydınlık kalır.
- **Sonuçlar**: Küre yalnızca ilerlemeli bir katman: ilk boyamada ilk olayın metni sunucudan gerçek
  HTML olarak gelir (SEO + JS'siz durum), LCP statik bir küre görselidir, WebGL yoksa veya
  `prefers-reduced-motion` açıksa sabit görsel + kart gösterilir ve düğmeler yine çalışır. Her olay
  derin bağlantılıdır (`?event=slug`), tarayıcı geri tuşu çalışır. Yer verisi ADR-025'te.
  `08`'deki "Hafta 8 ana sayfa yeniden tasarımı" maddesi bu karara dönüştü.

---

## ADR-025: Yer belirsizliği yıl belirsizliğinin desenini izler

**2026-09-04 · Kabul**

- **Bağlam**: Küre bir noktaya kamera götürmek zorunda, ama bazı olayların yeri gerçekten bilinmiyor:
  al-Biruni'nin Dünya'nın yarıçapını ölçtüğü tepe Pencap'ta bir yerdedir, hangisi olduğu belirsiz.
  Bunu gizlemek sitenin dürüstlük ilkesine aykırı olurdu.
- **Karar**: Yıl için `year_precision` ne yapıyorsa yer için `place_precision` aynısını yapar:
  `exact` (tespit edilmiş yapı/alan) · `city` · `region` · `continent` · `unknown`. Belirsizlik
  **veride** durur, sözcük **UI'dan** gelir: `place_name` çıplak addır ("Semerkant"), "civarı" /
  "around" / "bir yerde" ekleri `messages/*.json`'dan eklenir. Kürede `exact`/`city` net bir pin,
  `region`/`continent` yarıçapı kesinliğe göre büyüyen kesikli bir çember, `unknown` pin yok +
  küre geri çekilmiş olur. Renk **kırmızı değildir**: kırmızı "hata" demektir, bu ise bilgi eksikliği.
  Kısıt: `unknown` ise koordinat olamaz, değilse zorunludur (`place_needs_coords`).
- **Gerekçe**: ADR-023 ile birebir aynı mantık — okuyucunun çözmesi gereken kısaltma ya da uydurulmuş
  kesinlik yok. Enum'u veride tutmak, ileride "MÖ 9000 civarı tarım" gibi olayları kıta düzeyinde
  gösterebilmemizi sağlar; koordinatı uydurmak zorunda kalmayız.
- **Sonuçlar**: Migration 0003 şemayı, 0004 ilk 43 olayın backfill'ini taşır; bundan sonra yer
  `/admin` formundan girilir. `continent` ve `unknown` henüz hiçbir olayda kullanılmıyor ama küre
  ikisini de çizmek zorundadır — tarih öncesi olaylar geldiğinde gerekecek. Yer metnini biçimleyen
  tek yer `formatPlace.ts` olur (`formatYear.ts` ile aynı kural).

---

## ADR-026: Küre bir fotoğraf; nokta haritası kaldırıldı

**2026-09-04 · Kabul**

- **Bağlam**: İlk küre karayı 1°'lik bir maskeden üretilen noktalarla çiziyordu. Kullanıcı canlıda
  denedi ve iki şey söyledi: küre 2D duruyor, kıtalarda hatalar var. İkisi de doğruydu — maske
  kıyıları yarım derece şişiriyor, ince yarımadaları yutuyordu; dönmeyen ve elle çevrilemeyen bir
  nokta bulutu da göz için düz bir daire. Kullanıcı NASA'nın `solarsystem.nasa.gov/gltf_embed/2393`
  küresini önerdi.
- **Karar**: Küre artık NASA Blue Marble fotoğrafını giyiyor (`land_shallow_topo_2048.jpg`,
  2048×1024, **238 KB**, `web/public/globe/`). Çizim yine kendi Canvas 2D'imiz: `sphere.ts` diskin
  her pikseli için ortografik izdüşümü tersine çevirip eşlek dikdörtgen dokudan okuyor ve tek bir
  ışıkla gölgeliyor. Nokta üreteci, kara maskesi ve üç build-time bağımlılığı (`d3-geo`,
  `topojson-client`, `world-atlas`) silindi.
- **Gerekçe**: NASA'nın **modeli** 12,9 MB — bizim tüm küremiz 11 KB'dı; mobil performans bütçesini
  (M2: Lighthouse 90+) tek başına bitirirdi. Embed'i iframe ile gömmek teknik olarak mümkün ama
  işe yaramaz: o çerçeveyi Semerkant'a çeviremeyiz ve üstüne kendi pinlerimizi koyamayız, yani
  özelliğin kendisi kaybolur. NASA'nın **görüntüsü** ise telifsiz (CC0 muadili) ve boyutunu biz
  seçiyoruz. Böylece coğrafya foto gerçekliğinde doğru, "maske hatası" diye bir kategori kalmıyor,
  ışık ve terminatör küreyi top gibi gösteriyor — üstelik pinler, belirsizlik çemberleri, kart ve
  elle çevirme olduğu gibi kalıyor, üç.js gibi bir katman gerekmiyor.
- **Sonuçlar**: Her pikselde bir arcsin ve bir arctan var; küre dönerken **%55 çözünürlükte** çizilip
  büyütülüyor, durunca son kare tam çözünürlükte. Fotoğraf yüklenene kadar sade ışıklı bir top
  çiziliyor, yüklenemezse de öyle kalıyor — pinler ve düğmeler her hâlükârda çalışıyor. Atıf
  kürenin altında görünür (kaynak URL'ye bağlı), lisans ve tam kaynak `Globe.tsx`'te
  `EARTH_TEXTURE`'ın yanında.

---

## ADR-027: Ana sayfa tam ekran bir gökyüzü; site kabuğu kürenin üstünde yüzer

**2026-09-04 · Kabul** · ADR-024'ün "küre kendi koyu bandında, sayfanın kalanı aydınlık" maddesini
geçersiz kılar; o kararın geri kalanı (küre = timeline'a kapı, yerin hep merkezde olması, kuyruklu
kart, ileri/geri) aynen geçerli.

- **Bağlam**: Küre NASA fotoğrafını giydikten sonra sayfanın kalanı ona yakışmıyordu: açık zeminli
  opak bir başlık çubuğu, altta bir kutu içinde uzun dürüstlük paragrafı, ve ekranın ancak bir
  kısmını kaplayan bir küre. Kullanıcı referans olarak `eyes.nasa.gov/apps/solar-system` verdi:
  saydam kabuk, siyah zemin, beyaz metin, tam ekran.
- **Karar**: Ana sayfa `100dvh`, neredeyse siyah (`#05070b`) bir gökyüzü; üzerinde sabit bir yıldız
  alanı var. Site başlığı kendi zemini ve çizgisi olmadan kürenin üstünde yüzüyor (`SiteHeader over`).
  Kart opak kutu değil, `backdrop-blur`'lu yarı saydam bir panel. **Dürüstlük bandı ana sayfada tek
  satıra iniyor** ("Bu siteyi bir tarihçi yazmadı." + hata bildirme bağlantısı); diğer tüm sayfalarda
  paragraf hâliyle duruyor. NASA atfı onun yanında.
- **Gerekçe**: Sayfadaki tek parlak şey Dünya olmalı; onunla yarışan her kutu küreyi bir bileşen gibi
  gösteriyordu. Dürüstlük ilkesinden **vazgeçilmedi**, yalnızca boyu değişti: itiraf da, hata bildirme
  bağlantısı da ekranda duruyor (README'deki ürün ilkesi korunuyor). Sitenin kalanı açık tema olarak
  kalıyor — ADR-020 ve ADR-022 değişmedi; koyu olan sayfa değil, uzay.
- **Sonuçlar**: Ana sayfa artık kaydırılmıyor, tek ekran. Olay sheet'i sitenin açık temasıyla kürenin
  üstünde açılıyor (kasıtlı kontrast). Tema düğmesi ana sayfada gözle görülür bir şey değiştirmiyor,
  çünkü gökyüzü temaya bağlı değil; sitenin geri kalanında çalışmaya devam ediyor.

---

## ADR-028: İşaretler kızıl, koyu konturlu

**2026-09-04 · Kabul** · ADR-025'in "renk kırmızı değildir" maddesini geçersiz kılar; o kararın geri
kalanı (yer kesinliği enumu, çıplak ad, kesikli çember, en az 22 piksel) aynen geçerli.

- **Bağlam**: Pinler disiplin rengindeydi ve aktif olan sitenin turuncu vurgu rengiydi. Dünya
  fotoğrafı gelince ikisi de kayboldu: Sahra, Arabistan ve Avustralya iç bölgeleri zaten sıcak
  sarı-turuncu. Kullanıcı işaretleri bulamadığını söyledi ve kızıl önerdi.
- **Karar**: Bütün işaretler kızıl (`--globe-marker`), aktif olan daha parlak ve haleli, diğerleri
  daha sönük. Her pinin altına **koyu bir kontur** çiziliyor; belirsizlik çemberinin kesikleri de
  önce koyu, sonra kızıl çiziliyor. Disiplin rengi kürede kullanılmıyor.
- **Gerekçe**: Kızıl, fotoğrafta bulunmayan tek renk; okyanusta, çölde, ormanda ve buzda aynı
  şekilde görünüyor. Kontur ise zemin ne olursa olsun kontrastı garantiliyor — asıl işi yapan o.
  Disiplin rengi 2,8 pikselde zaten okunmuyordu: sekiz tonu ayırt edebilen kimse yok, yani bilgi
  taşıdığını sanmak kendimizi kandırmaktı.
- **Sonuçlar**: ADR-025'teki "kırmızı hata demektir" gerekçesi artık geçerli değil, çünkü kızıl
  bu kürede **hata değil "yer"** demek: her pin kızıl. Belirsizliği taşıyan şey renk değil,
  **kesikli çizgi** — `exact` ve `city` düz bir nokta, `region` ve `continent` kesikli bir çember.
  Ayrım hâlâ görünür ve hâlâ dürüst.

---

## Şablon

```
## ADR-0NN: Başlık
**YYYY-MM-DD · Öneri | Kabul | Geçersiz (bkz. ADR-0MM)**
- **Bağlam**:
- **Karar**:
- **Gerekçe**:
- **Sonuçlar**:
```
