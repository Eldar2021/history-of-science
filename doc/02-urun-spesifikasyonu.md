# 02 — Ürün Spesifikasyonu

Bu doküman "ne yapılacak"ı netleştirir. "Nasıl" için 04-mimari ve 05-timeline-ux'e bak.

## Öncelik dili

- **P0 (MVP, 1. ay)**: Bunsuz site yok.
- **P1 (v1.0, 3. ay sonu)**: Yayına çıkmadan olmalı.
- **P2 (sonrası)**: Güzel olur, aceleye gerek yok.

## Sayfa haritası

| Rota                                            | Sayfa                         | Öncelik | Açıklama                                                                           |
| ----------------------------------------------- | ----------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `/{dil}`                                        | Ana sayfa / giriş             | P0      | Tek cümle vaat, "Zamana düş" butonu, mini önizleme timeline                        |
| `/{dil}/timeline`                               | Timeline                      | P0      | Ürünün kalbi. Dikey akış, çağ bölümleri, yıl göstergesi, filtre                    |
| `/{dil}/timeline?year=1687`                     | Timeline, belirli yıla odaklı | P0      | Paylaşılabilir derin bağlantı                                                      |
| `/{dil}/event/{slug}`                           | Olay detay                    | P0      | Başlık, yıl, özet, gövde, "neden önemli", "orada olsaydın", bağlantılar, kaynaklar |
| `/{dil}/era/{slug}`                             | Çağ sayfası                   | P1      | Çağın hikâyesi + o çağın olayları                                                  |
| `/{dil}/discipline/{slug}`                      | Disiplin sayfası              | P1      | "Sadece astronomi" akışı                                                           |
| `/{dil}/person/{slug}`                          | Kişi sayfası                  | P1      | Bilim insanı: yaşam aralığı, olayları                                              |
| `/{dil}/chain/{slug}`                           | "Buraya nasıl geldik?"        | P1      | Bir olaydan geriye bağımlılık zinciri                                              |
| `/{dil}/search?q=`                              | Arama                         | P1      | Başlık + özet üzerinde arama, dile göre                                            |
| `/{dil}/about`                                  | Hakkında                      | P1      | Neden bu site, kaynaklar, katkı, iletişim                                          |
| `/admin`                                        | Admin girişi                  | P0      | Sadece admin rolü, dil ön eki yok                                                  |
| `/admin/events`                                 | Olay listesi                  | P0      | Tablo: yıl, başlık, durum, hangi dillerde var                                      |
| `/admin/events/new` ve `/{id}`                  | Olay editörü                  | P0      | Form (aşağıda detay)                                                               |
| `/admin/translate/{id}`                         | Çeviri ekranı                 | P1      | Yan yana 4 dil, "Claude ile çevir" butonu                                          |
| `/admin/people`, `/admin/eras`                  | Diğer varlıklar               | P1      | Basit CRUD                                                                         |
| `/sitemap.xml`, `/robots.txt`, `/og/{slug}.png` | SEO                           | P1      | Otomatik üretilen                                                                  |

## Kullanıcı hikâyeleri

### Ziyaretçi

