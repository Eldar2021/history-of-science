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

## ADR-014: İçeriği Claude yazar, yayın kararı insanındır

Hat `status='review'`, `drafted_by='ai'`, kaynaklar ve araştırma notu yazar. **Hiçbir betik `published`
yazmaz**; `published` yazan her kod insan eylemine bağlı olmalı. Kapatma anahtarı
(`CONTENT_PIPELINE_ENABLED`) ve "inceleme kuyruğunda 10 varsa üretme" kuralı hattın parçası.
Nasıl koştuğu ADR-039'da.

## ADR-018: Admin arayüzü 4 dilde

`messages/{locale}.json` `admin` ad alanı. Yeni admin ekranı dört dilde eklenir, sonradan çevrilmez.

## ADR-021: Site okumaları etiketli veri önbelleğinde; `cacheComponents` ertelendi

Ziyaretçi okumaları çerezsiz anon client ile (`lib/supabase/anon.ts`), `unstable_cache` + `timeline` ve
`event:{slug}` etiketleri, yedek `revalidate: 300`; admin kaydetme `updateTag` çağırır. `cacheComponents`
tüm render modelini değiştirdiği için Faz C performans turuna ertelendi; geçilirse yalnızca `lib/queries/`
değişir.

## ADR-024: Ana sayfa = küre + zaman şeridi

