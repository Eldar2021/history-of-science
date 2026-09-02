# 01 — Vizyon

## Tek cümle

> İnsanlığın bilimle nasıl bugüne geldiğini, bilim insanı olmayan meraklı insanlara,
> **bir zaman çizgisine düşmüş gibi** adım adım ve dört dilde anlatan site.

## Çıkış noktası (senin sözlerinle)

"Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım. Ne elektriği ne ilacı ne bir makineyi bulabilirdim.
Her şeyi bilmiş gibi kullanıyoruz ama aslında hiçbir şeyi bilmiyoruz."

Bu cümle projenin ruhu. Site bir ansiklopedi değil; **bir hayret yolculuğu**. Amaç bilgi yığmak değil,
"bu nasıl oldu da böyle oldu?" sorusunu her adımda hissettirmek.

## Çözdüğümüz problem

Bilim tarihi kaynakları iki uçta toplanıyor:

- **Wikipedia tarzı**: Doğru ama kuru, bağlantısız, bir olaydan diğerine geçince "neden" kaybolur.
- **Popüler kitaplar/belgeseller**: Sürükleyici ama doğrusal değil, tarama yapamazsın, dört dilde yok, Kırgızca hiç yok.

Aradaki boşluk: **Zamanda gezinilebilir, zincirleme anlatan, hafif, çok dilli** bir kaynak.

## Hedef kitle (personalar)

| Persona                    | Kim                                                                       | Ne ister                                                            | Sitede ne yapar                                                        |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Meraklı yetişkin** (sen) | 25-45, bilim insanı değil, teknolojiyi kullanıyor ama "nasıl"ını bilmiyor | Hayret, bağlantı, "ha, demek bu yüzden" anı                         | Akşam telefonundan 20 dk kaydırır, bir olaya dalar, zinciri takip eder |
| **Lise öğrencisi**         | 14-18, Bişkek/İstanbul/Almatı, ders kitabı sıkıcı geliyor                 | Kısa, görsel, kendi dilinde                                         | Ödev için bir çağa bakar, belki bir bilim insanına takılır kalır       |
| **Öğretmen**               | Fen/tarih öğretmeni                                                       | Sınıfta projeksiyonla gösterilecek güvenilir kaynak                 | Bir çağı büyük ekranda açar, disipline göre filtreler                  |
| **Kırgızca/Rusça okuyucu** | Orta Asya'da, İngilizce kaynaklara erişimi sınırlı                        | Kendi dilinde kaliteli içerik, kendi coğrafyasından bilim insanları | Uluğ Bey, El-Biruni, El-Harezmi'yi keşfeder                            |

Birincil persona: **meraklı yetişkin**. Onun için tasarlarsak öğrenci de öğretmen de faydalanır. Tersi doğru değil.

## Ürün ilkeleri

Her karar bu altı ilkeyle sınanır. Çelişirse ilke kazanır.

1. **Önce hikâye, sonra ansiklopedi.** Her olay "ne oldu"dan çok "neden önemliydi" ve "önceki neye dayandı" diye anlatılır.
2. **Hiçbir keşif tek başına değildir.** Olaylar arası bağlantı (dayanır / mümkün kıldı) birinci sınıf veridir, süs değil.
3. **"Orada olsaydın" hissi.** Her olayda, o günün insanının neyi bilmediğini hatırlatan küçük bir kutu. Hayreti canlı tutar.
4. **Dürüst tarih.** Tarihler yaklaşıktır, öncelik tartışmalıdır, "kim buldu" çoğu zaman "kimler buldu"dur. Belirsizliği saklamayız.
5. **Dört dil eşit vatandaştır.** Kırgızca ikinci sınıf olmayacak. Bir olay dört dilde yoksa, "eksik" olarak görünür, gizlenmez.
6. **Hafif ve hızlı.** Zayıf telefonda, yavaş internette bile akar. Süs animasyonu içerikten önce gelmez.

## Neyi YAPMIYORUZ (en az yaptıklarımız kadar önemli)

