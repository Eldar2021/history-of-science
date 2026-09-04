import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { updatePassword } from "../login/password-actions";

type Props = { searchParams: Promise<{ error?: string }> };

const ERRORS = ["tooShort", "mismatch", "samePassword", "failed"] as const;
const input = "w-full rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent";

/** Reached from the recovery link, once /api/auth/callback has traded the code for a session. */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const staff = await requireStaff();
  const { error } = await searchParams;
  const t = await getTranslations("admin.login");
  const key = ERRORS.find((k) => k === error);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form action={updatePassword} className="w-full max-w-sm space-y-5 rounded-card border border-line bg-elevated p-7 shadow-lg">
        <div>
          <p className="text-label uppercase tracking-wider text-muted">{staff.email}</p>
          <h1 className="font-display text-2xl text-primary">{t("reset.title")}</h1>
        </div>
        {key && (
          <p role="alert" className="rounded-lg border border-accent/40 bg-base/40 px-3 py-2 text-sm text-accent-text">{t(`reset.errors.${key}`)}</p>
        )}
        <label className="block space-y-1 text-sm">
          <span className="text-secondary">{t("reset.password")}</span>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={input} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-secondary">{t("reset.confirm")}</span>
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} />
        </label>
        <p className="text-xs text-muted">{t("reset.hint")}</p>
        <button type="submit" className="w-full rounded-pill bg-accent px-4 py-2.5 font-medium text-accent-ink transition hover:bg-accent-hover">
          {t("reset.submit")}
        </button>
      </form>
    </main>
  );
}
