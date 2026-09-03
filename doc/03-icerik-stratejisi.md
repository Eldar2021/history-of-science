# 03 — İçerik Stratejisi

Teknoloji üç ayda biter; içerik projenin ömrü boyunca sürer. Bu doküman içeriği **sürdürülebilir ve doğru**
üretmenin sistemidir.

## Yapı: Çağlar

Timeline 8 çağa (bölüme) ayrılır. Her çağın bir "kapak" hikâyesi vardır: o çağda insanlar dünyayı nasıl görüyordu,
neyi bilmiyorlardı, ne değişti.

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

Sınırlar tartışmalıdır; bunlar anlatı için seçilmiş sınırlardır. Çağ sayfasında bunu açıkça söyleriz.

## Yapı: Disiplinler

Her olay en az bir disipline bağlanır. Renk kodu timeline'da filtre ve görsel kimlik sağlar.

| Slug          | Türkçe                   | Renk önerisi      | Not                                                                     |
| ------------- | ------------------------ | ----------------- | ----------------------------------------------------------------------- |
| `mathematics` | Matematik                | Mor               | Sayı, geometri, mantık, bilgisayar bilimi kuramı                        |
| `physics`     | Fizik                    | Mavi              | Mekanik, elektrik, kuantum, görelilik                                   |
| `astronomy`   | Astronomi ve Uzay        | Lacivert/indigo   | Gözlem, kozmoloji, uzay uçuşu                                           |
| `chemistry`   | Kimya                    | Turuncu           | Elementler, atomlar, moleküller                                         |
| `biology`     | Biyoloji                 | Yeşil             | Hücre, evrim, genetik                                                   |
| `medicine`    | Tıp                      | Kırmızı/mercan    | Anatomi, mikroplar, aşı, ilaç                                           |
| `earth`       | Yer Bilimleri ve İklim   | Kahverengi/toprak | Jeoloji, iklim, ekoloji. **Senin ekoloji niyetin için bu lane önemli.** |
| `technology`  | Teknoloji ve Mühendislik | Gri/çelik         | Matbaa, buhar, transistör, internet                                     |

Kural: 8'den fazla disiplin açma. Filtre çipleri telefona sığmaz, renkler ayırt edilemez olur.

## Olay şablonu

Her olay şu yapıda yazılır. Alanlar formdaki alanlarla birebir eşleşir (02-urun-spesifikasyonu).

```
Yıl: 1687          Kesinlik: exact       Önem: 5
Başlık: Newton "Principia"yı yayımladı
Özet (1-2 cümle): Elmanın düşmesiyle Ay'ın dönmesini aynı yasa açıkladı. Gökyüzü ve yeryüzü ilk kez tek fizik oldu.

Gövde (300-600 kelime):
  - Sahne: 1687'de dünya nasıl bir yerdi, bu soruya kim, neden takılmıştı?
  - Ne oldu: Sade dille, formülsüz. Bir benzetme.
  - Zorluk: Neden bu kadar uzun sürdü? Neye ihtiyaç vardı? (Kepler'in verisi, kalkülüs, Galileo'nun eylemsizliği)
  - Sonrası: Bu ne kapı açtı?

Neden önemli (2-3 cümle): Evren anlaşılabilir bir makine oldu. 250 yıl boyunca fizik bunun üstüne kuruldu.
Orada olsaydın (1-2 cümle): Gezegenlerin neden döndüğünü kimse bilmiyordu; çoğu insan için gökyüzü hâlâ "başka bir alem"di.

Disiplinler: physics, astronomy, mathematics
Kişiler: Isaac Newton, Edmond Halley
Dayanır (builds_on): Kepler yasaları (1609), Galileo eylemsizlik (1632), Descartes geometri (1637)
Mümkün kıldı (enables): Neptün'ün keşfi (1846), Apollo 11 (1969)
Kaynaklar: en az 2 (biri birincil ansiklopedi: Britannica / Stanford Encyclopedia / Wikipedia; biri kitap)
Görsel: Principia ilk baskı kapağı, Wikimedia Commons, kamu malı
```

## Yazım kuralları (ses tonu)

