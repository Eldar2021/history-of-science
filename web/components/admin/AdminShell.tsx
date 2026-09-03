import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Staff } from "@/lib/auth";
import { signOut } from "@/app/admin/login/actions";

type Props = { staff: Staff; title: string; actions?: React.ReactNode; children: React.ReactNode };

/** Header + content frame for every admin page. Plain next/link: admin routes carry no locale prefix. */
export async function AdminShell({ staff, title, actions, children }: Props) {
  const t = await getTranslations("admin");
  return (
    <>
      <header className="sticky top-0 z-10 flex h-[3.5rem] items-center justify-between gap-4 border-b border-line bg-base/90 px-4 backdrop-blur">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-display text-lg text-primary">{t("title")}</Link>
          <Link href="/admin/events" className="text-secondary hover:text-primary">{t("nav.events")}</Link>
          <Link href={`/${staff.uiLocale}/timeline`} className="text-secondary hover:text-primary">{t("nav.site")}</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-muted sm:inline">{staff.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-secondary hover:text-primary">{t("signOut")}</button>
          </form>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl text-primary">{title}</h1>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </>
  );
}
