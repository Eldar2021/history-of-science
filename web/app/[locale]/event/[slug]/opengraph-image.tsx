import { ImageResponse } from "next/og";
import { getEventDetail } from "@/lib/queries/event";
import { formatYearRangeParts, type Locale } from "@/lib/i18n/formatYear";
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, displayFont } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Uchkun";

/** The card a shared event unfurls into: the year first, the way the page itself does it. */
export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const event = await getEventDetail(slug, locale as Locale);
  const year = event ? formatYearRangeParts(event.year, event.year_end, event.precision, locale as Locale) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          background: COLORS.base, borderTop: `12px solid ${COLORS.accent}`, padding: "60px 84px", fontFamily: "Literata",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {event?.era && <div style={{ fontSize: 30, color: COLORS.sage }}>{event.era.name}</div>}
          {year?.qualifier && <div style={{ marginTop: 14, fontSize: 30, color: COLORS.muted }}>{year.qualifier}</div>}
          <div style={{ marginTop: 6, fontSize: 132, color: COLORS.primary, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {year?.value ?? ""}
          </div>
          <div style={{ marginTop: 30, fontSize: 52, color: COLORS.primary, lineHeight: 1.2, maxWidth: 1000 }}>
            {event?.title ?? "Uchkun"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: COLORS.muted }}>
          <div style={{ color: COLORS.primary }}>Uchkun</div>
          <div style={{ width: 8, height: 8, borderRadius: 8, background: COLORS.sage }} />
          <div>history-of-science.vercel.app</div>
        </div>
      </div>
    ),
    { ...size, fonts: await displayFont() },
  );
}
