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

/**
 * The real invoice download endpoint (services/booking.service.js's
 * download_invoice → GET {NEXT_PUBLIC_API_URL}/invoice/download/:id) takes
 * a real backend invoice id, which the mock bookings below don't have —
 * there's no mock reservation row on the real backend to point at. Every
 * paid mock booking uses this one known-working id as a placeholder so the
 * Download button is wired to the real endpoint end-to-end; swap this for
 * each booking's own id once the mock array is replaced by a real
 * `all_reservations` response.
 */
const MOCK_REAL_INVOICE_ID = 64;

/**
 * MOCK_BOOKINGS is deliberately built as an exhaustive GST demo matrix —
 * 4 venues + 4 farmstays, one for each combination of:
 *   - gstRegistered: is the vendor itself GST-registered?
 *       true  → the Tax Invoice tab shows TWO real documents (the vendor's
 *               own tax invoice for the venue/farmstay charge, plus
 *               venuebook.in's tax invoice for the convenience fee) — real
 *               marketplace invoicing, two different suppliers.
 *       false → an unregistered vendor cannot issue a GST tax invoice at
 *               all, so venuebook.in itself issues ONE combined tax
 *               invoice covering both the venue/farmstay charge and the
 *               convenience fee (see InvoiceDocument.jsx's
 *               buildCombinedModel).
 *   - customerState vs the relevant supplier's state: CGST+SGST when they
 *     match (intra-state), IGST when they don't (inter-state) — checked
 *     independently per document. `customerState` lives per-booking (not
 *     a single module constant) specifically so this demo matrix can show
 *     all 4 outcomes side by side; `placeOfSupply` is still set on the
 *     unregistered bookings for display/context on the card, but it does
 *     NOT drive the tax math there — with no vendor tax invoice, only
 *     venuebook.in's own state (VENUEBOOK_STATE) vs customerState matters.
 *
 * `amountINR` is a PRE-TAX base price — GST is added on top of it, not backed
 * out of it. It is deliberately a round number so `amountINR * 0.18` (GST),
 * `amountINR * 0.09` (CGST/SGST half-split), and post-discount variants of
 * the same lands on a whole rupee every time — easy to eyeball-verify on
 * each invoice.
 */
