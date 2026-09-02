import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale detection + prefixing for the public site. Admin, API and static files are excluded.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
