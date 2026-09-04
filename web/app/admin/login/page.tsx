import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { signIn } from "./actions";

const ERRORS = ["invalid", "forbidden", "noEnv", "linkExpired"] as const;
type ErrorKey = (typeof ERRORS)[number];

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const t = await getTranslations("admin");
  const errorKey = ERRORS.find((k) => k === error) as ErrorKey | undefined;
  const inputClass =
    "w-full rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form action={signIn} className="w-full max-w-sm space-y-5 rounded-card border border-line bg-elevated p-7 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wider text-muted">{t("title")}</p>
            <h1 className="font-display text-2xl text-primary">{t("login.title")}</h1>
          </div>
        </div>

        {errorKey && (
          <p role="alert" className="rounded-lg border border-accent/40 bg-base/40 px-3 py-2 text-sm text-accent-text">
            {t(`login.errors.${errorKey}`)}
          </p>
        )}

        <input type="hidden" name="next" value={next ?? ""} />
        <label className="block space-y-1 text-sm">
          <span className="text-secondary">{t("login.email")}</span>
          <input name="email" type="email" required autoComplete="email" autoFocus className={inputClass} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-secondary">{t("login.password")}</span>
          <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
        </label>
        <button
          type="submit"
          className="w-full rounded-pill bg-accent px-4 py-2.5 font-medium text-accent-ink transition hover:bg-accent-hover"
        >
          {t("login.submit")}
        </button>
        <Link href="/admin/forgot-password" className="block text-center text-sm text-accent-text underline underline-offset-4">
          {t("login.forgot.link")}
        </Link>
      </form>
    </main>
  );
}
