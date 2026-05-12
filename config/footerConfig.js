/**
 * /config/footerConfig.js
 *
 * FOOTER CONTENT CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────
 * Maps region codes to translation key references and non-translatable
 * data (href strings). ALL user-visible text lives in /messages/{locale}.json
 * under the "footer" namespace — nothing is hardcoded here.
 *
 * Translation key convention
 * ─────────────────────────────────────────────────────────────────────
 * Keys are relative to the "footer" useTranslations namespace, e.g.
 *   tKey: "discover.wedding_venues"  →  t("discover.wedding_venues")
 *   headingKey: "discover.heading"   →  t("discover.heading")
 *
 * TO ADD A NEW REGION:
 *   1. Add an entry here keyed by the region code (e.g. "SG").
 *   2. Add the corresponding keys to every /messages/*.json file.
 *   No other file needs changing.
 */

export const FOOTER_CONFIG = {
  IN: {
    /** Non-translatable contact hrefs */
    contact: {
      phone: { href: "tel:+917338684444" },
      email: { href: "mailto:hello@venuebook.in" },
    },

    /**
     * Nav column definitions.
     * headingKey  → t(headingKey)  for the column title
     * links[].tKey → t(tKey)       for each link label
     * links[].href → raw URL       (not translated)
     */
    navGroups: [
      {
        headingKey: "discover.heading",
        links: [
          { tKey: "discover.wedding_venues",   href: "#" },
          { tKey: "discover.banquet_halls",    href: "#" },
          { tKey: "discover.farmstays_lawns",  href: "#" },
          { tKey: "discover.corporate_events", href: "#" },
        ],
      },
      {
        headingKey: "hosting.heading",
        links: [
          { tKey: "hosting.list_venue",          href: "#" },
          { tKey: "hosting.host_resources",      href: "#" },
          { tKey: "hosting.responsible_hosting", href: "#" },
        ],
      },
      {
        headingKey: "support.heading",
        links: [
          { tKey: "support.how_it_works", href: "#" },
          { tKey: "support.help_center",  href: "#" },
          { tKey: "support.cancellation", href: "#" },
          { tKey: "support.safety",       href: "#" },
          { tKey: "support.report",       href: "#" },
        ],
      },
    ],
  },

  AE: {
    contact: {
      phone: { href: "tel:+971541987423" },
      email: { href: "mailto:global@venuebook.in" },
    },

    navGroups: [
      {
        headingKey: "discover.heading",
        links: [
          { tKey: "discover.venues_farmstays",   href: "#" },
          { tKey: "discover.studios_workspaces", href: "#" },
          { tKey: "discover.luxury_rentals",     href: "#" },
          { tKey: "discover.unique_experiences", href: "#" },
        ],
      },
      {
        headingKey: "hosting.heading",
        links: [
          { tKey: "hosting.list_space",        href: "#" },
          { tKey: "hosting.uae_community",     href: "#" },
          { tKey: "hosting.service_standards", href: "#" },
        ],
      },
      {
        headingKey: "support.heading",
        links: [
          { tKey: "support.how_it_works",        href: "#" },
          { tKey: "support.global_help",         href: "#" },
          { tKey: "support.booking_protections", href: "#" },
          { tKey: "support.travel_safety",       href: "#" },
          { tKey: "support.report",              href: "#" },
        ],
      },
    ],
  },
};

/**
 * Returns footer config for a given region code.
 * Falls back to IN when the region is unknown.
 *
 * @param {string} regionCode  e.g. "IN" | "AE"
 * @returns {object}
 */
export function getFooterConfig(regionCode) {
  return FOOTER_CONFIG[regionCode?.toUpperCase()] ?? FOOTER_CONFIG.IN;
}
