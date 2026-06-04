// ─────────────────────────────────────────────────────────────────────────────
//  Pricing config — modes, shifts, and rate types per category
// ─────────────────────────────────────────────────────────────────────────────

// Venue-specific: shift slots
// Night and Hourly are reserved for a future release — do not remove config entries
export const VENUE_SHIFTS = [
  { key: "morning",   label: "Morning",   abbr: "M",  time: "6 AM – 12 PM", hours: 6  },
  { key: "afternoon", label: "Afternoon", abbr: "A",  time: "12 PM – 6 PM", hours: 6  },
  { key: "evening",   label: "Evening",   abbr: "E",  time: "6 PM – 10 PM", hours: 4  },
  { key: "full_day",  label: "Full Day",  abbr: "FD", time: "24 hours",     hours: 24 },
  // { key: "night",  label: "Night",     abbr: "N",  time: "10 PM – 6 AM", hours: 8  },
  // { key: "hourly", label: "Hourly",    abbr: "H",  time: "Per 1 hour",   hours: 1  },
];

// Venue pricing modes
export const VENUE_PRICING_MODES = [
  { key: "venue", label: "Venue Flat Rate", desc: "Charge a flat rate per shift booked" },
  { key: "pax",   label: "Per Person",      desc: "Charge per guest — rate set in Listing Editor" },
  { key: "both",  label: "Both",            desc: "Flat shift rate + per-person pricing in Editor" },
];

// Rate types per category
export const PRICING_CONFIG = {
  venue: {
    type: "venue_shifts",
    modes: VENUE_PRICING_MODES,
    shifts: VENUE_SHIFTS,
    hasDeposit: true,
  },
  // Farmstay: custom pricing rendered by FarmstayPricing component in PricingStep.
  farmstay: {
    type: "farmstay",
    rates: [
      { key: "nightly", label: "Per day price", required: true, placeholder: "3,500" },
    ],
    checkInOut:          true,
    weekendToggle:       true,
    weekendCheckInOut:   true,   // farmstay-specific: weekend has its own check-in/out
    longStayToggle:      true,   // farmstay-specific: multi-day stay rate
    hasDeposit:          true,
  },
  studio: {
    type: "hourly_day",
    rates: [
      { key: "hourly",   label: "Hourly rate",        required: true,  placeholder: "500" },
      { key: "halfDay",  label: "Half-day (4 hrs)",   required: false, placeholder: "1,800" },
      { key: "fullDay",  label: "Full-day (8 hrs)",   required: false, placeholder: "3,200" },
    ],
    hasDeposit: true,
  },
  workspace: {
    type: "hourly_day",
    rates: [
      { key: "hourly",   label: "Hourly rate",        required: true,  placeholder: "300" },
      { key: "halfDay",  label: "Half-day (4 hrs)",   required: false, placeholder: "1,000" },
      { key: "fullDay",  label: "Full-day (8 hrs)",   required: false, placeholder: "1,800" },
      { key: "monthly",  label: "Monthly rate",       required: false, placeholder: "15,000" },
    ],
    hasDeposit: true,
  },
  rental: {
    type: "nightly",
    rates: [
      { key: "nightly",  label: "Nightly rate",  required: true,  placeholder: "5,000" },
      { key: "weekly",   label: "Weekly rate",   required: false, placeholder: "30,000" },
      { key: "monthly",  label: "Monthly rate",  required: false, placeholder: "90,000" },
    ],
    weekendToggle: true,
    hasDeposit: true,
  },
  experience: {
    type: "per_pax",
    rates: [
      { key: "perPerson", label: "Price per person",   required: true,  placeholder: "800" },
      { key: "perGroup",  label: "Group flat rate",    required: false, placeholder: "5,000" },
    ],
    hasDeposit: false,
  },
};

// Check-in / check-out time presets
export const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM",
];
