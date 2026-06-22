"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  Tag,
  TreePine,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

// ─── Category meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
  venues: {
    mode: "enquiry",
    accentFrom: "from-violet-600",
    accentTo: "to-purple-600",
    accentBg: "bg-violet-600",
    accentRing: "ring-violet-300",
    badge: { label: "Pax", color: "bg-violet-100 text-violet-700" },
    icon: Building2,
    trustBadges: [
      { icon: Clock, text: "Response in 24h" },
      { icon: Tag, text: "Best price guaranteed" },
      { icon: Headphones, text: "Direct venue connect" },
    ],
    eventTypes: [
      "Wedding", "Reception", "Roce", "Engagement",
      "Birthday", "Corporate", "Baby Shower", "Other",
    ],
    ctaLabel: "Enquiry",
    mobileCtaLabel: "Enquire Now",
    priceLabel: "On Afternoon of Saturday, June 27, 2026",
    priceNote: null,
  },
  farmstays: {
    mode: "reserve",
    accentFrom: "from-emerald-500",
    accentTo: "to-teal-500",
    accentBg: "bg-emerald-600",
    accentRing: "ring-emerald-300",
    badge: { label: "Instant Book", color: "bg-emerald-100 text-emerald-700" },
    icon: TreePine,
    trustBadges: [
      { icon: CheckCircle2, text: "Free cancellation" },
      { icon: Zap, text: "Instant confirmation" },
      { icon: Users, text: "Entire farmstay" },
    ],
    ctaLabel: "Reserve",
    mobileCtaLabel: "Reserve Now",
    priceLabel: "night",
    priceNote: "You won't be charged yet",
  },
};

// Default for studios, rentals, workspaces, etc.
const DEFAULT_META = {
  mode: "reserve",
  accentFrom: "from-blue-500",
  accentTo: "to-indigo-500",
  accentBg: "bg-blue-600",
  accentRing: "ring-blue-300",
  badge: { label: "Available", color: "bg-blue-100 text-blue-700" },
  icon: Building2,
  trustBadges: [
    { icon: CheckCircle2, text: "Free cancellation" },
    { icon: Clock, text: "Flexible timings" },
    { icon: Headphones, text: "24/7 support" },
  ],
  ctaLabel: "Reserve",
  mobileCtaLabel: "Reserve Now",
  priceLabel: "night",
  priceNote: "You won't be charged yet",
};

function getMeta(category) {
  return CATEGORY_META[category] ?? DEFAULT_META;
}