- **Kime yazıyoruz**: 16 yaşındaki meraklı bir insana anlatır gibi. Aptal yerine koymadan, formül kullanmadan.
- **Ton**: Hayret + dürüstlük. "İnanılmaz" deme, inanılmaz olanı göster.
- **Formül yok.** E=mc² bile yazılmaz; "kütle ve enerji aynı şeyin iki yüzü" denir.
- **Bir benzetme** her olayda olsun. Benzetmenin nerede bozulduğunu bir cümleyle söyle.
- **Kahraman anlatısından kaçın.** "Newton buldu" değil, "Newton, Kepler'in 80 yıllık verisi ve Hooke'un sorusuyla..."
- **Belirsizliği söyle.** "MÖ 585 tutulması tahmini muhtemelen efsanedir, ama hikâye Thales'in yaklaşımını anlatır."
- **Kadınları ve Batı dışını görünür kıl.** Hypatia, Emmy Noether, Lise Meitner, Rosalind Franklin, Jocelyn Bell Burnell, Tu Youyou; El-Harezmi, İbn-i Heysem, El-Biruni, Uluğ Bey, Zhang Heng, Brahmagupta, Aryabhata.
- **Her olay tek başına okunabilir.** Okuyucu ortadan girmiş olabilir.
- **Uzunluk**: özet 200 karakter, gövde 300-600 kelime, daha uzunsa iki olaya böl.

## Orta Asya vurgusu (ky/ru okuyucu için)

Bu sitenin Kırgızca ve Rusça okuyucusu için özel değeri: **kendi coğrafyasının bilim tarihine sahip çıkması**.
Öncelikli olaylar:

- El-Harezmi (Harezm, ~820): cebir ve algoritma kelimelerinin kaynağı.
- El-Farabi (Otrar, ~950): mantık ve müzik kuramı.
- El-Biruni (Harezm, ~1020): Dünya'nın yarıçapını ölçtü, Hindistan'ı inceledi.
- İbn Sina (Buhara, 1025): "Tıbbın Kanunu", 600 yıl Avrupa'da ders kitabı.
- Uluğ Bey (Semerkant, 1420-1437): çıplak gözle en doğru yıldız kataloğu, Tycho'dan 150 yıl önce.
- Ömer Hayyam (Nişabur, ~1070): kübik denklemler, takvim reformu.

Bunlar 2. çağın omurgası olur; 1. ay içeriğine dahil edilir.

## Çekirdek olay listesi (ilk 110)

Bu liste MVP ve v1.0'ın iskeleti. Önem 5 = zoom-out'ta bile görünen "çapa" olaylar. Yıllar yaygın kabul gören yıllardır;
yazarken her biri iki kaynakla doğrulanır. Negatif yıl = MÖ.

### Antik Dünya (MÖ 600 – MS 500)

| Yıl  | Kesinlik | Önem | Olay                                                               | Disiplin               |
| ---- | -------- | ---- | ------------------------------------------------------------------ | ---------------------- |
| -585 | circa    | 5    | Thales: Doğa olaylarına doğal açıklama; tutulma tahmini efsanesi   | physics, astronomy     |
| -530 | circa    | 4    | Pisagor okulu: Evren sayılarla anlaşılır                           | mathematics            |
| -450 | circa    | 3    | Empedokles'in dört elementi                                        | chemistry              |
| -420 | circa    | 4    | Demokritos: Her şey atomlardan oluşur                              | physics, chemistry     |
| -400 | circa    | 5    | Hipokrat: Hastalığın nedeni tanrılar değil, doğadır                | medicine               |
| -387 | circa    | 4    | Platon Akademia'yı kurdu: Matematik felsefenin kapısı              | mathematics            |
| -335 | circa    | 5    | Aristoteles Lyceum: Sistematik gözlem, biyoloji, mantık            | biology, physics       |
| -300 | circa    | 5    | Öklid "Elementler": 2000 yıl matematik ders kitabı                 | mathematics            |
| -250 | circa    | 5    | Arşimet: Kaldırma kuvveti, kaldıraç, pi'nin hesaplanması           | physics, mathematics   |
| -240 | circa    | 5    | Eratosthenes Dünya'nın çevresini ölçtü (gölge ve deve adımlarıyla) | astronomy, earth       |
| -150 | circa    | 4    | Hipparkos: Yıldız kataloğu, presesyon, trigonometri                | astronomy, mathematics |
| 78   | circa    | 3    | Zhang Heng: Sismograf (Çin)                                        | earth, technology      |
| 150  | circa    | 5    | Batlamyus "Almagest": Dünya merkezli evren, 1400 yıl hüküm sürdü   | astronomy              |
| 160  | circa    | 4    | Galen: Anatomi ve tıp, 1300 yıl otorite                            | medicine               |
| 400  | circa    | 3    | Hypatia: İskenderiye'nin son büyük matematikçisi                   | mathematics, astronomy |
| 499  | exact    | 4    | Aryabhata: Dünya'nın dönüşü, pi, trigonometri (Hindistan)          | mathematics, astronomy |