- **P0** Siteyi açtığımda 3 saniyede ne olduğunu anlarım ve tek tıkla timeline'a düşerim.
- **P0** Timeline'da kaydırdıkça hangi yılda olduğumu her an görürüm.
- **P0** Bir olaya tıklayınca sayfa değişmeden (ya da çok hızlı) detayını okurum; geri dönünce kaldığım yerdeyim.
- **P0** Dili değiştirdiğimde aynı sayfada kalırım, sadece dil değişir. URL paylaşınca karşı taraf aynı dilde açar.
- **P0** Telefonda tek elle rahat kullanırım.
- **P1** Bir çağa (örn. "Bilimsel Devrim") doğrudan atlarım.
- **P1** Sadece bir disiplini (örn. astronomi) görürüm; diğerleri soluklaşır ya da kaybolur.
- **P1** Bir olayın "neye dayandığı" ve "neyi mümkün kıldığı"nı görür, zincir boyunca yürürüm.
- **P1** Keşfet modunda iki parmakla / tekerlekle yakınlaşıp uzaklaşır, 2600 yılın gerçek ölçeğini hissederim.
- **P0** Her sayfada "yapan kişi bilim insanı değil, hata gördüysen bildir" notunu görür, tek tıkla bildirim gönderirim.
- **P2** Bir olayı ararım.
- **P1** Bir olayın linkini paylaşınca güzel bir önizleme kartı çıkar (OG image).
- **P2** "Geriye sar" modunda bugünden başlayıp geçmişe doğru giderim.
- **P2** Karanlık/aydınlık temayı seçerim (sistem tercihini otomatik alır).
- **P2** "Bugün bilim tarihinde" kutusunu görürüm.

### Admin (sen)

- **P0** Giriş yaparım (e-posta + şifre). Başkası admin sayfalarını göremez.
- **P0** Yıl, başlık, açıklama girer, kaydederim; 60 saniye içinde (hedef: anında) sitede görünür.
- **P0** Olayı "taslak" olarak tutabilirim; taslaklar sitede görünmez.
- **P0** MÖ yıl girebilirim (negatif sayı ya da "MÖ" onay kutusu). "Yaklaşık" işaretleyebilirim.
- **P0** Olaya bir veya birden fazla disiplin atarım.
- **P0** Olayı silebilirim (yumuşak silme: geri alınabilir).
- **P1** Bir dilde (ky, tr ya da en) yazar, "çevir" derim; diğer 3 dile taslak çeviri gelir; düzenler, onaylarım.
- **P1** Her sabah onay kuyruğunda Claude'un hazırladığı 1-2 yeni olay taslağını (kaynaklarıyla) bulurum; okur, düzeltir, yayınlarım. Bildirim Telegram/e-posta ile gelir.
- **P1** Admin arayüzünü kendi dilimde (ky/tr/en/ru) kullanırım.
- **P1** Bir olayı başka olaylara "dayanır / mümkün kıldı" ile bağlarım (arama ile seçerek).
- **P1** Olaya kişi(ler) eklerim.
- **P1** Görsel yüklerim; lisans/atıf alanını doldurmadan kaydedemem.
- **P1** Kaynak (başlık + URL) eklerim; kaynaksız olay "yayınla" butonunu uyarır.
- **P1** Listede hangi olayın hangi dilde eksik olduğunu bir bakışta görürüm.
- **P2** Bir olayı önizlerim (yayınlamadan, sitede nasıl görüneceğini).
- **P2** Değişiklik geçmişini görürüm.

## Olay editörü formu (P0 alanlar kalın)

| Alan            | Tip                  | Kural                                                                                         |
| --------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| **Yıl**         | tamsayı              | Negatif = MÖ. Zorunlu.                                                                        |
| Bitiş yılı      | tamsayı              | Süreçler için (örn. 1925-1927 kuantum mekaniği). İsteğe bağlı.                                |
| **Kesinlik**    | seçim                | `exact`, `circa` (yaklaşık), `decade`, `century`. Gösterimi etkiler: "MÖ y. 300"              |
| **Başlık**      | metin, dil başına    | 80 karakter üstü uyarı                                                                        |
| **Özet**        | metin, dil başına    | 1-2 cümle, 200 karakter. Timeline kartında görünür.                                           |
| Gövde           | markdown, dil başına | 300-600 kelime hedef                                                                          |
| Neden önemli    | metin, dil başına    | 2-3 cümle. Detay sayfasında vurgulu kutu.                                                     |
| Orada olsaydın  | metin, dil başına    | 1-2 cümle: o gün insanlar neyi bilmiyordu                                                     |
| **Disiplinler** | çoklu seçim          | En az 1                                                                                       |
| Çağ             | otomatik             | Yıla göre otomatik hesaplanır, elle değiştirilebilir                                          |
| Önem            | 1-5                  | 5 = timeline'da her zoom seviyesinde görünür; 1 = sadece yakınlaşınca                         |
| Görsel          | dosya                | + atıf metni + lisans + kaynak URL (üçü zorunlu)                                              |
| Kişiler         | çoklu seçim          | Arama ile                                                                                     |
| Bağlantılar     | liste                | Hedef olay + tür (`builds_on`, `enables`, `contradicts`, `parallel`)                          |
| Kaynaklar       | liste                | Başlık + URL + tür (kitap, makale, ansiklopedi)                                               |
| **Durum**       | seçim                | `draft`, `published`                                                                          |
| Slug            | metin                | Başlıktan otomatik (İngilizce başlıktan; yoksa kaynak dilden transliterasyon), düzenlenebilir |

