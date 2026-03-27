"use client";

import { useState, useEffect } from "react";
import StepOverview from "./steps/StepOverview";
import StepRenderer from "./steps/StepRenderer";
import { steps, isStepCompleted } from "./steps/stepsConfig";
import { motion, AnimatePresence } from "framer-motion";

export default function ListingEditor() {
  const [activeStep, setActiveStep] = useState(null);

  const [form, setForm] = useState({
    title: "",
    capacity: "",
    location: "",
    price: "",
    termsAccepted: false,
    images: {},
  });

  // 🔥 PROGRESS (SAFE FIX)
  const requiredSteps = steps.filter((s) => s.required);

  const completedRequired = requiredSteps.filter((s) =>
    isStepCompleted?.(s.key, form)
  ).length;

  const progress =
    requiredSteps.length > 0
      ? Math.round((completedRequired / requiredSteps.length) * 100)
      : 0;

  // 🔥 NEXT STEP (SAFE FIX)
  const goNext = () => {
    if (!activeStep) return;

    const currentIndex = steps.findIndex((s) => s.key === activeStep);

    for (let i = currentIndex + 1; i < steps.length; i++) {
      if (!isStepCompleted?.(steps[i].key, form)) {
        setActiveStep(steps[i].key);
        return;
      }
    }

    setActiveStep(null); // done
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!activeStep ? (
          <motion.div key="overview">
            <StepOverview
              steps={steps}
              form={form}
              progress={progress}
              onSelect={setActiveStep}
            />
          </motion.div>
        ) : (
          <motion.div
            key="step"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            className="flex flex-col "
          >
            {/* HEADER */}
            <div className="backdrop-blur-xl bg-white/60 border-b border-b-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => setActiveStep(null)}>
                  ← Back
                </button>

                <span>{progress}%</span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-6 overflow-auto">
              {activeStep && (
                <StepRenderer
                  step={activeStep}
                  form={form}
                  setForm={setForm}
                />
              )}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-t-gray-200 bg-white">
              <button
                onClick={goNext}
                disabled={!isStepCompleted?.(activeStep, form)}
                className={`w-full py-3 rounded-xl
                ${
                  isStepCompleted?.(activeStep, form)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