### İslam Altın Çağı ve Orta Çağ (500 – 1400)

| Yıl  | Kesinlik | Önem | Olay                                                    | Disiplin               |
| ---- | -------- | ---- | ------------------------------------------------------- | ---------------------- |
| 628  | exact    | 5    | Brahmagupta: Sıfır bir sayıdır, kuralları vardır        | mathematics            |
| 820  | circa    | 5    | El-Harezmi: Cebir ve algoritma doğdu (Harezm)           | mathematics            |
| 950  | circa    | 3    | El-Farabi: Mantık ve bilimlerin sınıflandırması (Otrar) | mathematics            |
| 1021 | circa    | 5    | İbn-i Heysem "Optik": Deney yöntemi, görme ışıkla olur  | physics                |
| 1025 | exact    | 5    | İbn Sina "Tıbbın Kanunu" (Buhara)                       | medicine               |
| 1030 | circa    | 4    | El-Biruni: Dünya'nın yarıçapını trigonometriyle ölçtü   | earth, astronomy       |
| 1070 | circa    | 3    | Ömer Hayyam: Kübik denklemler, takvim                   | mathematics, astronomy |
| 1202 | exact    | 4    | Fibonacci "Liber Abaci": Hint-Arap rakamları Avrupa'ya  | mathematics            |
| 1267 | exact    | 3    | Roger Bacon: Deney, otoriteye üstündür                  | physics                |
| 1420 | exact    | 5    | Uluğ Bey Semerkant Gözlemevi: En hassas yıldız kataloğu | astronomy              |
| 1450 | circa    | 5    | Gutenberg matbaası: Bilgi kopyalanabilir oldu           | technology             |

### Rönesans ve Bilimsel Devrim (1400 – 1700)

| Yıl  | Kesinlik | Önem | Olay                                                       | Disiplin               |
| ---- | -------- | ---- | ---------------------------------------------------------- | ---------------------- |
| 1543 | exact    | 5    | Kopernik: Güneş merkezde                                   | astronomy              |
| 1543 | exact    | 5    | Vesalius "Fabrica": İnsan bedeni kesilerek çizildi         | medicine               |
| 1572 | exact    | 3    | Tycho Brahe'nin süpernovası: Gökyüzü değişebilir           | astronomy              |
| 1600 | exact    | 3    | Gilbert "De Magnete": Dünya dev bir mıknatıs               | physics, earth         |
| 1609 | exact    | 5    | Kepler: Gezegenler elips çizer                             | astronomy, mathematics |
| 1609 | exact    | 5    | Galileo teleskopu gökyüzüne çevirdi                        | astronomy              |
| 1614 | exact    | 3    | Napier: Logaritma, hesabı kısalttı                         | mathematics            |
| 1620 | exact    | 4    | Francis Bacon "Novum Organum": Bilimsel yöntem manifestosu | physics                |
| 1628 | exact    | 4    | Harvey: Kan dolaşır, kalp pompadır                         | medicine               |
| 1637 | exact    | 4    | Descartes: Geometri ile cebir birleşti (koordinatlar)      | mathematics            |
| 1643 | exact    | 3    | Torricelli barometresi: Havanın ağırlığı var               | physics                |
| 1660 | exact    | 4    | Royal Society kuruldu: Bilim kurumsallaştı                 | technology             |
| 1662 | exact    | 3    | Boyle yasası: Gazlar ölçülebilir                           | chemistry, physics     |
| 1665 | exact    | 4    | Hooke "Micrographia": "Hücre" kelimesi                     | biology                |
| 1676 | exact    | 5    | Leeuwenhoek: Bir damla suda canlılar                       | biology                |
| 1676 | exact    | 4    | Rømer: Işığın hızı sonlu                                   | physics, astronomy     |
| 1687 | exact    | 5    | Newton "Principia": Gök ve yer aynı yasa                   | physics, astronomy     |

### Aydınlanma (1700 – 1800)

