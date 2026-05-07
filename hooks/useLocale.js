"use client";

/**
 * /hooks/useLocale.js
 *
 * Manages the current locale, syncing with the URL and localStorage.
 *
 * The URL is the authoritative source (locale is in the path segment).
 * localStorage is used to persist the user's preference across visits,
 * so the middleware can read it on the next cold load.
 *
 * Usage:
 *   const { locale, switchLocale, isRTL, mounted } = useLocale();
 */

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { RTL_LOCALES } from "@/config/i18n";

const STORAGE_KEY = "vb_language";

export function useLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  /* Read locale from the URL params — this is always authoritative */
  const currentLocale = params?.locale || "en";
  const isRTL = RTL_LOCALES.includes(currentLocale);

  const [mounted, setMounted] = useState(false);

  /* Persist current locale whenever it changes */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentLocale);
    } catch (_) {}
    setMounted(true);
  }, [currentLocale]);

  /**
   * Switch to a new locale by rewriting the first URL segment.
   * Also persists to localStorage immediately.
   *
   * @param {string} newLocale  e.g. "hi" | "ar" | "kn"
   */
  const switchLocale = (newLocale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch (_) {}

    /* Replace the [locale] segment in the pathname */
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return { locale: currentLocale, switchLocale, isRTL, mounted };
}
