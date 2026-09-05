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
4. Admin hesabı / şifre: `backend/scripts/cloud-admin-password.sh <e-posta>` (anahtarı CLI'dan alır, şifreyi gizli sorar; kullanıcı yoksa oluşturur, varsa şifresini yeniler, rolü `admin` yapar; `editor` için ikinci argüman). E-posta ile şifre sıfırlama bağlantısı şimdilik çalışmaz: bulut Site URL yerel adres ve sitede sıfırlama sayfası yok (Faz A).
5. RLS kanıtı buluta karşı: `SUPABASE_URL=… SUPABASE_ANON_KEY=… backend/scripts/rls-proof.sh` (hepsi `ok` olmalı).

Sonraki şema değişiklikleri: yeni migration + `supabase db push`.

## Taslakları yükleme

```bash
node backend/scripts/draft-to-sql.mjs backend/content/drafts \
  | docker exec -i supabase_db_uchkun psql -U postgres -d postgres -v ON_ERROR_STOP=1
```

Taslağı önce sözleşmeye göre **doğrular** (özet 200 karakter, lisans bütünlüğü, kutu anahtarları,
en az iki kaynak, künyeli figür) ve hata varsa hiçbir şey yazmadan durur. `status='review'` yazar;
yayınlanmış bir olaya dokunamaz (`status <> 'published'`), yani insanın yayınladığı metni hat ezemez.
Yeniden çalıştırmak güvenlidir.

`builds_on` hedefleri çoğu zaman henüz yoktur — sıra kronolojik değil, önem sırasıdır. Bağlantılar
yalnızca iki ucu da var olduğunda eklenir, o yüzden yükleyiciyi **tüm klasöre** çalıştırmak grafiği
liste doldukça kendiliğinden tamamlar; bekleyen-bağlantı durumu hiçbir yerde tutulmaz.

Buluta: çıktıyı dosyaya al ve Supabase Studio'nun SQL editöründe çalıştır.

**Yayınlama insan eylemidir** (ADR-014): admin paneli `/admin/events`. Yalnızca yerelde denemek için
`update events set status='published' where slug='...'`.

Sıfırlama: `supabase/snippets/reset-content.sql` içerik tablolarını boşaltır, referans verisini bırakır.

## Klasörler

- `supabase/migrations/NNNN_*.sql` — şema, sıralı. Değişiklik = yeni dosya (`/com_migration`).
- `supabase/seed.sql` — çağlar, disiplinler (4 dil) + 10 örnek olay. Örnekler içerik değil, **e2e fikstürüdür**.
- `content/` — `top100.json` (üretim kuyruğu), `extension-queue.json`, `drafts/` (dört dilli taslaklar).
- `scripts/` — `draft-to-sql.mjs` (taslak JSON → doğrulama → SQL, bağımlılıksız), `backup.sh` (elle dump), `create-admin.mjs` (Auth kullanıcısı + `admin` rolü; yerelde `web/.env.local`'ı okur: `node backend/scripts/create-admin.mjs admin@uchkun.local 'şifre'`), `rls-proof.sh` (anon key ile taslak sızmıyor kanıtı, `jq` gerekir). Faz B: `pipeline/` (gece hattı), `check-i18n.ts`.
