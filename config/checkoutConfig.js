/**
 * /config/checkoutConfig.js
 *
 * CHECKOUT SYSTEM — SINGLE SOURCE OF TRUTH
 * ─────────────────────────────────────────
 * All category-specific checkout configuration lives here.
 * Adding a new category = adding one entry below. Zero component changes needed.
 *
 * Structure per category:
 *   ctaKey         – translation key for the primary CTA button
 *   summaryFields  – which fields appear in the right-column summary
 *   addOns         – smart upsell cards shown before payment (prices in INR)
 *   depositApplies – whether a refundable security deposit section is shown
 */

/**
 * Site-wide legal copy shown in TermsModal. Terms of Service and the
 * Privacy Policy aren't category-specific — only the cancellation tiers
 * below vary per category. Replace with real legal-team copy in production.
 */
export const LEGAL_DEFAULTS = {
  termsText:
    "By completing this booking, you enter into a binding agreement with the venue or property owner. The booking is confirmed once payment is received, and must be used in accordance with all applicable local laws and the property's house rules. Maximum capacity and usage restrictions stated on the listing must be followed at all times. venuebook.in acts as a booking platform connecting you with the property owner and is not a party to the underlying rental agreement.",
  privacyText:
    "We collect the information you provide during booking (contact details, event details, and payment information) to process your reservation and communicate with you about it. Payment details are handled by PCI-compliant payment processors and are never stored on venuebook.in servers. We do not sell your personal information to third parties; it may be shared with the property owner and service providers strictly to fulfil your booking.",
};