- Wikipedia klonu değil. Her olay için tam biyografi/makale yazmıyoruz; 300-600 kelime yeter.
- Ders kitabı değil. Formül, ispat, sınav sorusu yok.
- Sosyal ağ değil. İlk sürümde yorum, kullanıcı hesabı, forum yok.
- "Her şey" değil. 3 ayda 200 olay, 5 yılda belki 2000. Seçici olmak özelliktir.
- Mobil uygulama ilk 3 ayda yok. Önce web, mobil uyumlu. Flutter uygulaması 4. aydan sonra düşünülür.

## Fark yaratan özellik: "Buraya nasıl geldik?" zinciri

Sitenin Wikipedia'dan farkı şu ekran olacak: Bir olaya tıkla (örn. "Akıllı telefon, 2007"),
"Buraya nasıl geldik?" de, ve geriye doğru zincir açılsın:

Akıllı telefon → mikroişlemci (1971) → entegre devre (1958) → transistör (1947) → kuantum mekaniği (1925)
→ elektron (1897) → Maxwell denklemleri (1865) → Faraday indüksiyon (1831) → Volta pili (1800) → ...

Bu görünüm senin "o yüzyıla gitsem hiçbir şey yapamazdım" içgörünü **görselleştirir**. MVP'de veri modelinde yeri ayrılır, 3. ayda ekran olarak gelir.

## Başarı nasıl ölçülür

3. ay sonunda:

| Ölçüt                         | Hedef                                                |
| ----------------------------- | ---------------------------------------------------- |
| Yayınlanmış olay              | 200+                                                 |
| Dört dilde tamamlanmış olay   | 150+                                                 |
| Olaylar arası bağlantı        | 300+                                                 |
| Lighthouse (mobil) performans | 90+                                                  |
| İlk gerçek kullanıcı          | 100 kişi, en az 20'si geri bildirim vermiş           |
| Ortalama oturum               | 5 dk üstü (bir yıl sayısına bakıp kaçmıyorlar demek) |

1 yıl sonunda: bir öğretmen sınıfta kullanmış olsun. Bir öğrenci "bu siteden dolayı fizik bölümünü seçtim" desin. Bu ölçülmez ama hedef bu.

## İsim adayları (karar senin)

| Aday               | Dil      | Anlam                        | Not                                                                           |
| ------------------ | -------- | ---------------------------- | ----------------------------------------------------------------------------- |
| **Uchkun / Учкун** | ky       | Kıvılcım                     | Kırgızca, kısa, her dilde okunur, alan adı bulunabilir                        |
| **Kıvılcım**       | tr       | Spark                        | Türkçe, Latin harfli okuyucu için zor değil ama Cyrillic okuyucu için yabancı |
| **Eureka**         | evrensel | Arşimet'in "buldum!" çığlığı | Bilinir, ama çok kullanılmış                                                  |
| **Lumen**          | latin    | Işık                         | Kısa, nötr, biraz soğuk                                                       |
| **Nokta / Точка**  | tr/ru    | Başlangıç noktası            | Timeline'daki her olay bir nokta                                              |

Öneri: **Uchkun**. Projeye Orta Asya kimliği verir, dört dilde de telaffuz edilir, "kıvılcım" bilimin doğuşuna çok yakışır.
Dokümanlarda bundan sonra "site" diyeceğim; ismi seçince bul-değiştir yaparız.

## Uzun vadeli hayal (3 aydan sonrası, 10-riskler'de detay)

- "Bugün bilim tarihinde" günlük bildirim / widget.
- "Orada olsaydın" senaryoları: "1665'te Londra'dasın, veba var, elinde ne var?" mini etkileşimli hikâyeler.
- Öğretmen modu: bir çağı sunum gibi göstermek.
- Kullanıcı katkısı: kaynaklı olay önerisi, editör onayı ile.
- Flutter mobil uygulama (çevrimdışı okuma).
- Podcast/sesli anlatım: her olay 2 dakikalık ses.
