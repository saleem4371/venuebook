/**
 * /app/[locale]/[country]/profile/data/mockProfileData.js
 *
 * Mock data for the sections that have no confirmed customer-facing backend
 * endpoint yet: Bookings, Offers, Notifications. This mirrors the same
 * pattern already used elsewhere in the app (MOCK_WALLET in CheckoutClient,
 * DEMO_MEMBERSHIP in UserDropdown) rather than inventing a new one — the UI
 * is real, the data source is a clearly-labeled placeholder.
 *
 * IMPORTANT: field names here intentionally mirror what the real
 * `all_reservations` / `reservation_invoice` responses are expected to look
 * like (bookingId, propertyName, category, amountINR, paymentStatus,
 * bookingStatus) so swapping the mock array for a real API response later
 * is a data-source change, not a component rewrite.
 *
 * Category values match the badge taxonomy already used by VenueCard.jsx:
 * venues | farmstays | studios | rentals | workspaces | experiences
 */

export const CATEGORY_COLORS = {
  venues: "#7C3AED",
  farmstays: "#16A34A",
  studios: "#2563EB",
  rentals: "#EA580C",
  workspaces: "#4F46E5",
  experiences: "#DB2777",
};

/**
 * bookingType is a second, independent axis from bookingStatus:
 *   - "reservation" → a real, confirmed booking. bookingStatus carries its
 *     lifecycle (upcoming / completed / cancelled) as before.
 *   - "enquiry"      → customer asked about availability/pricing, never
 *     confirmed. bookingStatus mirrors the type ("enquiry") so status-badge
 *     lookups (`t(status.${bookingStatus})`, STATUS_TONE[...]) stay a single
 *     code path instead of branching on bookingType everywhere.
 *   - "draft"        → a booking flow started but not submitted. Same idea,
 *     bookingStatus is "draft".
 * The 7 filter tabs (All/Upcoming/Completed/Cancelled/Reservation/Enquiry/
 * Drafted) read bookingStatus for the first four and bookingType for the
 * last three — see BookingTabs.jsx.
 */
export const MOCK_BOOKINGS = [
  {
    bookingId: "BK-102934",
    propertyName: "Grand Orchid Palace",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    category: "venues",
    date: "2026-08-14",
    nights: 1,
    guests: 300,
    amountINR: 185000,
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Grand Orchid Events Pvt. Ltd.",
    vendorGSTIN: "29GOPPL5678K1Z3",
    placeOfSupply: "Karnataka",
    paymentMode: "UPI",
  },
  {
    bookingId: "BK-102810",
    propertyName: "Whispering Pines Farmstay",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "farmstays",
    date: "2026-06-02",
    nights: 3,
    guests: 8,
    amountINR: 22000,
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "completed",
    vendorName: "Whispering Pines Farmstay LLP",
    vendorGSTIN: "27WPFAR1234L1Z9",
    placeOfSupply: "Maharashtra",
    paymentMode: "Credit Card",
  },
  {
    bookingId: "BK-102766",
    propertyName: "Lumen Photo Studio",
    image:
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80",
    category: "studios",
    date: "2026-05-11",
    nights: 1,
    guests: 12,
    amountINR: 9500,
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "completed",
    vendorName: "Lumen Studios Pvt. Ltd.",
    vendorGSTIN: "29LUMEN9988M1Z2",
    placeOfSupply: "Karnataka",
    paymentMode: "Net Banking",
  },
  {
    bookingId: "BK-102640",
    propertyName: "Meridian Co-work Suite",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    category: "workspaces",
    date: "2026-03-22",
    nights: 1,
    guests: 6,
    amountINR: 4200,
    paymentStatus: "refunded",
    bookingType: "reservation",
    bookingStatus: "cancelled",
    vendorName: "Meridian Workspaces Pvt. Ltd.",
    vendorGSTIN: "07MERID4455N1Z6",
    placeOfSupply: "Delhi",
    paymentMode: "UPI",
  },
  {
    bookingId: "BK-102588",
    propertyName: "Silver Birch Farmstay",
    image:
      "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800&q=80",
    category: "farmstays",
    date: "2026-09-05",
    nights: 8,
    guests: 4,
    amountINR: 14500,
    paymentStatus: "partial",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Silver Birch Farmstay Pvt. Ltd.",
    vendorGSTIN: "24SILVR7766P1Z4",
    placeOfSupply: "Gujarat",
    paymentMode: "UPI",
  },
  {
    bookingId: "BK-102512",
    propertyName: "Coastal Breeze Villa",
    image:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
    category: "rentals",
    date: "2026-09-20",
    nights: 4,
    guests: 10,
    amountINR: 0,
    paymentStatus: "pending",
    bookingType: "enquiry",
    bookingStatus: "enquiry",
    vendorName: "Coastal Breeze Rentals",
    vendorGSTIN: "—",
    placeOfSupply: "—",
    paymentMode: "—",
  },
  {
    bookingId: "BK-102490",
    propertyName: "Skyline Experience Loft",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    category: "experiences",
    date: "2026-10-02",
    nights: 1,
    guests: 20,
    amountINR: 0,
    paymentStatus: "pending",
    bookingType: "draft",
    bookingStatus: "draft",
    vendorName: "Skyline Experiences",
    vendorGSTIN: "—",
    placeOfSupply: "—",
    paymentMode: "—",
  },
];

