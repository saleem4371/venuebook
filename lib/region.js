/**
 * /lib/region.js
 *
 * CENTRALIZED REGION CONFIGURATION
 * ─────────────────────────────────
 * Single source of truth for all region-related data.
 *
 * TO ADD A NEW REGION:
 *   1. Add an entry to the REGIONS object below.
 *   2. Add corresponding translation files in /messages/{locale}.json
 *   No other file needs changing.
 */

export const REGIONS = {
  IN: {
    code: "IN",
    countryCode: "in",       // matches URL segment /[locale]/[country]/
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    languages: ["en", "hi", "kn"],
    defaultLocale: "en",
  },
  AE: {
    code: "AE",
    countryCode: "ae",
    name: "UAE",
    flag: "🇦🇪",
    currency: "AED",
    languages: ["en", "ar"],
    defaultLocale: "en",
  },
};

/** The fallback region when nothing is stored or detected. */
export const DEFAULT_REGION = "IN";

/**
 * Return config for a region code (e.g. "IN", "AE").
 * Falls back to the default region if not found.
 *
 * @param {string} regionCode
 * @returns {object}
 */
export function getRegionConfig(regionCode) {
  if (!regionCode) return REGIONS[DEFAULT_REGION];
  return REGIONS[regionCode.toUpperCase()] || REGIONS[DEFAULT_REGION];
}

/**
 * Return the default region config object.
 *
 * @returns {object}
 */
export function getDefaultRegion() {
  return REGIONS[DEFAULT_REGION];
}

/**
 * Look up region config by URL country-code segment (e.g. "in", "ae").
 * Falls back to the default region if not found.
 *
 * @param {string} countryCode
 * @returns {object}
 */
export function getRegionByCountryCode(countryCode) {
  if (!countryCode) return REGIONS[DEFAULT_REGION];
  const match = Object.values(REGIONS).find(
    (r) => r.countryCode === countryCode.toLowerCase()
  );
  return match || REGIONS[DEFAULT_REGION];
}

/**
 * Return an array of all configured regions.
 *
 * @returns {object[]}
 */
export function getAllRegions() {
  return Object.values(REGIONS);
}
