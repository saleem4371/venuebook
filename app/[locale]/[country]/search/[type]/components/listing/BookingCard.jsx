"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2, CheckCircle2, ChevronDown, Clock,
  Headphones, Mail, Phone, Tag, TreePine, User, Users, X, Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
function VenueCard({ meta, gradient, colors, onAction, venueSelection, guestValues, setGuestValues, onScrollToCalendar, onClearVenueSelection, onClearShift }) {
  const [eventType, setEventType] = useState("Wedding");
  const ctaButtons = getDefaultCTA("venues");
  const { date, shiftLabel, shiftTime } = venueSelection ?? {};

  return (
    <div className="space-y-4">
      {/* Price */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₹20,00,000</p>
          <p className="text-xs text-gray-400 mt-0.5">{meta.priceLabel}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.bg}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Selection fields */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible text-sm">

        {/* Event Date + Time Slot — clicking scrolls to calendar */}
        <div className="border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          <div
            role="button"
            tabIndex={0}
            onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tl-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Date</p>
            <p className={`font-medium text-xs sm:text-sm leading-snug ${date ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {date ? fmtDate(date) : "Select on calendar"}
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
          <div
            role="button"
            tabIndex={0}
            onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tr-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Time Slot</p>
            <p className={`font-medium text-xs sm:text-sm leading-snug ${shiftLabel ? "text-gray-800 dark:text-gray-200 pr-5" : "text-gray-400 dark:text-gray-600"}`}>
              {shiftLabel ?? "—"}
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

        {/* Event Type */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 relative">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Type</p>
          <EventTypeDropdown value={eventType} onChange={setEventType} options={meta.eventTypes} colors={colors} />
        </div>

        {/* Guest Capacity — unified GuestPicker (same as search bar) */}
        <div className="p-3 relative">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Guest Capacity</p>
          <GuestPicker
            type="guests"
            lightMode
            defaultValue={200}
            textClass="font-medium text-gray-800 dark:text-gray-200 text-sm"
            chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
            onChange={setGuestValues}
          />
        </div>
      </div>

      {/* CTAs */}
      <DynamicCTA
        buttons={ctaButtons}
        gradient={gradient}
        onAction={(t) => onAction({ eventType, type: t, guestCount: guestValues?.guests ?? 200 })}
      />

      {/* Trust */}
      <TrustBadges badges={meta.trustBadges} />
    </div>
  );
}

// ─── Reserve card (farmstay / other) ─────────────────────────────────────────
function ReserveCard({ meta, gradient, colors, guestValues, setGuestValues, guestType, catKey, onAction, calendarRange, onScrollToCalendar, onClearCalendarRange, onClearCheckout }) {
  const ctaButtons = getDefaultCTA(catKey);
  const { start, end } = calendarRange ?? {};
  const nights = start && end ? Math.round((end - start) / 86400000) : 0;

  return (
    <div className="space-y-4">
      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="line-through text-gray-400 text-xs sm:text-sm">₹23,976</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₹19,181</span>
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

        {/* Check-in + Checkout — clicking scrolls to calendar */}
        <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
          <div
            role="button"
            tabIndex={0}
            onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tl-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Check-in</p>
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
            role="button"
            tabIndex={0}
            onClick={onScrollToCalendar}
            className="relative p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-tr-xl cursor-pointer"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Checkout</p>
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

        {/* Guests — unified GuestPicker (Adults / Children / Infants / Pets) */}
        <div className="p-3 relative">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Guests</p>
          <GuestPicker
            type={guestType}
            lightMode
            defaultValue={2}
            textClass="font-medium text-gray-800 dark:text-gray-200 text-sm"
            chevronClass="text-gray-400 hover:text-gray-600 dark:text-white/50"
            onChange={setGuestValues}
          />
        </div>
      </div>

      {/* CTAs */}
      <DynamicCTA
        buttons={ctaButtons}
        gradient={gradient}
        onAction={(t) => onAction({ guestValues, type: t })}
      />

      {meta.priceNote && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">{meta.priceNote}</p>
      )}

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[440px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[201] overflow-hidden"
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
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingCard({
  category = "venues",
  mobileOnly = false,
  propertyName,
  calendarRange,
  venueSelection,
  onClearVenueSelection,
  onClearShift,
  onClearCalendarRange,
  onClearCheckout,
}) {
  const catKey    = normalizeCategory(category);
  const meta      = getMeta(category);
  const gradient  = GRADIENTS[catKey]  ?? GRADIENTS.venues;
  const iconBg    = ICON_BG[catKey]    ?? ICON_BG.venues;
  const colors    = getCategoryColors(category);
  const isFarmstay = catKey === "farmstays";
  const guestType  = isFarmstay ? "guests_detailed" : "guests";

  // Guest state — object matching GuestPicker output shape
  const [guestValues, setGuestValues] = useState(() =>
    isFarmstay
      ? { adults: 2, children: 0, infants: 0, pets: 0 }
      : { guests: 200 }
  );
  const [openSheet, setOpenSheet] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  // When true the sheet is intentionally hidden so the calendar has full screen.
  // Auto-resets to false once selection is complete.
  const [isSelectingDate, setIsSelectingDate] = useState(false);

  const router = useRouter();
  const params = useParams();
  const locale     = params?.locale  ?? "en";
  const country    = params?.country ?? "in";
  const propertyId = params?.id      ?? "1";

  const CardIcon = meta.icon;

  const onScrollToCalendar = () => {
    scrollToCalendar();
    // Mobile: collapse the sheet so the calendar has the full viewport.
    // Desktop is unaffected (mobileOnly is false there).
    if (mobileOnly) {
      setOpenSheet(false);
      setIsSelectingDate(true);
    }
  };

  // Auto-restore the mobile sheet the moment selection is complete.
  //   Venue  → needs both a date AND a time slot (shiftLabel)
  //   Stay   → needs both check-in AND check-out (calendarRange.end)
  useEffect(() => {
    if (!mobileOnly || !isSelectingDate) return;
    const done =
      meta.mode === "enquiry"
        ? Boolean(venueSelection?.shiftLabel)
        : Boolean(calendarRange?.end);
    if (done) {
      setIsSelectingDate(false);
      setOpenSheet(true);
    }
  }, [venueSelection, calendarRange, isSelectingDate, mobileOnly, meta.mode]);

  const handleAction = (data) => {
    const type = data.type ?? "";

    if (type === "enquiry") {
      setEnquiryOpen(true);
      setOpenSheet(false);
      return;
    }

    if (type === "paxEnquiry") {
      const gCount = guestValues?.guests ?? guestValues?.adults ?? "";
      const qs = new URLSearchParams({
        ...(data.eventType && { eventType: data.eventType }),
        ...(gCount         && { guests: String(gCount) }),
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

    router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`);
  };

  const cardContent = (onAction) =>
    meta.mode === "enquiry"
      ? <VenueCard
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
        />
      : <ReserveCard
          meta={meta}
          gradient={gradient}
          colors={colors}
          guestValues={guestValues}
          setGuestValues={setGuestValues}
          guestType={guestType}
          catKey={catKey}
          onAction={onAction}
          calendarRange={calendarRange}
          onScrollToCalendar={onScrollToCalendar}
          onClearCalendarRange={onClearCalendarRange}
          onClearCheckout={onClearCheckout}
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
            {/* Price summary — tapping opens / restores the full booking sheet */}
            <button
              onClick={() => { setOpenSheet(true); setIsSelectingDate(false); }}
              className="flex-1 text-left min-w-0"
            >
              <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                {catKey === "venues" ? "₹20,00,000" : "₹19,181"}
              </p>
              <p className="text-xs text-gray-400 underline underline-offset-2 mt-0.5">
                {catKey === "venues" ? "Starting price" : "per night · tap to edit"}
              </p>
            </button>

            {/* Primary CTA buttons */}
            {catKey === "venues" ? (
              <div className="flex items-center gap-2 flex-none">
                <button
                  onClick={() => router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`)}
                  className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.97]"
                >
                  Reserve
                </button>
                <button
                  onClick={() => { setOpenSheet(true); setIsSelectingDate(false); }}
                  className={`bg-gradient-to-r ${gradient} text-white py-2.5 px-5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
                >
                  Book
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/${locale}/${country}/checkout/${catKey}/${propertyId}`)}
                className={`bg-gradient-to-r ${gradient} text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all flex-none`}
              >
                Reserve
              </button>
            )}
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

      {/* ── MOBILE BOTTOM SHEET ── */}
      <AnimatePresence>
        {openSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setOpenSheet(false); setIsSelectingDate(false); }}
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
                  onClick={() => { setOpenSheet(false); setIsSelectingDate(false); }}
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
