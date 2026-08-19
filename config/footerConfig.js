export const FOOTER_CONFIG = {
  IN: {
    contact: {
      phone: { href: "tel:+917338684444" },
      email: { href: "mailto:hello@venuebook.in" },
    },
    navGroups: [
      {
        headingKey: "discover.heading",
        links: [
          { tKey: "discover.wedding_venues", href: "#" },
          { tKey: "discover.banquet_halls", href: "#" },
          { tKey: "discover.farmstays_lawns", href: "#" },
          { tKey: "discover.corporate_events", href: "#" },
        ],
      },
      {
        headingKey: "hosting.heading",
        links: [
          { tKey: "hosting.list_venue", href: "#" },
          { tKey: "hosting.host_resources", href: "#" },
          { tKey: "hosting.responsible_hosting", href: "#" },
        ],
      },
      {
        headingKey: "support.heading",
        links: [
          { tKey: "support.how_it_works", href: "#" },
          { tKey: "support.help_center", href: "#" },
          { tKey: "support.cancellation", href: "#" },
          { tKey: "support.safety", href: "#" },
          { tKey: "support.report", href: "#" },
          { tKey: "support.install_app", href: "#install-app" },
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
          { tKey: "discover.venues_farmstays", href: "#" },
          { tKey: "discover.studios_workspaces", href: "#" },
          { tKey: "discover.luxury_rentals", href: "#" },
          { tKey: "discover.unique_experiences", href: "#" },
        ],
      },
      {
        headingKey: "hosting.heading",
        links: [
          { tKey: "hosting.list_space", href: "#" },
          { tKey: "hosting.uae_community", href: "#" },
          { tKey: "hosting.service_standards", href: "#" },
        ],
      },
      {
        headingKey: "support.heading",
        links: [
          { tKey: "support.how_it_works", href: "#" },
          { tKey: "support.global_help", href: "#" },
          { tKey: "support.booking_protections", href: "#" },
          { tKey: "support.travel_safety", href: "#" },
          { tKey: "support.report", href: "#" },
          { tKey: "support.install_app", href: "#install-app" },
        ],
      },
    ],
  },
};

export function getFooterConfig(regionCode) {
  return FOOTER_CONFIG[regionCode?.toUpperCase()] ?? FOOTER_CONFIG.IN;
}
