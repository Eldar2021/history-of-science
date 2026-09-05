# Kararlar (ADR)

Yalnızca **hâlâ bağlayıcı** kararlar. Koda tamamen gömülen, yapılıp biten ya da yerine yenisi geçen
ADR silinir; numaralar yeniden kullanılmaz, boşluk normaldir. Cevabı `git log`'da. Bir karar değişirse
yeni ADR yazılır. Format: Bağlam → Karar → Gerekçe → Sonuçlar.

## ADR-002: Next.js + Supabase, ayrı backend yok

Backend mantığı server action + RLS + Postgres fonksiyonları. **Gelecek yolu**: ücretsiz katman yetmezse
Go ile kendi backend; iş mantığı Postgres'te ve script'lerde tutulduğu için aynı Postgres'e bağlanır.

## ADR-004: Yıl = tamsayı, negatif = MÖ, sıfır yılı yok

MÖ 585 = -585; MÖ 1 = -1; MS 1 = 1. `formatYear.ts` tek doğruluk noktası; aradaki yıl sayısında
1 düzeltmesi. Yaklaşık yıl tam kelimeyle (`around`/`yaklaşık`), kısaltmayla değil; `formatYearParts`
qualifier + value diye böler, yıl sayfanın en büyük ögesi kalır. BCE/CE, BC/AD değil.

## ADR-005: Slug dilden bağımsız, İngilizce

`/ky/event/newton-principia`. Dil değiştirince aynı sayfada kalmak ve `hreflang` için.

## ADR-006: Keşfet kanvası ikinci görünüm, ölçek fonksiyonu ortak

Ana sayfadaki zaman şeridi ve ileride gerçek ölçekli Keşfet kanvası (Faz D) aynı `lib/timeline/xScale.ts`'i
kullanır. `importance` alanı zorunlu ve anlamlı olmalı: zoom seviyesinde görünürlüğü o belirler.

## ADR-008: Makine çevirisi gizlenmez, rozetle yayınlanır

`status='machine'` çeviriler "otomatik çeviri" rozetiyle görünür. "Hiç yok"tansa "var ama otomatik".

## ADR-011: Görsel lisans alanları zorunlu

Atıf + lisans + kaynak URL boş bırakılamaz. Sonradan toplamak imkânsız.

## ADR-014: Otomatik içerik hattı — Claude taslak yazar, insan onayı şart

GitHub Actions cron + `draft-next.ts` + Claude API (web search) → `status='review'`, `drafted_by='ai'`,
kaynaklar ve araştırma notu. **Script asla `published` yazmaz.** Kapatma anahtarı ve "kuyrukta 10+ varsa
üretme" kuralı. (Faz B)

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

## ADR-033: Olay gövdesi tam Markdown; okuyucuya bedeli yok

**2026-09-04 · Kabul**

- **Bağlam**: Gövde başından beri Markdown metni olarak saklanıyordu ama elle yazılmış küçük bir
  ayrıştırıcı yalnızca `###`, paragraf, `*eğik*` ve `**kalın**` tanıyordu. Bazı konular görsel, video,
  kod, formül ve "şu teori şu demek" kutusu istiyor.
- **Karar**: `react-markdown` + `remark-gfm` + `remark-math`/`rehype-katex`. Render `EventDetail`
  içinde, yani **sunucuda**: site paketine ayrıştırıcıdan tek bayt binmez (ölçüldü: 428 KB'lık öbek
  yalnızca admin rotalarında). Okuyucunun ödediği tek şey KaTeX stil dosyası (~28 KB ham).
  Ham HTML kapalı. GFM'nin üstüne üç sözleşme (`lib/content/remarkUchkun.ts`):
  `> [!NOT]` kutuları (GitHub'ın beşlisi + kendi `[!THEORY]`'miz), tek başına satırdaki YouTube adresi
  gömülü oynatıcı, tek başına satırdaki görsel künyeli `figure`.
- **Gerekçe**: Sözdizimi ödünç alındı, icat edilmedi: editör GitHub'da ne yazıyorsa burada da o.
  Görsel künyesi (`![alt](url "Yazar · Lisans · https://kaynak")`) Markdown görsellerinin atıf
  zorunluluğunu delmesini engeller — admin önizlemesi künyesizleri uyarır ama kaydı engellemez, çünkü
  taslağın yarım olma hakkı var.
- **Sonuçlar**: Şema değişmedi. `icerik.md`'deki "formül yok" kuralı **gövde metni** için sürüyor
  (anlatı formülle yapılmaz); `$...$` istisnai bir araç, kural değil. Admin gövde alanı GitHub'ın
  Write/Preview sekmelerini taşır ve önizleme siteyle **aynı bileşeni** kullanır, böylece ikisi
  ayrışamaz. `/admin/help/markdown` aynı bileşenle render edilen canlı bir kılavuz.

## ADR-034: Admin formu dört dili birden taşır; olayın her parçası admin'den düzenlenir

**2026-09-04 · Kabul**

- **Bağlam**: Form tek çeviri taşıyordu; dil değiştirmek tam sayfa gezinmeydi (`?locale=ru`) ve
  **kaydedilmemiş yazıyı sessizce siliyordu**. Kaynaklar, kişiler, `builds_on` bağlantıları ve kapak
  görseli ise formda hiç yoktu: 43 olayın kaynakları `drafts-to-sql.mjs` ile girilmişti, admin'den
  düzenlenemiyordu. `icerik.md` her olayda en az iki kaynak istiyor.
