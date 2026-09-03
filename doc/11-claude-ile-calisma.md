# 11 — Claude Code ile Çalışma Rehberi

Bu projeyi birlikte yürütüyoruz. Bu doküman, her oturumun verimli geçmesi için kuralları ve hazır istekleri toplar.

## Temel ilkeler

1. **Dokümanlar tek gerçek kaynak.** Bir istekte "04-mimari'deki şemaya göre" de; ben okurum. Konuşmada anlatmak yerine dokümana yaz.
2. **Haftanın hedefi = oturumun hedefi.** 08'deki kutucukları teker teker ver. "Siteyi yap" değil, "Hafta 2, kutucuk 1-3".
3. **Küçük adımlar, sık commit.** Her kutucuk bir commit. Bozulursa geri almak kolay.
4. **Ben plan yaparım, sen onaylarsın, ben kodlarım, sen test edersin.** Kod yazmadan önce plan modunda ne yapacağımı özetlerim; büyük değişikliklerde "devam" demeni beklerim.
5. **Kararlar ADR'ye.** Bir şeyi değiştirmek istersen "ADR-002'yi Payload'a çevirelim" de; dosyayı güncelleyip kodu ona göre yazarım.
6. **İçerik doğrulama senin.** Ben olay taslağı yazarım, kaynak öneririm; yayınla kararı senin.

## CLAUDE.md şablonu (repo köküne, Hafta 1)

