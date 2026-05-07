/**
 * /i18n/request.js
 *
 * next-intl server-side request configuration.
 * Used when server components call getTranslations() / getMessages().
 *
 * Registered via next.config.js → createNextIntlPlugin('./i18n/request.js')
 *
 * LOCALE DETECTION STRATEGY (custom middleware)
 * ─────────────────────────────────────────────
 * This project uses a custom middleware instead of next-intl's
 * createMiddleware(). In that setup, the `requestLocale` parameter
 * injected by the plugin is unreliable — it only resolves correctly
 * when the plugin's own middleware sets its internal locale cache.
 *
 * The correct pattern for custom middleware is to read the locale
 * directly from the request header that middleware.js sets on every
 * valid pass-through:
 *
 *   requestHeaders.set("x-next-intl-locale", seg0)   // middleware.js:80
 *
 * next-intl internally uses the same header name (HEADER_LOCALE_NAME =
 * "X-NEXT-INTL-LOCALE"). headers().get() is case-insensitive, so both
 * casing forms resolve to the same value.
 */

import { getRequestConfig } from "next-intl/server";
import { headers }          from "next/headers";
import { locales, defaultLocale } from "@/config/i18n";

export default getRequestConfig(async () => {
  /* Read the locale our middleware stamped onto the request. */
  const headerLocale = (await headers()).get("x-next-intl-locale");

  /* Validate — reject any value not in the supported list. */
  const locale =
    headerLocale && locales.includes(headerLocale)
      ? headerLocale
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
