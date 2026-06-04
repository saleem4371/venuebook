/**
 * app/unauthorized/page.jsx — Server Component
 *
 * This page lives outside [locale], so NextIntlClientProvider is never
 * in its tree. Instead we read the locale from the middleware header,
 * load the messages JSON directly, and pass plain strings as props to
 * the client component. No useTranslations / no provider needed.
 */

import { headers } from "next/headers";
import { locales, defaultLocale } from "@/config/i18n";
import UnauthorizedClient from "./UnauthorizedClient";

export default async function UnauthorizedPage() {
  // Locale stamped by middleware on every routed request
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-next-intl-locale");
  const locale = locales.includes(headerLocale) ? headerLocale : defaultLocale;

  // Load messages directly — no provider, no hook
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import("../../messages/en.json")).default;
  }

  const t = messages.unauthorized ?? {
    badge:           "Access Restricted",
    heading:         "Access Restricted",
    description:     "You don't currently have permission to access this page. If you believe this is an error, please contact support or return to a page available to your account.",
    go_back:         "Go Back",
    return_home:     "Return Home",
    contact_support: "Contact Support",
  };

  return <UnauthorizedClient t={t} />;
}
