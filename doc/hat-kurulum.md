# Gece hattı — senden gerekenler

> Bu doküman **geçici**. Hat çalışmaya başlayınca silinir; kalıcı bilgi `mimari.md` ve `kararlar.md`'de.
> Buradaki hiçbir değeri sohbete yapıştırma. Hepsi GitHub secret'ı ya da bilgisayarındaki gitignore'lu
> bir dosya olarak durur.

## Neden bir Anthropic API anahtarı yok

Eski plan (ADR-014) hattı Claude API'ye bağlıyordu: token başına ayrı fatura. Yeni plan (ADR-039) hattı
**zaten ödediğin Claude Code aboneliğine** bağlıyor. `claude setup-token` aboneliğin uzun ömürlü bir
token'ını verir, GitHub Actions onunla çalışır. Ek ücret yok; koşular Max kotandan yer.
`ANTHROPIC_API_KEY` hiçbir yere konmayacak — betik onu kasten siliyor, çünkü ortamda dursaydı CLI onu
tercih eder ve ilk haberi fatura olurdu.

## Ne gerekiyor, hangi adım için

| Değer                       | Ne için                 | Nereden                      | Zorunlu mu               |
| --------------------------- | ----------------------- | ---------------------------- | ------------------------ |
| `SUPABASE_URL`              | kuyruğu okumak          | Supabase paneli, Adım 1      | evet                     |
| `SUPABASE_SERVICE_ROLE_KEY` | kuyruğu okumak          | Supabase paneli, Adım 1      | evet                     |
| `SUPABASE_DB_URL`           | olayı yazmak            | GitHub'da zaten var; elle koşu için Adım 1b | GitHub için hayır, elle koşu için evet |
| `CLAUDE_CODE_OAUTH_TOKEN`   | GitHub'ın gece koşusu   | `claude setup-token`, Adım 2 | gece otomatiği için      |
| `TELEGRAM_BOT_TOKEN`        | koşu bitince haber      | @BotFather, Adım 3           | hayır                    |
| `TELEGRAM_CHAT_ID`          | haberi kime yollayacağı | Adım 3                       | hayır                    |

**Elle çalıştırmak için yalnızca ilk üçü yeter** (Adım 5). Telegram ve token, sen uyurken çalışsın diye.

---

## Adım 1 — Supabase'ten üç değer (~3 dakika)

[supabase.com/dashboard](https://supabase.com/dashboard) → **uchkun** projesi.

**a) Proje adresi ve servis anahtarı.** Sol altta **Project Settings** → **API** (bazı sürümlerde
"API Keys"):

- **Project URL** → `SUPABASE_URL`. `https://hsllmvouqayaccubodcl.supabase.co` gibi görünür.
- **`service_role`** anahtarı → `SUPABASE_SERVICE_ROLE_KEY`. Uzun bir metin; "Reveal" deyip kopyala.
  Bu anahtar RLS'i baypas eder, yani veritabanının tamamına yetkilidir. Tarayıcıya, sohbete, ekran
  görüntüsüne girmez.

**b) Veritabanı bağlantısı.** Bu değeri GitHub'a 2026-09-04'te `SUPABASE_DB_URL` adıyla girmiştin ve
duruyor (gece yedeği onu kullanıyor).

- **Gece koşusu için**: gerek yok, iş akışı mevcut secret'ı okur. Adım 4'te işaretli say, atla.
- **Elle koşu için**: gerekiyor. **GitHub'a girilmiş bir secret geri okunamaz** — `.env.pipeline`
  dosyasına yazacağın değeri oradan alamazsın. Şifre yöneticinde duruyorsa oradan kopyala; yoksa
  aşağıdaki gibi bir kez daha çıkar (aynı dizeyi üretir, yeni bir şey yaratmaz).

**Project Settings** → **Database** → **Connection string** →
**Session pooler** sekmesi (ilk gösterdiği "Direct connection" **değil**).

