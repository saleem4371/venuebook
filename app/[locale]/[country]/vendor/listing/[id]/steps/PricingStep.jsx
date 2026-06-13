"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Sun, Sunset, Moon, IndianRupee } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   PRICING MODELS PER CATEGORY
   - venues / studios / workspaces  → shift-based (morning / afternoon / evening)
   - farmstays / rentals            → nightly rate
   - experiences                    → per-person rate
───────────────────────────────────────────────────────────────────────────── */
const SHIFT_CATEGORIES   = ["venues", "studios", "workspaces"];
const NIGHTLY_CATEGORIES = ["farmstays", "rentals"];
const PERSON_CATEGORIES  = ["experiences"];

const SHIFT_COPY = {
  venues:     { heading: "Event Pricing",    subtitle: "Set prices per booking slot. Enable at least one shift.",          unit: "per event"  },
  studios:    { heading: "Studio Pricing",   subtitle: "Set hourly slot rates. Enable the time slots you offer.",          unit: "per slot"   },
  workspaces: { heading: "Workspace Pricing",subtitle: "Define pricing for each part of the day you're open.",             unit: "per slot"   },
};

const SHIFTS = [
  { key: "morning",   label: "Morning",   Icon: Sun,    timeHint: "e.g. 07:00 – 12:00" },
  { key: "afternoon", label: "Afternoon", Icon: Sunset, timeHint: "e.g. 12:00 – 17:00" },
  { key: "evening",   label: "Evening",   Icon: Moon,   timeHint: "e.g. 17:00 – 23:00" },
];

const NIGHTLY_COPY = {
  farmstays: { heading: "Stay Pricing",    subtitle: "Set your base nightly rate and optional peak/weekend rates." },
  rentals:   { heading: "Rental Pricing",  subtitle: "Set your nightly rate. You can adjust weekend and peak rates too." },
};

const PERSON_COPY = {
  experiences: { heading: "Experience Pricing", subtitle: "Set your per-person rate and any group discounts." },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    card:    isDark ? "#111827"                : "#ffffff",
    cardAlt: isDark ? "#0d1526"               : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)": "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"               : "#0f172a",
    muted:   isDark ? "#94a3b8"               : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)": "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)": "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"               : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)": "rgba(0,0,0,0.12)",
    shadow:  isDark ? "0 2px 16px rgba(0,0,0,0.40)" : "0 2px 12px rgba(0,0,0,0.07)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function PricingStep({ form, setForm, category = "venues" }) {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk = tokens(isDark);
  const theme = getCategoryTheme(category);

  if (NIGHTLY_CATEGORIES.includes(category)) return <NightlyPricing  form={form} setForm={setForm} copy={NIGHTLY_COPY[category]}               tk={tk} theme={theme} />;
  if (PERSON_CATEGORIES.includes(category))  return <PerPersonPricing form={form} setForm={setForm} copy={PERSON_COPY[category]}                tk={tk} theme={theme} />;
  return <ShiftPricing form={form} setForm={setForm} copy={SHIFT_COPY[category] ?? SHIFT_COPY.venues} tk={tk} theme={theme} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHIFT-BASED PRICING  (venues / studios / workspaces)
