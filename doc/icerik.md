# İçerik Stratejisi

Teknoloji üç ayda biter; içerik projenin ömrü boyunca sürer. Bu doküman içeriği sürdürülebilir ve doğru
üretmenin sistemidir. Yayınlanmış olaylar listeden çıkarılır; kalan liste en altta.

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

Alanlar admin formundaki alanlarla birebir eşleşir.

```
Yıl: 1687          Kesinlik: exact       Önem: 5
Başlık: Newton "Principia"yı yayımladı
Özet (1-2 cümle, 200 karakter): Elmanın düşmesiyle Ay'ın dönmesini aynı yasa açıkladı.
  Gökyüzü ve yeryüzü ilk kez tek fizik oldu.

Gövde (300-600 kelime):
  - Sahne: o yıl dünya nasıl bir yerdi, bu soruya kim, neden takılmıştı?
  - Ne oldu: sade dille, formülsüz. Bir benzetme.
  - Zorluk: neden bu kadar uzun sürdü? Neye ihtiyaç vardı?
  - Sonrası: bu ne kapı açtı?

Neden önemli (2-3 cümle): Evren anlaşılabilir bir makine oldu. 250 yıl fizik bunun üstüne kuruldu.
Orada olsaydın (1-2 cümle): Gezegenlerin neden döndüğünü kimse bilmiyordu.

Disiplinler: physics, astronomy, mathematics
Kişiler: Isaac Newton, Edmond Halley
Dayanır (builds_on): Kepler yasaları (1609), Galileo eylemsizlik (1632), Descartes geometri (1637)
Mümkün kıldı (enables): Neptün'ün keşfi (1846), Apollo 11 (1969)
Kaynaklar: en az 2 (biri ansiklopedi: Britannica / Stanford Encyclopedia / Wikipedia; biri kitap)
Görsel: Principia ilk baskı kapağı, Wikimedia Commons, kamu malı
```

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
- **Uzunluk**: özet 200 karakter, gövde 300-600 kelime. Daha uzunsa iki olaya böl.

## Orta Asya vurgusu

Sitenin Kırgızca ve Rusça okuyucusu için özel değeri, kendi coğrafyasının bilim tarihine sahip
çıkmasıdır. Omurga olaylar (El-Harezmi, El-Farabi, İbn Sina, El-Biruni, Ömer Hayyam, Uluğ Bey) yayında.
Bundan sonraki olaylarda da aynı ölçü aranır: Batı dışı katkı varsa gövdede geçer.

## Doğruluk süreci

1. **İki kaynak kuralı**: her olay için en az 2 bağımsız kaynak. Sıra: Britannica, Stanford Encyclopedia
   of Philosophy, İngilizce Wikipedia, MacTutor, üniversite sayfaları, hakemli tarih kitapları.
   Britannica otomatik çekimi engelliyor (403) — hattın kaynak eşiği diğerleriyle tutulur; Britannica
   yalnızca insan kontrolü için link olarak kalır.
2. **Yıl çelişirse**: `circa` işaretle ve gövdede "kaynaklar 1609-1610 arasında" diye belirt.
3. **Öncelik tartışması varsa**: hepsini yaz, kahraman seçme.
4. **Claude taslak yazar, sen doğrularsın.** Şüphe varsa yayınlamayız.
5. **Hata bildirimi**: dürüstlük bandındaki mailto. Düzeltmeler `about` sayfasında listelenir (Faz C).

## Görseller ve lisans

Sadece **kamu malı** veya **CC BY / CC BY-SA**; kaynak Wikimedia Commons. Her görselde yazar/kaynak,
lisans ve Commons linki zorunlu (form aksini kabul etmez, ADR-011). Eski portreler, kitap kapakları ve
çizimler çoğunlukla kamu malı; NASA/ESA görselleri genelde serbest, kontrol edilir. Görsel yoksa olay
yine yayınlanır: disiplin renginde, yılın büyük yazıldığı üretilmiş kart. Görsel bekleyen olay olmaz.

