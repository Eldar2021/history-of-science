import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { UiLocaleSelect } from "./UiLocaleSelect";
import type { Staff } from "@/lib/auth";
import { signOut } from "@/app/admin/login/actions";

type Props = { staff: Staff; title: string; actions?: React.ReactNode; children: React.ReactNode };

const navLink = "rounded-pill px-3 py-1 text-secondary transition hover:bg-elevated hover:text-primary";

/** Header + content frame for every admin page. Plain next/link: admin routes carry no locale prefix. */
export async function AdminShell({ staff, title, actions, children }: Props) {
  const t = await getTranslations("admin");
  return (
    <>
      <header className="sticky top-0 z-10 flex h-[3.5rem] items-center justify-between gap-4 border-b border-line bg-base/90 px-4 backdrop-blur">
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/admin" className="mr-2 font-display text-lg text-primary">{t("title")}</Link>
          <Link href="/admin/events" className={navLink}>{t("nav.events")}</Link>
          <Link href="/admin/help/markdown" className={navLink}>{t("nav.help")}</Link>
          <Link href={`/${staff.uiLocale}`} className={navLink}>{t("nav.site")}</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted lg:inline">{staff.email}</span>
          <form action={signOut}>
            <button type="submit" className="rounded-pill px-3 py-1 text-secondary transition hover:bg-elevated hover:text-primary">{t("signOut")}</button>
          </form>
          <UiLocaleSelect />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl leading-tight text-primary">{title}</h1>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </>
  );
}
