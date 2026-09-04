import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { COLORS, OG_CONTENT_TYPE, OG_SIZE, displayFont } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Uchkun";

/** The card a link to the home page unfurls into. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          background: COLORS.base, borderTop: `12px solid ${COLORS.accent}`, padding: "72px 84px", fontFamily: "Literata",
        }}
      >
        <div style={{ fontSize: 116, color: COLORS.primary, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{t("name")}</div>
        <div style={{ marginTop: 28, fontSize: 44, color: COLORS.secondary, lineHeight: 1.25, maxWidth: 940 }}>{t("tagline")}</div>
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: COLORS.muted }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: COLORS.sage }} />
          <div>history-of-science.vercel.app</div>
        </div>
      </div>
    ),
    { ...size, fonts: await displayFont() },
  );
}