## Üretim temposu

**İçerik 50 olayda dondu (2026-09-04).** Önce 7 Aydınlanma olayı, sonra Faz A bitene kadar yeni olay
yok (`yol-haritasi.md`). Hat çalışınca (Faz B) günde 2 taslak; senin onayın olay başına ~10 dakika.

---

## Yazılacak olaylar

**43 olay yayında**: Antik Dünya, İslam Altın Çağı ve Bilimsel Devrim'in tamamı, artı 1947 transistör.
Yayındaki liste sitede: https://history-of-science.vercel.app/en

Aşağıdaki tablolar kalan çekirdek listedir. Önem 5 = zoom-out'ta bile görünen "çapa" olaylar. Yıllar
yaygın kabul gören yıllardır; yazarken her biri iki kaynakla doğrulanır. Negatif yıl = MÖ.

### Antik Dünya — kalan 2

| Yıl  | Kesinlik | Önem | Olay                        | Disiplin          |
| ---- | -------- | ---- | --------------------------- | ----------------- |
| -450 | circa    | 3    | Empedokles'in dört elementi | chemistry         |
| 78   | circa    | 3    | Zhang Heng: sismograf (Çin) | earth, technology |

### Aydınlanma (1700 – 1800) — 7, **sıradaki grup** (50 olay hedefi)

| Yıl  | Kesinlik | Önem | Olay                                           | Disiplin            |
| ---- | -------- | ---- | ---------------------------------------------- | ------------------- |
| 1735 | exact    | 4    | Linnaeus: canlılara isim ve düzen              | biology             |
| 1752 | exact    | 4    | Franklin: yıldırım elektriktir                 | physics             |
| 1774 | exact    | 4    | Priestley/Scheele: oksijen                     | chemistry           |
| 1781 | exact    | 3    | Herschel Uranüs'ü keşfetti                     | astronomy           |
| 1789 | exact    | 5    | Lavoisier: kütle korunur, kimya bir bilim oldu | chemistry           |
| 1796 | exact    | 5    | Jenner: ilk aşı (çiçek)                        | medicine            |
| 1800 | exact    | 5    | Volta pili: sürekli elektrik akımı             | physics, technology |

### 19. Yüzyıl (1800 – 1900) — 25

| Yıl  | Kesinlik | Önem | Olay                                              | Disiplin            |
| ---- | -------- | ---- | ------------------------------------------------- | ------------------- |
| 1803 | exact    | 5    | Dalton: atom teorisi                              | chemistry           |
| 1820 | exact    | 4    | Ørsted: elektrik pusulayı oynattı                 | physics             |
| 1824 | exact    | 4    | Carnot: termodinamiğin doğuşu                     | physics             |
| 1830 | exact    | 4    | Lyell: Dünya çok yaşlı, yavaş değişir             | earth               |
| 1831 | exact    | 5    | Faraday: hareketten elektrik (indüksiyon)         | physics, technology |
| 1838 | exact    | 4    | Schleiden/Schwann: her canlı hücrelerden          | biology             |
| 1846 | exact    | 3    | Neptün kâğıt üstünde bulundu                      | astronomy           |
| 1846 | exact    | 4    | Eter anestezisi: acısız ameliyat                  | medicine            |
| 1847 | exact    | 4    | Semmelweis: el yıkamak hayat kurtarır             | medicine            |
| 1847 | exact    | 4    | Helmholtz: enerjinin korunumu                     | physics             |
| 1859 | exact    | 5    | Darwin "Türlerin Kökeni"                          | biology             |
| 1861 | exact    | 5    | Pasteur: mikroplar hastalık yapar                 | medicine, biology   |
| 1865 | exact    | 5    | Maxwell: ışık bir elektromanyetik dalgadır        | physics             |
| 1865 | exact    | 5    | Mendel'in bezelyeleri: kalıtımın kuralları        | biology             |
| 1869 | exact    | 5    | Mendeleyev: periyodik tablo                       | chemistry           |
| 1876 | exact    | 3    | Bell: telefon                                     | technology          |
| 1879 | exact    | 3    | Edison: dayanıklı ampul                           | technology          |
| 1882 | exact    | 4    | Koch: verem basili, mikrop kuramının kanıtı       | medicine            |
| 1887 | exact    | 4    | Hertz: radyo dalgaları gerçek                     | physics, technology |
| 1887 | exact    | 4    | Michelson-Morley: eter yok                        | physics             |
| 1895 | exact    | 5    | Röntgen: X-ışınları                               | physics, medicine   |
| 1896 | exact    | 4    | Becquerel: radyoaktivite                          | physics             |
| 1896 | exact    | 4    | Arrhenius: CO₂ Dünya'yı ısıtır (ilk iklim hesabı) | earth, chemistry    |
| 1897 | exact    | 5    | Thomson: elektron, atom bölünebilir               | physics             |
| 1898 | exact    | 4    | Curie'ler: radyum, polonyum                       | chemistry, physics  |

