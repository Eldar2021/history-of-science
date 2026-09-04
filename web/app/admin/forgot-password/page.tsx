import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requestPasswordReset } from "../login/password-actions";

type Props = { searchParams: Promise<{ sent?: string; error?: string }> };

const input = "w-full rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent";

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { sent, error } = await searchParams;
  const t = await getTranslations("admin.login");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-5 rounded-card border border-line bg-elevated p-7 shadow-lg">
        <div>
          <p className="text-label uppercase tracking-wider text-muted">{t("forgot.eyebrow")}</p>
          <h1 className="font-display text-2xl text-primary">{t("forgot.title")}</h1>
        </div>

        {sent ? (
          <p role="status" className="rounded-lg border border-sage/60 bg-sage/15 px-3 py-2 text-sm text-primary">{t("forgot.sent")}</p>
        ) : (
          <form action={requestPasswordReset} className="space-y-5">
            {error && (
              <p role="alert" className="rounded-lg border border-accent/40 bg-base/40 px-3 py-2 text-sm text-accent-text">{t("errors.invalid")}</p>
            )}
            <p className="text-sm text-secondary">{t("forgot.text")}</p>
            <label className="block space-y-1 text-sm">
              <span className="text-secondary">{t("email")}</span>
              <input name="email" type="email" required autoComplete="email" autoFocus className={input} />
            </label>
            <button type="submit" className="w-full rounded-pill bg-accent px-4 py-2.5 font-medium text-accent-ink transition hover:bg-accent-hover">
              {t("forgot.submit")}
            </button>
          </form>
        )}

        <Link href="/admin/login" className="block text-sm text-accent-text underline underline-offset-4">{t("forgot.back")}</Link>
      </div>
    </main>
  );
}
