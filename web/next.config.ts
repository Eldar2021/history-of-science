import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  typedRoutes: false,
  // /timeline was its own page until ADR-030 folded it into the home globe. The address has been
  // shared and linked to, so it keeps working rather than turning into a 404.
  async redirects() {
    return [
      { source: "/:locale(en|ru|ky|tr)/timeline", destination: "/:locale", permanent: true },
      { source: "/timeline", destination: "/", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
