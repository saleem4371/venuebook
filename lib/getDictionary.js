/**
 * /lib/getDictionary.js
 *
 * Server-side dictionary loader for the custom DictionaryContext.
 * Loads from /messages/{locale}.json — the single source of truth.
 * Lazy-loads per locale so only the needed bundle is sent.
 */

const dictionaries = {
  en: () => import("../messages/en.json").then((m) => m.default),
  hi: () => import("../messages/hi.json").then((m) => m.default),
  kn: () => import("../messages/kn.json").then((m) => m.default),
  ar: () => import("../messages/ar.json").then((m) => m.default),
};

/**
 * Load the translation dictionary for a given locale.
 * Falls back to English if the locale is not supported.
 *
 * @param {string} locale  BCP 47 locale code: "en" | "hi" | "kn" | "ar"
 * @returns {Promise<object>}
 */
export async function getDictionary(locale) {
  const loader = dictionaries[locale] || dictionaries.en;
  return loader();
}
