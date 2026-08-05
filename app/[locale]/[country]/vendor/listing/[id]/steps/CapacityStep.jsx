"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Users, BedDouble, MonitorCheck, Armchair, DoorOpen, Bath, LayoutGrid, Lock, ParkingSquare, Car, Bike, Bus } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   SEATING ARRANGEMENTS (venues only) — mirrors start-listing's capacityConfig.js
   so vendors see the exact same styles/icons they picked during listing creation.
───────────────────────────────────────────────────────────────────────────── */
const SEATING_STYLES = [
  { key: "theatre",       label: "Theatre" },
  { key: "banquet",       label: "Banquet" },
  { key: "classroom",     label: "Classroom" },
  { key: "boardroom",     label: "Boardroom" },
  { key: "ushape",        label: "U-Shape" },
  { key: "cocktail",      label: "Cocktail" },
  { key: "cabaret",       label: "Cabaret" },
  { key: "hollow_square", label: "Hollow Square" },
];

const SEATING_ICONS = {
  theatre: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="26" height="3" rx="1" strokeWidth="0" fill="currentColor" opacity="0.3"/>
      <circle cx="7"  cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="17" cy="12" r="1.8"/><circle cx="22" cy="12" r="1.8"/><circle cx="27" cy="12" r="1.8"/>
      <circle cx="7"  cy="19" r="1.8"/><circle cx="12" cy="19" r="1.8"/><circle cx="17" cy="19" r="1.8"/><circle cx="22" cy="19" r="1.8"/><circle cx="27" cy="19" r="1.8"/>
      <circle cx="7"  cy="26" r="1.8"/><circle cx="12" cy="26" r="1.8"/><circle cx="17" cy="26" r="1.8"/><circle cx="22" cy="26" r="1.8"/><circle cx="27" cy="26" r="1.8"/>
    </svg>
  ),
  classroom: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {[6, 14, 22].map((y) => (
        <g key={y}>
          <rect x="4" y={y} width="10" height="4" rx="1"/>
          <circle cx="6.5" cy={y - 3} r="1.6"/>
          <circle cx="11" cy={y - 3} r="1.6"/>
          <rect x="18" y={y} width="10" height="4" rx="1"/>
          <circle cx="20.5" cy={y - 3} r="1.6"/>
          <circle cx="25" cy={y - 3} r="1.6"/>
        </g>
      ))}
    </svg>
  ),
  ushape: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4 L6 22 Q6 28 16 28 Q26 28 26 22 L26 4"/>
      <circle cx="2"  cy="8"  r="1.8"/><circle cx="2" cy="15" r="1.8"/>
      <circle cx="30" cy="8"  r="1.8"/><circle cx="30" cy="15" r="1.8"/>
      <circle cx="11" cy="30" r="1.8"/><circle cx="21" cy="30" r="1.8"/>
    </svg>
  ),
  boardroom: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="9" width="20" height="14" rx="2"/>
      <circle cx="11" cy="5.5" r="1.8"/><circle cx="16" cy="5.5" r="1.8"/><circle cx="21" cy="5.5" r="1.8"/>
      <circle cx="11" cy="26.5" r="1.8"/><circle cx="16" cy="26.5" r="1.8"/><circle cx="21" cy="26.5" r="1.8"/>
      <circle cx="2.5" cy="14" r="1.8"/><circle cx="2.5" cy="19" r="1.8"/>
      <circle cx="29.5" cy="14" r="1.8"/><circle cx="29.5" cy="19" r="1.8"/>
    </svg>
  ),
  banquet: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="16" r="5"/>
      <circle cx="10" cy="7"  r="1.8"/><circle cx="10" cy="25" r="1.8"/>
      <circle cx="3"  cy="12" r="1.8"/><circle cx="3"  cy="20" r="1.8"/>
      <circle cx="22" cy="16" r="5"/>
      <circle cx="22" cy="7"  r="1.8"/><circle cx="22" cy="25" r="1.8"/>
      <circle cx="29" cy="12" r="1.8"/><circle cx="29" cy="20" r="1.8"/>
    </svg>
  ),
  cocktail: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8"  cy="8"  r="3.5"/><circle cx="24" cy="8"  r="3.5"/>
      <circle cx="8"  cy="24" r="3.5"/><circle cx="24" cy="24" r="3.5"/>
      <circle cx="16" cy="16" r="3.5"/>
      <line x1="8"  y1="11.5" x2="8"  y2="15"/><line x1="24" y1="11.5" x2="24" y2="15"/><line x1="16" y1="19.5" x2="16" y2="23"/>
    </svg>
  ),
  cabaret: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="26" height="2.5" rx="1" strokeWidth="0" fill="currentColor" opacity="0.3"/>
      <circle cx="7"  cy="13" r="1.8"/><circle cx="11" cy="13" r="1.8"/><circle cx="9"  cy="17" r="1.8"/>
      <circle cx="19" cy="13" r="1.8"/><circle cx="23" cy="13" r="1.8"/><circle cx="21" cy="17" r="1.8"/>
      <circle cx="7"  cy="23" r="1.8"/><circle cx="11" cy="23" r="1.8"/><circle cx="9"  cy="27" r="1.8"/>
      <circle cx="19" cy="23" r="1.8"/><circle cx="23" cy="23" r="1.8"/><circle cx="21" cy="27" r="1.8"/>
    </svg>
  ),
  hollow_square: (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="16" height="16" rx="1"/>
      <circle cx="16" cy="3.5" r="1.8"/><circle cx="16" cy="28.5" r="1.8"/>
      <circle cx="3.5" cy="16" r="1.8"/><circle cx="28.5" cy="16" r="1.8"/>
      <circle cx="7"  cy="7"  r="1.8"/><circle cx="25" cy="7"  r="1.8"/>
      <circle cx="7"  cy="25" r="1.8"/><circle cx="25" cy="25" r="1.8"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────────────────────────────────────
   PARKING — vehicle-count fields, shown for every category (optional, doesn't
   affect step validation). Stored at form.parking = { cars, twoWheelers, buses }.
───────────────────────────────────────────────────────────────────────────── */
const PARKING_VEHICLES = [
  { key: "cars",        label: "Cars",             icon: Car,  placeholder: "e.g. 40" },
  { key: "twoWheelers", label: "Two-Wheelers",     icon: Bike, placeholder: "e.g. 60" },
  { key: "buses",       label: "Buses / Coaches",  icon: Bus,  placeholder: "e.g. 4"  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CONFIG — each category gets its own field set + validation
───────────────────────────────────────────────────────────────────────────── */
const CAPACITY_CONFIG = {
  venues: {
    heading:     "Capacity & Seating",
    subtitle:    "Minimum, maximum and standing capacity for your venue.",
    summaryIcon: Users,
    tips: [],
    seatingStyles: true,
    fields: [
      { key: "maxCapacity",      label: "Max",      placeholder: "e.g. 500", unit: "guests", required: true },
      { key: "minCapacity",      label: "Min",      placeholder: "e.g. 50",  unit: "guests", required: true },
      { key: "floatingCapacity", label: "Floating", placeholder: "e.g. 800", unit: "guests", required: false },
    ],
    validate: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) >= Number(f.minCapacity),
    rangeError: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) > 0 && Number(f.maxCapacity) < Number(f.minCapacity),
    summary:  (f) => `${f.minCapacity} – ${f.maxCapacity} guests${Number(f.floatingCapacity) > 0 ? ` · ${f.floatingCapacity} floating` : ""}`,
  },

  farmstays: {
    heading:     "Rooms & Occupancy",
    subtitle:    "Tell guests how many rooms you have and the total guest capacity.",
    summaryIcon: BedDouble,
    tips: [
      "Include all room types: cottages, tents, dormitories",
      "Max guests should reflect total comfortable occupancy",
    ],
    fields: [
      { key: "totalRooms",  label: "Total rooms",       placeholder: "e.g. 8",  unit: "rooms",  required: true },
      { key: "bedsPerRoom", label: "Avg beds per room", placeholder: "e.g. 2",  unit: "beds",   required: true },
      { key: "maxCapacity", label: "Max total guests",  placeholder: "e.g. 20", unit: "guests", required: true },
    ],
    validate:   (f) => Number(f.totalRooms) > 0 && Number(f.bedsPerRoom) > 0 && Number(f.maxCapacity) > 0,
    rangeError: ()  => false,
    summary:    (f) => `${f.totalRooms} rooms · ${f.bedsPerRoom} beds/room · ${f.maxCapacity} guests max`,
  },

  studios: {
    heading:     "Studio Capacity",
    subtitle:    "How many people can use the studio at one time?",
    summaryIcon: MonitorCheck,
    tips: [
      "Consider fire safety and comfort when setting your maximum",
      "Include crew, models, and talent in your count",
    ],
    fields: [
      { key: "minCapacity", label: "Minimum people", placeholder: "e.g. 1",  unit: "people", required: true },
      { key: "maxCapacity", label: "Maximum people", placeholder: "e.g. 20", unit: "people", required: true },
    ],
    validate:   (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) >= Number(f.minCapacity),
    rangeError: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) > 0 && Number(f.maxCapacity) < Number(f.minCapacity),
    summary:    (f) => `${f.minCapacity} – ${f.maxCapacity} people`,
  },

  workspaces: {
    heading:     "Workspace Capacity",
    subtitle:    "How many desks, meeting rooms, and total seats do you offer?",
    summaryIcon: Armchair,
    tips: [
      "Count all desk types: hot desks, dedicated, and private offices",
      "Leave buffer — avoid listing at fire-code maximum",
    ],
    fields: [
      { key: "totalDesks",   label: "Total desks",    placeholder: "e.g. 40", unit: "desks",  required: true  },
      { key: "meetingRooms", label: "Meeting rooms",  placeholder: "e.g. 3",  unit: "rooms",  required: false },
      { key: "maxCapacity",  label: "Max occupancy",  placeholder: "e.g. 60", unit: "people", required: true  },
    ],
    validate:   (f) => Number(f.totalDesks) > 0 && Number(f.maxCapacity) > 0,
    rangeError: ()  => false,
    summary:    (f) => `${f.totalDesks} desks · ${f.meetingRooms ? `${f.meetingRooms} meeting rooms · ` : ""}${f.maxCapacity} people max`,
  },

  rentals: {
    heading:     "Property Details",
    subtitle:    "How many bedrooms and bathrooms does your rental property have?",
    summaryIcon: DoorOpen,
    tips: [
      "Include children in your guest count",
      "Align with your building's occupancy rules",
    ],
    fields: [
      { key: "bedrooms",    label: "Bedrooms",   placeholder: "e.g. 3", unit: "rooms",  required: true },
      { key: "bathrooms",   label: "Bathrooms",  placeholder: "e.g. 2", unit: "baths",  required: true },
      { key: "maxCapacity", label: "Max guests", placeholder: "e.g. 8", unit: "guests", required: true },
    ],
    validate:   (f) => Number(f.bedrooms) > 0 && Number(f.bathrooms) > 0 && Number(f.maxCapacity) > 0,
    rangeError: ()  => false,
    summary:    (f) => `${f.bedrooms} bed · ${f.bathrooms} bath · ${f.maxCapacity} guests max`,
  },

  experiences: {
    heading:     "Group Size",
    subtitle:    "What is the minimum and maximum group size for this experience?",
    summaryIcon: Users,
    tips: [
      "Minimum ensures the experience is economically viable",
      "Maximum ensures quality and safety for all participants",
    ],
    fields: [
      { key: "minCapacity", label: "Min group size", placeholder: "e.g. 2",  unit: "people", required: true },
      { key: "maxCapacity", label: "Max group size", placeholder: "e.g. 15", unit: "people", required: true },
    ],
    validate:   (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) >= Number(f.minCapacity),
    rangeError: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) > 0 && Number(f.maxCapacity) < Number(f.minCapacity),
    summary:    (f) => `${f.minCapacity} – ${f.maxCapacity} people per session`,
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    card:    isDark ? "#111827"                 : "#ffffff",
    cardAlt: isDark ? "#0d1526"                : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                : "#0f172a",
    muted:   isDark ? "#94a3b8"               : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)": "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)": "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"               : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)": "rgba(0,0,0,0.12)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CapacityStep({ form, setForm, category = "venues" }) {
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk     = tokens(isDark);
  const theme  = getCategoryTheme(category);
  const config = CAPACITY_CONFIG[category] ?? CAPACITY_CONFIG.venues;
  const SummaryIcon = config.summaryIcon;

  const [touched, setTouched] = useState({});
  const touch = (key) => setTouched((p) => ({ ...p, [key]: true }));

  /* Only the error state gets a highlighted border/glow — a green
     "success" ring on every filled field was firing across nearly the
     whole form at once and read as noise rather than useful feedback. */
  const inputStyle = (hasErr) => ({
    background: tk.inputBg,
    border:     `1px solid ${hasErr ? "#f87171" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  hasErr ? "0 0 0 3px rgba(248,113,113,0.12)" : "none",
  });

  const isValid     = config.validate(form);
  const hasRangeErr = config.rangeError(form);

  /* Parking — optional vehicle counts, doesn't gate step completion. */
  const parking = form.parking || {};
  const setParkingField = (key, val) => setForm({ ...form, parking: { ...parking, [key]: val } });

  /* Seating arrangements (venues only) — locked until min & max guests are
     both set, matching the gating pattern from the start-listing flow. */
  const seating      = form.seatingStyles || {};
  const minGuests     = Number(form.minCapacity) || 0;
  const maxGuests     = Number(form.maxCapacity) || 0;
  const seatingReady  = minGuests > 0 && maxGuests > 0 && maxGuests >= minGuests;

  const toggleSeating = (key) => {
    if (!seatingReady) return;
    const cur = seating[key] || { enabled: false, capacity: "" };
    setForm({ ...form, seatingStyles: { ...seating, [key]: { ...cur, enabled: !cur.enabled } } });
  };
  const setSeatingCap = (key, val) => {
    const clamped = maxGuests > 0 ? Math.min(Number(val) || 0, maxGuests) : val;
    const cur = seating[key] || { enabled: true, capacity: "" };
    setForm({ ...form, seatingStyles: { ...seating, [key]: { ...cur, capacity: clamped || "" } } });
  };

  /* column count based on number of fields — jumping straight to 3 columns
     at the "sm" breakpoint left no room once the sidebar is on screen too,
     so 3-field configs step through 2 columns first. */
  const colClass = config.fields.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {config.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {config.subtitle}
        </p>
      </div>

      {/* ── Fields ── */}
      <div className={`grid ${colClass} gap-6`}>
        {config.fields.map((field) => {
          const val     = Number(form[field.key]) || "";
          const isValid = val > 0;
          const hasErr  = touched[field.key] && !isValid && field.required;

          return (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center gap-1.5 h-[17px] text-[13px] font-semibold" style={{ color: tk.text }}>
                <span>{field.label}</span>
                {field.required
                  ? <span style={{ color: theme.accent }}>*</span>
                  : <span className="text-[11px] font-normal" style={{ color: tk.dimmed }}>(optional)</span>
                }
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form[field.key] || ""}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  onBlur={() => touch(field.key)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20"
                  style={inputStyle(hasErr)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
                  style={{ color: tk.dimmed }}
                >
                  {field.unit}
                </span>
              </div>
              {/* Only surfaces an error now — a green "All set" on every
                  filled field fired across nearly the whole form at once. */}
              <AnimatePresence mode="wait">
                {hasErr ? (
                  <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <AlertCircle size={12} style={{ color: "#f87171" }} />
                    <span className="text-[12px]" style={{ color: "#f87171" }}>Enter a valid number</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Range mismatch warning */}
      <AnimatePresence>
        {hasRangeErr && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)" }}
          >
            <AlertCircle size={13} style={{ color: "#f87171" }} />
            <p className="text-[12px] font-medium" style={{ color: "#f87171" }}>
              Maximum must be greater than or equal to minimum
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary card */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl"
            style={{ background: tk.trackBg, border: `1px solid ${tk.border}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: tk.card, border: `1px solid ${tk.border}` }}
            >
              <SummaryIcon size={18} style={{ color: tk.text }} />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: tk.text }}>
                {config.summary(form)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: tk.muted }}>
                Capacity confirmed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seating arrangements — venues only, locked until min & max are set */}
      {config.seatingStyles && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <LayoutGrid size={15} style={{ color: tk.muted }} />
            <h3 className="text-[14px] font-bold" style={{ color: tk.text }}>
              Seating arrangements
            </h3>
            {!seatingReady ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "#d97706" }}>
                <Lock size={11} />
                Enter min &amp; max guests first
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: tk.muted }}>
                Enable the layouts your venue supports
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SEATING_STYLES.map((style) => {
              const entry   = seating[style.key] || { enabled: false, capacity: "" };
              const enabled = !!entry.enabled && seatingReady;
              const seatMax = maxGuests > 0 ? maxGuests : 100000;

              return (
                <div
                  key={style.key}
                  role="button"
                  tabIndex={seatingReady ? 0 : -1}
                  onClick={() => toggleSeating(style.key)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleSeating(style.key)}
                  className="relative rounded-xl transition-all duration-150 select-none focus:outline-none"
                  style={{
                    border:        enabled ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                    background:    tk.card,
                    opacity:       seatingReady ? 1 : 0.5,
                    pointerEvents: seatingReady ? "auto" : "none",
                    cursor:        seatingReady ? "pointer" : "default",
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5 p-3 pt-4">
                    <span style={{ color: enabled ? tk.text : tk.dimmed }}>
                      {SEATING_ICONS[style.key]}
                    </span>
                    <p
                      className="text-[11.5px] font-semibold text-center leading-tight"
                      style={{ color: tk.text }}
                    >
                      {style.label}
                    </p>

                    {enabled && (
                      <div className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min="1"
                          max={seatMax}
                          value={entry.capacity || ""}
                          onChange={(e) => setSeatingCap(style.key, e.target.value)}
                          placeholder="Capacity"
                          className="w-full px-2 py-1.5 rounded-lg text-[11px] text-center outline-none"
                          style={{ background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Parking Details — grouped card, same convention as Venue Policies
          in TermsStep.jsx (icon-badge header + p-5 rounded-2xl card).
          Shown for every category since parking is broadly relevant, and
          left fully optional so it never blocks step completion. */}
      <div className="p-5 rounded-2xl" style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}>
        <div className="flex items-start gap-3 pb-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tk.card, border: `1px solid ${tk.border}` }}>
            <ParkingSquare size={16} style={{ color: tk.text }} />
          </div>
          <div>
            <p className="text-[13.5px] font-bold" style={{ color: tk.text }}>Parking Details</p>
            <p className="text-[12px] mt-0.5" style={{ color: tk.muted }}>
              How many vehicles can park on-site at once? Leave blank if not applicable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {PARKING_VEHICLES.map((v) => {
            const VIcon = v.icon;
            return (
              <div key={v.key} className="space-y-2">
                <label className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: tk.text }}>
                  <VIcon size={14} style={{ color: tk.muted }} />
                  {v.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={parking[v.key] || ""}
                    onChange={(e) => setParkingField(v.key, e.target.value)}
                    placeholder={v.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all"
                    style={{ background: tk.inputBg, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
                    style={{ color: tk.dimmed }}
                  >
                    spots
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      {config.tips.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>Tips</p>
          {config.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-[11px]" style={{ color: theme.accent }}>›</span>
              <p className="text-[12px]" style={{ color: tk.muted }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
