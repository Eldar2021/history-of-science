# doc/ — Rehber

Bu klasör projenin çalışan hafızasıdır. Amacı **her oturumda baştan anlatmamak**, arşiv tutmak değil.
Bitmiş iş buradan silinir; kanıtı kodda ve git geçmişinde durur.

## Dosyalar

| #      | Dosya                                                          | Ne anlatır                                                  | Ne zaman okunur      |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------------- | -------------------- |
| —      | [../README.md](../README.md)                                   | Vizyon, kitle, ürün ilkeleri, klasörler, çalıştırma         | İlk kez bakan        |
| 03     | [03-icerik-stratejisi.md](03-icerik-stratejisi.md)             | Çağlar, disiplinler, olay şablonu, ses tonu, yazılacak liste | İçerik yazarken      |
| 04     | [04-mimari.md](04-mimari.md)                                   | Yığın, veri modeli, yayın akışı, içerik hattı, ortam        | Kod yazarken         |
| 06     | [06-i18n-stratejisi.md](06-i18n-stratejisi.md)                 | Yıl tablosu, dil tuzakları, çeviri hattı                    | Dil işine girerken   |
| 08     | [08-yol-haritasi.md](08-yol-haritasi.md)                       | Kalan haftalar ve kilometre taşları                         | Hafta başı           |
| 09     | [09-kararlar-ADR.md](09-kararlar-ADR.md)                       | Hâlâ bağlayıcı olan kararlar ve gerekçeleri                 | Bir kararı sorgularken |
| 10     | [10-riskler-ve-acik-sorular.md](10-riskler-ve-acik-sorular.md) | Açık sorular, canlı riskler, park edilmiş fikirler          | Hafta başı           |
| 11     | [11-claude-ile-calisma.md](11-claude-ile-calisma.md)           | Bu projeyi Claude Code ile yürütme kuralları                | Her oturum           |
| STATUS | [STATUS.md](STATUS.md)                                         | Şu an neredeyiz, ne bekliyor, son oturum                    | Her oturum başı      |

Numaralarda boşluk var (01, 02, 05, 07 kaldırıldı, 2026-09-04). Numaralar korundu ki koddaki ve
`.claude/` altındaki referanslar kırılmasın. Kaldırılanlar: vizyon ve spesifikasyon `README.md`'ye ve
kabul kriterleri `08`'e taşındı; timeline UX ve tasarım promptu işlevini bitirdi, karşılığı kodda.

## Bakım kuralı

- Bir madde bitti mi, doküman**dan** silinir. "Ne yapıldı" sorusunun cevabı `git log`.
- Bir karar değişirse `09`'a yeni ADR; eskisi "Geçersiz, bkz. ADR-N" olarak kalır ya da silinir.
- Yeni fikir → `10`'daki Park listesi. Ayda bir bakılır.