- **Karar**: `EventFormValues` tek çeviri yerine `Record<Locale, …>` tutar. Dört dilin alanları da
  DOM'da durur, sekmeler yalnızca hangisinin görüneceğine karar verir, tek kaydetme **metin taşıyan
  bütün dilleri** yazar. Boş bırakılan dil yazılmaz ve var olan çevirisi **silinmez**. Aynı formda
  kaynak, kişi, `builds_on` ve kapak görseli editörleri; tekrarlanan satırlar aynı alan adı altında
  paralel dizi olarak gönderilir. Kaydet listeye döner, "Kaydet ve kal" formda bırakır.
- **Gerekçe**: Veri kaybının kökü tek dilli formdu; sekmeyi client'a almak onu ortadan kaldırıyor.
  Kaynak ve görsel editörü olmadan içerik toplamaya geçmek, her olay için SQL yazmak demekti.
  Kişiler `people` tablosunda ortaktır: buradan kaydedilen ad o kişinin her olaydaki adıdır.
- **Sonuçlar**: Şema değişmedi. Doğrulama artık dil başına (`"<locale>.title"`), hatalı dil sekmede
  işaretlenir. Tarayıcı `required`'ı kalktı — gizli sekmedeki alana tarayıcı hata gösteremez, sunucu
  doğrular. **Bir dili tamamen boşaltmak o çeviriyi silmez**; silmek ayrı bir eylem ister (yapılmadı).
  `saveEvent` hâlâ işlem (transaction) değil: yarıda kalan kayıt aynı formdan tekrar kaydedince onarılır.
  Kapak görseli artık kova yolu **ya da** tam https adresi kabul eder (`lib/media.ts`).

## ADR-036: İçerik sıfırlandı; gece hattı ve kelime tavanının kalkması

**2026-09-06 · Kabul**

- **Bağlam**: 43 olay yayındaydı ama ölçüldüğünde tablo şuydu: **43/43 yalnızca İngilizce** (olay başına
  tam bir çeviri satırı), gövdeler **550-652 kelime** arasına sıkışmış (yani hepsi 600 tavanına yapışmış:
  sınır malzemeyi değil, malzeme sınırı takip etmiş), **0 kapak görseli, 0 gövde görseli, 0 video,
  0 kutu, 0 formül**, ve `people` tablosu boş — taslaklarda kişiler yazılıydı, eski hat onları hiç
  yazmamıştı. ADR-033 (Markdown, künyeli görsel, YouTube, KaTeX, kutular) bu 43 olay yazıldıktan
  **sonra** geldi; platform bugün istediğimiz her şeyi yapıyor, içerik ise o yetenekler yokken yazılmış.
- **Karar**: İçerik tablolarını boşalt (`events` cascade + `people`; `eras`, `disciplines`, `profiles`
  kalır), 43 eski taslağı sil, üretimi baştan kur:
  1. **`backend/content/top100.json`** üretim kuyruğu. `rank` = yazılma sırası, `importance` = zaman
     şeridindeki ağırlık; **ayrı iki şey**.
  2. **Gövde kelime tavanı kalktı.** Özetin 200 karakteri kaldı (yerleşim kuralı). Ölçü kelime sayısı
     değil dolgu yokluğu: her paragraf yeni bir olgu getirir.
  3. **Gece hattı** (yazılacak): Bişkek 22:00, elle de çalıştırılabilir. Veriyi doğrudan veritabanına
     `status='review'` yazar; **Telegram yalnızca haber verir**, içerik taşımaz.
  4. Sıradaki olay = "listede karşılığı veritabanında olmayan en düşük `rank`". **İmleç dosyası yok**;
     konum veritabanından türer, o yüzden gece koşusu ile elle koşu birbirini ezmez.
- **Gerekçe**: Silmeden önce yeni tarifin daha iyi olduğunu kanıtlamayı önerdim; kullanıcı site fiilen
  yayında olmadığı (yalnızca kendisi ve eşi test ediyor) için silmeyi seçti, bu da itirazın dayanağını
  ortadan kaldırdı. Telegram'dan dosya gönderip admin'e elle girmek olay başına ~32 kopyala-yapıştır
  demekti; hattın `review` yazması zaten mimarinin kuralı (ADR-014) ve insan onayını hiç zayıflatmıyor.
  `importance` puanları çağ-içi göreliydi: 135 adayı onlarla sıralayınca top 100'e tek bir "3"
  giremiyordu ve kesilenler tam da Hypatia, El-Farabi, Ömer Hayyam, Noether, Bell Burnell, Zhang Heng
  oluyordu — yani `icerik.md`'nin korumakla yükümlü olduğu isimler. Puanlar küresel ölçeğe çekildi ve
  bu altısı listeye alındı.
- **Sonuçlar**: **ADR-013 geçersiz**: yayın sırası artık "İngilizce önce, sonra ötekiler" değil; hat bir
  olayın dört dilini tek koşuda yazar. Şema değişmedi. Sıralama önem katmanları içinde çağlara yayılıyor: **ilk 9 olay 8 çağın
  hepsine dokunuyor**, site hiçbir aşamada yarım görünmüyor. Yeni dört dilli taslak sözleşmesi ve
  yükleyicisi `backend/scripts/draft-to-sql.mjs`; sözleşme doğrulaması yükleyicinin **içinde**, atlanamaz
  (özet uzunluğu, lisans bütünlüğü, kutu anahtarları, iki kaynak). Yükleyici `status <> 'published'`
  ile korumalı: insan bir olayı yayınladıktan sonra hat ona dokunamaz. `builds_on` hedefleri çoğu zaman
  henüz yok (sıra kronolojik değil); bağlantılar iki ucu da var olduğunda eklenir, bekleyen-bağlantı
  durumu hiçbir yerde tutulmaz. Eski format betikleri (`drafts-to-sql`, `check-drafts`,
  `fill-stubs-sql`) silindi. Kırgızca sözlüğü (`glossary.ky.json`) hat başlamadan önce gerekiyor:
  uzun gövde kötü Kırgızcayı büyütür.

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
