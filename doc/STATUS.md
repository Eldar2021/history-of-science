# STATUS — Güncel Durum

> Her oturum sonunda `/com_wrapup` bu dosyayı günceller. Her oturum başında `/com_read_doc` okur.
> Tarihler mutlak (YYYY-MM-DD). En üstte en yeni.

## Şu an

- **Faz**: Ay 1 / Hafta 1 (başladı 2026-09-02)
- **Sonraki adım**: Hafta 1 kod kutucukları (08-yol-haritasi): Next.js iskeleti, `0001_init.sql`, seed, Vercel bağlantısı.
- **Kullanıcıdan bekleyen**: Supabase bulut projesi açması, Vercel hesabı bağlaması, Docker'ı başlatması (yerel DB için), 07'deki promptu Claude Design'a vermesi.
- **Bloklayan**: yok.

## Hafta 1 kutucukları

- [ ] `web/`: Next.js 15 + TS + Tailwind v4 + next-intl; 4 dil rotası
- [ ] `backend/supabase/migrations/0001_init.sql` (04-mimari şeması)
- [ ] Seed: 8 çağ, 8 disiplin (4 dilde), 10 örnek olay (İngilizce)
- [ ] Vercel bağlı, `main` push = deploy
- [x] `CLAUDE.md` ve `.claude/` komutları
- [ ] Tasarım: 07 promptu Claude Design'a verildi (kullanıcı)
- [ ] İçerik: ilk 5 olay şablonla yazıldı ve doğrulandı

## Oturum günlüğü

### 2026-09-02 — Planlama + kurulum

- 12 doküman yazıldı (`doc/`), kullanıcının 10 sorusu ve 9 risk cevabı işlendi, ADR-001..018.
- Kararlar: isim Uchkun; İngilizce önce yayın; Keşfet kanvası 3 ayda; gece otomatik içerik hattı + sabah insan onayı; admin 4 dilde; iki tema eşit; modern telefonlar; dürüstlük bandı.
- `CLAUDE.md`, `doc/STATUS.md`, `.claude/commands`, `.claude/agents` oluşturuldu.
- Hafta 1 koduna başlandı (aşağıya bak, oturum sonunda güncellenir).
