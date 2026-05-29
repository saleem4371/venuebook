"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Users, BedDouble, MonitorCheck, Armchair, DoorOpen, Bath } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CONFIG — each category gets its own field set + validation
───────────────────────────────────────────────────────────────────────────── */
const CAPACITY_CONFIG = {
  venues: {
    heading:     "Capacity & Seating",
    subtitle:    "Set the minimum and maximum number of guests your venue can accommodate.",
    summaryIcon: Users,
    tips: [
      "Include standing capacity for cocktail-style events",
      "Set minimum to avoid under-utilised bookings",
    ],
    fields: [
      { key: "minCapacity", label: "Minimum guests", placeholder: "e.g. 50",  unit: "guests", required: true },
      { key: "maxCapacity", label: "Maximum guests", placeholder: "e.g. 500", unit: "guests", required: true },
    ],
    validate: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) >= Number(f.minCapacity),
    rangeError: (f) => Number(f.minCapacity) > 0 && Number(f.maxCapacity) > 0 && Number(f.maxCapacity) < Number(f.minCapacity),
    summary:  (f) => `${f.minCapacity} – ${f.maxCapacity} guests`,
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
  const [isDark, setIsDark] = useState(true);
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

  const inputStyle = (hasErr, isValid) => ({
    background: tk.inputBg,
    border:     `1px solid ${hasErr ? "#f87171" : isValid ? "#34d399" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  hasErr   ? "0 0 0 3px rgba(248,113,113,0.12)"
               : isValid ? "0 0 0 3px rgba(52,211,153,0.10)"
               : "none",
  });

  const isValid     = config.validate(form);
  const hasRangeErr = config.rangeError(form);

  /* column count based on number of fields */
  const colClass = config.fields.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-3";

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
              <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
                {field.label}
                {field.required
                  ? <span className="ml-1" style={{ color: theme.accent }}>*</span>
                  : <span className="ml-2 text-[11px] font-normal" style={{ color: tk.dimmed }}>(optional)</span>
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
                  style={inputStyle(hasErr, isValid && !!form[field.key])}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
                  style={{ color: tk.dimmed }}
                >
                  {field.unit}
                </span>
              </div>
              <AnimatePresence mode="wait">
                {hasErr ? (
                  <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <AlertCircle size={12} style={{ color: "#f87171" }} />
                    <span className="text-[12px]" style={{ color: "#f87171" }}>Enter a valid number</span>
                  </motion.div>
                ) : isValid && form[field.key] ? (
                  <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} style={{ color: "#34d399" }} />
                    <span className="text-[12px]" style={{ color: "#34d399" }}>All set</span>
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
            style={{ background: `${theme.ring}0.07)`, border: `1px solid ${theme.ring}0.18)` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${theme.ring}0.15)` }}
            >
              <SummaryIcon size={18} style={{ color: theme.accent }} />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: theme.accent }}>
                {config.summary(form)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: `${theme.ring}0.70)` }}>
                Capacity confirmed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tk.dimmed }}>Tips</p>
        {config.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-[11px]" style={{ color: theme.accent }}>›</span>
            <p className="text-[12px]" style={{ color: tk.muted }}>{tip}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