### Modern Fizik Çağı (1900 – 1945) — 21

| Yıl  | Kesinlik | Önem | Olay                                           | Disiplin                |
| ---- | -------- | ---- | ---------------------------------------------- | ----------------------- |
| 1900 | exact    | 5    | Planck: enerji paketler halinde (kuantum)      | physics                 |
| 1903 | exact    | 4    | Wright kardeşler: kontrollü uçuş               | technology              |
| 1905 | exact    | 5    | Einstein'ın mucize yılı                        | physics                 |
| 1909 | exact    | 5    | Haber-Bosch: havadan gübre, milyarları doyurdu | chemistry, technology   |
| 1911 | exact    | 5    | Rutherford: atomun çekirdeği var               | physics                 |
| 1912 | exact    | 4    | Wegener: kıtalar kayar                         | earth                   |
| 1913 | exact    | 4    | Bohr atom modeli                               | physics                 |
| 1915 | exact    | 5    | Genel görelilik: kütle uzay-zamanı büker       | physics, astronomy      |
| 1918 | exact    | 3    | Emmy Noether: simetri ile korunum yasaları     | mathematics, physics    |
| 1919 | exact    | 4    | Eddington tutulması: görelilik doğrulandı      | astronomy               |
| 1924 | exact    | 5    | Hubble: başka galaksiler var                   | astronomy               |
| 1925 | exact    | 5    | Heisenberg/Schrödinger: kuantum mekaniği       | physics                 |
| 1927 | exact    | 4    | Belirsizlik ilkesi; Lemaître genişleyen evren  | physics, astronomy      |
| 1928 | exact    | 5    | Fleming: penisilin                             | medicine                |
| 1929 | exact    | 5    | Hubble: evren genişliyor                       | astronomy               |
| 1931 | exact    | 4    | Gödel: matematiğin sınırları                   | mathematics             |
| 1932 | exact    | 4    | Chadwick: nötron                               | physics                 |
| 1936 | exact    | 5    | Turing: hesaplanabilirlik, evrensel makine     | mathematics, technology |
| 1938 | exact    | 5    | Hahn/Meitner: çekirdek bölünmesi               | physics                 |
| 1942 | exact    | 4    | Fermi: ilk zincirleme reaksiyon                | physics                 |
| 1945 | exact    | 5    | Trinity: ilk atom bombası; bilim ve sorumluluk | physics                 |

### Bilgi Çağı (1945 – 2000) — 25 (1947 transistör yayında)

