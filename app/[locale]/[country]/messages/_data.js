/**
 * Customer Messages — Mock Data
 * ──────────────────────────────────────────────────────────────────
 * Demo dataset for the guest-facing inbox. Mirrors the vendor Messages
 * shape so the two share the same component ergonomics, but the point of
 * view is the CUSTOMER: `role: "me"` is the guest, `role: "them"` is the
 * venue host / support agent.
 *
 * Category labels are resolved via next-intl (`messages.categories.*`),
 * so only the stable `key` lives here — no hardcoded UI strings.
 *
 * Replace with the customer chat API when the backend is ready.
 */

/* Category keys — labels come from translations, not from here. */
export const MESSAGE_CATEGORIES = ["all", "bookings", "enquiries", "support"];

/* Visual styles per category (theme-safe, dark-mode aware). */
export const CATEGORY_STYLES = {
  bookings:  { pill: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
  enquiries: { pill: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  support:   { pill: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
};

export const MOCK_CONVERSATIONS = [
  /* ── BOOKINGS ───────────────────────────────────────────────── */
  {
    id: "1",
    category: "bookings",
    contact: { name: "The Grand Pavilion", initials: "GP", color: "from-violet-500 to-purple-400", isOnline: true },
    venue:   "The Grand Pavilion",
    subject: "Wedding Reception #VB-24815",
    lastMessage: "Great — the décor team will arrive by 2 PM on the 15th.",
    time:    "10:42 AM",
    unread:  2,
    pinned:  true,
    messages: [
      { id: "m1", role: "me",   text: "Hi! I've booked The Grand Pavilion for March 15. Just confirming a few details.", time: "9:00 AM",  date: "Today" },
      { id: "m2", role: "them", text: "Hello! Congratulations on your booking. Happy to help — what would you like to confirm?", time: "9:05 AM", date: "Today", sender: "Host" },
      { id: "m3", role: "me",   text: "What time can the decoration team access the hall?", time: "9:08 AM",  date: "Today" },
      { id: "m4", role: "them", text: "Setup access opens at 2 PM. Your coordinator will be on site to assist.", time: "9:12 AM", date: "Today", sender: "Host" },
      { id: "m5", role: "me",   text: "Perfect. And is in-house catering included in the package?", time: "10:30 AM", date: "Today" },
      { id: "m6", role: "them", text: "Great — the décor team will arrive by 2 PM on the 15th.", time: "10:42 AM", date: "Today", sender: "Host" },
    ],
  },
  {
    id: "2",
    category: "bookings",
    contact: { name: "Riverside Banquets", initials: "RB", color: "from-indigo-500 to-blue-400", isOnline: false },
    venue:   "Riverside Banquets",
    subject: "Anniversary Dinner #VB-24902",
    lastMessage: "Your advance payment has been received. Thank you!",
    time:    "Yesterday",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Hi, I'd like to confirm the menu selection for our anniversary dinner.", time: "4:10 PM", date: "Yesterday" },
      { id: "m2", role: "them", text: "Of course! We've noted the vegetarian set menu for 40 guests.", time: "4:22 PM", date: "Yesterday", sender: "Host" },
      { id: "m3", role: "them", text: "Your advance payment has been received. Thank you!", time: "5:01 PM", date: "Yesterday", sender: "Host" },
    ],
  },

  /* ── ENQUIRIES ──────────────────────────────────────────────── */
  {
    id: "3",
    category: "enquiries",
    contact: { name: "Sunset Terrace", initials: "ST", color: "from-amber-500 to-orange-400", isOnline: true },
    venue:   "Sunset Terrace",
    subject: "Availability — December",
    lastMessage: "We have Dec 20 and Dec 27 open. Shall I hold one for you?",
    time:    "2:15 PM",
    unread:  1,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Is Sunset Terrace available for an evening event in late December?", time: "1:40 PM", date: "Today" },
      { id: "m2", role: "them", text: "We have Dec 20 and Dec 27 open. Shall I hold one for you?", time: "2:15 PM", date: "Today", sender: "Host" },
    ],
  },
  {
    id: "4",
    category: "enquiries",
    contact: { name: "Palm Court Lawns", initials: "PC", color: "from-teal-500 to-emerald-400", isOnline: false },
    venue:   "Palm Court Lawns",
    subject: "Capacity & pricing",
    lastMessage: "The lawn seats up to 500 guests. I'll share the tariff sheet.",
    time:    "Mon",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "What's the maximum seated capacity for the lawn area?", time: "11:05 AM", date: "Monday" },
      { id: "m2", role: "them", text: "The lawn seats up to 500 guests. I'll share the tariff sheet.", time: "11:20 AM", date: "Monday", sender: "Host" },
    ],
  },

  /* ── SUPPORT ────────────────────────────────────────────────── */
  {
    id: "5",
    category: "support",
    contact: { name: "venuebook.in Support", initials: "VB", color: "from-sky-500 to-cyan-400", isOnline: true },
    venue:   null,
    subject: "Refund status — booking #VB-24710",
    lastMessage: "Your refund has been processed and should reflect in 3–5 days.",
    time:    "9:58 AM",
    unread:  1,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Hi, I cancelled a booking last week. When will the refund arrive?", time: "9:30 AM", date: "Today" },
      { id: "m2", role: "them", text: "Let me check that for you right away.", time: "9:44 AM", date: "Today", sender: "Support" },
      { id: "m3", role: "them", text: "Your refund has been processed and should reflect in 3–5 days.", time: "9:58 AM", date: "Today", sender: "Support" },
    ],
  },
  {
    id: "6",
    category: "support",
    contact: { name: "venuebook.in Support", initials: "VB", color: "from-sky-500 to-cyan-400", isOnline: false },
    venue:   null,
    subject: "Update invoice details",
    lastMessage: "Done — your updated GST invoice has been emailed to you.",
    time:    "Tue",
    unread:  0,
    pinned:  false,
    messages: [
      { id: "m1", role: "me",   text: "Could you update the company name on my invoice?", time: "3:12 PM", date: "Tuesday" },
      { id: "m2", role: "them", text: "Done — your updated GST invoice has been emailed to you.", time: "3:40 PM", date: "Tuesday", sender: "Support" },
    ],
  },
];
