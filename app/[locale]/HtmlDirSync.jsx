"use client";

/**
 * /app/[locale]/HtmlDirSync.jsx
 *
 * Keeps <html lang> and <html dir> correct during client-side navigation.
 *
 * Why this exists
 * ───────────────
 * app/layout.jsx owns the <html> element and sets lang/dir correctly at
 * SSR time by reading the x-next-intl-locale header from middleware.
 * However, the root layout does NOT re-execute on soft (client-side)
 * navigation — only the changed layout segments re-render. This component
 * lives inside [locale]/layout.jsx so it re-renders whenever the locale
 * segment changes, and keeps <html> attributes in sync reactively.
 *
 * Tailwind RTL variants (`rtl:*`) generate `[dir="rtl"] &` selectors —
 * they require dir="rtl" on <html>, not on a nested element.
 */

import { useEffect } from "react";
import { RTL_LOCALES } from "@/config/i18n";

export function HtmlDirSync({ locale }) {
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir  = dir;
  }, [locale, dir]);

  return null;
}