| Yıl  | Kesinlik | Önem | Olay                                                | Disiplin                |
| ---- | -------- | ---- | --------------------------------------------------- | ----------------------- |
| 1948 | exact    | 4    | Shannon: bilgi kuramı, "bit"                        | mathematics, technology |
| 1953 | exact    | 5    | DNA çift sarmalı (Watson, Crick, Franklin, Wilkins) | biology                 |
| 1953 | exact    | 3    | Miller-Urey: hayatın kimyası laboratuvarda          | chemistry, biology      |
| 1957 | exact    | 5    | Sputnik: ilk uydu                                   | astronomy, technology   |
| 1958 | exact    | 5    | Entegre devre (Kilby, Noyce)                        | technology              |
| 1958 | exact    | 4    | Keeling eğrisi: CO₂ ölçümü başladı                  | earth                   |
| 1960 | exact    | 4    | Lazer                                               | physics, technology     |
| 1961 | exact    | 5    | Gagarin: uzayda ilk insan                           | astronomy               |
| 1964 | exact    | 4    | Kuarklar; Higgs mekanizması önerildi                | physics                 |
| 1965 | exact    | 5    | Kozmik mikrodalga arka plan                         | astronomy               |
| 1967 | exact    | 3    | Jocelyn Bell Burnell: pulsarlar                     | astronomy               |
| 1969 | exact    | 5    | Apollo 11: Ay'da insan                              | astronomy, technology   |
| 1969 | exact    | 5    | ARPANET: internetin tohumu                          | technology              |
| 1971 | exact    | 5    | Mikroişlemci (Intel 4004)                           | technology              |
| 1973 | exact    | 4    | Rekombinant DNA: genetik mühendisliği               | biology                 |
| 1977 | exact    | 3    | Voyager fırlatıldı                                  | astronomy               |
| 1980 | exact    | 5    | Çiçek hastalığı yeryüzünden silindi                 | medicine                |
| 1983 | exact    | 4    | PCR: DNA'yı kopyalama makinesi                      | biology                 |
| 1985 | exact    | 4    | Ozon deliği keşfi → 1987 Montreal Protokolü         | earth                   |
| 1988 | exact    | 3    | IPCC kuruldu                                        | earth                   |
| 1989 | exact    | 5    | World Wide Web (Berners-Lee)                        | technology              |
| 1990 | exact    | 4    | Hubble Uzay Teleskopu                               | astronomy               |
| 1995 | exact    | 4    | İlk ötegezegen (51 Pegasi b)                        | astronomy               |
| 1996 | exact    | 3    | Koyun Dolly: klonlama                               | biology                 |
| 1998 | exact    | 4    | Karanlık enerji: genişleme hızlanıyor               | astronomy               |

### Bugün (2000 – ) — 12

| Yıl  | Kesinlik | Önem | Olay                                  | Disiplin            |
| ---- | -------- | ---- | ------------------------------------- | ------------------- |
| 2003 | exact    | 5    | İnsan Genom Projesi tamamlandı        | biology             |
| 2007 | exact    | 4    | Akıllı telefon: cepte 60 yıllık bilim | technology          |
| 2012 | exact    | 5    | Higgs bozonu (CERN)                   | physics             |
| 2012 | exact    | 5    | CRISPR-Cas9 (Doudna, Charpentier)     | biology             |
| 2015 | exact    | 5    | Kütleçekim dalgaları (LIGO)           | physics, astronomy  |
| 2015 | exact    | 3    | Paris İklim Anlaşması                 | earth               |
| 2019 | exact    | 4    | İlk kara delik fotoğrafı              | astronomy           |
| 2020 | exact    | 5    | mRNA aşıları: 1 yılda pandemi aşısı   | medicine            |
| 2020 | exact    | 4    | AlphaFold: protein katlanması çözüldü | biology, technology |
| 2022 | exact    | 4    | James Webb'in ilk görüntüleri         | astronomy           |
| 2022 | exact    | 4    | NIF: füzyonda net enerji kazancı      | physics             |
| 2022 | exact    | 4    | Büyük dil modelleri kamuya açıldı     | technology          |