export const CHECKOUT_CATEGORY_CONFIG = {
  venues: {
    ctaKey: "checkout.cta.venue",
    depositApplies: false,
    allowAdvancePayment: true,
    advancePercent: 30,
    summaryFields: ["eventDate", "shift", "guestCount", "eventType"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "30+ days before the event", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: 15, daysTo: 29,  refundPercent: 75,  description: "75% refund of the total amount paid.", color: "success" },
      { daysFrom: 7,  daysTo: 14,  refundPercent: 50,  description: "50% refund of the total amount paid.", color: "warning" },
      { daysFrom: 0,  daysTo: 6,   refundPercent: 0,   description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "eventType",
      "guestCount",
      "eventDate",
      "shift",
      "specialRequirements",
      "decorationNotes",
      "foodPreferences",
      "vendorNotes",
    ],
    addOns: [
      {
        id: "drone",
        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80",
        nameKey: "checkout.addons.venue.drone.name",
        descKey: "checkout.addons.venue.drone.desc",
        priceINR: 8000,
      },
      {
        id: "livestream",
        image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80",
        nameKey: "checkout.addons.venue.livestream.name",
        descKey: "checkout.addons.venue.livestream.desc",
        priceINR: 5000,
      },
      {
        id: "ledwall",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
        nameKey: "checkout.addons.venue.ledwall.name",
        descKey: "checkout.addons.venue.ledwall.desc",
        priceINR: 15000,
      },
      {
        id: "decoration",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80",
        nameKey: "checkout.addons.venue.decoration.name",
        descKey: "checkout.addons.venue.decoration.desc",
        priceINR: 12000,
      },
    ],
  },

  farmstays: {
    ctaKey: "checkout.cta.farmstay",
    depositApplies: true,
    depositAmountINR: 5000,
    allowAdvancePayment: true,
    advancePercent: 30,
    summaryFields: ["checkIn", "checkOut", "nights", "guests"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "7+ days before check-in", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: 3, daysTo: 6, refundPercent: 50, description: "50% refund of the total amount paid.", color: "warning" },
      { daysFrom: 0, daysTo: 2, refundPercent: 0,  description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "checkIn",
      "checkOut",
      "adults",
      "children",
      "pets",
      "arrivalTime",
      "earlyCheckIn",
    ],
    addOns: [
      {
        id: "bonfire",
        image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&q=80",
        nameKey: "checkout.addons.farmstay.bonfire.name",
        descKey: "checkout.addons.farmstay.bonfire.desc",
        priceINR: 1500,
      },
      {
        id: "bbq",
        image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=80",
        nameKey: "checkout.addons.farmstay.bbq.name",
        descKey: "checkout.addons.farmstay.bbq.desc",
        priceINR: 2500,
      },
      {
        id: "plantation",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
        nameKey: "checkout.addons.farmstay.plantation.name",
        descKey: "checkout.addons.farmstay.plantation.desc",
        priceINR: 800,
      },
      {
        id: "chef",
        image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80",
        nameKey: "checkout.addons.farmstay.chef.name",
        descKey: "checkout.addons.farmstay.chef.desc",
        priceINR: 3500,
      },
    ],
  },

  studios: {
    ctaKey: "checkout.cta.studio",
    depositApplies: false,
    summaryFields: ["shootDate", "timeSlot", "studioName"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "48+ hours before the shoot", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: null, daysTo: null, condition: "24-47 hours before the shoot", refundPercent: 50, description: "50% refund of the total amount paid.", color: "warning" },
      { daysFrom: null, daysTo: null, condition: "Less than 24 hours before the shoot", refundPercent: 0, description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "shootDate",
      "timeSlot",
      "crewSize",
      "equipmentRequired",
      "lightingRequirement",
      "productionNotes",
    ],
    addOns: [
      {
        id: "extralights",
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&q=80",
        nameKey: "checkout.addons.studio.lights.name",
        descKey: "checkout.addons.studio.lights.desc",
        priceINR: 3000,
      },
      {
        id: "camera",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
        nameKey: "checkout.addons.studio.camera.name",
        descKey: "checkout.addons.studio.camera.desc",
        priceINR: 5000,
      },
      {
        id: "backdrop",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        nameKey: "checkout.addons.studio.backdrop.name",
        descKey: "checkout.addons.studio.backdrop.desc",
        priceINR: 2000,
      },
      {
        id: "editor",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80",
        nameKey: "checkout.addons.studio.editor.name",
        descKey: "checkout.addons.studio.editor.desc",
        priceINR: 8000,
      },
    ],
  },

  workspaces: {
    ctaKey: "checkout.cta.workspace",
    depositApplies: false,
    summaryFields: ["bookingDate", "timeSlot", "seats"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "24+ hours before booking", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: null, daysTo: null, condition: "Less than 24 hours before booking", refundPercent: 0, description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "bookingDate",
      "timeSlot",
      "seats",
      "meetingRoom",
      "internet",
      "projector",
      "whiteboard",
      "teaCoffee",
      "visitorCount",
    ],
    addOns: [
      {
        id: "meetingupgrade",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
        nameKey: "checkout.addons.workspace.meeting.name",
        descKey: "checkout.addons.workspace.meeting.desc",
        priceINR: 2000,
      },
      {
        id: "lunch",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
        nameKey: "checkout.addons.workspace.lunch.name",
        descKey: "checkout.addons.workspace.lunch.desc",
        priceINR: 500,
      },
      {
        id: "reception",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80",
        nameKey: "checkout.addons.workspace.reception.name",
        descKey: "checkout.addons.workspace.reception.desc",
        priceINR: 1000,
      },
    ],
  },

  rentals: {
    ctaKey: "checkout.cta.rental",
    depositApplies: true,
    depositAmountINR: 10000,
    summaryFields: ["rentalStart", "rentalEnd", "rentalDuration", "pickup", "rentalReturn"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "48+ hours before pickup", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: null, daysTo: null, condition: "24-47 hours before pickup", refundPercent: 50, description: "50% refund of the total amount paid.", color: "warning" },
      { daysFrom: null, daysTo: null, condition: "Less than 24 hours before pickup", refundPercent: 0, description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "rentalStart",
      "rentalEnd",
      "pickup",
      "delivery",
      "driverRequired",
      "usageNotes",
    ],
    addOns: [
      {
        id: "insurance",
        image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80",
        nameKey: "checkout.addons.rental.insurance.name",
        descKey: "checkout.addons.rental.insurance.desc",
        priceINR: 1200,
      },
      {
        id: "driver",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
        nameKey: "checkout.addons.rental.driver.name",
        descKey: "checkout.addons.rental.driver.desc",
        priceINR: 1500,
      },
      {
        id: "fuel",
        image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&q=80",
        nameKey: "checkout.addons.rental.fuel.name",
        descKey: "checkout.addons.rental.fuel.desc",
        priceINR: 2000,
      },
      {
        id: "extrahours",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80",
        nameKey: "checkout.addons.rental.extrahours.name",
        descKey: "checkout.addons.rental.extrahours.desc",
        priceINR: 500,
      },
    ],
  },

  experiences: {
    ctaKey: "checkout.cta.experience",
    depositApplies: false,
    summaryFields: ["experienceDate", "session", "participants"],
    cancellationRule: [
      { daysFrom: null, daysTo: null, condition: "48+ hours before the experience", refundPercent: 100, description: "Full refund of the amount paid, minus payment gateway charges.", color: "success" },
      { daysFrom: null, daysTo: null, condition: "24-47 hours before the experience", refundPercent: 50, description: "50% refund of the total amount paid.", color: "warning" },
      { daysFrom: null, daysTo: null, condition: "Less than 24 hours before the experience", refundPercent: 0, description: "No refund — the booking amount is forfeited.", color: "danger" },
    ],
    bookingFields: [
      "experienceDate",
      "sessionTime",
      "participants",
      "difficultyLevel",
      "equipmentRental",
      "dietaryPreferences",
      "emergencyContact",
    ],
    addOns: [
      {
        id: "photo",
        image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=400&q=80",
        nameKey: "checkout.addons.experience.photo.name",
        descKey: "checkout.addons.experience.photo.desc",
        priceINR: 2500,
      },
      {
        id: "guide",
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80",
        nameKey: "checkout.addons.experience.guide.name",
        descKey: "checkout.addons.experience.guide.desc",
        priceINR: 1800,
      },
      {
        id: "transport",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80",
        nameKey: "checkout.addons.experience.transport.name",
        descKey: "checkout.addons.experience.transport.desc",
        priceINR: 1200,
      },
      {
        id: "meals",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
        nameKey: "checkout.addons.experience.meals.name",
        descKey: "checkout.addons.experience.meals.desc",
        priceINR: 800,
      },
    ],
  },
};