## Kabul kriterleri (MVP, 4. hafta sonu)

- [ ] `/tr/timeline` açılıyor, en az 50 yayınlanmış olay dikey akışta, çağ başlıkları ile.
- [ ] Kaydırınca sabit yıl göstergesi güncelleniyor.
- [ ] Olaya tıklayınca detay açılıyor, tarayıcı geri tuşu timeline'da aynı konuma dönüyor.
- [ ] `/admin` sadece giriş yapmış admin'e açılıyor; anonim istek 302 ile login'e gidiyor.
- [ ] Admin'de yeni olay kaydedince, 60 saniye içinde (hedef anında) timeline'da görünüyor, deploy gerekmeden.
- [ ] Taslak olaylar sitede görünmüyor, API'den de dönmüyor (RLS ile veritabanı seviyesinde).
- [ ] Dört dil rotası (`/en`, `/ru`, `/ky`, `/tr`) çalışıyor; içerik çevirisi yoksa kaynak dil gösteriliyor ve "bu dilde henüz yok" rozeti çıkıyor.
- [ ] Mobil Lighthouse performans 85+.

## Kabul kriterleri (v1.0, 12. hafta sonu)

- [ ] 200+ yayınlanmış olay İngilizce; 150+'si dört dilde (ky/tr sen + Kırgızca öğretmen, ru gözden geçirici; kalanlar `machine` rozetli).
- [ ] Çağ, disiplin, kişi sayfaları çalışıyor.
- [ ] "Buraya nasıl geldik?" zincir görünümü en az 20 olay için anlamlı zincir üretiyor.
- [ ] Keşfet (kanvas) modu masaüstünde Z0-Z2, mobilde sıkıştırma ile çalışıyor; akış moduyla URL uyumlu.
- [ ] Onay kuyruğu çalışıyor; en az 50 olay bu hattan geçmiş.
- [ ] Dürüstlük bandı ve hata bildirimi 4 dilde her sayfada.
- [ ] OG görselleri otomatik üretiliyor; Twitter/WhatsApp/Telegram'da önizleme düzgün.
- [ ] Çeviri ekranı çalışıyor; makine çevirisi rozeti sitede görünüyor.
- [ ] Lighthouse: performans 90+, erişilebilirlik 95+, SEO 95+.
- [ ] Gerçek alan adında, HTTPS ile yayında.
- [ ] `about` sayfasında kaynak politikası ve iletişim var.

## Bilinçli olarak dışarıda bırakılanlar

- Kullanıcı hesabı, yorum, beğeni, favori (P2+, belki hiç).
- Çoklu admin / rol yönetimi (tek admin yeter; ikinci editör gelirse `editor` rolü eklenir).
- WYSIWYG editör (markdown + önizleme yeter).
- Arama (v1.0'da yok; çağ + disiplin filtresi + kanvas yeterli; 4. ay).
- Gerçek zamanlı işbirliği.
- Mobil uygulama (4. ay+).
