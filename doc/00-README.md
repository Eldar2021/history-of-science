# Bilim Tarihi Timeline Projesi — Dokümantasyon Rehberi

Bu klasör projenin "beyni"dir. Kod yazmadan önce burada düşündük, karar verdik ve yol haritasını çizdik.
Her dosya tek bir konuya odaklanır. Sırayla okumak en iyisidir, ama her biri tek başına da anlaşılır.

## Dosyalar

| #   | Dosya                                                          | Ne anlatır                                                                     | Kim okumalı            |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| 01  | [01-vizyon.md](01-vizyon.md)                                   | Neden bu siteyi yapıyoruz, kim için, neyi yapmıyoruz, isim adayları            | Herkes, ilk önce       |
| 02  | [02-urun-spesifikasyonu.md](02-urun-spesifikasyonu.md)         | Özellik listesi, sayfalar, kullanıcı hikâyeleri, MVP sınırı                    | Geliştirme başlamadan  |
| 03  | [03-icerik-stratejisi.md](03-icerik-stratejisi.md)             | Çağlar, disiplinler, olay şablonu, yazım kuralları, ~110 çekirdek olay listesi | İçerik yazarken        |
| 04  | [04-mimari.md](04-mimari.md)                                   | Teknoloji seçimi, veri modeli, admin → site otomatik yayın akışı, hosting      | Kod yazarken           |
| 05  | [05-timeline-ux.md](05-timeline-ux.md)                         | Timeline'ın nasıl çalışacağı: zaman ölçeği problemi, navigasyon, etkileşimler  | Tasarım ve frontend    |
| 06  | [06-i18n-stratejisi.md](06-i18n-stratejisi.md)                 | 4 dil (en, ru, ky, tr): URL yapısı, çeviri hattı, Kırgızca özel notlar         | Frontend ve içerik     |
| 07  | [07-tasarim-konsept-promptu.md](07-tasarim-konsept-promptu.md) | Claude Design'a verilecek hazır tasarım promptu ve tasarım yönü                | Tasarım aşamasında     |
| 08  | [08-yol-haritasi-3-ay.md](08-yol-haritasi-3-ay.md)             | Hafta hafta 12 haftalık plan, kilometre taşları, sonrası                       | Her hafta başı         |
| 09  | [09-kararlar-ADR.md](09-kararlar-ADR.md)                       | Verilen mimari/ürün kararları ve gerekçeleri                                   | Bir kararı sorgularken |
| 10  | [10-riskler-ve-acik-sorular.md](10-riskler-ve-acik-sorular.md) | Neler ters gidebilir, senin vermen gereken kararlar                            | Başlamadan önce        |
| 11  | [11-claude-ile-calisma.md](11-claude-ile-calisma.md)           | Bu projeyi Claude Code ile nasıl yürüteceğiz, faz faz örnek istekler           | Her oturumda           |

## Tek paragrafta proje

Bilim insanı olmayan ama bilime hayranlıkla bakan insanlar için, insanlığın Thales'ten yapay zekâya nasıl geldiğini
**adım adım, zincir halinde** gösteren, dört dilli (en, ru, ky, tr), modern bir timeline sitesi.
Bir admin paneli üzerinden yıl + başlık + açıklama girilen her olay otomatik olarak sitede görünür.
Üç ayda: yayında, dört dilde, 200+ olayla, "Buraya nasıl geldik?" zincir görünümüyle v1.0.

## Nasıl kullanılır

1. Bugün: 01, 10 ve 08'i oku. 10'daki açık soruları cevapla.
2. Tasarım için: 07'deki promptu Claude Design'a ver, çıkan konsepti `resource/design/` altına kaydet.
3. Her hafta: 08'deki o haftanın hedefini aç, 11'deki örnek istekle Claude Code oturumunu başlat.
4. Bir karar değişirse: 09'a yeni bir ADR ekle. Eskisini silme, "geçersiz" olarak işaretle.
