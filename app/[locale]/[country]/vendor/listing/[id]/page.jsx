"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, SkipForward } from "lucide-react";
import StepOverview from "./steps/StepOverview";
import StepRenderer from "./steps/StepRenderer";
import { steps, isStepCompleted } from "./steps/stepsConfig";

export default function ListingEditor() {
  const [activeStep, setActiveStep] = useState(null);

  const [form, setForm] = useState({
    title:        "",
    description:  "",
    category:     "",
    minCapacity:  0,
    maxCapacity:  0,
    address:      "",
    city:         "",
    state:        "",
    pincode:      "",
    country:      "India",
    pricing:      {},
    termsAccepted: false,
    thumbnail:    null,
    banner:       null,
    categories:   [],
  });

  // ── Progress ─────────────────────────────────────────────────────
  const requiredSteps     = steps.filter((s) => s.required);
  const completedRequired = requiredSteps.filter((s) =>
    isStepCompleted(s.key, form)
  ).length;
  const progress = requiredSteps.length > 0
    ? Math.round((completedRequired / requiredSteps.length) * 100)
    : 0;

  // ── Active step derived state ─────────────────────────────────────
  const activeStepObj = steps.find((s) => s.key === activeStep);
  const stepIndex     = steps.findIndex((s) => s.key === activeStep);
  const stepDone      = activeStep ? isStepCompleted(activeStep, form) : false;
  const isOptional    = activeStepObj?.required === false;

  // ── Navigation ───────────────────────────────────────────────────
  const goNext = () => {
    if (!activeStep) return;
    const currentIndex = steps.findIndex((s) => s.key === activeStep);
    for (let i = currentIndex + 1; i < steps.length; i++) {
      if (!isStepCompleted(steps[i].key, form)) {
        setActiveStep(steps[i].key);
        return;
      }
    }
    setActiveStep(null); // all remaining steps done → back to overview
  };

  const goSkip = () => {
    const currentIndex = steps.findIndex((s) => s.key === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].key);
    } else {
      setActiveStep(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>
      <AnimatePresence mode="wait">

        {/* ─── OVERVIEW ─── */}
        {!activeStep ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <StepOverview
              steps={steps}
              form={form}
              progress={progress}
              onSelect={setActiveStep}
            />
          </motion.div>

        ) : (

          /* ─── STEP FORM ─── */
          <motion.div
            key={activeStep}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0,  opacity: 1 }}
            exit={{   x: -60, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col min-h-[calc(100vh-160px)]"
          >

            {/* ── Sticky header ── */}
            <div
              className="sticky top-0 z-10 px-5 py-4"
              style={{
                background:           "rgba(3,7,18,0.84)",
                backdropFilter:       "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom:         "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Row 1: back + step counter + progress % */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setActiveStep(null)}
                  className="flex items-center gap-1.5 text-[13px] text-white/38 hover:text-white/78 transition-colors cursor-pointer font-medium"
                >
                  <ArrowLeft size={15} />
                  Overview
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/22 font-medium tabular-nums">
                    Step {stepIndex + 1} of {steps.length}
                  </span>
                  <span
                    className="text-[12px] font-black tabular-nums px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      border:     "1px solid rgba(124,58,237,0.22)",
                      color:      "#a78bfa",
                    }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Row 2: step title */}
              <p className="text-[15px] font-bold text-white mb-3">
                {activeStepObj?.title}
              </p>

              {/* Row 3: gradient progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #6366f1)" }}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* ── Content area ── */}
            <div className="flex-1 px-5 py-8 overflow-auto">
              <StepRenderer
                step={activeStep}
                form={form}
                setForm={setForm}
              />
            </div>

            {/* ── Sticky footer ── */}
            <div
              className="sticky bottom-0 px-5 py-4"
              style={{
                background:           "rgba(3,7,18,0.92)",
                backdropFilter:       "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop:            "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-3 max-w-sm ml-auto">

                {/* Skip — only for optional steps that aren't complete */}
                {isOptional && !stepDone && (
                  <button
                    onClick={goSkip}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[12px] text-white/28 hover:text-white/55 hover:bg-white/[0.04] transition-all cursor-pointer font-medium"
                  >
                    Skip
                    <SkipForward size={13} />
                  </button>
                )}

                {/* Primary CTA */}
                <button
                  onClick={goNext}
                  disabled={!stepDone && !isOptional}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]"
                  style={
                    stepDone || isOptional
                      ? {
                          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          color:      "#fff",
                          boxShadow:  "0 2px 16px rgba(124,58,237,0.40)",
                          cursor:     "pointer",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          color:      "rgba(255,255,255,0.20)",
                          cursor:     "not-allowed",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (stepDone || isOptional)
                      e.currentTarget.style.opacity = "0.88";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {stepDone
                    ? "Save & Continue"
                    : isOptional
                    ? "Skip this step"
                    : "Complete to continue"}
                  {(stepDone || isOptional) && <ChevronRight size={15} />}
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
