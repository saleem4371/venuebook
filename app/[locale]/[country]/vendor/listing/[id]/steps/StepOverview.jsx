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
import VenueSettingsButton from "../../components/VenueSettingsButton";

/* ══════════════════════════════════════════════════════════════════════
   STEP META — icon + short description per step key
══════════════════════════════════════════════════════════════════════ */

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
   STEP OVERVIEW
══════════════════════════════════════════════════════════════════════ */

export default function StepOverview({ steps, form, progress, onSelect }) {
  const router = useRouter();

  const requiredSteps  = steps.filter((s) => s.required);
  const completedCount = steps.filter((s) => isStepCompleted(s.key, form)).length;
  const reqCompleted   = requiredSteps.filter((s) => isStepCompleted(s.key, form)).length;
  const allCompleted   = reqCompleted === requiredSteps.length;

  const circumference = 2 * Math.PI * 30;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] text-white/38 hover:text-white/78 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="text-[21px] font-bold text-white tracking-tight">
              Create your listing
            </h1>
            <p className="text-[12px] text-white/25 mt-0.5">
              Complete all required steps to go live
            </p>
          </div>
        </div>
        <VenueSettingsButton progress={progress} allComplete={allCompleted} />
      </div>

      {/* Progress hero card */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background:           allCompleted ? "rgba(16,185,129,0.06)"  : "rgba(124,58,237,0.06)",
          backdropFilter:       "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: allCompleted
            ? "1px solid rgba(16,185,129,0.18)"
            : "1px solid rgba(124,58,237,0.18)",
          boxShadow: allCompleted
            ? "0 0 40px rgba(16,185,129,0.06)"
            : "0 0 40px rgba(124,58,237,0.07)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: allCompleted
              ? "radial-gradient(ellipse at 90% 10%, rgba(16,185,129,0.10) 0%, transparent 58%)"
              : "radial-gradient(ellipse at 90% 10%, rgba(124,58,237,0.10) 0%, transparent 58%)",
          }}
        />

        <div className="relative flex flex-wrap items-center gap-6">

          {/* SVG progress ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36" cy="36" r="30" fill="none" strokeWidth="6"
                stroke={allCompleted ? "rgba(16,185,129,0.18)" : "rgba(124,58,237,0.18)"}
              />
              <circle
                cx="36" cy="36" r="30" fill="none" strokeWidth="6"
                stroke={allCompleted ? "#10b981" : "#7c3aed"}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-[13px] font-black tabular-nums"
              style={{ color: allCompleted ? "#10b981" : "#a78bfa" }}
            >
              {progress}%
            </span>
          </div>

          {/* Stats + mini bar */}
          <div className="flex-1 min-w-[150px]">
            <p className="text-[15px] font-bold text-white mb-1">
              {allCompleted
                ? "All required steps complete!"
                : `${reqCompleted} of ${requiredSteps.length} required steps done`}
            </p>
            <p className="text-[12px] text-white/28 mb-4">
              {completedCount} of {steps.length} total steps completed
            </p>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: allCompleted
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #7c3aed, #6366f1)",
                }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
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
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow:  "0 2px 14px rgba(124,58,237,0.40)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Continue
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Step card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, i) => {
          const completed = isStepCompleted(step.key, form);
          const meta      = STEP_META[step.key] ?? { Icon: Settings2, desc: "" };
          const { Icon }  = meta;

          return (
            <motion.button
              key={step.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              onClick={() => onSelect(step.key)}
              className="text-left p-5 rounded-2xl cursor-pointer transition-all duration-200 group"
              style={{
                background:           completed ? "rgba(16,185,129,0.05)"          : "rgba(255,255,255,0.025)",
                border:               completed ? "1px solid rgba(16,185,129,0.16)" : "1px solid rgba(255,255,255,0.07)",
                backdropFilter:       "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform   = "translateY(-2px)";
                e.currentTarget.style.boxShadow   = completed
                  ? "0 8px 28px rgba(16,185,129,0.12)"
                  : "0 8px 28px rgba(124,58,237,0.13)";
                e.currentTarget.style.borderColor = completed
                  ? "rgba(16,185,129,0.28)"
                  : "rgba(124,58,237,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform   = "";
                e.currentTarget.style.boxShadow   = "";
                e.currentTarget.style.borderColor = completed
                  ? "rgba(16,185,129,0.16)"
                  : "rgba(255,255,255,0.07)";
              }}
            >
              {/* Top row: icon + status badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: completed ? "rgba(16,185,129,0.12)" : "rgba(124,58,237,0.12)",
                    border:     completed ? "1px solid rgba(16,185,129,0.20)" : "1px solid rgba(124,58,237,0.20)",
                  }}
                >
                  <Icon size={16} style={{ color: completed ? "#10b981" : "#a78bfa" }} />
                </div>

                {completed ? (
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.10)",
                      border:     "1px solid rgba(16,185,129,0.20)",
                      color:      "#6ee7b7",
                    }}
                  >
                    <Check size={9} strokeWidth={3} />
                    Done
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={
                      step.required
                        ? {
                            background: "rgba(239,68,68,0.09)",
                            border:     "1px solid rgba(239,68,68,0.17)",
                            color:      "rgba(252,165,165,0.85)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border:     "1px solid rgba(255,255,255,0.09)",
                            color:      "rgba(255,255,255,0.28)",
                          }
                    }
                  >
                    {step.required ? "Required" : "Optional"}
                  </span>
                )}
              </div>

              {/* Step title */}
              <h3 className="text-[14px] font-bold text-white mb-1.5 leading-snug">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[12px] text-white/30 leading-snug mb-5">
                {meta.desc}
              </p>

              {/* Bottom CTA */}
              <div
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: completed ? "rgba(110,231,183,0.68)" : "rgba(167,139,250,0.68)" }}
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
