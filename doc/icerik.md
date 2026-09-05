# İçerik Stratejisi

Teknoloji üç ayda biter; içerik projenin ömrü boyunca sürer. Bu doküman içeriği sürdürülebilir ve doğru
üretmenin sistemidir. Üretim listesi `backend/content/top100.json`; sıradaki olay veritabanından
bulunur (en alta bak).

## Çağlar

Timeline 8 çağa ayrılır. Sınırlar tartışmalıdır; anlatı için seçilmiş sınırlardır, çağ sayfasında bunu
açıkça söyleriz.

| #   | Slug            | Aralık          | Türkçe ad                    | Tema cümlesi                                                             |
| --- | --------------- | --------------- | ---------------------------- | ------------------------------------------------------------------------ |
| 1   | `ancient`       | MÖ 600 – MS 500 | Antik Dünya                  | "Tanrılar yerine doğa: ilk kez 'neden?' diye soruldu"                    |
| 2   | `golden-age`    | 500 – 1400      | İslam Altın Çağı ve Orta Çağ | "Bağdat'tan Semerkant'a: bilgi korundu, çoğaldı, ölçüldü"                |
| 3   | `revolution`    | 1400 – 1700     | Rönesans ve Bilimsel Devrim  | "Dünya merkezden çıktı, deney kitaba galip geldi"                        |
| 4   | `enlightenment` | 1700 – 1800     | Aydınlanma                   | "Sınıflandırma, ölçüm, elektrik: doğa bir makine gibi okunmaya başlandı" |
| 5   | `industrial`    | 1800 – 1900     | 19. Yüzyıl                   | "Enerji, evrim, mikroplar, elektromanyetizma: modern dünyanın temelleri" |
| 6   | `modern`        | 1900 – 1945     | Modern Fizik Çağı            | "Atom parçalandı, uzay-zaman büküldü, kesinlik bitti"                    |
| 7   | `information`   | 1945 – 2000     | Bilgi Çağı                   | "Transistör, DNA, uzay, internet: bilim gündelik hayat oldu"             |
| 8   | `today`         | 2000 – bugün    | Bugün                        | "Genom, Higgs, kütleçekim dalgaları, yapay zekâ: hikâye sürüyor"         |

## Disiplinler

Her olay en az bir disipline bağlanır. **8'den fazla disiplin açma**: filtre çipleri telefona sığmaz,
renkler ayırt edilemez olur.

`mathematics` (mor) · `physics` (mavi) · `astronomy` (lacivert) · `chemistry` (turuncu) · `biology` (yeşil)
· `medicine` (mercan) · `earth` (toprak; iklim ve ekoloji buraya) · `technology` (çelik grisi)

## Olay şablonu

Alanlar admin formundaki alanlarla birebir eşleşir. Hat da tam bu şekli üretir (ADR-036).

```
Yıl: 1687          Kesinlik: exact       Önem: 5
Başlık: Newton "Principia"yı yayımladı
Özet (1-2 cümle, en fazla 200 karakter): Elmanın düşmesiyle Ay'ın dönmesini aynı yasa açıkladı.
  Gökyüzü ve yeryüzü ilk kez tek fizik oldu.

Gövde (Markdown, uzunluk serbest — aşağıdaki "Uzunluk" kuralına bak):
  - Sahne: o yıl dünya nasıl bir yerdi, bu soruya kim, neden takılmıştı?
  - Ne oldu: sade dille. Bir benzetme, ve benzetmenin nerede bozulduğu.
  - Zorluk: neden bu kadar uzun sürdü? Neye ihtiyaç vardı?
  - Sonrası: bu ne kapı açtı?

Neden önemli (2-3 cümle): Evren anlaşılabilir bir makine oldu. 250 yıl fizik bunun üstüne kuruldu.
Orada olsaydın (1-2 cümle): Gezegenlerin neden döndüğünü kimse bilmiyordu.

Disiplinler: physics, astronomy, mathematics
Kişiler: Isaac Newton, Edmond Halley
Dayanır (builds_on): Kepler yasaları (1609), Galileo eylemsizlik (1632), Descartes geometri (1637)
Mümkün kıldı (enables): Neptün'ün keşfi (1846), Apollo 11 (1969)
Kaynaklar: en az 2 (biri ansiklopedi: Britannica / Stanford Encyclopedia / Wikipedia; biri kitap)
Kapak görseli: Principia ilk baskı kapağı, Wikimedia Commons, kamu malı
```