/**
 * Flat convenience fee VenueBook charges on top of every paid reservation,
 * GST added on top (not inclusive) — matches the reference invoice designs
 * exactly. Deliberately separate from checkoutConfig.js's real 3%
 * platform-fee formula: that formula produces different numbers than these
 * reference designs, and this mock invoice feature has no real backend
 * invoice endpoint to reconcile against yet, so it stays self-contained
 * rather than silently drifting from the reference.
 */
export const MOCK_CONVENIENCE_FEE_INR = 99;

/** VenueBook's own GSTIN, used on the Convenience Fee tax invoice. */
export const VENUEBOOK_GSTIN = "29AAFCV1234B1Z8";

/**
 * Deterministic invoice numbers/transaction id derived from the booking's
 * own id, so the 7 mock bookings don't need 3 more hardcoded fields each.
 */
export function deriveInvoiceNumbers(bookingId) {
  const digits = (bookingId || "").replace(/\D/g, "").padStart(6, "0");
  const short = digits.slice(-6);
  return {
    vendorInvoiceNo: `INV-${short}`,
    feeInvoiceNo: `CF-${short}`,
    transactionId: `TXNVB${digits}IN`,
  };
}

export const MOCK_OFFERS = [
  {
    id: "off-farmstay-20",
    title: "20% off Farmstay",
    subtitle: "On your next weekend getaway",
    tag: "FARMSTAY20",
    colorFrom: "#16A34A",
    colorTo: "#22C55E",
  },
  {
    id: "off-weekend",
    title: "Weekend Deal",
    subtitle: "Flat ₹1,000 off venues, Fri–Sun",
    tag: "WEEKEND1000",
    colorFrom: "#7C3AED",
    colorTo: "#A855F7",
  },
  {
    id: "off-earlybird",
    title: "Early Bird Offer",
    subtitle: "Book 30 days ahead, save 12%",
    tag: "EARLY12",
    colorFrom: "#EA580C",
    colorTo: "#FB923C",
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    type: "booking",
    title: "Booking confirmed",
    body: "Grand Orchid Palace — 14 Aug 2026",
    time: "2h ago",
  },
  {
    id: "n2",
    type: "payment",
    title: "Payment received",
    body: "₹22,000 for Whispering Pines Farmstay",
    time: "1d ago",
  },
  {
    id: "n3",
    type: "reply",
    title: "Property replied",
    body: "Meridian Co-work Suite answered your question",
    time: "3d ago",
  },
  {
    id: "n4",
    type: "offer",
    title: "Offer available",
    body: "20% off your next Farmstay booking",
    time: "5d ago",
  },
];

/**
 * Wallet / loyalty points, spend, and nights are all derived from the mock
 * bookings themselves (rather than second, disconnected magic numbers) so
 * the Member Card, Farm Rewards, and Identity panel all agree with the
 * Bookings list on the same page. Mirrors the POINTS_PER_INR calculation
 * CheckoutClient.jsx already uses.
 *
 * Only real, confirmed bookings (bookingType === "reservation") count
 * toward these totals — an enquiry or an unsubmitted draft was never paid
 * or stayed, so it must not inflate spend/points/nights.
 */
function confirmedReservations() {
  return MOCK_BOOKINGS.filter((b) => b.bookingType === "reservation" && b.bookingStatus !== "cancelled");
}

export function computeMockWalletPoints(pointsPerINR) {
  const spend = confirmedReservations().reduce((sum, b) => sum + b.amountINR, 0);
  return Math.floor(spend * pointsPerINR);
}

export function hasFarmstayBooking() {
  return confirmedReservations().some((b) => b.category === "farmstays");
}

/** Lifetime spend across confirmed, non-cancelled reservations. */
export function computeMockLifetimeSpend() {
  return confirmedReservations().reduce((sum, b) => sum + b.amountINR, 0);
}

/** Total nights across confirmed, non-cancelled reservations. */
export function computeMockTotalNights() {
  return confirmedReservations().reduce((sum, b) => sum + (b.nights || 0), 0);
}

/** Soonest upcoming booking, or null if none. */
export function getNextUpcomingBooking() {
  const upcoming = MOCK_BOOKINGS.filter((b) => b.bookingStatus === "upcoming").sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  return upcoming[0] || null;
}

export const MOCK_POINTS_HISTORY = [
  { id: "p1", delta: 200, label: "Booked Farmstay", date: "2 Jun 2026" },
  { id: "p2", delta: 40, label: "Review Posted", date: "8 Jun 2026" },
  { id: "p3", delta: -100, label: "Reward Redeemed", date: "20 Jun 2026" },
];
