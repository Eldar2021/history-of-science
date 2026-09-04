import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Markdown } from "@/components/content/Markdown";
import { CHEATSHEET } from "@/lib/content/cheatsheet";

export const metadata = { robots: { index: false, follow: false } };

/**
 * What an editor may write in a body. Every row shows the source on the left and the real thing on
 * the right, rendered by the component the site uses: the page is a demonstration, not a copy of
 * one, so it cannot fall behind the renderer.
 */
export default async function MarkdownHelpPage() {
  const staff = await requireStaff();
  const t = await getTranslations("admin.help");

  return (
    <AdminShell staff={staff} title={t("title")}>
      <p className="mb-6 max-w-2xl text-secondary">{t("intro")}</p>
      <div className="space-y-8">
        {CHEATSHEET.map((row) => (
          <section key={row.key} className="grid gap-3 md:grid-cols-2">
            <div>
              <h2 className="text-label uppercase tracking-wider text-muted">{t("syntax")}</h2>
              <p className="mt-1 text-sm text-secondary">{t(`rows.${row.key}`)}</p>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-md border border-line bg-elevated p-3 font-mono text-xs leading-relaxed text-primary">
                {row.source}
              </pre>
            </div>
            <div>
              <h2 className="text-label uppercase tracking-wider text-muted">{t("result")}</h2>
              <div className="mt-2 rounded-md border border-line bg-elevated px-4 py-3">
                <Markdown source={row.source} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