/** Platform fee percentage applied to base + add-ons */
export const PLATFORM_FEE_PERCENT = 0.03;

/** GST / Tax percentage */
export const TAX_PERCENT = 0.18;

/** Points earned per INR spent */
export const POINTS_PER_INR = 2;

/** INR value per reward point */
export const INR_PER_POINT = 0.25;

/** Maximum percentage of order value redeemable via wallet */
export const MAX_WALLET_REDEMPTION_PERCENT = 0.2;

/** Membership tiers with points thresholds */
export const MEMBERSHIP_TIERS = [
  { id: "bronze",  label: "Bronze",  minPoints: 0,      color: "#cd7f32", nextAt: 5000  },
  { id: "silver",  label: "Silver",  minPoints: 5000,   color: "#9ca3af", nextAt: 15000 },
  { id: "gold",    label: "Gold",    minPoints: 15000,  color: "#f59e0b", nextAt: 30000 },
  { id: "diamond", label: "Diamond", minPoints: 30000,  color: "#818cf8", nextAt: null  },
];

/**
 * Return the active tier for a given points balance.
 * @param {number} points
 */
export function getMembershipTier(points) {
  let active = MEMBERSHIP_TIERS[0];
  for (const tier of MEMBERSHIP_TIERS) {
    if (points >= tier.minPoints) active = tier;
  }
  return active;
}

/**
 * Return config for a given category slug. Falls back to venues.
 * @param {string} category
 */
export function getCheckoutConfig(category) {
  return CHECKOUT_CATEGORY_CONFIG[category] ?? CHECKOUT_CATEGORY_CONFIG.venues;
}
