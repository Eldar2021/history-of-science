import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AdminNotFound() {
  const t = await getTranslations("admin");
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-4 py-16">
      <h1 className="font-display text-2xl text-primary">{t("notFound.title")}</h1>
      <Link href="/admin/events" className="text-secondary underline hover:text-primary">{t("notFound.back")}</Link>
    </main>
  );
}