// ─── Venue Enquiry Card ───────────────────────────────────────────────────────
function VenueCard({ meta, onAction }) {
  const [eventType, setEventType] = useState("Wedding");
  const [capacity, setCapacity] = useState(200);

  return (
    <div className="space-y-4">
      {/* Price row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">₹20,00,000</p>
          <p className="text-xs text-gray-400 mt-0.5">{meta.priceLabel}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.color}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Fields */}
      <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
        {/* Event Type */}
        <div className="p-3 border-b border-gray-200">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Event Type</p>
          <div className="relative">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full appearance-none bg-transparent font-medium text-gray-800 pr-6 focus:outline-none cursor-pointer"
            >
              {meta.eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Guest Capacity */}
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Guest Capacity</p>
          <input
            type="number"
            value={capacity}
            min={10}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full bg-transparent font-medium text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onAction({ eventType, capacity })}
        className={`w-full bg-gradient-to-r ${meta.accentFrom} ${meta.accentTo} text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
      >
        {meta.ctaLabel}
      </button>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {meta.trustBadges.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1.5">
            <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
              <Icon size={15} className="text-gray-500" />
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reserve Card (farmstay / rentals / workspaces / default) ────────────────
function ReserveCard({ meta, guests, setGuests, onAction }) {
  return (
    <div className="space-y-4">
      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="line-through text-gray-400 text-sm">₹23,976</span>
            <span className="text-2xl font-bold text-gray-900">₹19,181</span>
          </div>
          <p className="text-xs text-gray-400">per {meta.priceLabel} · 24 nights</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge.color}`}>
          {meta.badge.label}
        </span>
      </div>

      {/* Discount chip */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
        <Tag size={13} />
        Host is offering a limited discount
      </div>

      {/* Date + Guests */}
      <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-3 border-r border-gray-200">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Check-in</p>
            <p className="font-medium text-gray-800">Apr 9, 2026</p>
          </div>
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Checkout</p>
            <p className="font-medium text-gray-800">May 3, 2026</p>
          </div>
        </div>
        <div className="p-3 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Guests</p>
            <p className="font-medium text-gray-800">{guests} guest{guests > 1 ? "s" : ""}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Price breakdown */}
      <div className="text-sm space-y-1.5 text-gray-600">
        <div className="flex justify-between">
          <span className="underline decoration-dashed">₹799 × 24 nights</span>
          <span>₹19,176</span>
        </div>
        <div className="flex justify-between text-emerald-600">
          <span>Discount</span>
          <span>−₹4,795</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
          <span>Total</span>
          <span>₹19,181</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onAction({ guests })}
        className={`w-full bg-gradient-to-r ${meta.accentFrom} ${meta.accentTo} text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}
      >
        {meta.ctaLabel}
      </button>

      {meta.priceNote && (
        <p className="text-center text-xs text-gray-400">{meta.priceNote}</p>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {meta.trustBadges.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1.5">
            <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
              <Icon size={15} className="text-gray-500" />
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingCard({ category = "venues" }) {
  const meta = getMeta(category);
  const [guests, setGuests] = useState(1);
  const [openSheet, setOpenSheet] = useState(false);

  const handleAction = (data) => {
    if (meta.mode === "enquiry") {
      toast.success(`Enquiry sent for ${data.eventType} (${data.capacity} guests)!`);
    } else {
      toast.success("Booking confirmed! 🎉");
    }
  };

  const CardIcon = meta.icon;

  return (
    <>
      {/* ── DESKTOP CARD ── */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-5 border border-gray-100">
          {/* Header row with icon */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-7 h-7 rounded-lg ${meta.accentBg} flex items-center justify-center`}>
              <CardIcon size={14} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {meta.mode === "enquiry" ? "Request a Quote" : "Book your stay"}
            </p>
          </div>

          {meta.mode === "enquiry" ? (
            <VenueCard meta={meta} onAction={handleAction} />
          ) : (
            <ReserveCard
              meta={meta}
              guests={guests}
              setGuests={setGuests}
              onAction={handleAction}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between z-40 shadow-lg">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {meta.mode === "enquiry" ? "₹20,00,000" : "₹19,181"}
          </p>
          <p className="text-xs text-gray-400">
            {meta.mode === "enquiry" ? "Starting price" : "for 24 nights"}
          </p>
        </div>
        <button
          onClick={() => setOpenSheet(true)}
          className={`bg-gradient-to-r ${meta.accentFrom} ${meta.accentTo} text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all`}
        >
          {meta.mobileCtaLabel}
        </button>
      </div>

      {/* ── MOBILE BOTTOM SHEET ── */}
      <AnimatePresence>
        {openSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenSheet(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${meta.accentBg} flex items-center justify-center`}>
                    <CardIcon size={14} className="text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-800">
                    {meta.mode === "enquiry" ? "Request a Quote" : "Book your stay"}
                  </h2>
                </div>
                <button onClick={() => setOpenSheet(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {meta.mode === "enquiry" ? (
                <VenueCard meta={meta} onAction={(d) => { handleAction(d); setOpenSheet(false); }} />
              ) : (
                <ReserveCard
                  meta={meta}
                  guests={guests}
                  setGuests={setGuests}
                  onAction={(d) => { handleAction(d); setOpenSheet(false); }}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