| Yıl  | Kesinlik | Önem | Olay                                             | Disiplin            |
| ---- | -------- | ---- | ------------------------------------------------ | ------------------- |
| 1735 | exact    | 4    | Linnaeus: Canlılara isim ve düzen                | biology             |
| 1752 | exact    | 4    | Franklin: Yıldırım elektriktir                   | physics             |
| 1774 | exact    | 4    | Priestley/Scheele: Oksijen                       | chemistry           |
| 1781 | exact    | 3    | Herschel Uranüs'ü keşfetti: Güneş sistemi büyüdü | astronomy           |
| 1789 | exact    | 5    | Lavoisier: Kütle korunur, kimya bir bilim oldu   | chemistry           |
| 1796 | exact    | 5    | Jenner: İlk aşı (çiçek)                          | medicine            |
| 1800 | exact    | 5    | Volta pili: Sürekli elektrik akımı               | physics, technology |

### 19. Yüzyıl (1800 – 1900)

| Yıl  | Kesinlik | Önem | Olay                                                  | Disiplin            |
| ---- | -------- | ---- | ----------------------------------------------------- | ------------------- |
| 1803 | exact    | 5    | Dalton: Atom teorisi                                  | chemistry           |
| 1820 | exact    | 4    | Ørsted: Elektrik pusulayı oynattı (elektromanyetizma) | physics             |
| 1824 | exact    | 4    | Carnot: Termodinamiğin doğuşu                         | physics             |
| 1830 | exact    | 4    | Lyell: Dünya çok yaşlı, yavaş değişir                 | earth               |
| 1831 | exact    | 5    | Faraday: Hareketten elektrik (indüksiyon)             | physics, technology |
| 1838 | exact    | 4    | Schleiden/Schwann: Her canlı hücrelerden              | biology             |
| 1846 | exact    | 3    | Neptün kâğıt üstünde bulundu                          | astronomy           |
| 1846 | exact    | 4    | Eter anestezisi: Acısız ameliyat                      | medicine            |
| 1847 | exact    | 4    | Semmelweis: El yıkamak hayat kurtarır                 | medicine            |
| 1847 | exact    | 4    | Helmholtz: Enerjinin korunumu                         | physics             |
| 1859 | exact    | 5    | Darwin "Türlerin Kökeni"                              | biology             |
| 1861 | exact    | 5    | Pasteur: Mikroplar hastalık yapar                     | medicine, biology   |
| 1865 | exact    | 5    | Maxwell: Işık bir elektromanyetik dalgadır            | physics             |
| 1865 | exact    | 5    | Mendel'in bezelyeleri: Kalıtımın kuralları            | biology             |
| 1869 | exact    | 5    | Mendeleyev: Periyodik tablo, boşluklar tahmin edildi  | chemistry           |
| 1876 | exact    | 3    | Bell: Telefon                                         | technology          |
| 1879 | exact    | 3    | Edison: Dayanıklı ampul                               | technology          |
| 1882 | exact    | 4    | Koch: Verem basili, mikrop kuramının kanıtı           | medicine            |
| 1887 | exact    | 4    | Hertz: Radyo dalgaları gerçek                         | physics, technology |
| 1887 | exact    | 4    | Michelson-Morley: Eter yok                            | physics             |
| 1895 | exact    | 5    | Röntgen: X-ışınları                                   | physics, medicine   |
| 1896 | exact    | 4    | Becquerel: Radyoaktivite                              | physics             |
| 1896 | exact    | 4    | Arrhenius: CO₂ Dünya'yı ısıtır (ilk iklim hesabı)     | earth, chemistry    |
| 1897 | exact    | 5    | Thomson: Elektron, atom bölünebilir                   | physics             |
| 1898 | exact    | 4    | Marie ve Pierre Curie: Radyum, polonyum               | chemistry, physics  |

### Modern Fizik Çağı (1900 – 1945)

