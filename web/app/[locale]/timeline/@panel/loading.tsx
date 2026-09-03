import { getTranslations } from "next-intl/server";
import { DetailPanel } from "@/components/event/DetailPanel";

/** Shown while get_event_detail runs (doc/05 Durumlar: skeleton). Same shell as the real panel. */
export default async function PanelLoading() {
  const t = await getTranslations("event");
  return (
    <DetailPanel closeLabel={t("close")} labelledBy="event-panel-title">
      <div aria-busy className="animate-pulse space-y-4">
        <div className="h-3 w-40 rounded bg-elevated" />
        <div className="h-12 w-32 rounded bg-elevated" />
        <div className="h-7 w-4/5 rounded bg-elevated" />
        <div className="h-5 w-full rounded bg-elevated" />
        <div className="h-5 w-3/4 rounded bg-elevated" />
        <div className="mt-6 h-24 w-full rounded-lg bg-elevated" />
      </div>
    </DetailPanel>
  );
}
