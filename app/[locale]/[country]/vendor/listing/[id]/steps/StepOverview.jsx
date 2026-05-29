"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight,
  Camera, FileText, Tag, Package,
  Users, Sparkles, MapPin, DollarSign,
  Shield, Settings2,
} from "lucide-react";
import { isStepCompleted } from "./stepsConfig";
import { getCategoryTheme } from "./categoryTheme";

const STEP_META = {
  photo:     { Icon: Camera,     desc: "Upload thumbnail, banner & category gallery images" },
  basic:     { Icon: FileText,   desc: "Venue name, description and category type"          },
  tags:      { Icon: Tag,        desc: "Keywords and categories for discoverability"         },
  addons:    { Icon: Package,    desc: "Extra services and add-on offerings"                 },
  capacity:  { Icon: Users,      desc: "Minimum and maximum guest capacity"                  },
  amenities: { Icon: Sparkles,   desc: "Facilities and features available at the venue"      },
  location:  { Icon: MapPin,     desc: "Full address and location details"                   },
  pricing:   { Icon: DollarSign, desc: "Shift timings and pricing configuration"             },
  terms:     { Icon: Shield,     desc: "Review and accept terms and conditions"              },
};

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════ */

function tokens(isDark) {
  return {
    card:    isDark ? "#0f172a"                 : "#ffffff",
    border:  isDark ? "rgba(255,255,255,0.10)"  : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                 : "#0f172a",
    muted:   isDark ? "#94a3b8"                 : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)"  : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.07)",
  };
}

/* ══════════════════════════════════════════════════════════════════════
   STEP OVERVIEW
   Props:
     steps      — array of step objects from stepsConfig
     form       — current form state
     progress   — 0-100 required completion %
     onSelect   — fn(stepKey) called when user picks a step
     isDark     — boolean passed from parent (no re-detection needed)
     compact    — when true: hides page header + progress hero
                  (they live in the sidebar on desktop, or the parent
                  renders them on mobile)
══════════════════════════════════════════════════════════════════════ */

