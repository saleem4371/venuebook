"use client";

import { motion } from "framer-motion";
import { WIZARD_STEPS } from "./wizardConfig";

/*
  Thin segmented progress bar — sits flush at the bottom of the header.
  Full-width, no constraints. 6 equal segments separated by 2px gaps.

  Done   → full gradient fill
  Active → 45 % fill (in-progress visual cue)
  Future → muted track
*/
export default function ProgressBar({ stepIndex }) {
  return (
    <div className="flex w-full gap-[2px]" aria-hidden="true">
      {WIZARD_STEPS.map((step, i) => {
        const done   = i < stepIndex;
        const active = i === stepIndex;

        return (
          <div
            key={step.key}
            className="flex-1 h-[3px] bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #a44bf3, #499ce8)" }}
              initial={false}
              animate={{ width: done ? "100%" : active ? "45%" : "0%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        );
      })}
    </div>
  );
}
