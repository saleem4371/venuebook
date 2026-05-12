/**
 * /config/i18n.js
 *
 * Locale and country configuration used by middleware and routing.
 * This is the routing-level config — for business-logic region config
 * see /lib/region.js.
 */

/** All supported locale codes. */
export const locales = ["en", "hi", "kn", "ar"];

/** Default locale when none is detected. */
export const defaultLocale = "en";

/**
 * Languages with display metadata.
 * Used by LanguageSwitcher and RegionLanguageModal.
 */
export const LANGUAGE_META = {
  en: { code: "en", label: "English",  native: "English",    flag: "/flags/us.svg", dir: "ltr" },
  hi: { code: "hi", label: "Hindi",    native: "हिन्दी",     flag: "/flags/in.svg", dir: "ltr" },
  kn: { code: "kn", label: "Kannada",  native: "ಕನ್ನಡ",      flag: "/flags/in.svg", dir: "ltr" },
  ar: { code: "ar", label: "Arabic",   native: "العربية",    flag: "/flags/ae.svg", dir: "rtl" },
};

/**
 * RTL locales — layout direction flips for these.
 */
export const RTL_LOCALES = ["ar"];

/**
 * Countries/regions used in URL routing.
 * Business-level region config (currencies, languages) lives in /lib/region.js.
 */
export const countries = [
  { code: "in", name: "India", regionCode: "IN" },
  { code: "ae", name: "UAE",   regionCode: "AE" },
];
