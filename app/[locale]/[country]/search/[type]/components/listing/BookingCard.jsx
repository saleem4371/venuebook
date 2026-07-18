"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2, CheckCircle2, ChevronDown, Clock,
  Headphones, Info, Mail, Phone, Search, Tag, TreePine, User, Users, X, Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { getCategoryColors, normalizeCategory, getDefaultCTA } from "../../utils/categoryConfig";
import GuestPicker from "@/app/[locale]/[country]/home/components/GuestPicker";

// ─── Static gradient map ──────────────────────────────────────────────────────
const GRADIENTS = {
  venues:      "from-violet-600  to-purple-600",
  farmstays:   "from-emerald-500 to-teal-500",
  studios:     "from-blue-500    to-indigo-500",
  workspaces:  "from-amber-500   to-orange-500",
  rentals:     "from-rose-500    to-pink-500",
  experiences: "from-cyan-500    to-sky-500",
};

const ICON_BG = {
  venues:      "bg-violet-600",
  farmstays:   "bg-emerald-600",
  studios:     "bg-blue-600",
  workspaces:  "bg-amber-600",
  rentals:     "bg-rose-600",
  experiences: "bg-cyan-600",
};

// ─── Category meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
  venues: {
    mode: "enquiry",
    badge: { label: "Pax Available", bg: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
    icon: Building2,
    trustBadges: [
      { icon: Clock,      text: "Response in 24h" },
      { icon: Tag,        text: "Best price guaranteed" },
      { icon: Headphones, text: "Direct venue connect" },
    ],
    eventTypes: ["Wedding", "Reception", "Roce", "Engagement", "Birthday", "Corporate", "Baby Shower", "Other"],
    priceLabel: "Starting price",
  },
  farmstays: {
    mode: "reserve",
    badge: { label: "Instant Book", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
    icon: TreePine,
    trustBadges: [
      { icon: CheckCircle2, text: "Free cancellation" },
      { icon: Zap,          text: "Instant confirmation" },
      { icon: Users,        text: "Entire farmstay" },
    ],
    priceLabel: "night",
    priceNote: "You won't be charged yet",
  },
};

const DEFAULT_META = {
  mode: "reserve",
  badge: { label: "Available", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  icon: Building2,
  trustBadges: [
    { icon: CheckCircle2, text: "Free cancellation" },
    { icon: Clock,        text: "Flexible timings" },
    { icon: Headphones,   text: "24/7 support" },
  ],
  priceLabel: "night",
  priceNote: "You won't be charged yet",
};

function getMeta(category) {
  return CATEGORY_META[normalizeCategory(category)] ?? DEFAULT_META;
}

function getWeekendCount(start, end) {
  if (!start || !end) {
    return {
      saturday: 0,
      sunday: 0,
      weekend: 0,
    };
  }

  let saturday = 0;
  let sunday = 0;

  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday

    if (day === 6) saturday++;
    if (day === 0) sunday++;

    current.setDate(current.getDate() + 1);
  }

  return {
    saturday,
    sunday,
    weekend: saturday + sunday,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

/** Format guest values object → readable summary string */
function fmtGuests(type, values) {
  if (!values) return "Add guests";
  if (type === "guests") {
    const n = values.guests ?? 1;
    return `${n} Guest${n !== 1 ? "s" : ""}`;
  }
  const adults   = values.adults   ?? 1;
  const children = values.children ?? 0;
  const infants  = values.infants  ?? 0;
  const pets     = values.pets     ?? 0;
  const parts    = [`${adults} Adult${adults !== 1 ? "s" : ""}`];
  if (children) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  if (infants)  parts.push(`${infants} Infant${infants !== 1 ? "s" : ""}`);
  if (pets)     parts.push(`${pets} Pet${pets !== 1 ? "s" : ""}`);
  return parts.join(" · ");
}

/**
 * Scroll to the #calendar section so its heading is fully visible below both
 * the fixed global header and the sticky section nav.
 * Heights are read from the DOM to stay in sync with any layout changes.
 */
function scrollToCalendar() {
  const el = document.getElementById("calendar");
  if (!el) return;
  const hdr = document.querySelector("header");
  const nav = document.getElementById("section-nav");
  const OFFSET = (hdr?.offsetHeight ?? 57) + (nav?.offsetHeight ?? 44) + 8;
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

// ─── Custom event type dropdown ───────────────────────────────────────────────
function EventTypeDropdown({ value, onChange, options,venueEvents, colors, open, onOpenChange }) {
  const [search, setSearch] = useState("");
  const showSearch = venueEvents.length > 5;

 const filtered =
  showSearch && search.trim()
    ? venueEvents.filter((o) =>
        o.event_name.toLowerCase().includes(search.toLowerCase())
      )
    : venueEvents;

  // Reset search whenever dropdown closes
  useEffect(() => { if (!open) setSearch(""); }, [open]);

  return (
    <>
      <div className="flex items-center justify-between pointer-events-none">
        <span className={`font-medium text-sm leading-snug ${value ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
          {value ?? "Select event type"}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 flex-none ${open ? "rotate-180" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — stopPropagation prevents it from bubbling to the field wrapper toggle */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search — shown when list has more than 5 items */}
              {showSearch && (
                <div className="px-3 pt-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search event type…"
                      value={search}
                      autoFocus
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* List */}
              <div className="relative max-h-44 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-gray-100 dark:[&::-webkit-scrollbar-thumb]:border-gray-800">
               {filtered.length > 0 ? (
  filtered.map((event) => (
    <button
      key={event.id}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(event.event_name); // or onChange(event) if you need the full object
        onOpenChange(false);
      }}
      className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
        value === event.event_name
          ? `${colors.light} ${colors.accentBold} font-semibold`
          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{event.icon}</span>
        <span>{event.event_name}</span>
      </div>
    </button>
  ))
) : (
  <>
    <p className="px-3 pt-3 pb-1 text-xs text-gray-400 text-center">
      No match for &ldquo;{search}&rdquo;
    </p>

    {options.includes("Other") && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange("Other");
          onOpenChange(false);
        }}
        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
          value === "Other"
            ? `${colors.light} ${colors.accentBold} font-semibold`
            : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        Other
      </button>
    )}
  </>
)}

                {/* Scroll fade hint */}
                {filtered.length > 4 && (
                  <div className="sticky bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── PAX info tooltip ─────────────────────────────────────────────────────────
function PaxTooltip({ iconClassName }) {
  const [open,  setOpen]    = useState(false);
  const containerRef        = useRef(null);
  const hideTimerRef        = useRef(null);

  const show = () => { clearTimeout(hideTimerRef.current); setOpen(true);  };
  const hide = () => { hideTimerRef.current = setTimeout(() => setOpen(false), 80); };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="What is PAX?"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={iconClassName ?? "w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-gray-500 hover:text-gray-600 dark:hover:border-gray-400 dark:hover:text-gray-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 focus-visible:ring-offset-1"}
      >
        <Info size={iconClassName ? 10 : 8} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={show}
            onMouseLeave={hide}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[60] p-3.5"
          >
            {/* Upward caret arrow */}
            <div className="absolute -top-[5px] right-2.5 w-2.5 h-2.5 bg-white dark:bg-gray-900 border-t border-l border-gray-200 dark:border-gray-700 rotate-45" />
            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 mb-1.5">What is PAX?</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              PAX (Passengers/Persons) refers to bookings where pricing is based on
              the number of attendees rather than reserving the venue directly.
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
              Choose PAX if you want a customised quotation based on your guest count
              and event requirements.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dynamic CTA ──────────────────────────────────────────────────────────────
const CTA_LABELS = {
  book:       "Book Now",
  reserve:    "Reserve",
  enquiry:    "Enquire",
  paxEnquiry: "PAX Enquiry",
};

function DynamicCTA({ buttons, gradient, onAction }) {
  if (buttons.length === 1) {
    return (
      <button
        onClick={() => onAction(buttons[0])}
        className={`w-full bg-gradient-to-r ${gradient} text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
      >
        {CTA_LABELS[buttons[0]] ?? "Continue"}
      </button>
    );
  }

  if (buttons.length === 2) {
    const [secondary, primary] = buttons;
    return (
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onAction(secondary)}
          className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          {CTA_LABELS[secondary]}
        </button>
        <button
          onClick={() => onAction(primary)}
          className={`bg-gradient-to-r ${gradient} text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
        >
          {CTA_LABELS[primary]}
        </button>
      </div>
    );
  }

  const primary    = buttons[buttons.length - 1];
  const secondaries = buttons.slice(0, buttons.length - 1);
  return (
    <div className="space-y-2.5">
      <button
        onClick={() => onAction(primary)}
        className={`w-full bg-gradient-to-r ${gradient} text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
      >
        {CTA_LABELS[primary]}
      </button>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${secondaries.length}, 1fr)` }}>
        {secondaries.map((btn) => (
          <button
            key={btn}
            onClick={() => onAction(btn)}
            className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            {CTA_LABELS[btn]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
function TrustBadges({ badges }) {
  return (
    <div className="grid grid-cols-3 gap-2 pt-1">
      {badges.map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-1.5">
          <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Icon size={15} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Venue card ───────────────────────────────────────────────────────────────
function VenueCard({ venueData, meta, gradient, colors, onAction, venueSelection, guestValues, setGuestValues, onScrollToCalendar, onClearVenueSelection,
   onClearShift, capacity,venueEvents,shiftAmount,venue_settings }) {
  const [eventType,       setEventType]     = useState(null);
  const [eventTypeOpen,   setEventTypeOpen] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [bookingMode,     setBookingMode]   = useState("venue"); // "venue" | "pax"

  const { date, shiftLabel, shiftTime } = venueSelection ?? {};
  const hasDateAndShift = Boolean(date && shiftLabel);
  const guestCount      = guestValues?.guests;

  // Both modes reveal Event Type + Guests after date + shift are selected
  const detailsRevealed = hasDateAndShift;

  // Both modes require all four fields; only the CTA action differs
  const isComplete = Boolean(date && shiftLabel && eventType && guestCount);

  useEffect(() => {
  if (venueData?.venue_mode) {
    const mode = venueData?.venue_mode =='both' ? 'venue' : venueData.venue_mode;
    setBookingMode(mode);
  }
}, [venueData?.venue_mode]);

const propertySettings = venue_settings
  .filter(item => item.group === bookingMode)
  .reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return (
    <div className="space-y-3">

      {/* Price (left) + Badge + Toggle stacked (right) */}
      <div className="flex items-start justify-between gap-3">
        { bookingMode ==='venue' ? (
 <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{shiftAmount==0 ? venueData.minPrice : shiftAmount}</p>
          <p className="text-xs text-gray-400 mt-0.5">{shiftAmount==0 ?  meta.priceLabel :'Your Venue price '}</p>
        </div>
        ):(
          <>
 <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{propertySettings.pack_amt}</p>
          <p className="text-xs text-gray-400 mt-0.5">Starting Package</p>
        </div>
          </>
        )}
       

        <div className="flex flex-col items-end gap-2 flex-none">
          {/* Badge with PAX info tooltip */}
          {venueData.venue_mode ==='both' ? ( <>
          <div className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.bg}`}>
            {meta.badge.label}
            <PaxTooltip
              iconClassName="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-current focus-visible:ring-offset-1"
            />
          </div>
          

          {/* Compact Booking Mode Toggle */}
          <div
            className="relative flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-0.5 gap-0.5"
            role="tablist"
          >
            {[
              { id: "venue", label: "Venue" },
              { id: "pax",   label: "PAX"   },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={bookingMode === id}
                onClick={() => setBookingMode(id)}
                className="relative px-2.5 py-1 rounded-full text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400 whitespace-nowrap"
              >
                {bookingMode === id && (
                  <motion.div
                    layoutId="venue-mode-bg"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} shadow-sm`}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${bookingMode === id ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          </>
          ):(<>
          {venueData.venue_mode}
          </>)
          }
        </div>
      </div>

      {/* ── Selection fields — identical for both modes ── */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible text-sm">

        {/* Event Date + Time Slot — always 2-column */}
        <div className={`grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 ${detailsRevealed ? "border-b border-gray-200 dark:border-gray-700" : ""}`}>

          {/* Event Date */}
          <div
            role="button" tabIndex={0} onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tl-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              Event Date
              {date && <CheckCircle2 size={9} className="text-emerald-500 flex-none" />}
            </p>
            <p className={`font-medium text-xs sm:text-sm leading-snug ${date ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {date ? fmtDate(date) : "Select date"}
            </p>
            {date && onClearVenueSelection && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClearVenueSelection(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={10} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Time Slot — shown in both modes */}
          <div
            role="button" tabIndex={0} onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tr-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              Time Slot
              {shiftLabel && <CheckCircle2 size={9} className="text-emerald-500 flex-none" />}
            </p>
            <p className={`font-medium text-xs sm:text-sm leading-snug ${shiftLabel ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {shiftLabel ?? "Select slot"}
              {shiftTime && <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{shiftTime}</span>}
            </p>
            {shiftLabel && onClearShift && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClearShift(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={10} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Event Type + Guests — revealed after date+shift */}
        <AnimatePresence>
          {detailsRevealed && (
            <motion.div
              key="venue-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* Event Type */}
              <div
                role="button" tabIndex={0}
                onClick={() => setEventTypeOpen((o) => !o)}
                className="p-3 border-b border-gray-200 dark:border-gray-700 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Type</p>
                <EventTypeDropdown
                  value={eventType}
                  onChange={setEventType}
                  options={meta.eventTypes}
                  venueEvents={venueEvents}
                  colors={colors}
                  open={eventTypeOpen}
                  onOpenChange={setEventTypeOpen}
                />
              </div>

              {/* Guest Capacity (Venue) / Expected Guests (PAX) */}
              <div
                role="button" tabIndex={0}
                onClick={() => {
                  if (!showGuestPicker && !guestValues) {
                    setShowGuestPicker(true);
                    setGuestValues({ guests: 50 });
                  }
                }}
                className={`p-3 relative rounded-b-xl transition-colors ${!showGuestPicker && !guestValues ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                  {bookingMode === "venue" ? "Guest Capacity" : "Expected Guests"}
                  {guestCount && <CheckCircle2 size={9} className="text-emerald-500 flex-none" />}
                </p>
                {(showGuestPicker || guestValues) ? (
                  <GuestPicker
                    type="guests"
                    lightMode
                    step={50}
                    maxCapacity={capacity}
                    defaultValue={guestValues?.guests ?? 50}
                    textClass="font-medium text-gray-800 dark:text-gray-200 text-sm"
                    chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
                    onChange={setGuestValues}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
                    {bookingMode === "venue" ? "Select guest count" : "Estimated attendees"}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA Section ── */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          /* Not complete — Check Availability */
          <motion.button
            key="check-avail"
            onClick={onScrollToCalendar}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Check Availability
          </motion.button>

        ) : bookingMode === "venue" ? (
          /* Venue Booking — Reserve | Book Now | Enquire on one row */
          <motion.div
            key="venue-ctas"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            { venueData.property ==='regitered' ? (
              <>
              <div className="flex items-stretch gap-2">
              <button
                onClick={() => onAction({ eventType, type: "reserve", guestCount })}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm ${colors.pill} hover:opacity-80 active:scale-[0.98] transition-all`}
              >
                Reserve
              </button>
              <button
                onClick={() => onAction({ eventType, type: "book", guestCount })}
                className={`flex-[1.4] py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${gradient} text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
              >
                Book Now
              </button>
              <button
                onClick={() => onAction({ eventType, type: "enquiry", guestCount })}
                className="flex-1 py-3 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
              >
                Enquire
              </button>
            </div>
            </>
          ):(<>
            <div className="flex items-stretch">
             
              <button
                onClick={() => onAction({ eventType, type: "enquiry", guestCount })}
                className="flex-1 py-3 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
              >
                Enquire
              </button>
            </div>
          </>)}
          
          </motion.div>

        ) : (
          /* PAX Enquiry — single full-width CTA */
          <motion.button
            key="pax-cta"
            onClick={() => onAction({ eventType, type: "paxEnquiry", guestCount })}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`w-full bg-gradient-to-r ${gradient} text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-[0.98] transition-all`}
          >
            PAX Enquiry
          </motion.button>
        )}
      </AnimatePresence>

      {/* Trust */}
      <TrustBadges badges={meta.trustBadges} />
    </div>
  );
}

// ─── Reserve card (farmstay / other) ─────────────────────────────────────────
function ReserveCard({ venueData,meta, gradient, colors, guestValues, setGuestValues,shiftAmount, guestType, catKey, onAction, calendarRange, onScrollToCalendar, onClearCalendarRange, onClearCheckout, highlightGuests }) {
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const ctaButtons = getDefaultCTA(catKey);
  const { start, end } = calendarRange ?? {};
  const nights = start && end ? Math.round((end - start) / 86400000) : 0;
  const weekends = getWeekendCount(start, end).weekend;
  const hasRange = Boolean(start && end);

  // Farmstay: dates alone unlock the CTAs — guest count is bonus context
  const isComplete = hasRange;

  return (
    <div className="space-y-4">
      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₹{venueData.minPrice}</span>
          </div>
          <p className="text-xs text-gray-400">
            per {meta.priceLabel}{nights > 0 ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.bg}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Dates + Guests */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible text-sm">

        {/* Check-in + Checkout — always visible */}
        <div className={`grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 ${hasRange ? "border-b border-gray-200 dark:border-gray-700" : ""}`}>
          <div
            role="button" tabIndex={0} onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tl-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 flex items-center gap-1">
              Check-in
              {start && <CheckCircle2 size={9} className="text-emerald-500 flex-none" />}
            </p>
            <p className={`font-medium text-xs sm:text-sm ${start ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {fmtDate(start) ?? "Select date"}
            </p>
            {start && onClearCalendarRange && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClearCalendarRange(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={10} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          <div
            role="button" tabIndex={0} onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tr-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 flex items-center gap-1">
              Checkout
              {end && <CheckCircle2 size={9} className="text-emerald-500 flex-none" />}
            </p>
            <p className={`font-medium text-xs sm:text-sm ${end ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {fmtDate(end) ?? "Select date"}
            </p>
            {end && onClearCheckout && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClearCheckout(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={10} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Guests — revealed once dates are set; subtly highlighted on auto-open */}
        <AnimatePresence>
          {hasRange && (
            <motion.div
              key="guests-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div
                role="button" tabIndex={0}
                onClick={() => { if (!showGuestPicker && !guestValues) setShowGuestPicker(true); }}
                className={`p-3 relative rounded-b-xl transition-all duration-500
                  ${highlightGuests && !showGuestPicker && !guestValues ? "ring-2 ring-inset ring-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-900/10" : ""}
                  ${!showGuestPicker && !guestValues ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Guests</p>
                {(showGuestPicker || guestValues) ? (
                  <GuestPicker
                    type={guestType}
                    lightMode
                    defaultValue={1}
                    textClass="font-medium text-gray-800 dark:text-gray-200 text-sm"
                    chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
                    onChange={setGuestValues}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-600">
                    Who's coming?
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nights breakdown — visible once range is set */}
      <AnimatePresence>
        {nights > 0 && (
          <motion.div
            key="nights-summary"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-3.5 py-2.5"
          >
            <span>₹{venueData.minPrice} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              ₹{(venueData.minPrice * nights).toLocaleString("en-IN")}
            </span>
          </motion.div>
        )}
        {weekends > 0 && (
          <motion.div
            key="weekend-summary"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-3.5 py-2.5"
          >
            <span>₹{venueData.weekly_amount} × {weekends} weekend{weekends > 1 ? "s" : ""}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              ₹{(venueData.weekly_amount * weekends).toLocaleString("en-IN")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Binary CTA — Check Availability until dates complete, then vendor CTAs */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.button
            key="check-avail"
            onClick={onScrollToCalendar}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Check Availability
          </motion.button>
        ) : (
          <motion.div
            key="stay-ctas"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <DynamicCTA
              buttons={ctaButtons}
              gradient={gradient}
              onAction={(t) => onAction({ guestValues, type: t })}
            /> 
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust */}
      <TrustBadges badges={meta.trustBadges} />
    </div>
  );
}

// ─── Enquiry modal ────────────────────────────────────────────────────────────
function EnquiryModal({ isOpen, onClose, gradient, propertyName }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Mount guard — createPortal requires document to be available
  useEffect(() => { setMounted(true); }, []);

  // Scroll lock — prevent background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  function validate() {
    const e = {};
    if (!form.name.trim())                       e.name  = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = "Valid phone required";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  }

  function handleClose() {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "" });
    setErrors({});
    onClose();
  }

  if (!mounted) return null;

  // Portal to document.body — escapes any parent stacking context or transform
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[440px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Send an Enquiry</h3>
                  {propertyName && (
                    <p className="text-xs text-white/75 mt-0.5 truncate">{propertyName}</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={15} className="text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {submitted ? (
                <div className="flex flex-col items-center py-6 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-base">Enquiry Sent!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Full name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative mt-1.5">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="John Dsouza"
                        value={form.name}
                        onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                          ${errors.name ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900" : "border-gray-200 dark:border-gray-700 focus:ring-violet-200 dark:focus:ring-violet-900 focus:border-violet-400"}`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                          ${errors.email ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900" : "border-gray-200 dark:border-gray-700 focus:ring-violet-200 dark:focus:ring-violet-900 focus:border-violet-400"}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative mt-1.5">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: "" })); }}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                          ${errors.phone ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900" : "border-gray-200 dark:border-gray-700 focus:ring-violet-200 dark:focus:ring-violet-900 focus:border-violet-400"}`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <button
                    type="submit"
                    className={`w-full bg-gradient-to-r ${gradient} text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all mt-1`}
                  >
                    Send Enquiry
                  </button>

                  <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                    We'll respond within 24 hours. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingCard({
  venueData,
  category = "venues",
  mobileOnly = false,
  propertyName,
  capacity,
  calendarRange,
  venueSelection,
  venueEvents,
  onClearVenueSelection,
  onClearShift,
  onClearCalendarRange,
  onClearCheckout,
  shiftAmount,
  venue_settings
}) {
  const catKey    = normalizeCategory(category);
  const meta      = getMeta(category);
  const gradient  = GRADIENTS[catKey]  ?? GRADIENTS.venues;
  const iconBg    = ICON_BG[catKey]    ?? ICON_BG.venues;
  const colors    = getCategoryColors(category);
  const isFarmstay = catKey === "farmstays";
  const guestType  = isFarmstay ? "guests_detailed" : "guests";

  // Guest state — null until user explicitly selects (no pre-filled defaults)
  const [guestValues, setGuestValues] = useState(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [highlightGuests, setHighlightGuests] = useState(false);

  const router = useRouter();
  const params = useParams();
  const locale     = params?.locale  ?? "en";
  const country    = params?.country ?? "in";
  const propertyId = params?.id      ?? "1";

  const CardIcon = meta.icon;

  // ── Booking completeness (single source of truth for CTA state) ──────────────
  // Farmstay: check-in + checkout sufficient
  // Venue:    date + shift + explicit guest count all required
  const isBookingComplete = isFarmstay
    ? Boolean(calendarRange?.start && calendarRange?.end)
    : Boolean(venueSelection?.date && venueSelection?.shiftLabel && guestValues?.guests);

  const ctaButtons = getDefaultCTA(catKey);

  // ── Auto-open sheet whenever booking selection transitions none → valid ────────
  // Fires regardless of where the selection came from (sheet, direct calendar,
  // any other component). Uses a ref to track previous state so only the
  // false→true transition triggers the open.
  const prevHasSelectionRef = useRef(false);
  useEffect(() => {
    if (!mobileOnly) return;
    // Never auto-open on desktop/tablet — the sticky sidebar handles it there
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    const nowHasSelection = isFarmstay
      ? Boolean(calendarRange?.start && calendarRange?.end)
      : Boolean(venueSelection?.date && venueSelection?.shiftLabel);
    if (nowHasSelection && !prevHasSelectionRef.current) {
      setOpenSheet(true);
      // Farmstay: briefly highlight the guests field to guide the next step
      if (isFarmstay) setHighlightGuests(true);
    }
    prevHasSelectionRef.current = nowHasSelection;
  }, [calendarRange, venueSelection, mobileOnly, isFarmstay]);

  // Auto-clear guest highlight after 1.8 s
  useEffect(() => {
    if (!highlightGuests) return;
    const t = setTimeout(() => setHighlightGuests(false), 1800);
    return () => clearTimeout(t);
  }, [highlightGuests]);

  const onScrollToCalendar = () => {
    scrollToCalendar();
    // Mobile: collapse the sheet so the calendar has the full viewport.
    if (mobileOnly) setOpenSheet(false);
  };

  const handleAction = (data) => {
    const type = data.type ?? "";

    if (type === "enquiry") {
      setEnquiryOpen(true);
      setOpenSheet(false);
      return;
    }

    if (type === "paxEnquiry") {
      const guests = guestValues?.guests ?? guestValues?.adults ?? data.guestCount ?? "";

      const paxParams = new URLSearchParams({
        ...(data.eventType && { eventType: data.eventType }),
        ...(guests && { guests: String(guests) }),
        ...(venueSelection?.date && {
          date: venueSelection.date.toISOString().split("T")[0],
        }),
        ...(venueSelection?.shift && {
          shift: venueSelection.shift,
        }),
        ...(propertyName && { venueName: propertyName }),
      });

      router.push(
        `/${locale}/${country}/search/${catKey}/${propertyId}/pax-enquiry?${paxParams.toString()}`
      );

      return;
    }

    // Checkout — "reserve" | "book" | (farmstay/other CTAs from getDefaultCTA)
    const guestCount = guestValues?.guests ?? guestValues?.adults ?? data.guestCount ?? "";

    const checkoutParams = new URLSearchParams({
      ...(data.eventType && { eventType: data.eventType }),
      ...(type && { bookingType: type }),

      ...(guestCount && {
        guests: String(guestCount),
      }),

      ...(venueSelection?.date && {
        date: venueSelection.date.toISOString().split("T")[0],
      }),

      ...(venueSelection?.shift && {
        shift: venueSelection.shift,
      }),

      ...(calendarRange?.start && {
        checkIn: calendarRange.start.toISOString().split("T")[0],
      }),

      ...(calendarRange?.end && {
        checkOut: calendarRange.end.toISOString().split("T")[0],
      }),

      ...(propertyName && { venueName: propertyName }),
      ...(propertyId && { venueId: propertyId }),
      ...(catKey && { category: catKey }),
    });

    router.push(
      `/${locale}/${country}/checkout/${catKey}/${propertyId}?${checkoutParams.toString()}`
    );
  };

  const cardContent = (onAction) =>
    meta.mode === "enquiry"
      ? <VenueCard
          venueData={venueData}
          meta={meta}
          gradient={gradient}
          colors={colors}
          onAction={onAction}
          propertyName={propertyName}
          venueSelection={venueSelection}
          guestValues={guestValues}
          setGuestValues={setGuestValues}
          onScrollToCalendar={onScrollToCalendar}
          onClearVenueSelection={onClearVenueSelection}
          onClearShift={onClearShift}
          capacity={capacity}
          venueEvents={venueEvents}
          shiftAmount={shiftAmount}
          venue_settings={venue_settings}
        />
      : <ReserveCard
          venueData={venueData}
          meta={meta}
          gradient={gradient}
          colors={colors}
          guestValues={guestValues}
          setGuestValues={setGuestValues}
          guestType={guestType}
          catKey={catKey}
          onAction={onAction}
          calendarRange={calendarRange}
          shiftAmount={shiftAmount}
          onScrollToCalendar={onScrollToCalendar}
          onClearCalendarRange={onClearCalendarRange}
          onClearCheckout={onClearCheckout}
          highlightGuests={highlightGuests}
        />;

  const headerLabel = meta.mode === "enquiry"
    ? (propertyName ?? "Request a Quote")
    : (propertyName ?? "Book your stay");

  const cardHeader = (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-none`}>
        <CardIcon size={14} className="text-white" />
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{headerLabel}</p>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP CARD ── */}
      {!mobileOnly && (
        <div className="hidden md:block">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.40)] p-5 border border-gray-100 dark:border-gray-800">
            {cardHeader}
            {cardContent(handleAction)}
          </div>
        </div>
      )}

      {/*
        ── MOBILE BOTTOM BAR ──────────────────────────────────────────────────
        Rendered ONLY from the mobileOnly instance so the desktop instance
        (inside `hidden lg:block`) doesn't bleed a second fixed bar through
        its parent's display:none on smaller viewports.
      */}
      {mobileOnly && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            {/* Info summary — tapping opens the full booking sheet */}
            <button
              onClick={() => setOpenSheet(true)}
              className="flex-1 text-left min-w-0"
            >
              <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                {isFarmstay ? `₹${venueData?.minPrice ?? ""}` : `₹${venueData?.minPrice ?? ""}`}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {isFarmstay
                  ? (calendarRange?.start && calendarRange?.end
                      ? `${fmtDate(calendarRange.start)} – ${fmtDate(calendarRange.end)}`
                      : "Select dates to see pricing")
                  : (venueSelection?.date
                      ? `${fmtDate(venueSelection.date)}${venueSelection?.shiftLabel ? ` · ${venueSelection.shiftLabel}` : ""}`
                      : "Starting price")}
              </p>
            </button>

            {/* Progressive CTA — mirrors booking card state exactly */}
            <AnimatePresence mode="wait">
              {!isBookingComplete ? (
                <motion.button
                  key="bar-check"
                  onClick={() => { scrollToCalendar(); setOpenSheet(false); }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-none bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.97] transition-all"
                >
                  Check Availability
                </motion.button>
              ) : catKey === "venues" ? (
                <motion.div
                  key="bar-venue-ctas"
                  className="flex items-center gap-2 flex-none"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    onClick={() => handleAction({ type: "reserve" })}
                    className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.97]"
                  >
                    Reserve
                  </button>
                  <button
                    onClick={() => handleAction({ type: "book" })}
                    className={`bg-gradient-to-r ${gradient} text-white py-2.5 px-5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
                  >
                    Book
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="bar-reserve"
                  onClick={() => handleAction({ type: ctaButtons[0] })}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className={`flex-none bg-gradient-to-r ${gradient} text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
                >
                  {CTA_LABELS[ctaButtons[0]] ?? "Reserve"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── ENQUIRY MODAL ── */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        gradient={gradient}
        propertyName={propertyName}
      />

      {/* ── MOBILE BOTTOM SHEET — mobile only, never on desktop ── */}
      <AnimatePresence>
        {mobileOnly && openSheet && typeof window !== "undefined" && window.innerWidth < 768 && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpenSheet(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-5 z-[101] max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-none`}>
                    <CardIcon size={14} className="text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-800 dark:text-white truncate">{headerLabel}</h2>
                </div>
                <button
                  onClick={() => setOpenSheet(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex-none ml-2"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              {cardContent((d) => { handleAction(d); setOpenSheet(false); })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}