### Gövdenin araçları (ADR-033)

Gövde tam Markdown. Bunlar süs değil; konu istiyorsa **kullanılması beklenir**:

| Araç             | Sözdizimi                                          | Ne zaman                                     |
| ---------------- | -------------------------------------------------- | -------------------------------------------- |
| Künyeli görsel   | `![alt](url "Yazar · Lisans · https://kaynak")`     | Elyazması, ilk baskı, aygıt, portre, diyagram |
| Video            | Tek başına satırda YouTube adresi                   | Gerçekten iyi bir belgesel/anlatım varsa      |
| Kutu             | `> [!NOTE]` `> [!TIP]` `> [!IMPORTANT]` `> [!WARNING]` `> [!CAUTION]` `> [!THEORY]` | Yan bilgi; "şu teori şu demek". **Anahtar sözcük İngilizce**, kutunun içi hedef dilde |
| Formül           | `$...$`                                             | **İstisna.** Sözcükler yetmediğinde, açıklamasıyla |
| Tablo, liste     | GFM                                                 | Karşılaştırma, ölçüm, kronoloji               |

**Lisans tahmin edilmez.** Görselin lisansı Wikimedia Commons API'sinden okunur; modelin "kamu malı"
demesi kabul edilmez. Lisans hukuki bir iddiadır. Künyesiz görsel gövdeye girmez.

## Ses tonu

- **Kime**: 16 yaşındaki meraklı bir insana anlatır gibi. Aptal yerine koymadan, formül kullanmadan.
- **Ton**: hayret + dürüstlük. "İnanılmaz" deme, inanılmaz olanı göster.
- **Formül yok.** E=mc² bile yazılmaz; "kütle ve enerji aynı şeyin iki yüzü" denir. Gövde `$...$` ile
  formül dizebilir (ADR-033) ama bu istisnadır: anlatı formülsüz yürür, formül ancak sözcüklerin
  yetmediği yerde ve açıklamasıyla birlikte gelir.
- **Kısaltma yok.** Okuyucunun çözmesi gereken kısaltma kullanma. Site de öyle: yaklaşık yıl "c." değil
  "around" yazar (ADR-004).
- **Bir benzetme** her olayda olsun; benzetmenin nerede bozulduğunu bir cümleyle söyle.
- **Kahraman anlatısından kaçın.** "Newton buldu" değil, "Newton, Kepler'in 80 yıllık verisi ve Hooke'un
  sorusuyla...".
- **Belirsizliği söyle.** "MÖ 585 tutulması tahmini muhtemelen efsanedir, ama hikâye Thales'in
  yaklaşımını anlatır."
- **Kadınları ve Batı dışını görünür kıl.** Hypatia, Emmy Noether, Lise Meitner, Rosalind Franklin,
  Jocelyn Bell Burnell, Tu Youyou; El-Harezmi, İbn-i Heysem, El-Biruni, Uluğ Bey, Zhang Heng, Brahmagupta.
- **Her olay tek başına okunabilir.** Okuyucu ortadan girmiş olabilir.
- **Uzunluk**: özet en fazla **200 karakter** (zaman şeridi kartı ve OG görseli buna göre kurulu —
  bu bir yerleşim kuralı, üslup değil). **Gövdenin tavanı yok.** Ama boşluk doldurulmaz:
  her paragraf yeni bir olgu getirir; bir öncekini başka sözcüklerle söyleyen paragraf silinir.
  Önem 5 derine iner, önem 3 kısa keser. Ölçü kelime sayısı değil, **dolgu yokluğu**.