export const MOCK_BOOKINGS = [
  // ── VENUES ──────────────────────────────────────────────────────────
  {
    bookingId: "BK-103010",
    propertyName: "Grand Orchid Palace",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    category: "venues",
    date: "2026-08-14",
    nights: 1,
    guests: 120,
    shiftLabel: "Evening",
    shiftTime: "6:00 PM – 11:00 PM",
    amountINR: 11800, // pre-tax price; after ₹300 discount → 11,500 taxable, GST 18% = 2,070 (CGST 1,035 + SGST 1,035)
    address: "142 MG Road, Bengaluru, Karnataka 560001",
    specialRequest: "Please arrange a floral welcome arch at the entrance.",
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Grand Orchid Events Pvt. Ltd.",
    vendorGSTIN: "29GOPPL5678K1Z3",
    gstRegistered: true,
    placeOfSupply: "Karnataka",
    customerState: "Karnataka", // same state as vendor & venuebook.in → CGST/SGST
    paymentMode: "UPI",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103022",
    propertyName: "Azure Convention Center",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    category: "venues",
    date: "2026-09-02",
    nights: 1,
    guests: 200,
    shiftLabel: "Full Day",
    shiftTime: "9:00 AM – 6:00 PM",
    amountINR: 23600, // pre-tax price; after ₹300 discount → 23,300 taxable, GST 18% = 4,194 (IGST)
    address: "88 Marine Drive, Mumbai, Maharashtra 400002",
    specialRequest: null,
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Azure Convention Pvt. Ltd.",
    vendorGSTIN: "27AZURE9988H1Z2",
    gstRegistered: true,
    placeOfSupply: "Maharashtra",
    customerState: "Tamil Nadu", // differs from vendor's Maharashtra → IGST
    paymentMode: "Credit Card",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103034",
    propertyName: "Riverside Banquet Lawn",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    category: "venues",
    date: "2026-07-28",
    nights: 1,
    guests: 80,
    shiftLabel: "Afternoon",
    shiftTime: "1:00 PM – 5:00 PM",
    amountINR: 5900, // pre-tax price; after ₹300 discount → 5,600 taxable, GST 18% = 1,008 (CGST 504 + SGST 504)
    address: "21 Necklace Road, Hyderabad, Telangana 500001",
    specialRequest: "Need extra parking space for 20 cars.",
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "completed",
    vendorName: "Riverside Lawns",
    vendorGSTIN: null,
    gstRegistered: false,
    placeOfSupply: "Telangana", // vendor's own location — not used in the tax math once unregistered
    customerState: "Karnataka", // matches venuebook.in's own state → CGST/SGST
    paymentMode: "UPI",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103046",
    propertyName: "Coral Bay Rooftop",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    category: "venues",
    date: "2026-10-10",
    nights: 1,
    guests: 60,
    shiftLabel: "Evening",
    shiftTime: "7:00 PM – 12:00 AM",
    amountINR: 17700, // pre-tax price; after ₹300 discount → 17,400 taxable, GST 18% = 3,132 (IGST)
    address: "5 Rooftop Lane, Amritsar, Punjab 143001",
    specialRequest: null,
    paymentStatus: "partial",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Coral Bay Events",
    vendorGSTIN: null,
    gstRegistered: false,
    placeOfSupply: "Punjab",
    customerState: "West Bengal", // differs from venuebook.in's Karnataka → IGST
    paymentMode: "Net Banking",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },

  // ── FARMSTAYS ───────────────────────────────────────────────────────
  {
    bookingId: "BK-103058",
    propertyName: "Whispering Pines Farmstay",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "farmstays",
    date: "2026-06-02",
    nights: 3,
    guests: 8,
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    amountINR: 8200, // pre-tax price; after ₹300 discount → 7,900 taxable, GST 18% = 1,422 (CGST 711 + SGST 711)
    address: "Pine Ridge Estate, Coorg, Karnataka 571201",
    specialRequest: "Vegetarian meals only for all guests.",
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "completed",
    vendorName: "Whispering Pines Farmstay LLP",
    vendorGSTIN: "29WPFAR1234L1Z9",
    gstRegistered: true,
    placeOfSupply: "Karnataka",
    customerState: "Karnataka", // same state as vendor & venuebook.in → CGST/SGST
    paymentMode: "Credit Card",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103060",
    propertyName: "Silver Birch Farmstay",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800&q=80",
    category: "farmstays",
    date: "2026-09-05",
    nights: 2,
    guests: 4,
    checkInTime: "1:00 PM",
    checkOutTime: "10:00 AM",
    amountINR: 15300, // pre-tax price; after ₹300 discount → 15,000 taxable, GST 18% = 2,700 (IGST)
    address: "Birch Valley Road, Kutch, Gujarat 370001",
    specialRequest: null,
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Silver Birch Farmstay Pvt. Ltd.",
    vendorGSTIN: "24SILVR7766P1Z4",
    gstRegistered: true,
    placeOfSupply: "Gujarat",
    customerState: "Rajasthan", // differs from vendor's Gujarat → IGST
    paymentMode: "UPI",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103072",
    propertyName: "Misty Meadows Farmstay",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "farmstays",
    date: "2026-08-20",
    nights: 2,
    guests: 6,
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    amountINR: 4700, // pre-tax price; after ₹300 discount → 4,400 taxable, GST 18% = 792 (CGST 396 + SGST 396)
    address: "Meadow Trail, Munnar, Kerala 685612",
    specialRequest: "Early check-in requested if possible.",
    paymentStatus: "paid",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Misty Meadows Farms",
    vendorGSTIN: null,
    gstRegistered: false,
    placeOfSupply: "Kerala",
    customerState: "Karnataka", // matches venuebook.in's own state → CGST/SGST
    paymentMode: "UPI",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
  {
    bookingId: "BK-103084",
    propertyName: "Cedar Creek Farmstay",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800&q=80",
    category: "farmstays",
    date: "2026-07-15",
    nights: 1,
    guests: 5,
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    amountINR: 10600, // pre-tax price; after ₹300 discount → 10,300 taxable, GST 18% = 1,854 (IGST)
    address: "Cedar Creek Road, Manali, Himachal Pradesh 175131",
    specialRequest: null,
    paymentStatus: "partial",
    bookingType: "reservation",
    bookingStatus: "upcoming",
    vendorName: "Cedar Creek Farms",
    vendorGSTIN: null,
    gstRegistered: false,
    placeOfSupply: "Himachal Pradesh",
    customerState: "Odisha", // differs from venuebook.in's Karnataka → IGST
    paymentMode: "UPI",
    invoiceId: MOCK_REAL_INVOICE_ID,
  },
];

/**
 * Flat convenience fee venuebook.in charges on top of every paid reservation,
 * GST added on top (not inclusive). A round ₹100 (rather than the earlier
 * ₹99) so its own GST @18% is a clean ₹18.00, not ₹17.82 — easier to
 * verify by eye alongside the venue/farmstay charge's clean taxable value.
 * Deliberately separate from checkoutConfig.js's real 3% platform-fee
 * formula: that formula produces different numbers than these reference
 * designs, and this mock invoice feature has no real backend invoice
 * endpoint to reconcile against yet, so it stays self-contained rather
 * than silently drifting from the reference.
 */
export const MOCK_CONVENIENCE_FEE_INR = 100;

/** venuebook.in's own GSTIN, used on every Fee/Combined tax invoice. */
export const VENUEBOOK_GSTIN = "29AAFCV1234B1Z8";

/** venuebook.in's own registered state (GSTIN 29 = Karnataka) — the other
 *  half of the intra-/inter-state comparison on the Fee/Combined tax
 *  invoice (compared against each booking's own `customerState`). */
export const VENUEBOOK_STATE = "Karnataka";

/**
 * Flat mock "coupon"-style discount — real discount codes are usually a
 * flat amount rather than a percentage, so this stays flat across every
 * booking rather than scaling with price. Reduces the taxable base on
 * BOTH the Main Invoice and the Tax Invoice tab: "Net {category} Value" /
 * "Net {category} Price" is always `amountINR - MOCK_DISCOUNT_INR`, and
 * every CGST/SGST/IGST figure is computed off that discounted base, not
 * the pre-tax sticker price. A round ₹300 (a multiple of 100) so it
 * doesn't break the whole-rupee GST math described above — every mock
 * `amountINR` is itself a multiple of 100, so `amountINR - 300` stays a
 * multiple of 100 too.
 */
export const MOCK_DISCOUNT_INR = 300;

/**
 * Flat mock value of loyalty points redeemed against this booking (see
 * MOCK_POINTS_HISTORY's "Reward Redeemed" entry) — its own Main Invoice
 * line since it's the customer spending their own points, not a
 * vendor/platform discount. Only ever applied to farmstay bookings (per
 * product rule): the Main Invoice's Grand Total Paid (venues) vs Gross
 * Invoice Value → Net Payable Value (farmstays) split in
 * InvoiceDocument.jsx is what actually gates whether this line appears.
 */
export const MOCK_VB_LOYALTY_DISCOUNT_INR = 100;

/**
 * Deterministic invoice numbers/transaction id derived from the booking's
 * own id, so the 7 mock bookings don't need 3 more hardcoded fields each.
 */
export function deriveInvoiceNumbers(bookingId) {
  const digits = (bookingId || "").replace(/\D/g, "").padStart(6, "0");
  const short = digits.slice(-6);
  return {
    mainInvoiceNo: `VB-${short}`,
    vendorInvoiceNo: `INV-${short}`,
    feeInvoiceNo: `CF-${short}`,
    transactionId: `TXNVB${digits}IN`,
  };
}

/**
 * Cancellation refund tier schedule shown on ManageBookingView's
 * Cancellation tab — a standard tiered policy (further out = more
 * refunded), same shape as a real cancellation-policy API would return
 * (`daysFrom`/`daysTo`/`refundPercent`) so swapping this mock constant for
 * a real per-vendor policy later is a data-source change, not a component
 * rewrite. `daysTo: Infinity` on the top tier reads as "30+ days" in the UI.
 * Applies uniformly to venue and farmstay bookings alike (no real per-
 * category cancellation policy exists yet on the backend to differentiate
 * them).
 */
export const MOCK_CANCELLATION_TIERS = [
  { daysFrom: 30, daysTo: Infinity, refundPercent: 90 },
  { daysFrom: 15, daysTo: 29, refundPercent: 50 },
  { daysFrom: 7, daysTo: 14, refundPercent: 25 },
  { daysFrom: 0, daysTo: 6, refundPercent: 0 },
];

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
    body: "₹8,200 for Whispering Pines Farmstay",
    time: "1d ago",
  },
  {
    id: "n3",
    type: "reply",
    title: "Property replied",
    body: "Silver Birch Farmstay answered your question",
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