| Yıl  | Kesinlik | Önem | Olay                                                                     | Disiplin                |
| ---- | -------- | ---- | ------------------------------------------------------------------------ | ----------------------- |
| 1900 | exact    | 5    | Planck: Enerji paketler halinde (kuantum)                                | physics                 |
| 1903 | exact    | 4    | Wright kardeşler: Kontrollü uçuş                                         | technology              |
| 1905 | exact    | 5    | Einstein'ın mucize yılı: Özel görelilik, ışık kuantumu, atomların kanıtı | physics                 |
| 1909 | exact    | 5    | Haber-Bosch: Havadan gübre, milyarları doyurdu                           | chemistry, technology   |
| 1911 | exact    | 5    | Rutherford: Atomun çekirdeği var                                         | physics                 |
| 1912 | exact    | 4    | Wegener: Kıtalar kayar                                                   | earth                   |
| 1913 | exact    | 4    | Bohr atom modeli                                                         | physics                 |
| 1915 | exact    | 5    | Genel görelilik: Kütle uzay-zamanı büker                                 | physics, astronomy      |
| 1918 | exact    | 3    | Emmy Noether: Simetri ile korunum yasaları                               | mathematics, physics    |
| 1919 | exact    | 4    | Eddington tutulması: Görelilik doğrulandı                                | astronomy               |
| 1924 | exact    | 5    | Hubble: Başka galaksiler var                                             | astronomy               |
| 1925 | exact    | 5    | Heisenberg/Schrödinger: Kuantum mekaniği                                 | physics                 |
| 1927 | exact    | 4    | Belirsizlik ilkesi; Lemaître genişleyen evren                            | physics, astronomy      |
| 1928 | exact    | 5    | Fleming: Penisilin                                                       | medicine                |
| 1929 | exact    | 5    | Hubble: Evren genişliyor                                                 | astronomy               |
| 1931 | exact    | 4    | Gödel: Matematiğin sınırları                                             | mathematics             |
| 1932 | exact    | 4    | Chadwick: Nötron                                                         | physics                 |
| 1936 | exact    | 5    | Turing: Hesaplanabilirlik, evrensel makine                               | mathematics, technology |
| 1938 | exact    | 5    | Hahn/Meitner: Çekirdek bölünmesi                                         | physics                 |
| 1942 | exact    | 4    | Fermi: İlk zincirleme reaksiyon                                          | physics                 |
| 1945 | exact    | 5    | Trinity: İlk atom bombası; bilim ve sorumluluk                           | physics                 |

### Bilgi Çağı (1945 – 2000)

| Yıl  | Kesinlik | Önem | Olay                                                | Disiplin                |
| ---- | -------- | ---- | --------------------------------------------------- | ----------------------- |
| 1947 | exact    | 5    | Transistör                                          | physics, technology     |
| 1948 | exact    | 4    | Shannon: Bilgi kuramı, "bit"                        | mathematics, technology |
| 1953 | exact    | 5    | DNA çift sarmalı (Watson, Crick, Franklin, Wilkins) | biology                 |
| 1953 | exact    | 3    | Miller-Urey: Hayatın kimyası laboratuvarda          | chemistry, biology      |
| 1957 | exact    | 5    | Sputnik: İlk uydu                                   | astronomy, technology   |
| 1958 | exact    | 5    | Entegre devre (Kilby, Noyce)                        | technology              |
| 1958 | exact    | 4    | Keeling eğrisi: CO₂ ölçümü başladı                  | earth                   |
| 1960 | exact    | 4    | Lazer                                               | physics, technology     |
| 1961 | exact    | 5    | Gagarin: Uzayda ilk insan                           | astronomy               |
| 1964 | exact    | 4    | Kuarklar; Higgs mekanizması önerildi                | physics                 |
| 1965 | exact    | 5    | Kozmik mikrodalga arka plan: Big Bang'in yankısı    | astronomy               |
| 1967 | exact    | 3    | Jocelyn Bell Burnell: Pulsarlar                     | astronomy               |
| 1969 | exact    | 5    | Apollo 11: Ay'da insan                              | astronomy, technology   |
| 1969 | exact    | 5    | ARPANET: İnternetin tohumu                          | technology              |
| 1971 | exact    | 5    | Mikroişlemci (Intel 4004)                           | technology              |
| 1973 | exact    | 4    | Rekombinant DNA: Genetik mühendisliği               | biology                 |
| 1977 | exact    | 3    | Voyager fırlatıldı                                  | astronomy               |
| 1980 | exact    | 5    | Çiçek hastalığı yeryüzünden silindi                 | medicine                |
| 1983 | exact    | 4    | PCR: DNA'yı kopyalama makinesi                      | biology                 |
| 1985 | exact    | 4    | Ozon deliği keşfi → 1987 Montreal Protokolü         | earth                   |
| 1988 | exact    | 3    | IPCC kuruldu                                        | earth                   |
| 1989 | exact    | 5    | World Wide Web (Berners-Lee)                        | technology              |
| 1990 | exact    | 4    | Hubble Uzay Teleskopu                               | astronomy               |
| 1995 | exact    | 4    | İlk ötegezegen (51 Pegasi b)                        | astronomy               |
| 1996 | exact    | 3    | Koyun Dolly: Klonlama                               | biology                 |
| 1998 | exact    | 4    | Karanlık enerji: Genişleme hızlanıyor               | astronomy               |

