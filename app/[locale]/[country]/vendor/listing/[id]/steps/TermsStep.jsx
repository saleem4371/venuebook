"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronDown, ShieldCheck, Circle, Plus, X, Music, Volume2, Cigarette, PawPrint, Users, Sun, Sunset, Moon, Palette } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";
import RichTextEditor from "./RichTextEditor";

/* Coloured status dot — replaces emoji indicators */
function StatusDot({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" fill={color} opacity="0.18" />
      <circle cx="6" cy="6" r="3" fill={color} />
    </svg>
  );
}

/* Simple Yes/No selector for boolean venue policies — neutral black/white
   selected state, consistent with the rest of the editor. */
function YesNoToggle({ value, onChange, tk, isDark }) {
  const options = [
    { id: true,  label: "Yes" },
    { id: false, label: "No" },
  ];
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() => onChange(opt.id)}
            className="px-5 py-2 rounded-xl text-[12px] font-semibold transition-colors outline-none focus:outline-none focus-visible:outline-none"
            style={{
              background: isActive ? tk.trackBg : tk.card,
              border: isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
              color: tk.text,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE COPY
───────────────────────────────────────────────────────────────────────────── */
const TERMS_COPY = {
  venues: {
    heading:  "Terms & Conditions",
    subtitle: "Set your cancellation policy and venue rules for guests.",
    rulesLabel: "Venue Rules",
    rulesPlaceholder: "e.g. No confetti or glitter allowed. Guests must vacate by midnight. Outside alcohol not permitted.",
  },
  farmstays: {
    heading:  "Terms & Stay Policies",
    subtitle: "Let guests know your check-in rules and cancellation policy.",
    rulesLabel: "House / Farm Rules",
    rulesPlaceholder: "e.g. Do not disturb farm animals. Bonfire only in designated area. Lights out by 11 PM.",
  },
  studios: {
    heading:  "Studio Terms",
    subtitle: "Define your booking policies and studio rules.",
    rulesLabel: "Studio Rules",
    rulesPlaceholder: "e.g. Renter is responsible for any damage to equipment. Clean up after each session. No food near backdrops.",
  },
  workspaces: {
    heading:  "Workspace Terms",
    subtitle: "Set your workspace usage policies and community guidelines.",
    rulesLabel: "Workspace Rules",
    rulesPlaceholder: "e.g. Maintain noise levels during focus hours. Guests must carry valid ID. No overnight access without prior approval.",
  },
  rentals: {
    heading:  "Rental Terms & Policies",
    subtitle: "Define check-in/out rules, damage policy, and house rules.",
    rulesLabel: "House Rules",
    rulesPlaceholder: "e.g. No smoking indoors. No parties or events. Pets allowed only in designated areas.",
  },
  experiences: {
    heading:  "Experience Terms",
    subtitle: "Set your participation rules and cancellation policy.",
    rulesLabel: "Participation Rules",
    rulesPlaceholder: "e.g. Minimum age 12 years. Participants must be in good health. No alcohol before the activity.",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   CANCELLATION POLICIES
   Venues are booked for a single event date, usually planned weeks or months
   out, so their cancellation windows are measured in days/weeks before the
   event — not the short, stay-style "24 hours" windows that make sense for
   an overnight farmstay/rental booking. Categories fall back to the shorter
   stay-style windows unless a category-specific list is defined below.
───────────────────────────────────────────────────────────────────────────── */
const CUSTOM_POLICY = {
  id:       "custom",
  label:    "Custom",
  dotColor: "#94a3b8",
  summary:  "Set your own refund tiers",
  detail:   null,
  popular:  false,
  custom:   true,
};

const CANCELLATION_POLICIES_BY_CATEGORY = {
  venues: [
    {
      id:       "flexible",
      label:    "Flexible",
      dotColor: "#22c55e",
      summary:  "Full refund up to 7 days before the event",
      detail:   "Guests receive a full refund if they cancel at least 7 days before the event date. After that, no refund is issued.",
      popular:  false,
    },
    {
      id:       "moderate",
      label:    "Moderate",
      dotColor: "#eab308",
      summary:  "Full refund up to 15 days before the event",
      detail:   "Guests receive a full refund if they cancel at least 15 days before the event date. 50% refund for cancellations between 7–15 days before. No refund within 7 days of the event.",
      popular:  false,
    },
    {
      id:       "strict",
      label:    "Strict",
      dotColor: "#f87171",
      summary:  "50% refund up to 30 days before the event",
      detail:   "Guests receive a 50% refund if they cancel at least 30 days before the event date. No refund for cancellations within 30 days of the event.",
      popular:  false,
    },
    {
      id:       "non_refundable",
      label:    "Non-Refundable",
      dotColor: "#6b7280",
      summary:  "No refunds offered",
      detail:   "Bookings are non-refundable. Guests accept this policy at the time of booking. You may offer rescheduling at your discretion.",
      popular:  false,
    },
    CUSTOM_POLICY,
  ],

  default: [
    {
      id:       "flexible",
      label:    "Flexible",
      dotColor: "#22c55e",
      summary:  "Full refund up to 24 hours before",
      detail:   "Guests receive a full refund if they cancel at least 24 hours before the booking start time. After that, no refund is issued.",
      popular:  false,
    },
    {
      id:       "moderate",
      label:    "Moderate",
      dotColor: "#eab308",
      summary:  "Full refund up to 5 days before",
      detail:   "Guests receive a full refund if they cancel at least 5 days before the booking start time. 50% refund for cancellations between 1–5 days. No refund after that.",
      popular:  false,
    },
    {
      id:       "strict",
      label:    "Strict",
      dotColor: "#f87171",
      summary:  "50% refund up to 7 days before",
      detail:   "Guests receive a 50% refund if they cancel at least 7 days before the booking start time. No refund for cancellations less than 7 days before.",
      popular:  false,
    },
    {
      id:       "non_refundable",
      label:    "Non-Refundable",
      dotColor: "#6b7280",
      summary:  "No refunds offered",
      detail:   "Bookings are non-refundable. Guests accept this policy at the time of booking. You may offer rescheduling at your discretion.",
      popular:  false,
    },
    CUSTOM_POLICY,
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   VENUE POLICIES — music timing, noise, outside vendors, smoking, pets.
   Venue-specific operational rules shown to guests before booking. Scoped to
   the venues category since these don't apply to farmstays/studios/etc.
───────────────────────────────────────────────────────────────────────────── */
const MUSIC_SHIFTS = [
  { key: "morning",   label: "Morning",   Icon: Sun },
  { key: "afternoon", label: "Afternoon", Icon: Sunset },
  { key: "evening",   label: "Evening",   Icon: Moon },
];

const NOISE_OPTIONS = [
  { id: "strict",   label: "Strict",   desc: "Low volume, early cutoff" },
  { id: "moderate", label: "Moderate", desc: "Standard event volume" },
  { id: "flexible", label: "Flexible", desc: "High volume, late cutoff" },
];

const SMOKING_OPTIONS = [
  { id: "not_allowed",     label: "Not Allowed" },
  { id: "designated_area", label: "Designated Area" },
  { id: "outdoors",        label: "Allowed Outdoors" },
];

const DECOR_OPTIONS = [
  { id: "approval_required", label: "Outside allowed with approval", desc: "Guest's own decorator, pending your sign-off" },
  { id: "outside_allowed",   label: "Outside allowed",                desc: "Guests may bring any decorator freely" },
  { id: "in_house_only",     label: "Only in-house allowed",          desc: "Decor must go through your venue's team" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    card:    isDark ? "#111827"                 : "#ffffff",
    cardAlt: isDark ? "#0d1526"                : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                : "#0f172a",
    muted:   isDark ? "#94a3b8"                : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    inputBg: isDark ? "#0d1526"                : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function TermsStep({ form, setForm, category = "venues" }) {
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk   = tokens(isDark);
  const theme = getCategoryTheme(category);
  const copy = TERMS_COPY[category] ?? TERMS_COPY.venues;
  const CANCELLATION_POLICIES = CANCELLATION_POLICIES_BY_CATEGORY[category] ?? CANCELLATION_POLICIES_BY_CATEGORY.default;

  const selectedPolicy   = form.cancellationPolicy || "";
  const houseRules       = form.houseRules          || "";
  const customTiers      = form.customCancellationTiers || [];

  const setPolicy = (id) => {
    // Picking a cancellation policy is now the only acceptance step —
    // the separate "Platform Agreement" checkbox was removed, so implicitly
    // mark terms as accepted here instead of leaving it permanently unset.
    const patch = { cancellationPolicy: id, termsAccepted: true };
    // Seed one empty tier the first time "Custom" is picked so the vendor
    // has a row to fill in immediately instead of an empty state.
    if (id === "custom" && customTiers.length === 0) {
      patch.customCancellationTiers = [{ fromDays: "", toDays: "", refund: "" }];
    }
    setForm({ ...form, ...patch });
    if (id === "custom") setExpandedPolicy("custom");
  };
  const setRules = (val) => setForm({ ...form, houseRules: val });

  const setTiers   = (tiers) => setForm({ ...form, customCancellationTiers: tiers });
  const addTier    = () => setTiers([...customTiers, { fromDays: "", toDays: "", refund: "" }]);
  const updateTier = (idx, key, val) =>
    setTiers(customTiers.map((t, i) => (i === idx ? { ...t, [key]: val } : t)));
  const removeTier = (idx) => setTiers(customTiers.filter((_, i) => i !== idx));

  const completeTiers = customTiers.filter(
    (t) => t.fromDays !== "" && t.toDays !== "" && t.refund !== ""
  );
  const customSummary = completeTiers.length > 0
    ? completeTiers.map((t) => `${t.fromDays}–${t.toDays}d → ${t.refund}% refunded`).join(" · ")
    : "Set your own refund tiers";

  /* ── Venue Policies ── */
  const policies      = form.policies || {};
  const musicTiming   = policies.musicTiming || {};
  const setPolicyField = (key, val) => setForm({ ...form, policies: { ...policies, [key]: val } });
  const setMusicTime   = (shift, val) =>
    setForm({ ...form, policies: { ...policies, musicTiming: { ...musicTiming, [shift]: val } } });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {copy.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {copy.subtitle}
        </p>
      </div>

      {/* ── House / Studio / Workspace Rules ── */}
      <div className="space-y-2">
        <RichTextEditor
          value={houseRules}
          onChange={setRules}
          placeholder={copy.rulesPlaceholder}
          tk={tk}
          minHeight={220}
        />
      </div>

      {/* ── Cancellation Policy ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold" style={{ color: tk.text }}>
            Cancellation Policy <span style={{ color: theme.accent }}>*</span>
          </p>
          {touched && !selectedPolicy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
              <AlertCircle size={12} style={{ color: "#f87171" }} />
              <span className="text-[11px]" style={{ color: "#f87171" }}>Required</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          {CANCELLATION_POLICIES.map((policy) => {
            const isActive   = selectedPolicy === policy.id;
            const isExpanded = expandedPolicy === policy.id;

            // The custom tier editor only ever makes sense for the policy
            // that's actually selected — showing it for an unselected card
            // (via the old independent expand toggle) let vendors edit tiers
            // for an option they hadn't picked, which read as broken.
            const showExpanded = policy.custom ? isActive : isExpanded;

            return (
              <div
                key={policy.id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: isActive ? tk.trackBg : tk.cardAlt,
                  border:     isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                }}
              >
                {/* Header row — the whole row selects the policy; only the
                    chevron (non-custom cards) stops propagation to expand
                    the detail text without changing the selection. */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                  onClick={() => { setPolicy(policy.id); setTouched(true); }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = tk.trackBg; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <StatusDot color={policy.dotColor} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: tk.text }}>
                        {policy.label}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: tk.muted }}>
                      {policy.custom ? customSummary : policy.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand detail — non-custom cards only */}
                    {!policy.custom && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setExpandedPolicy(isExpanded ? null : policy.id); }}
                        className="p-1.5 rounded-lg transition-colors outline-none focus:outline-none focus-visible:outline-none"
                        style={{ color: tk.dimmed }}
                      >
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={14} />
                        </motion.div>
                      </button>
                    )}

                    {/* Select indicator — purely visual, the row click handles selection */}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 pointer-events-none"
                      style={{
                        borderColor: isActive ? (isDark ? "#ffffff" : "#0f172a") : tk.border,
                        background:  isActive ? (isDark ? "#ffffff" : "#0f172a") : "transparent",
                      }}
                    >
                      {isActive && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: isDark ? "#0f172a" : "#ffffff" }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {showExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {policy.custom ? (
                        <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: `1px solid ${tk.border}` }} onClick={(e) => e.stopPropagation()}>
                          <p className="text-[11px] mt-3" style={{ color: tk.muted }}>
                            Define a window before the event and how much of the booking amount you'll refund the guest for cancelling in that window.
                          </p>

                          {customTiers.map((tier, idx) => (
                            <div key={idx} className="p-3 rounded-xl space-y-2.5" style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: tk.muted }}>
                                  Tier {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeTier(idx)}
                                  className="p-1 rounded-md shrink-0 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                                  style={{ color: tk.dimmed }}
                                >
                                  <X size={13} />
                                </button>
                              </div>

                              {/* From / to days before event, and refund % — all in one row */}
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold" style={{ color: tk.text }}>
                                    From (days before)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={tier.fromDays}
                                    onChange={(e) => updateTier(idx, "fromDays", e.target.value)}
                                    placeholder="e.g. 7"
                                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] outline-none transition-colors"
                                    style={{ background: tk.card, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                                  />
                                </div>

                                <span className="text-[11px] shrink-0 mt-6" style={{ color: tk.dimmed }}>to</span>

                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold" style={{ color: tk.text }}>
                                    To (days before)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={tier.toDays}
                                    onChange={(e) => updateTier(idx, "toDays", e.target.value)}
                                    placeholder="e.g. 14"
                                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] outline-none transition-colors"
                                    style={{ background: tk.card, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                                  />
                                </div>

                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold" style={{ color: tk.text }}>
                                    Refund % to guest
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tier.refund}
                                    onChange={(e) => updateTier(idx, "refund", e.target.value)}
                                    placeholder="e.g. 50"
                                    className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] outline-none transition-colors"
                                    style={{ background: tk.card, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                                  />
                                </div>
                              </div>

                              {tier.refund !== "" && (
                                <p className="text-[10px]" style={{ color: tk.dimmed }}>
                                  Guest gets {tier.refund}% back — you keep {Math.max(0, 100 - Number(tier.refund || 0))}% of the booking amount.
                                </p>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addTier}
                            className="flex items-center gap-1.5 text-[12px] font-semibold outline-none focus:outline-none focus-visible:outline-none"
                            style={{ color: tk.text }}
                          >
                            <Plus size={13} /> Add tier
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 pb-4 pt-1">
                          <p className="text-[12px] leading-relaxed" style={{ color: tk.muted }}>
                            {policy.detail}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Venue Policies ── */}
      {category === "venues" && (
        <div className="p-5 rounded-2xl" style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}>
          <div className="flex items-start gap-3 pb-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tk.card, border: `1px solid ${tk.border}` }}>
              <ShieldCheck size={16} style={{ color: tk.text }} />
            </div>
            <div>
              <p className="text-[13.5px] font-bold" style={{ color: tk.text }}>Venue Policies</p>
              <p className="text-[12px] mt-0.5" style={{ color: tk.muted }}>
                Operational rules shown to guests before they book.
              </p>
            </div>
          </div>

          {/* Music Timing — per shift, e.g. "until 10:30 PM" */}
          <div className="space-y-2.5 py-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-2 flex-wrap">
              <Music size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Music Timing</span>
              <span className="text-[11px]" style={{ color: tk.dimmed }}>Based on shift — e.g. until 10:30 PM</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MUSIC_SHIFTS.map((shift) => {
                const ShiftIcon = shift.Icon;
                return (
                  <div key={shift.key} className="p-3 rounded-xl" style={{ background: tk.card, border: `1px solid ${tk.border}` }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShiftIcon size={13} style={{ color: tk.muted }} />
                      <span className="text-[11px] font-semibold" style={{ color: tk.text }}>{shift.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] shrink-0" style={{ color: tk.dimmed }}>Until</span>
                      <input
                        type="time"
                        value={musicTiming[shift.key] || ""}
                        onChange={(e) => setMusicTime(shift.key, e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg text-[12px] outline-none transition-colors"
                        style={{ background: tk.cardAlt, border: `1px solid ${tk.inputBd}`, color: tk.text }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Noise Restriction */}
          <div className="space-y-2.5 py-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-2">
              <Volume2 size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Noise Restriction</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {NOISE_OPTIONS.map((opt) => {
                const isActive = policies.noiseRestriction === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPolicyField("noiseRestriction", opt.id)}
                    className="px-3.5 py-2.5 rounded-xl text-left transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    style={{
                      background: isActive ? tk.trackBg : tk.card,
                      border: isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                    }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: tk.text }}>{opt.label}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: tk.muted }}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outside Vendors Allowed */}
          <div className="space-y-2.5 py-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Outside Vendors Allowed</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: tk.muted }}>
              "Outside vendors" means third-party caterers, decorators, photographers, DJs, or other
              service providers guests bring in themselves — not staff or partners affiliated with your venue.
            </p>
            <YesNoToggle
              value={policies.outsideVendorsAllowed}
              onChange={(v) => setPolicyField("outsideVendorsAllowed", v)}
              tk={tk}
              isDark={isDark}
            />
          </div>

          {/* Decor Rule */}
          <div className="space-y-2.5 py-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-2">
              <Palette size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Decor Rule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {DECOR_OPTIONS.map((opt) => {
                const isActive = policies.decorRule === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPolicyField("decorRule", opt.id)}
                    className="px-3.5 py-2.5 rounded-xl text-left transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    style={{
                      background: isActive ? tk.trackBg : tk.card,
                      border: isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                    }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: tk.text }}>{opt.label}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: tk.muted }}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smoking */}
          <div className="space-y-2.5 py-5" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-2">
              <Cigarette size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Smoking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SMOKING_OPTIONS.map((opt) => {
                const isActive = policies.smoking === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPolicyField("smoking", opt.id)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    style={{
                      background: isActive ? tk.trackBg : tk.card,
                      border: isActive ? `1.5px solid ${isDark ? "#ffffff" : "#0f172a"}` : `1px solid ${tk.border}`,
                      color: tk.text,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pets Allowed */}
          <div className="space-y-2.5 pt-5">
            <div className="flex items-center gap-2">
              <PawPrint size={14} style={{ color: tk.muted }} />
              <span className="text-[12.5px] font-semibold" style={{ color: tk.text }}>Pets Allowed</span>
            </div>
            <YesNoToggle
              value={policies.petsAllowed}
              onChange={(v) => setPolicyField("petsAllowed", v)}
              tk={tk}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <ShieldCheck size={11} style={{ color: theme.accent }} />
        Your cancellation policy and house rules are shown to guests before they confirm a booking.
      </div>
    </div>
  );
}
