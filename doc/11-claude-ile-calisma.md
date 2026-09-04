# 11 — Claude Code ile çalışma

## İlkeler

1. **Dokümanlar tek gerçek kaynak.** Konuşmada anlatmak yerine dokümana yaz; "04'teki şemaya göre" de,
   ben okurum.
2. **Haftanın hedefi = oturumun hedefi.** `08`'deki kutucukları teker teker ver, "siteyi yap" değil.
3. **Küçük adımlar, sık commit.** Her kutucuk bir commit; bozulursa geri almak kolay.
4. **Yeni özellik veya şema değişikliğinde**: önce plan özeti, senin onayın, sonra kod.
   Bug, metin, stil düzeltmesinde doğrudan.
5. **Kararlar `09`'a ADR olarak.** Bir şeyi değiştirmek istersen "ADR-002'yi değiştirelim" de.
6. **İçerik doğrulama senin.** Ben taslak yazarım ve kaynak öneririm; yayın kararı senin.
7. **Doküman şişerse temizle.** Biten madde silinir; "ne yapıldı"nın cevabı `git log`.

## Slash komutları

| Komut             | Ne yapar                                               |
| ----------------- | ------------------------------------------------------ |
| `/com_read_doc`   | Oturum başı bağlam: CLAUDE.md, STATUS ve `doc/` okunur |
| `/com_week N`     | Roadmap haftası N'i açar, kutucukları sırayla yapar    |
| `/com_event`      | Olay taslağı yazar (03'teki şablon, kaynaklarıyla)     |
| `/com_adr`        | `09`'a yeni ADR ekler                                  |
| `/com_migration`  | Yeni şema migration'ı + `gen:types`                    |
| `/com_check`      | Typecheck + lint + test, dürüst rapor                  |
| `/com_i18n_check` | Dört dil tutarlılık kontrolü                           |
| `/com_wrapup`     | Oturum sonu: STATUS güncelle, commit                   |

Ajanlar (`.claude/agents/`): `content-writer` (olay taslağı), `fact-checker` (taslak doğrulama),
`timeline-ux-reviewer` (frontend gözden geçirme).

## Hazır istekler

**İçerik oturumu**

> 03'teki şablon ve ses tonuyla şu olayları İngilizce yaz: [liste]. Her biri için en az 2 kaynak URL'si
> öner, yıl belirsizse söyle. Efsane olan kısımları "efsane" diye işaretle.

**Hat kalitesi oturumu** (Faz B'den sonra ayda bir)

> Son 30 gündeki review kuyruğunda reddedilen ve çok düzenlenen taslaklara bak (`research_note` ve fark).
> Ortak sorunları çıkar, `draft-next.ts` prompt'unu iyileştir, 3 yeni taslakla test et.

**Sorun giderme**

> [hata/ekran görüntüsü]. Önce sebebi bul, düzeltmeden önce açıkla, sonra en küçük düzeltmeyi yap ve
> ilgili testi ekle.

**Tasarım oturumu**

> Şu ekranın konseptini üret. Kırgızca örnek metin kullan, `Ңөү` harflerini göster, iki temayı da ver.

## Oturum sonu

`/com_wrapup`: bu oturumda ne yapıldı, ne yarım kaldı, `08`'de hangi kutucuk işaretlenmeli, yeni bir
karar/risk çıktı mı. STATUS güncellenir ve commit atılır.