## Orta Asya vurgusu

Sitenin Kırgızca ve Rusça okuyucusu için özel değeri, kendi coğrafyasının bilim tarihine sahip
çıkmasıdır. Omurga olaylar (El-Harezmi, El-Farabi, İbn Sina, El-Biruni, Ömer Hayyam, Uluğ Bey, Zhang Heng,
Brahmagupta, Aryabhata) top 100 listesindedir ve hiçbiri kesilmedi. Her olayda aynı ölçü aranır:
Batı dışı katkı varsa gövdede geçer.

## Doğruluk süreci

1. **İki kaynak kuralı**: her olay için en az 2 bağımsız kaynak; admin formundaki Kaynaklar bölümüne girilir. Sıra: Britannica, Stanford Encyclopedia
   of Philosophy, İngilizce Wikipedia, MacTutor, üniversite sayfaları, hakemli tarih kitapları.
   Britannica otomatik çekimi engelliyor (403) — hattın kaynak eşiği diğerleriyle tutulur; Britannica
   yalnızca insan kontrolü için link olarak kalır.
2. **Yıl çelişirse**: `circa` işaretle ve gövdede "kaynaklar 1609-1610 arasında" diye belirt.
3. **Öncelik tartışması varsa**: hepsini yaz, kahraman seçme.
4. **Claude taslak yazar, sen doğrularsın.** Şüphe varsa yayınlamayız.
5. **Hata bildirimi**: dürüstlük bandındaki mailto. Düzeltmeler `about` sayfasında listelenir (Faz C).

## Görseller ve lisans

Sadece **kamu malı** veya **CC BY / CC BY-SA**; kaynak Wikimedia Commons. Her görselde yazar/kaynak,
lisans ve Commons linki zorunlu (form aksini kabul etmez, ADR-011). Kapak görseli admin formundan
girilir: kova yolu ya da tam https adresi. Gövdeye gömülen görselin künyesi Markdown başlığındadır
(ADR-033). Eski portreler, kitap kapakları ve
çizimler çoğunlukla kamu malı; NASA/ESA görselleri genelde serbest, kontrol edilir. Görsel yoksa olay
yine yayınlanır: disiplin renginde, yılın büyük yazıldığı üretilmiş kart. Görsel bekleyen olay olmaz.

## Üretim temposu

İçerik 2026-09-06'da sıfırlandı ve yeniden toplanıyor (ADR-036). Gece hattı Bişkek saatiyle 22:00'de
listeden bir olay alır, araştırır, dört dilde yazar ve `status='review'` olarak veritabanına koyar;
Telegram sana haber verir. Elle de çalıştırılabilir, günde kaç kez istersen. Yayın kararı senindir.

---

## Yazılacak olaylar

Liste artık bu dokümanda değil, **`backend/content/top100.json`** içinde: hat onu okuyor, iki kopya
tutmuyoruz. Sıradaki olay "listede karşılığı henüz veritabanında olmayan en düşük `rank`" diye
bulunur — imleç dosyası yok, o yüzden gece koşusu ile elle koşu birbirini ezmez.

- **`rank`** = üretim sırası. **`importance`** = olayın zaman şeridindeki ağırlığı. Aynı şey değiller.
- Sıra önem sırasıdır, ama her önem katmanı çağlara yayılır: ilk 9 olay 8 çağın hepsine dokunur,
  böylece site hiçbir aşamada yarım görünmez.
- `importance` puanları **küresel** ölçekte verildi. Eski puanlar çağ-içi göreliydi; 135 adayı onlarla
  sıralayınca listeye tek bir "3" giremiyordu ve kesilenler tam da Hypatia, El-Farabi, Ömer Hayyam,
  Noether, Bell Burnell, Zhang Heng oluyordu. Bu altısı listede: bu sitenin varlık sebebi onlar.
- Liste bitince hat yazmaz, "uzatalım mı?" der. Uzatma sırası **`backend/content/extension-queue.json`**
  (top 100'e girmeyen 35 aday).
