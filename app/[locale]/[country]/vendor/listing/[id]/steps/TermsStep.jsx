"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, ChevronDown, ShieldCheck, Circle } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* Coloured status dot — replaces emoji indicators */
function StatusDot({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" fill={color} opacity="0.18" />
      <circle cx="6" cy="6" r="3" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE COPY
───────────────────────────────────────────────────────────────────────────── */
const TERMS_COPY = {
  venues: {
    heading:  "Terms & Conditions",
    subtitle: "Set your cancellation policy and house rules for guests.",
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
───────────────────────────────────────────────────────────────────────────── */
const CANCELLATION_POLICIES = [
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
    popular:  true,
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
    inputBg: isDark ? "#0d1526"                : "#ffffff",
    inputBd: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function TermsStep({ form, setForm, category = "venues" }) {
  const [isDark, setIsDark] = useState(true);
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

  const selectedPolicy   = form.cancellationPolicy || "";
  const houseRules       = form.houseRules          || "";
  const termsAccepted    = form.termsAccepted        === true;

  const setPolicy  = (id)   => setForm({ ...form, cancellationPolicy: id });
  const setRules   = (val)  => setForm({ ...form, houseRules: val });
  const setAccepted= (val)  => setForm({ ...form, termsAccepted: val });

  const INPUT_CLS = "w-full px-4 py-3 rounded-xl text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20 resize-none";
  const inputStyle = () => ({
    background: tk.inputBg,
    border:     `1px solid ${tk.inputBd}`,
    color:      tk.text,
  });

  const allComplete = !!selectedPolicy && termsAccepted;

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

            return (
              <div
                key={policy.id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: isActive ? `${theme.ring}0.06)` : tk.cardAlt,
                  border:     `1px solid ${isActive ? `${theme.ring}0.35)` : tk.border}`,
                }}
              >
                {/* Header row */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <StatusDot color={policy.dotColor} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: isActive ? theme.accent : tk.text }}>
                        {policy.label}
                      </span>
                      {policy.popular && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: `${theme.ring}0.15)`, color: theme.accent }}
                        >
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: tk.muted }}>{policy.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand detail */}
                    <button
                      type="button"
                      onClick={() => setExpandedPolicy(isExpanded ? null : policy.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: tk.dimmed }}
                    >
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} />
                      </motion.div>
                    </button>

                    {/* Select radio */}
                    <button
                      type="button"
                      onClick={() => { setPolicy(policy.id); setTouched(true); }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150"
                      style={{
                        borderColor: isActive ? theme.accent : tk.border,
                        background:  isActive ? theme.accent : "transparent",
                      }}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-[12px] leading-relaxed" style={{ color: tk.muted }}>
                          {policy.detail}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── House / Studio / Workspace Rules ── */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold" style={{ color: tk.text }}>
          {copy.rulesLabel}
          <span className="ml-2 text-[11px] font-normal" style={{ color: tk.dimmed }}>(optional)</span>
        </label>
        <textarea
          value={houseRules}
          onChange={(e) => setRules(e.target.value)}
          rows={4}
          maxLength={800}
          placeholder={copy.rulesPlaceholder}
          className={INPUT_CLS}
          style={inputStyle()}
        />
        <div className="flex justify-end">
          <span className="text-[11px] tabular-nums" style={{ color: tk.dimmed }}>
            {houseRules.length} / 800
          </span>
        </div>
      </div>

      {/* ── Platform Terms ── */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} style={{ color: theme.accent }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: tk.text }}>Platform Agreement</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: tk.muted }}>
              By listing on VenueBook, you agree to our{" "}
              <span style={{ color: theme.accent, cursor: "pointer" }}>Host Terms of Service</span>,{" "}
              <span style={{ color: theme.accent, cursor: "pointer" }}>Non-Discrimination Policy</span>, and{" "}
              <span style={{ color: theme.accent, cursor: "pointer" }}>Community Guidelines</span>.
              You confirm that the information in this listing is accurate and up to date.
            </p>
          </div>
        </div>

        {/* Acceptance checkbox */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setAccepted(!termsAccepted)}
          className="flex items-start gap-3 w-full text-left"
        >
          <div
            className="mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
            style={{
              borderColor: termsAccepted ? theme.accent : touched && !termsAccepted ? "#f87171" : tk.border,
              background:  termsAccepted ? theme.accent : "transparent",
            }}
          >
            <AnimatePresence>
              {termsAccepted && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={11} strokeWidth={3} style={{ color: "#fff" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[13px] font-medium leading-relaxed" style={{ color: tk.text }}>
            I confirm that I have read and agree to VenueBook's Host Terms of Service, and all information in this listing is accurate.
          </span>
        </motion.button>

        {/* Terms error */}
        <AnimatePresence>
          {touched && !termsAccepted && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 ml-8"
            >
              <AlertCircle size={12} style={{ color: "#f87171" }} />
              <span className="text-[12px]" style={{ color: "#f87171" }}>You must accept the terms to continue</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── All complete confirmation ── */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl"
            style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.22)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(52,211,153,0.12)" }}
            >
              <ShieldCheck size={18} style={{ color: "#34d399" }} />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: "#34d399" }}>All set!</p>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(52,211,153,0.75)" }}>
                Cancellation policy selected · Terms accepted · Your listing is ready to publish.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <ShieldCheck size={11} style={{ color: theme.accent }} />
        Your cancellation policy and house rules are shown to guests before they confirm a booking.
      </div>
    </div>
  );
}