**2026-09-04 · Kabul** (eski 024, 026, 027, 028, 030, 032'nin toplamı)

- **Karar**: Ana sayfa tam ekran bir gökyüzü: dünya fotoğrafını giyen bir küre ve ayağında gerçek
  ölçekli zaman şeridi. Olayın yeri **her zaman merkezde**; giriş animasyonu yok; her olay derin
  bağlantılı (`?event=slug`). `/timeline` yok, ana sayfaya yönlenir. Belirsizliği renk değil **kesikli
  çizgi** taşır. Dürüstlük bandı ana sayfada "!" rozetinin arkasında, diğer sayfalarda paragraf.
- **Gerekçe**: Site "ne zaman"a cevap veriyordu; bilim tarihinin en çarpıcı hikâyesi coğrafi (İskenderiye
  → Bağdat → Semerkant → Londra). Elli olay dikey akışta boş görünüyordu; yatay şerit dolu hissettirir.
- **Geri dönüş sinyalleri**: "Dürüstlük bandını görmedim" gelirse rozet paragrafa döner. Disiplin
  filtresi ve minimap `/timeline` ile gitti; istenirse şeridin üstüne (`riskler.md`, Park).

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
- **Sonuçlar**: `icerik.md`'deki "formül yok" kuralı **gövde metni** için sürüyor
  (anlatı formülle yapılmaz); `$...$` istisnai bir araç, kural değil. Admin gövde alanı GitHub'ın
  Write/Preview sekmelerini taşır ve önizleme siteyle **aynı bileşeni** kullanır, böylece ikisi
  ayrışamaz. `/admin/help/markdown` aynı bileşenle render edilen canlı bir kılavuz.

## ADR-034: Admin formu dört dili birden taşır; olayın her parçası admin'den düzenlenir

**2026-09-04 · Kabul**

- **Karar**: Form dört dili birden taşır: hepsinin alanları DOM'da durur, sekmeler yalnızca hangisinin
  görüneceğine karar verir, tek kaydetme **metin taşıyan bütün dilleri** yazar. Olayın her parçası
  (kaynak, kişi, `builds_on`, kapak görseli) aynı formdan düzenlenir; hiçbiri için SQL yazılmaz.
  Kişiler `people` tablosunda ortaktır: buradan kaydedilen ad o kişinin her olaydaki adıdır.
- **Gerekçe**: Tek dilli form dil değiştirirken kaydedilmemiş yazıyı sessizce siliyordu; sekmeyi
  client'a almak veri kaybının kökünü kesti.
- **Hâlâ ısıran iki şey**: **bir dili tamamen boşaltmak o çeviriyi silmez** — silmek ayrı bir eylem
  ister ve yapılmadı. `saveEvent` işlem (transaction) **değil**: yarıda kalan kayıt aynı formdan tekrar
  kaydedince onarılır.

## ADR-036: İçerik sıfırlandı; gece hattı ve kelime tavanının kalkması

**2026-09-06 · Kabul**

- **Bağlam**: 43 olay yayındaydı ama hepsi yalnızca İngilizceydi, gövdeler 600 kelime tavanına
  yapışmıştı (sınır malzemeyi değil, malzeme sınırı takip etmişti) ve hiçbirinde görsel, video, kutu
  ya da kişi yoktu. ADR-033 bu 43 olay yazıldıktan **sonra** gelmişti: platform istediğimiz her şeyi
  yapıyordu, içerik ise o yetenekler yokken yazılmıştı.
- **Karar**: İçerik tabloları boşaltıldı (`events` cascade + `people`; `eras`, `disciplines`,
  `profiles` kaldı) ve üretim baştan kuruldu:
  1. **`backend/content/top100.json`** üretim kuyruğu. `rank` = yazılma sırası, `importance` = zaman
     şeridindeki ağırlık; **ayrı iki şey**.
  2. **Gövde kelime tavanı kalktı.** Özetin 200 karakteri kaldı (yerleşim kuralı). Ölçü kelime sayısı
     değil dolgu yokluğu: her paragraf yeni bir olgu getirir.
  3. **Gece hattı** (yazılacak): Bişkek 22:00, elle de çalıştırılabilir. Veriyi doğrudan veritabanına
     `status='review'` yazar; **Telegram yalnızca haber verir**, içerik taşımaz.
  4. Sıradaki olay = "listede karşılığı veritabanında olmayan en düşük `rank`". **İmleç dosyası yok**;
     konum veritabanından türer, o yüzden gece koşusu ile elle koşu birbirini ezmez.
- **Gerekçe**: Silmeden önce yeni tarifin daha iyi olduğunu kanıtlamayı önerdim; kullanıcı site fiilen
  yayında olmadığı için silmeyi seçti ve bu itirazın dayanağını ortadan kaldırdı. `importance` puanları
  çağ-içi göreliydi ve o ölçekle top 100'den kesilenler tam da Hypatia, El-Farabi, Ömer Hayyam, Noether,
  Bell Burnell, Zhang Heng oluyordu — `icerik.md`'nin korumakla yükümlü olduğu isimler. Puanlar küresel
  ölçeğe çekildi, altısı da listede.
- **Sonuçlar**: Yayın sırası artık "İngilizce önce" değil; hat bir olayın dört dilini tek koşuda yazar.
  Şema değişmedi. Sıralama önem katmanları içinde çağlara yayılıyor: **ilk 9 olay 8 çağın hepsine
  dokunuyor**, site hiçbir aşamada yarım görünmüyor. Sözleşme doğrulaması yükleyicinin (`draft-to-sql.mjs`)
  **içinde**, atlanamaz: özet uzunluğu, lisans bütünlüğü, kutu anahtarları, iki kaynak. Yükleyici
  `status <> 'published'` ile korumalı, yani insan yayınladıktan sonra hat o olaya dokunamaz. `builds_on`
  hedefleri çoğu zaman henüz yok (sıra kronolojik değil); bağlantı iki ucu da var olduğunda eklenir,
  bekleyen-bağlantı durumu hiçbir yerde tutulmaz.

---

## ADR-037: Fixture geri düşüşü yok; ortam değişkeni eksikse site çöker

**2026-09-06 · Kabul**

- **Bağlam**: Ortam değişkeni eksikse sorgular sessizce fixture'a düşüyordu ve olay sayfaları build'de
  basıldığı için canlıda **10 uydurma olay gerçek statik sayfa olarak** yayınlandı.
- **Karar**: Fixture dosyası silindi. İki değişken tek kapıdan okunuyor (`lib/supabase/env.ts`):
  `requireSupabaseEnv()` eksik olanın adını söyleyerek hata fırlatır, `hasSupabaseEnv()` yalnızca
  değişkensiz de anlamlı olan iki yerde kalır — admin'i `?error=noEnv`'e yollayan `proxy.ts` ve
  oturumu olmayan `lib/auth.ts`. Ziyaretçi okumalarında geri düşüş yok: değişken yoksa build patlar.
- **Gerekçe**: Yanlış içerik yayınlamaktansa hiç yayınlamamak yeğdir; sessiz geri düşüş hatayı
  gizlediği için tehlikeliydi. "Veritabanı yokken site çalışsın" gerekçesi veritabanı kurulduğunda
  öldü, fixture'ı canlı tutan tek şey buydu.
- **Sonuçlar**: Değişkensiz `npm run build` artık başarısız olur — istenen davranış budur. Vercel ve CI
  (e2e işi yerel Supabase kurar) değişkenleri zaten veriyor. `getEventDetail` bir daha asla uydurma
  olay döndürmez; `generateStaticParams` içindeki env kontrolü de kalktı.

---

## ADR-039: Hat, ölçülen API'yi değil Claude Code aboneliğini kullanır

**2026-09-06 · Kabul**

- **Bağlam**: ADR-014 hattı `ANTHROPIC_API_KEY` ile Claude API'ye bağlıyordu: her koşu token başına
  ayrı bir fatura demekti. Kullanıcı Claude Code'a zaten aylık ödüyor ve ikinci bir ödeme kalemi
  istemedi. Hattın gerçekten LLM'e ihtiyaç duyan kısmı da sanıldığından küçük: sıradaki olayı bulmak,
  Commons lisansını okumak, sözleşmeyi doğrulamak ve veritabanına yazmak modelsiz işlerdir.
- **Karar**: Hat iki katmana ayrıldı.
  1. **Deterministik katman** (`backend/scripts/pipeline/`): `next-event.mjs` sıradaki olayı ve inceleme
     kuyruğunun doluluğunu veritabanından türetir, `commons.mjs` lisansı Commons API'sinden okuyup künye
     dizesini üretir, `load.sh` sözleşmeyi doğrulayıp `status='review'` yazar, `notify.sh` haber verir.
     Bunların hiçbiri model çağırmaz, dolayısıyla hiçbiri para harcamaz.
  2. **Model katmanı**: `run.sh`, `prompts/run.md` talimatını `claude -p` ile çalıştırır. Yerelde bu
     makinedeki oturum, GitHub Actions'ta `claude setup-token`'ın verdiği `CLAUDE_CODE_OAUTH_TOKEN`
     — ikisi de aynı abonelik. `run.sh` `ANTHROPIC_API_KEY`'i **kasten siler**.
     Kuyruk durumu modelden **önce** sorulur: liste bitmişse ya da 10 olay incelemede bekliyorsa koşu
     hiçbir şey harcamadan çıkar.
- **Gerekçe**: Aynı işi iki ayrı ödeme kaleminden almak için sebep yok. Ayrıca bu ayrım hattı test
  edilebilir yaptı: lisans okuma, kuyruk konumu ve sözleşme doğrulaması artık modelin doğru davranmasına
  değil, koşan koda bağlı. "Lisans tahmin edilmez" kuralı ilk kez gerçekten uygulanıyor — model bir
  lisans iddia edemez, `commons.mjs` serbest olmayan dosyayı reddeder.
- **Sonuçlar**: `ANTHROPIC_API_KEY` hiçbir ortamda gerekmiyor. Gece koşusu 16:00 UTC (Bişkek 22:00) +
  elle tetikleme; taslak JSON'u `main`'e doğrudan `content(draft):` diye yazar — kod dosyasına
  dokunmadığı için PR'dan geçmez. Kotayı Max planı taşır: gecede bir olay, koşu başına bir oturum.
  Sırlar, kimlik sırası ve durdurma `mimari.md`'nin "İçerik hattı" bölümünde.
- **İlk koşuda öğrenilen**: CI'da `claude -p` prompt'u argüman olarak verilince model görevi almamış gibi
  davrandı (aynı çağrı bu makinede çalışıyordu). Prompt stdin'e alındı, talimat "bu mesaj görevin"
  diye açılıyor ve koşu prompt'un kaç bayt verildiğini loga basıyor. Üçü birlikte gitti, hangisinin
  çözdüğü ayırt edilmedi. Ayrıca hat kendi raporuna güvenmez: koşu sonunda olayın veritabanında
  gerçekten `review` olduğu sorgulanır — boş dönen ilk koşuyu yakalayan buydu.

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
