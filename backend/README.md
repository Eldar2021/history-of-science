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

1. https://supabase.com → New project (bölge: Frankfurt). Şifreyi 1Password'e.
2. `supabase link --project-ref <ref>` sonra `supabase db push` migration'ları uygular.
3. Studio → SQL editor → `seed.sql` içeriğini bir kez çalıştır.
4. Authentication → Users → kendi e-postanla kullanıcı oluştur; sonra SQL: `update profiles set role='admin' where id='<uuid>';`

## Klasörler

- `supabase/migrations/NNNN_*.sql` — şema, sıralı. Değişiklik = yeni dosya (`/com_migration`).
- `supabase/seed.sql` — çağlar, disiplinler (4 dil), örnek olaylar.
- `scripts/` — içerik hattı (`draft-next.ts`), çeviri (`translate-missing.ts`), kontroller (`check-i18n.ts`). Hafta 5-6.