### Bugün (2000 – )

| Yıl  | Kesinlik | Önem | Olay                                  | Disiplin            |
| ---- | -------- | ---- | ------------------------------------- | ------------------- |
| 2003 | exact    | 5    | İnsan Genom Projesi tamamlandı        | biology             |
| 2007 | exact    | 4    | Akıllı telefon: Cepte 60 yıllık bilim | technology          |
| 2012 | exact    | 5    | Higgs bozonu (CERN)                   | physics             |
| 2012 | exact    | 5    | CRISPR-Cas9 (Doudna, Charpentier)     | biology             |
| 2015 | exact    | 5    | Kütleçekim dalgaları (LIGO)           | physics, astronomy  |
| 2015 | exact    | 3    | Paris İklim Anlaşması                 | earth               |
| 2019 | exact    | 4    | İlk kara delik fotoğrafı              | astronomy           |
| 2020 | exact    | 5    | mRNA aşıları: 1 yılda pandemi aşısı   | medicine            |
| 2020 | exact    | 4    | AlphaFold: Protein katlanması çözüldü | biology, technology |
| 2022 | exact    | 4    | James Webb'in ilk görüntüleri         | astronomy           |
| 2022 | exact    | 4    | NIF: Füzyonda net enerji kazancı      | physics             |
| 2022 | exact    | 4    | Büyük dil modelleri kamuya açıldı     | technology          |

Toplam: ~110 çekirdek olay. Bunlara olay başına ortalama 3 bağlantı eklenince 300+ bağlantı hedefi doğal olarak tutar.

## Doğruluk süreci

Sen bilim insanı değilsin; ben de hata yapabilirim. O yüzden süreç kişiye değil kurala dayanır:

1. **İki kaynak kuralı**: Her olay için en az 2 bağımsız kaynak. Tercih sırası: Britannica, Stanford Encyclopedia of Philosophy,
   ilgili dildeki Wikipedia (İngilizce Wikipedia daha güvenilir), üniversite sayfaları, hakemli tarih kitapları.
2. **Yıl çelişirse**: `circa` işaretle ve gövdede "kaynaklar 1609-1610 arasında" gibi belirt.
3. **Öncelik tartışması varsa** ("kim ilk buldu"): Hepsini yaz. Kahraman seçme.
4. **Claude ile taslak**: Ben taslak yazarım, sen kaynaklarla karşılaştırırsın. Şüphe varsa yayınlamayız.
5. **Hata bildirimi**: `about` sayfasında "hata gördün mü?" e-posta bağlantısı. Düzeltmeler ADR gibi loglanır.

## Görseller ve lisans

- Sadece **kamu malı** veya **CC BY / CC BY-SA** görseller. Kaynak: Wikimedia Commons.
- Her görselde: yazar/kaynak, lisans, Commons linki. Form bunları zorunlu tutar.
- Eski portreler, kitap kapakları, çizimler çoğunlukla kamu malı. Modern fotoğraflarda (LIGO, JWST) NASA/ESA görselleri genelde serbesttir; kontrol et.
- Görsel yoksa olay yine yayınlanır: disiplin renginde, yılın büyük yazıldığı üretilmiş bir kart kullanılır. Görsel bekleyen olay olmaz.

## Üretim temposu

- 1. ay: 50 olay (Türkçe veya İngilizce, tek dil). Günde 2 olay, haftada 5 gün.
- 2. ay: +60 olay ve 4 dile çeviri hattı. Makine çevirisi + senin gözden geçirmen.
- 3. ay: +90 olay, bağlantılar, kişiler. 200'e ulaş.
- Sonrası: haftada 5-10 olay sürdürülebilir tempo.

Bir olayı sıfırdan yazıp doğrulamak ilk başta 45-60 dk sürer; şablon oturunca 20-30 dk.