```markdown
# Uchkun (Учкун) — Bilim Tarihi Timeline

Dört dilli (en, ru, ky, tr) bilim tarihi timeline sitesi. Dokümanlar `doc/` altında; önce `doc/00-README.md`.

## Yapı
- `web/`: Next.js 15 App Router, TypeScript, Tailwind v4, next-intl. Site + `/admin`.
- `backend/supabase/`: SQL migration'lar, seed, script'ler. Supabase (Postgres, Auth, Storage).
- `mobile/`: Flutter, 4. ay+. Şimdilik boş.
- `resource/`: tasarım, fontlar, görsel kaynak listesi.

## Kurallar
- Şema değişikliği = yeni migration dosyası (`backend/supabase/migrations/NNNN_*.sql`) + `supabase gen types`.
- Yıl formatlama sadece `web/lib/i18n/formatYear.ts` üzerinden. Negatif yıl = MÖ.
- UI metni `web/messages/*.json`; içerik veritabanında. Kodda sabit metin yok.
- Taslak ve review içerik RLS ile gizli; frontend'de `status` filtresi ek güvenlik, birincil değil.
- Otomatik içerik hattı (`backend/scripts/draft-next.ts`) yalnızca `status='review'` yazar; `published` yazan kod insan eylemi olmalı.
- Zaman ölçeği tek fonksiyon: `web/lib/timeline/xScale.ts`; minimap ve Keşfet kanvası bunu paylaşır.
- Türkçe büyük harf: `toUpperCase()` yasak; `toLocaleUpperCase('tr')` ya da hiç.
- Her yeni font `Ңөү` ile test edilir.
- Commit: İngilizce, `type(scope): özet`. Örn. `feat(timeline): sticky year indicator`.
- Test: `npm test` (Vitest) + `npm run e2e` (Playwright). PR öncesi ikisi de yeşil.

## Komutlar
- `cd web && npm run dev` — site
- `cd backend && supabase start` — yerel DB
- `cd backend && supabase db reset` — migration + seed baştan
- `cd web && npm run gen:types` — Supabase tiplerini üret
- `cd backend && npm run translate:missing` — eksik çevirileri üret
- `cd backend && npm run draft:next` — içerik hattını elle bir kez çalıştır

## Kararlar
Mimari kararlar `doc/09-kararlar-ADR.md`. Değiştirmeden önce oku.
```

## Haftalık başlangıç istekleri (kopyala-yapıştır)

### Hafta 1
> `doc/` altındaki tüm dokümanları oku. Sonra 08-yol-haritasi Hafta 1 "Kod" kutucuklarını sırayla yap: web/ altında Next.js 15 + TS + Tailwind v4 + next-intl kur, 4 dil rotası çalışsın; backend/supabase altında 04-mimari'deki şemayla 0001_init.sql yaz; 8 çağ, 8 disiplin ve 10 örnek olayı 4 dilde seed et. Her adımdan sonra commit at. Başlamadan önce planını özetle.

### Hafta 2
> 05-timeline-ux'e göre timeline sayfasını yap: dikey akış, 3 boyutta olay kartı, sticky çağ başlığı, zaman boşluğu işareti, canlı yıl göstergesi. `formatYear` fonksiyonunu 06-i18n'deki tabloya göre yaz ve 32 durumu Vitest ile test et. Tasarım token'ları `resource/design/tokens.json`dan.

### Hafta 3
> Olay detayını paralel rota ile masaüstünde yan panel, mobilde sheet olarak yap; doğrudan URL'de tam sayfa. Geri tuşunda kaydırma konumu korunsun. Ana sayfa ve "Zamana düş" sayaç geçişini ekle, reduced-motion varyantıyla. Minimap'i SVG ile yap.

### Hafta 4
> Supabase Auth ile admin girişi, profiles.role, 04-mimari'deki RLS politikaları. /admin/events liste ve form (02'deki P0 alanlar). Server action kaydedince revalidateTag ile sitede anında görünsün. Playwright ile "admin ekler, sitede görünür" testini yaz. RLS'nin taslağı sızdırmadığını anonim istekle test et.

### Hafta 5
> 04-mimari'deki "Otomatik içerik hattı"nı yap: backend/scripts/draft-next.ts, Claude API web search ile 3+ kaynak, 03'teki şablona göre İngilizce JSON taslak, status='review' ve drafted_by='ai' ile Supabase'e yaz, Telegram'a bildir. GitHub Actions cron ekle. /admin/review kuyruğunu yap: Yayınla / Düzenle / Reddet. Önce elle 3 taslak üret, bana göster, prompt'u birlikte ayarlayalım.

### Hafta 6
> 06-i18n'deki çeviri hattını yap: web/lib/translate.ts Claude API ile, JSON şema doğrulamalı, kaynak dili olaydan okur, Kırgızca için tr+ru referanslı; /admin/translate/[id] dört dil yan yana; editor rolü; machine/reviewed rozetleri sitede. Görsel yükleme ve zorunlu lisans alanları. UI metinlerini 4 dile tamamla, check-i18n script'ini yaz.

### Hafta 11
> 05-timeline-ux'teki "Keşfet modu"nu yap: /explore, SVG + d3-zoom, xScale ortak fonksiyon, Z0-Z2 anlamsal zoom, 8 disiplin şeridi, importance'a göre görünürlük, kümeleme, görünür pencere dışını render etme, URL senkron, Akış ile geçişte konum korunur. Önce masaüstü. Başlamadan önce bileşen ve durum planını özetle.

### İçerik oturumu (hat dışında elle yazmak istersen)
> 03-icerik'teki şablon ve ses tonuyla şu olayları İngilizce (ya da Kırgızca/Türkçe) yaz: [liste]. Her biri için en az 2 kaynak URL'si öner, yıl belirsizse söyle. Efsane olan kısımları "efsane" diye işaretle. Çıktıyı admin formuna yapıştırılacak biçimde ver.

### Hat kalitesi oturumu (Hafta 5'ten sonra ayda bir)
> Son 30 gündeki review kuyruğunda reddedilen ve çok düzenlenen taslaklara bak (research_note ve fark). Ortak sorunları çıkar, draft-next.ts prompt'unu buna göre iyileştir, 3 yeni taslakla test et.

### Tasarım oturumu
> 07'deki promptu kullanarak design becerisiyle timeline ekranının mobil karanlık tema konseptini üret. Kırgızca örnek metni kullan, Ңөү harflerini göster.

### Sorun giderme
> [hata/ekran görüntüsü]. Önce sebebi bul, düzeltmeden önce açıkla, sonra en küçük düzeltmeyi yap ve ilgili testi ekle.

## Ne zaman plan modu

- Yeni bir sayfa/özellik: evet, önce plan.
- Şema değişikliği: evet, mutlaka.
- Bug düzeltme, metin değişikliği, stil: hayır, doğrudan.

## Oturum sonu ritüeli

Her oturum bitince benden şunu iste:
> Bu oturumda ne yapıldı, ne yarım kaldı, 08'deki hangi kutucuklar işaretlenmeli, yeni bir karar/risk çıktı mı? Dokümanları güncelle ve commit at.
