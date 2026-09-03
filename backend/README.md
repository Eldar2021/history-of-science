# backend — Supabase (Postgres, Auth, Storage)

## İlk kurulum (bir kez)

```bash
brew install supabase/tap/supabase     # Supabase CLI
cd backend
supabase init                           # config.toml üretir (mevcut migrations/ ve seed.sql korunur)
# config.toml içinde [db.seed] sql_paths = ["./supabase/seed.sql"] olduğundan emin ol
supabase start                          # Docker çalışıyor olmalı
supabase db reset                       # migration + seed
```

`supabase start` çıktısındaki `API URL` ve `anon key` değerlerini `web/.env.local` içine yaz (`web/.env.example`).

## Bulut projesi

Proje: `hsllmvouqayaccubodcl` (Supabase, oluşturuldu). Tek seferlik kurulum:

1. `supabase login` (tarayıcı açılır; bir kez).
2. `backend/scripts/cloud-setup.sh` → link, `db push`, isteğe bağlı seed (`db reset --linked`), Vercel'e `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. `main`'e push ya da `npx vercel redeploy` → site bulut veritabanını okur.
4. Admin hesabı / şifre: `backend/scripts/cloud-admin-password.sh <e-posta>` (anahtarı CLI'dan alır, şifreyi gizli sorar; kullanıcı yoksa oluşturur, varsa şifresini yeniler, rolü `admin` yapar; `editor` için ikinci argüman). E-posta ile şifre sıfırlama bağlantısı şimdilik çalışmaz: bulut Site URL yerel adres ve sitede sıfırlama sayfası yok (Hafta 5).
5. RLS kanıtı buluta karşı: `SUPABASE_URL=… SUPABASE_ANON_KEY=… backend/scripts/rls-proof.sh` (hepsi `ok` olmalı).

Sonraki şema değişiklikleri: yeni migration + `supabase db push`.

## Taslakları yerel DB'ye yükleme

```bash
node backend/scripts/drafts-to-sql.mjs backend/content/drafts | docker exec -i supabase_db_uchkun psql -U postgres -d postgres -v ON_ERROR_STOP=1
```

Yalnızca `status='draft'` yazar; yeniden çalıştırmak güvenlidir (slug üstünden günceller; yayınlanmış olayın hiçbir satırına, çeviri/disiplin/kaynak/bağlantı dahil, dokunmaz). Buluta: `node backend/scripts/drafts-to-sql.mjs backend/content/drafts > /tmp/drafts.sql && cd backend && supabase db query --linked --file /tmp/drafts.sql`. Denetim: `node backend/scripts/check-drafts.mjs`.
Yayınlama insan eylemidir: `update events set status='published' where slug='...'` (yerelde) ya da admin paneli (Hafta 4).

## Klasörler

- `supabase/migrations/NNNN_*.sql` — şema, sıralı. Değişiklik = yeni dosya (`/com_migration`).
- `supabase/seed.sql` — çağlar, disiplinler (4 dil), örnek olaylar.
- `scripts/` — `drafts-to-sql.mjs` (taslak JSON → SQL, bağımlılıksız), `check-drafts.mjs` (taslak denetimi), `create-admin.mjs` (Auth kullanıcısı + `admin` rolü; yerelde `web/.env.local`'ı okur: `node backend/scripts/create-admin.mjs admin@uchkun.local 'şifre'`), `rls-proof.sh` (anon key ile taslak sızmıyor kanıtı, `jq` gerekir). Hafta 5-6: içerik hattı (`draft-next.ts`), çeviri (`translate-missing.ts`), kontroller (`check-i18n.ts`).
