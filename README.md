# Uchkun (Учкун) — Bilim Tarihi Timeline

İnsanlığın bilimle Thales'ten yapay zekâya nasıl geldiğini, bilim insanı olmayan meraklı insanlara,
**bir zaman çizgisine düşmüş gibi** adım adım ve dört dilde (en, ru, ky, tr) anlatan site.

Yayında: https://history-of-science.vercel.app · Güncel durum: [doc/STATUS.md](doc/STATUS.md)

## Neden

> "Şu anki bilgimle o yüzyıllara gitseydim hiçbir şey yapamazdım. Ne elektriği ne ilacı ne bir makineyi
> bulabilirdim. Her şeyi bilmiş gibi kullanıyoruz ama aslında hiçbir şeyi bilmiyoruz."

Bu cümle projenin ruhu. Site bir ansiklopedi değil, bir hayret yolculuğu. Amaç bilgi yığmak değil,
"bu nasıl oldu da böyle oldu?" sorusunu her adımda hissettirmek.

Mevcut kaynaklar iki uçta: Wikipedia doğru ama kuru ve bağlantısız; popüler kitaplar sürükleyici ama
taranamaz, dört dilde yok, Kırgızca hiç yok. Aradaki boşluk: zamanda gezinilebilir, zincirleme anlatan,
hafif, çok dilli bir kaynak.

## Kim için

Birincil kitle **meraklı yetişkin**: 25-45 yaş, bilim insanı değil, teknolojiyi kullanıyor ama "nasıl"ını
bilmiyor. Akşam telefonundan 20 dakika kaydırır, bir olaya dalar, zinciri takip eder. Onun için
tasarlarsak lise öğrencisi de öğretmen de faydalanır; tersi doğru değil.

İkincil: lise öğrencisi (Bişkek/İstanbul/Almatı), fen ve tarih öğretmeni, ve Kırgızca/Rusça okuyucu —
El-Harezmi'yi, El-Biruni'yi, Uluğ Bey'i kendi dilinde okuyan Orta Asyalı.

## Ürün ilkeleri

Her karar bu altı ilkeyle sınanır. Çelişirse ilke kazanır.

1. **Önce hikâye, sonra ansiklopedi.** "Ne oldu"dan çok "neden önemliydi" ve "önceki neye dayandı".
2. **Hiçbir keşif tek başına değildir.** Olaylar arası bağlantı birinci sınıf veridir, süs değil.
3. **"Orada olsaydın" hissi.** Her olayda o günün insanının neyi bilmediğini hatırlatan küçük bir kutu.
4. **Dürüst tarih.** Tarihler yaklaşıktır, öncelik tartışmalıdır, "kim buldu" çoğu zaman "kimler buldu"dur.
   Belirsizliği saklamayız. Her sayfada dürüstlük bandı: "Bu siteyi yapan kişi tarihçi ya da bilim insanı
   değil. Bir hata gördüyseniz lütfen bildirin." Zayıflık değil, güven kaynağı.
5. **Dört dil eşit vatandaştır.** Kırgızca ikinci sınıf olmayacak. Bir olay dört dilde yoksa "eksik"
   görünür, gizlenmez. Yayın sırası pratik nedenle İngilizce önce.
6. **Hafif ve hızlı.** Zayıf telefonda, yavaş internette bile akar. Süs animasyonu içerikten önce gelmez.

## Neyi yapmıyoruz

Wikipedia klonu değil (olay başına 300-600 kelime yeter). Ders kitabı değil (formül, ispat, sınav yok).
Sosyal ağ değil (yorum, hesap, forum yok). "Her şey" değil — seçici olmak özelliktir.

## Fark yaratan üç şey

- **Küre + zaman şeridi** (yayında): bilginin İskenderiye → Bağdat → Semerkant → Londra göçü, zaman
  çizelgesiyle aynı ekranda.
- **"Buraya nasıl geldik?" zinciri** (Faz D): bir olaydan geriye bağımlılık zinciri. Akıllı telefon →
  mikroişlemci → transistör → kuantum mekaniği → Maxwell → Faraday → Volta.
- **Dürüstlük bandı** (yayında): 4. ilke, her sayfada.

## Başarı ölçütü

200+ yayınlanmış olay, 150+'si dört dilde, 300+ bağlantı, Lighthouse mobil 90+, 100 gerçek kullanıcı.
1 yıl sonunda: bir öğretmen sınıfta kullanmış olsun. Bir öğrenci "bu siteden dolayı fizik bölümünü
seçtim" desin.

## İsim

**Uchkun / Учкун** — Kırgızca "kıvılcım". Latin ve Kiril yazımı birlikte kullanılır. Alan adı henüz yok
(uchkun.science / .kg / .org adayları, Faz C).

## Klasörler ve çalıştırma

`doc/` çalışan hafıza · `web/` Next.js sitesi + `/admin` · `backend/` Supabase migration'ları, seed,
script'ler · `.github/` her PR'da CI, her gece veritabanı yedeği · `mobile/` Flutter (sonra, boş).
Çalışma kuralları `CLAUDE.md`'de.

```
colima start                      # Docker
cd backend && supabase start      # yerel Postgres + Auth
cd web && npm run dev             # site + admin
```

`cd web && npm run check` typecheck + lint + unit test; `npm run e2e` Playwright.
Ayrıntı: [doc/mimari.md](doc/mimari.md).

Tasarım referansı: https://eyes.nasa.gov/apps/solar-system/#/earth