- Şu şekli taşır: `postgresql://postgres.hsllmvouqayaccubodcl:<ŞİFRE>@aws-0-<bölge>.pooler.supabase.com:5432/postgres`
- `[YOUR-PASSWORD]` yazan yeri veritabanı şifrenle değiştir. Şifreyi unuttuysan aynı sayfada
  **Reset database password** var (siteyi etkilemez, Vercel'deki anahtarlar ayrıdır).
- **Neden pooler**: doğrudan adres (`db.<ref>.supabase.co`) yalnızca IPv6 konuşur, GitHub'ın makinesinde
  IPv6 yok. Yedek iş akışı da bu yüzden pooler kullanıyor.

## Adım 2 — Claude Code abonelik token'ı (gece otomatiği için)

Bilgisayarında, Claude Code'a giriş yapmış olduğun terminalde:

```
claude setup-token
```

Tarayıcıda onay ister, sonra `sk-ant-oat...` ile başlayan uzun bir metin basar. **Bu token senin
aboneliğin** — API anahtarı değil, ek ücreti yok, ama biri ele geçirirse senin kotanla çalışır.

- Ekranda bir kez görünür; hemen Adım 4'e geç ve GitHub secret'ı olarak yapıştır.
- Süresi dolarsa gece koşusu "authentication" hatasıyla düşer; komutu tekrar çalıştırıp secret'ı
  güncellersin. Başka bir şey bozulmaz.
- **Bana yapıştırma.** Bu token'la yapılacak hiçbir işim yok.

## Adım 3 — Telegram (opsiyonel, ~5 dakika)

Haber almak istiyorsan. Hat içerik taşımaz, sadece "yeni olay incelemede" der; olayı `/admin`'de okursun.

**a) Bot:** Telegram'da [@BotFather](https://t.me/BotFather) → `/newbot` → bir ad, bir kullanıcı adı
(`...bot` ile bitmeli) → sana `123456:ABC-DEF...` şeklinde bir token verir → `TELEGRAM_BOT_TOKEN`.

**b) Chat id:** Yeni botunu Telegram'da bul ve ona bir mesaj yaz (herhangi bir şey, "merhaba" yeter).
Sonra tarayıcıda şu adresi aç — `<TOKEN>` yerine bir önceki adımdaki token:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Dönen metinde `"chat":{"id":123456789,` diye bir yer var. O sayı `TELEGRAM_CHAT_ID`. (Negatif de
olabilir, bir gruba yazdırıyorsan; eksi işaretini de al.)

## Adım 4 — GitHub'a gir

Depoda: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Her biri için
ad + değer, tek tek:

Depoda 2026-09-06 itibarıyla **yalnızca `SUPABASE_DB_URL` var** (`gh secret list` ile bakıldı).
Eksikler:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `SUPABASE_DB_URL` — girilmiş, dokunma
- [ ] `CLAUDE_CODE_OAUTH_TOKEN`
- [ ] `TELEGRAM_BOT_TOKEN` _(opsiyonel)_
- [ ] `TELEGRAM_CHAT_ID` _(opsiyonel)_

Girdikten sonra bana "secret'lar hazır" demen yeter; değerleri değil.

## Adım 5 — Elle koşu (token beklemeden bugün çalışır)

Bilgisayarından koşacaksan Adım 1'in üç değerini `backend/.env.pipeline` dosyasına yaz. Bu dosya
gitignore'da, depoya gitmez:

```
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DB_URL=postgresql://postgres....pooler.supabase.com:5432/postgres
```

Sonra:

```
backend/scripts/pipeline/run.sh --check   # sıradaki olay ne, model çağrısı yok
backend/scripts/pipeline/run.sh           # bir olay yaz ve incelemeye koy
```

Ya da bir Claude Code oturumunda `/com_pipeline` — aynı iş, adımları izleyerek.

> **Dosya yoksa hat yerel veritabanına bakar.** Oradaki 10 yayınlanmış olay e2e fikstürü, içerik değil:
> yerelde yazılan taslak siteye ulaşmaz ve sıradaki olay yanlış çıkar. Betikler bunu ekrana yazıyor.

## Adım 6 — Gece koşusunu dene

GitHub → **Actions** → **Content pipeline** → **Run workflow** → `check_only` işaretli → çalıştır.
Model çağırmaz, sadece sırlara ulaşabildiğini ve sıradaki olayı söyler. Yeşilse işaretsiz bir kez daha
çalıştır: bir olay yazar, Telegram varsa haber verir.

Bundan sonrası kendiliğinden: her gece Bişkek saatiyle 22:00 (16:00 UTC).

## Durdurma

- **Bir gecelik**: bir şey yapma, koşuyu Actions'tan iptal et.
- **Süresiz**: **Settings** → **Secrets and variables** → **Actions** → **Variables** sekmesi →
  `CONTENT_PIPELINE_ENABLED` = `0`. İş akışı çalışır, hiçbir şey yazmadan çıkar. Geri açmak `1`.
- **İnceleme kuyruğu dolarsa** (10 olay `review` bekliyorsa) hat kendiliğinden durur ve söyler:
  yazmaya devam etmek yığını uzatmaktan başka işe yaramaz (ADR-014).
