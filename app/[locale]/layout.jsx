/**
 * /app/[locale]/layout.jsx
 *
 * Locale-level layout (Server Component).
 *
 * Responsibilities:
 *   1. Load translations for the current locale (lazy, per-locale bundle)
 *   2. Wrap children in NextIntlClientProvider for useTranslations() in client components
 *   3. Mount HtmlDirSync so client-side navigation keeps <html dir/lang> correct
 *
 * RTL / lang on <html>
 * ─────────────────────
 * app/layout.jsx sets lang and dir on <html> at SSR time by reading the
 * x-next-intl-locale header stamped by middleware. HtmlDirSync (a client
 * component below) keeps them reactive on soft navigation. There is no
 * longer a nested <div dir> wrapper — dir lives where it belongs: <html>.
 */

import { NextIntlClientProvider }         from "next-intl";
import { locales, defaultLocale }         from "@/config/i18n";
import { HtmlDirSync }                    from "./HtmlDirSync";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default async function LocaleLayout({ children, params }) {
  const { locale: rawLocale } = await params;

  /* Validate locale — fall back to default if unknown */
  const locale = locales.includes(rawLocale) ? rawLocale : defaultLocale;

  /* Load messages — one JSON file per locale, lazy-loaded per request */
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import("../../messages/en.json")).default;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/*
        HtmlDirSync runs on the client after hydration and on every
        locale change (soft navigation). Keeps <html lang> and <html dir>
        correct without a full page reload.
      */}
      <HtmlDirSync locale={locale} />
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
   {children}
      </GoogleOAuthProvider>
   
    </NextIntlClientProvider>
  );
}