export default function StepOverview({
  steps,
  form,
  progress,
  onSelect,
  isDark    = true,
  compact   = false,
  category  = "venues",
}) {
  const router = useRouter();

  const requiredSteps  = steps.filter((s) => s.required);
  const completedCount = steps.filter((s) => isStepCompleted(s.key, form)).length;
  const reqCompleted   = requiredSteps.filter((s) => isStepCompleted(s.key, form)).length;
  const allCompleted   = reqCompleted === requiredSteps.length;

  const circumference = 2 * Math.PI * 30;
  const tk    = tokens(isDark);
  const theme = getCategoryTheme(category);

  return (
    <div className="w-full">

      {/* ── Page header (non-compact / mobile-full only) ── */}
      {!compact && (
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-colors"
              style={{ color: tk.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tk.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.muted)}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h1 className="text-[21px] font-bold tracking-tight" style={{ color: tk.text }}>
                Create your listing
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: tk.dimmed }}>
                Complete all required steps to go live
              </p>
            </div>
          </div>
          {/* Settings access moved to sidebar Settings tab */}
        </div>
      )}

      {/* ── Progress hero (non-compact only) ── */}
      {!compact && (
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: allCompleted
              ? "rgba(16,185,129,0.06)"
              : isDark ? `${theme.ring}0.06)` : `${theme.ring}0.04)`,
            border: allCompleted
              ? "1px solid rgba(16,185,129,0.18)"
              : `1px solid ${theme.ring}0.18)`,
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: allCompleted
                ? "radial-gradient(ellipse at 90% 10%, rgba(16,185,129,0.10) 0%, transparent 58%)"
                : `radial-gradient(ellipse at 90% 10%, ${theme.ring}0.10) 0%, transparent 58%)`,
            }}
          />

          <div className="relative flex flex-wrap items-center gap-6">

            {/* SVG ring */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <defs>
                  <linearGradient id="brand-ov-hero" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={theme.accent} />
                    <stop offset="100%" stopColor="#499ce8" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="30" fill="none" strokeWidth="6"
                  stroke={allCompleted ? "rgba(16,185,129,0.18)" : `${theme.ring}0.18)`} />
                <circle
                  cx="36" cy="36" r="30" fill="none" strokeWidth="6"
                  stroke={allCompleted ? "#10b981" : "url(#brand-ov-hero)"}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[13px] font-black tabular-nums"
                style={{ color: allCompleted ? "#10b981" : theme.accent }}
              >
                {progress}%
              </span>
            </div>

            {/* Stats + mini bar */}
            <div className="flex-1 min-w-[150px]">
              <p className="text-[15px] font-bold mb-1" style={{ color: tk.text }}>
                {allCompleted
                  ? "All required steps complete!"
                  : `${reqCompleted} of ${requiredSteps.length} required steps done`}
              </p>
              <p className="text-[12px] mb-4" style={{ color: tk.dimmed }}>
                {completedCount} of {steps.length} total steps completed
              </p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: tk.trackBg }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${progress}%`,
                    background: allCompleted ? "linear-gradient(90deg,#10b981,#34d399)" : theme.gradient,
                  }}
                />
              </div>
            </div>

            {/* Continue CTA */}
            {!allCompleted && (
              <button
                onClick={() => {
                  const next = steps.find((s) => !isStepCompleted(s.key, form));
                  if (next) onSelect(next.key);
                }}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-all active:scale-[0.97]"
                style={{ background: theme.gradient, boxShadow: `0 2px 18px ${theme.ring}0.40)` }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Continue
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ Step card grid ══════════════════════════════════════════ */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, i) => {
          const completed = isStepCompleted(step.key, form);
          const meta      = STEP_META[step.key] ?? { Icon: Settings2, desc: "" };
          const { Icon }  = meta;

          return (
            <motion.button
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18 }}
              onClick={() => onSelect(step.key)}
              className="text-left p-5 rounded-2xl cursor-pointer transition-all duration-200 group"
              style={{
                background: completed
                  ? isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)"
                  : tk.card,
                border: completed
                  ? "1px solid rgba(16,185,129,0.18)"
                  : `1px solid ${tk.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform   = "translateY(-2px)";
                e.currentTarget.style.boxShadow   = completed
                  ? "0 8px 24px rgba(16,185,129,0.12)"
                  : isDark
                    ? `0 8px 28px ${theme.ring}0.16)`
                    : `0 8px 24px ${theme.ring}0.10)`;
                e.currentTarget.style.borderColor = completed
                  ? "rgba(16,185,129,0.30)"
                  : `${theme.ring}0.38)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform   = "";
                e.currentTarget.style.boxShadow   = "";
                e.currentTarget.style.borderColor = completed
                  ? "rgba(16,185,129,0.18)"
                  : tk.border;
              }}
            >

              {/* Top row: icon + status badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: completed
                      ? "rgba(16,185,129,0.12)"
                      : isDark ? `${theme.ring}0.12)` : `${theme.ring}0.08)`,
                    border: completed
                      ? "1px solid rgba(16,185,129,0.22)"
                      : `1px solid ${theme.ring}0.22)`,
                  }}
                >
                  <Icon size={16} style={{ color: completed ? "#10b981" : theme.accent }} />
                </div>

                {completed ? (
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.10)",
                      border:     "1px solid rgba(16,185,129,0.22)",
                      color:      "#6ee7b7",
                    }}
                  >
                    <Check size={9} strokeWidth={3} />
                    Done
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={step.required
                      ? {
                          background: "rgba(239,68,68,0.09)",
                          border:     "1px solid rgba(239,68,68,0.17)",
                          color:      "rgba(252,165,165,0.85)",
                        }
                      : {
                          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          border:     `1px solid ${tk.border}`,
                          color:      tk.muted,
                        }
                    }
                  >
                    {step.required ? "Required" : "Optional"}
                  </span>
                )}
              </div>

              {/* Step title */}
              <h3 className="text-[14px] font-bold mb-1.5 leading-snug" style={{ color: tk.text }}>
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[12px] leading-snug mb-5" style={{ color: tk.muted }}>
                {meta.desc}
              </p>

              {/* Bottom CTA */}
              <div
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: completed ? "rgba(110,231,183,0.72)" : `${theme.ring}0.82)` }}
              >
                {completed ? "Edit" : "Start"}
                <ChevronRight
                  size={13}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </div>

            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