───────────────────────────────────────────────────────────────────────────── */
function ShiftPricing({ form, setForm, copy, tk, theme }) {
  const pricing = form.pricing || {
    morning:   { enabled: false, start: "", end: "", price: "" },
    afternoon: { enabled: false, start: "", end: "", price: "" },
    evening:   { enabled: false, start: "", end: "", price: "" },
  };

  const update = (shift, field, value) =>
    setForm({ ...form, pricing: { ...pricing, [shift]: { ...pricing[shift], [field]: value } } });

  // const toggle = (shift) =>
  //   setForm({ ...form, pricing: { ...pricing, [shift]: { ...pricing[shift], enabled: !pricing[shift].enabled } } });

  const toggle = (shift) => {
  setForm((prev) => ({
    ...prev,
    pricing: {
      ...prev.pricing,
      [shift]: {
        ...(prev.pricing?.[shift] || {}),
        enabled: !(prev.pricing?.[shift]?.enabled ?? false),
      },
    },
  }));
};

  const anyEnabled = SHIFTS.some((s) => pricing[s.key]?.enabled);

  const INPUT = "w-full px-3 py-2.5 rounded-xl text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: tk.text }}>{copy.heading}</h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>{copy.subtitle}</p>
      </div>

      <div className="space-y-3">
        {SHIFTS.map(({ key, label, Icon, timeHint }) => {
          const shift   = pricing[key] || { enabled: false, start: "", end: "", price: "" };
          const isValid = !shift.enabled || (shift.start && shift.end && shift.price > 0);

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border:     `1px solid ${shift.enabled ? `${theme.ring}0.35)` : tk.border}`,
                background: shift.enabled ? `${theme.ring}0.05)` : tk.cardAlt,
              }}
            >
              {/* Shift header */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: shift.enabled ? `${theme.ring}0.15)` : tk.trackBg,
                    }}
                  >
                    <Icon size={14} style={{ color: shift.enabled ? theme.accent : tk.dimmed }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: shift.enabled ? tk.text : tk.muted }}>
                      {label} Slot
                    </p>
                    <p className="text-[11px]" style={{ color: tk.dimmed }}>{timeHint}</p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(key)}
                  className="relative w-10 h-6 rounded-full transition-all cursor-pointer shrink-0"
                  style={{ background: shift.enabled ? theme.gradient : "rgba(148,163,184,0.25)" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: shift.enabled ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.22)" }}
                  />
                </button>
              </div>

              {/* Shift fields */}
              <AnimatePresence>
                {shift.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-4 pb-4 grid grid-cols-3 gap-3" style={{ borderTop: `1px solid ${theme.ring}0.15)` }}>
                      <div className="pt-3">
                        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tk.dimmed }}>Start Time *</label>
                        <input
                          type="time"
                          value={shift.start}
                          onChange={(e) => update(key, "start", e.target.value)}
                          className={INPUT}
                          style={{ background: tk.inputBg, border: `1px solid ${!shift.start ? "rgba(248,113,113,0.50)" : tk.inputBd}`, color: tk.text }}
                        />
                      </div>
                      <div className="pt-3">
                        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tk.dimmed }}>End Time *</label>
                        <input
                          type="time"
                          value={shift.end}
                          onChange={(e) => update(key, "end", e.target.value)}
                          className={INPUT}
                          style={{ background: tk.inputBg, border: `1px solid ${!shift.end ? "rgba(248,113,113,0.50)" : tk.inputBd}`, color: tk.text }}
                        />
                      </div>
                      <div className="pt-3">
                        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tk.dimmed }}>Price (₹) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: tk.dimmed }}>₹</span>
                          <input
                            type="number"
                            value={shift.price}
                            onChange={(e) => update(key, "price", e.target.value)}
                            placeholder="5000"
                            className={INPUT + " pl-7"}
                            style={{ background: tk.inputBg, border: `1px solid ${shift.price <= 0 ? "rgba(248,113,113,0.50)" : tk.inputBd}`, color: tk.text }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {!anyEnabled && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
          <AlertCircle size={13} style={{ color: "#f59e0b" }} />
          <p className="text-[12px] font-medium" style={{ color: "#f59e0b" }}>Enable at least one slot to continue</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHTLY PRICING  (farmstays / rentals)
───────────────────────────────────────────────────────────────────────────── */
function NightlyPricing({ form, setForm, copy, tk, theme }) {
  
  const pricing = form.pricing || { nightlyRate: "", weekendRate: "", cleaningFee: "" };
  const set     = (k, v) => setForm({ ...form, pricing: { ...pricing, [k]: v } });

  const hasBase = Number(pricing.nightlyRate) > 0;

  const INPUT = "w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";

  const inputStyle = (valid) => ({
    background: tk.inputBg,
    border:     `1px solid ${valid ? "#34d399" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  valid ? "0 0 0 3px rgba(52,211,153,0.10)" : "none",
  });

  useEffect(() => {
  if (!form?.property_pricing?.length) return;

  const getAmount = (key) =>
    form.property_pricing.find(
      (item) => item.pricing_key === key
    )?.amount || "";

  setForm((prev) => ({
    ...prev,
    pricing: {
      nightlyRate: getAmount("nightly"),
      weekendRate: getAmount("weekly"),
      cleaningFee: getAmount("cleaning_fee"),
    },
  }));
}, [form?.property_pricing]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: tk.text }}>{copy.heading}</h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>{copy.subtitle}</p>
      </div>

      {/* Base nightly rate */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
          Base Nightly Rate <span style={{ color: theme.accent }}>*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: tk.dimmed }}>₹</span>
          <input
            type="number"
            value={pricing.nightlyRate}
            onChange={(e) => set("nightlyRate", e.target.value)}
            placeholder="e.g. 4500"
            className={INPUT + " pl-9"}
            style={inputStyle(hasBase)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: tk.dimmed }}>per night</span>
        </div>
        {hasBase && (
          <div className="flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} style={{ color: "#34d399" }} />
            <span className="text-[12px]" style={{ color: "#34d399" }}>Base rate set</span>
          </div>
        )}
      </div>

      {/* Optional rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Weekend Rate <span className="text-[11px] font-normal" style={{ color: tk.muted }}>(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: tk.dimmed }}>₹</span>
            <input
              type="number"
              value={pricing.weekendRate}
              onChange={(e) => set("weekendRate", e.target.value)}
              placeholder="e.g. 5500"
              className={INPUT + " pl-9"}
              style={inputStyle(Number(pricing.weekendRate) > 0)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Cleaning Fee <span className="text-[11px] font-normal" style={{ color: tk.muted }}>(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: tk.dimmed }}>₹</span>
            <input
              type="number"
              value={pricing.cleaningFee}
              onChange={(e) => set("cleaningFee", e.target.value)}
              placeholder="e.g. 800"
              className={INPUT + " pl-9"}
              style={inputStyle(Number(pricing.cleaningFee) > 0)}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {hasBase && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: `${theme.ring}0.07)`, border: `1px solid ${theme.ring}0.18)` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${theme.ring}0.15)` }}>
            <IndianRupee size={18} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: theme.accent }}>₹{Number(pricing.nightlyRate).toLocaleString("en-IN")} / night</p>
            {pricing.weekendRate > 0 && (
              <p className="text-[11px] mt-0.5" style={{ color: `${theme.ring}0.70)` }}>
                + ₹{Number(pricing.weekendRate).toLocaleString("en-IN")} on weekends
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PER-PERSON PRICING  (experiences)
───────────────────────────────────────────────────────────────────────────── */
function PerPersonPricing({ form, setForm, copy, tk, theme }) {
  const pricing = form.pricing || { perPersonRate: "", groupDiscount: "", childRate: "" };
  const set     = (k, v) => setForm({ ...form, pricing: { ...pricing, [k]: v } });

  const hasBase = Number(pricing.perPersonRate) > 0;

  const INPUT = "w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";
  const inputStyle = (valid) => ({
    background: tk.inputBg,
    border:     `1px solid ${valid ? "#34d399" : tk.inputBd}`,
    color:      tk.text,
    boxShadow:  valid ? "0 0 0 3px rgba(52,211,153,0.10)" : "none",
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[22px] font-bold" style={{ color: tk.text }}>{copy.heading}</h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>{copy.subtitle}</p>
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
          Price per Person <span style={{ color: theme.accent }}>*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: tk.dimmed }}>₹</span>
          <input
            type="number"
            value={pricing.perPersonRate}
            onChange={(e) => set("perPersonRate", e.target.value)}
            placeholder="e.g. 1200"
            className={INPUT + " pl-9"}
            style={inputStyle(hasBase)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: tk.dimmed }}>per person</span>
        </div>
        {hasBase && (
          <div className="flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} style={{ color: "#34d399" }} />
            <span className="text-[12px]" style={{ color: "#34d399" }}>Rate set</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Child Rate <span className="text-[11px] font-normal" style={{ color: tk.muted }}>(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: tk.dimmed }}>₹</span>
            <input type="number" value={pricing.childRate} onChange={(e) => set("childRate", e.target.value)} placeholder="e.g. 600"
              className={INPUT + " pl-9"} style={inputStyle(Number(pricing.childRate) > 0)} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Group Discount <span className="text-[11px] font-normal" style={{ color: tk.muted }}>(% off)</span>
          </label>
          <div className="relative">
            <input type="number" value={pricing.groupDiscount} onChange={(e) => set("groupDiscount", e.target.value)} placeholder="e.g. 10"
              className={INPUT + " pr-9"} style={inputStyle(Number(pricing.groupDiscount) > 0)} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold" style={{ color: tk.dimmed }}>%</span>
          </div>
        </div>
      </div>

      {hasBase && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: `${theme.ring}0.07)`, border: `1px solid ${theme.ring}0.18)` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${theme.ring}0.15)` }}>
            <IndianRupee size={18} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: theme.accent }}>₹{Number(pricing.perPersonRate).toLocaleString("en-IN")} / person</p>
            {pricing.groupDiscount > 0 && (
              <p className="text-[11px] mt-0.5" style={{ color: `${theme.ring}0.70)` }}>
                {pricing.groupDiscount}% group discount available
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
