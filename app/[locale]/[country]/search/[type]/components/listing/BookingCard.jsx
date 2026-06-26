"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2, CheckCircle2, ChevronDown, Clock,
  Headphones, Tag, TreePine, Users, X, Zap,
  CalendarDays, Clock3,
} from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getCategoryColors, normalizeCategory, getDefaultCTA } from "../../utils/categoryConfig";

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
    maxGuests: 12,
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
  maxGuests: 8,
};

function getMeta(category) {
  return CATEGORY_META[normalizeCategory(category)] ?? DEFAULT_META;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

// ─── Custom event type dropdown ───────────────────────────────────────────────
function EventTypeDropdown({ value, onChange, options, colors }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors
                    ${value === opt
                      ? `${colors.light} ${colors.accentBold} font-semibold`
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Guest count dropdown ─────────────────────────────────────────────────────
function GuestDropdown({ value, onChange, max = 12, colors }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
      >
        <span>{value} guest{value > 1 ? "s" : ""}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
            >
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { onChange(n); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors
                    ${value === n
                      ? `${colors.light} ${colors.accentBold} font-semibold`
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {n} guest{n > 1 ? "s" : ""}
                </button>
              ))}
            </motion.div>
          </>
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

/**
 * Renders 1–3 CTA buttons that share available width equally, never leaving
 * empty space. Layout:
 *   1 → full-width gradient
 *   2 → [outlined secondary | gradient primary] side-by-side
 *   3 → gradient full-width top + two outlined below side-by-side
 */
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

  // 3 buttons: primary on top (full width), two secondaries below
  // Last element in the array = most important action = gradient primary
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
      <div className={`grid gap-2.5`} style={{ gridTemplateColumns: `repeat(${secondaries.length}, 1fr)` }}>
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
function VenueCard({ meta, gradient, colors, onAction, propertyName, venueSelection }) {
  const [eventType, setEventType] = useState("Wedding");
  const [capacity, setCapacity] = useState(200);
  const ctaButtons = getDefaultCTA("venues");
  const { date, shiftLabel, shiftTime } = venueSelection ?? {};

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹20,00,000</p>
          <p className="text-xs text-gray-400 mt-0.5">{meta.priceLabel}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.bg}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Selection fields */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible text-sm">
        {/* Event Date — from calendar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="pr-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Date</p>
            <p className={`font-medium ${date ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
              {date ? fmtDate(date) : "Select on calendar"}
            </p>
          </div>
          <div className="pl-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Time Slot</p>
            <p className={`font-medium leading-snug ${shiftLabel ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
              {shiftLabel ?? "—"}
              {shiftTime && <span className="block text-[10px] text-gray-400 font-normal">{shiftTime}</span>}
            </p>
          </div>
        </div>

        {/* Event Type */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 relative">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Type</p>
          <EventTypeDropdown value={eventType} onChange={setEventType} options={meta.eventTypes} colors={colors} />
        </div>

        {/* Guest Capacity */}
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Guest Capacity</p>
          <input
            type="number"
            value={capacity}
            min={10}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full bg-transparent font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
          />
        </div>
      </div>

      {/* CTAs */}
      <DynamicCTA buttons={ctaButtons} gradient={gradient} onAction={(t) => onAction({ eventType, capacity, type: t, guestCount: capacity })} />

      {/* Trust */}
      <TrustBadges badges={meta.trustBadges} />
    </div>
  );
}

// ─── Reserve card (farmstay / other) ─────────────────────────────────────────
function ReserveCard({ meta, gradient, colors, guests, setGuests, catKey, onAction, calendarRange }) {
  const ctaButtons = getDefaultCTA(catKey);
  const { start, end } = calendarRange ?? {};
  const nights = start && end ? Math.round((end - start) / 86400000) : 0;

  return (
    <div className="space-y-4">
      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="line-through text-gray-400 text-sm">₹23,976</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹19,181</span>
          </div>
          <p className="text-xs text-gray-400">per {meta.priceLabel}{nights > 0 ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.bg}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Dates + Guests */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible text-sm">
        <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 border-r border-gray-200 dark:border-gray-700">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Check-in</p>
            <p className={`font-medium ${start ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
              {fmtDate(start) ?? "Select date"}
            </p>
          </div>
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Checkout</p>
            <p className={`font-medium ${end ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}`}>
              {fmtDate(end) ?? "Select date"}
            </p>
          </div>
        </div>
        <div className="p-3 relative">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Guests</p>
          <GuestDropdown value={guests} onChange={setGuests} max={meta.maxGuests ?? 12} colors={colors} />
        </div>
      </div>

      {/* CTAs */}
      <DynamicCTA buttons={ctaButtons} gradient={gradient} onAction={(t) => onAction({ guests, type: t })} />

      {meta.priceNote && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">{meta.priceNote}</p>
      )}

      {/* Trust */}
      <TrustBadges badges={meta.trustBadges} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingCard({
  category = "venues",
  mobileOnly = false,
  propertyName,
  calendarRange,
  venueSelection,
}) {
  const catKey = normalizeCategory(category);
  const meta = getMeta(category);
  const gradient = GRADIENTS[catKey] ?? GRADIENTS.venues;
  const iconBg = ICON_BG[catKey] ?? ICON_BG.venues;
  const colors = getCategoryColors(category);
  const [guests, setGuests] = useState(1);
  const [openSheet, setOpenSheet] = useState(false);

  const router = useRouter();
  const params = useParams();
  const locale  = params?.locale  ?? "en";
  const country = params?.country ?? "in";
  const propertyId = params?.id   ?? "1";

  const CardIcon = meta.icon;

  const handleAction = (data) => {
    const type = data.type ?? "";

    if (type === "paxEnquiry") {
      // PAX Enquiry: route into the dedicated enquiry flow, carrying context
      const qs = new URLSearchParams({
        ...(data.eventType  && { eventType:  data.eventType  }),
        ...(data.capacity   && { guests:     String(data.capacity) }),
        ...(data.guestCount && { guests:     String(data.guestCount) }),
        ...(venueSelection?.date && {
          date:  venueSelection.date.toISOString().split("T")[0],
          shift: venueSelection.shift ?? "",
        }),
        ...(propertyName && { venueName: propertyName }),
      });
      router.push(
        `/${locale}/${country}/search/${catKey}/${propertyId}/pax-enquiry${qs.toString() ? `?${qs}` : ""}`
      );
      return;
    }

    if (type === "enquiry" || meta.mode === "enquiry") {
      router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`);
    } else {
      router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`);
    }
  };

  const cardContent = (onAction) =>
    meta.mode === "enquiry"
      ? <VenueCard meta={meta} gradient={gradient} colors={colors} onAction={onAction} propertyName={propertyName} venueSelection={venueSelection} />
      : <ReserveCard meta={meta} gradient={gradient} colors={colors} guests={guests} setGuests={setGuests} catKey={catKey} onAction={onAction} calendarRange={calendarRange} />;

  // Header: property name for venue, category label for others
  const headerLabel = meta.mode === "enquiry"
    ? (propertyName ?? "Request a Quote")
    : "Book your stay";

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

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3 z-40 shadow-lg">
        {/* If venue (paxEnquiry available): show two buttons */}
        {catKey === "venues" ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`)}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.97]"
            >
              Reserve
            </button>
            <button
              onClick={() => router.push(`/${locale}/${country}/search/${catKey}/${propertyId}/pax-enquiry`)}
              className={`flex-1 bg-gradient-to-r ${gradient} text-white py-2.5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
            >
              PAX Enquiry
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">₹19,181</p>
              <p className="text-xs text-gray-400">per night</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`)}
              className={`bg-gradient-to-r ${gradient} text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
            >
              Reserve Now
            </button>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM SHEET ── */}
      <AnimatePresence>
        {openSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenSheet(false)}
              className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-5 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-none`}>
                    <CardIcon size={14} className="text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-800 dark:text-white truncate">{headerLabel}</h2>
                </div>
                <button onClick={() => setOpenSheet(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex-none ml-2">
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
