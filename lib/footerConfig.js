/**
 * /lib/footerConfig.js
 *
 * CENTRALIZED FOOTER CONTENT CONFIGURATION
 * ─────────────────────────────────────────
 * All region-specific footer content lives here.
 * The Footer component reads this config via useRegion() — no
 * conditional logic inside JSX, no duplicated markup.
 *
 * TO ADD A NEW REGION:
 *   1. Add an entry keyed by the region code (e.g. "SG").
 *   2. No other file needs changing.
 */

export const FOOTER_CONFIG = {
  IN: {
    brand: {
      name: "venuebook",
      tld: ".in",
      href: "/",
      description:
        "Discover and book amazing venues for weddings, corporate events, and serene farmstays. Your perfect celebration starts here.",
    },
    newsletter: {
      heading: "Get inspired for your next event",
      subtext:
        "Hand-picked venues, exclusive offers, and planning tips — straight to your inbox.",
    },
    contact: {
      phone: { display: "+91 733 868 4444", href: "tel:+917338684444" },
      email: { display: "hello@venuebook.in", href: "mailto:hello@venuebook.in" },
      hours: "Mon–Sat · 9:30 AM – 6:30 PM (IST)",
    },
    localization: {
      label: "English (IN)",
      currency: "INR",
    },
    navGroups: [
      {
        heading: "Discover",
        links: [
          { label: "Wedding Venues", href: "#" },
          { label: "Banquet Halls", href: "#" },
          { label: "Farmstays & Lawns", href: "#" },
          { label: "Corporate Events", href: "#" },
        ],
      },
      {
        heading: "Hosting",
        links: [
          { label: "List Your Venue / Farmstay", href: "#" },
          { label: "Host Resources", href: "#" },
          { label: "Responsible Hosting", href: "#" },
        ],
      },
      {
        heading: "Support",
        links: [
          { label: "How it Works", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Cancellation Policy", href: "#" },
          { label: "Safety Information", href: "#" },
          { label: "Report a Concern", href: "#" },
        ],
      },
    ],
  },

  AE: {
    brand: {
      name: "venuebook",
      tld: ".in",
      href: "/",
      description:
        "Your gateway to premier venues, luxury farmstays, creative studios, and extraordinary experiences across the UAE.",
    },
    newsletter: {
      heading: "Explore the extraordinary",
      subtext:
        "Curated spaces, luxury stays, and unique experiences — delivered to your inbox.",
    },
    contact: {
      phone: { display: "+971 54 198 7423", href: "tel:+971541987423" },
      email: { display: "global@venuebook.in", href: "mailto:global@venuebook.in" },
      hours: "Sun–Thu · 9:00 AM – 6:00 PM (GST)",
    },
    localization: {
      label: "English (UAE)",
      currency: "AED",
    },
    navGroups: [
      {
        heading: "Discover",
        links: [
          { label: "Venues & Farmstays", href: "#" },
          { label: "Studios & Workspaces", href: "#" },
          { label: "Luxury Rentals", href: "#" },
          { label: "Unique Experiences", href: "#" },
        ],
      },
      {
        heading: "Hosting",
        links: [
          { label: "List Your Space / Property", href: "#" },
          { label: "UAE Host Community", href: "#" },
          { label: "Service Standards", href: "#" },
        ],
      },
      {
        heading: "Support",
        links: [
          { label: "How it Works", href: "#" },
          { label: "Global Help Center", href: "#" },
          { label: "Booking Protections", href: "#" },
          { label: "Travel Safety", href: "#" },
          { label: "Report a Concern", href: "#" },
        ],
      },
    ],
  },
};

/**
 * Returns footer config for the given region code.
 * Falls back to IN if the region is not found.
 *
 * @param {string} regionCode  e.g. "IN" | "AE"
 * @returns {object}
 */
export function getFooterConfig(regionCode) {
  return FOOTER_CONFIG[regionCode?.toUpperCase()] ?? FOOTER_CONFIG.IN;
}
