"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY OPTIONS
───────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "banquet",    name: "Banquet Hall",       icon: "🏛️",  desc: "Grand halls for weddings & galas" },
  { id: "conference", name: "Conference Center",  icon: "🏢",  desc: "Corporate meetings & summits" },
  { id: "resort",     name: "Resorts",            icon: "🏝️",  desc: "Retreat & leisure experiences" },
  { id: "hotel",      name: "Hotels",             icon: "🏨",  desc: "Luxury stay & dining packages" },
  { id: "villa",      name: "Villas",             icon: "🏡",  desc: "Intimate private celebrations" },
  { id: "farm",       name: "Farmhouse",          icon: "🌿",  desc: "Open air & nature settings" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM BASIC DETAILS STEP
───────────────────────────────────────────────────────────────────────────── */
export default function BasicStep({ form, setForm }) {
  const [touched, setTouched] = useState({});

  const isTitleValid    = (form.title?.length ?? 0) > 3;
  const isDescValid     = (form.description?.length ?? 0) > 10;
  const isCategoryValid = !!form.category;

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white leading-tight">Basic Details</h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
          Give your venue a compelling name and description that attracts guests.
        </p>
      </div>

      {/* ── Venue Name ── */}
      <FieldGroup
        label="Venue Name"
        required
        hint={`${form.title?.length ?? 0} / 50`}
        error={touched.title && !isTitleValid ? "Minimum 4 characters required" : null}
        valid={isTitleValid}
      >
        <input
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onBlur={() => touch("title")}
          maxLength={50}
          placeholder="e.g. The Grand Coastal Pavilion"
          className={inputClass(touched.title && !isTitleValid, isTitleValid)}
        />
      </FieldGroup>

      {/* ── Description ── */}
      <FieldGroup
        label="About the Venue"
        required
        hint={`${form.description?.length ?? 0} / 500`}
        error={touched.description && !isDescValid ? "Minimum 10 characters required" : null}
        valid={isDescValid}
      >
        <textarea
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          onBlur={() => touch("description")}
          maxLength={500}
          rows={5}
          placeholder="Describe the ambience, unique features, and what makes your venue special…"
          className={`${inputClass(touched.description && !isDescValid, isDescValid)} resize-none`}
        />
      </FieldGroup>

      {/* ── Category ── */}
      <FieldGroup
        label="Venue Category"
        required
        error={touched.category && !isCategoryValid ? "Please select a category" : null}
        valid={isCategoryValid}
      >
        <div
          onClick={() => touch("category")}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1"
        >
          {CATEGORIES.map((cat) => {
            const isActive = form.category === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setForm({ ...form, category: cat.id })}
                className={`
                  relative flex flex-col items-start gap-1.5 p-4 rounded-2xl
                  border text-left transition-all duration-200 cursor-pointer
                  ${isActive
                    ? "bg-violet-50 dark:bg-violet-500/10 border-violet-400 dark:border-violet-500/50 shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
                    : "bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.07] hover:border-violet-200 dark:hover:border-violet-500/25 hover:bg-violet-50/30 dark:hover:bg-violet-500/5"
                  }
                `}
              >
                {/* Active check */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center"
                    >
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="text-2xl leading-none">{cat.icon}</span>
                <span className={`text-[13px] font-bold leading-tight ${isActive ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>
                  {cat.name}
                </span>
                <span className={`text-[10.5px] leading-snug ${isActive ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {cat.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </FieldGroup>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function inputClass(hasError, isValid) {
  return `
    w-full px-4 py-3 rounded-xl text-[14px]
    bg-gray-50 dark:bg-white/[0.04]
    border text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-600
    outline-none transition-all duration-200
    ${hasError
      ? "border-red-400 dark:border-red-500/60 ring-2 ring-red-400/20 dark:ring-red-500/20"
      : isValid
      ? "border-emerald-400 dark:border-emerald-500/50 ring-2 ring-emerald-400/15 dark:ring-emerald-500/15"
      : "border-gray-200 dark:border-white/[0.08] focus:border-violet-400 dark:focus:border-violet-500/60 focus:ring-2 focus:ring-violet-400/20"
    }
  `;
}

function FieldGroup({ label, required, hint, error, valid, children }) {
  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-violet-500 ml-1">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">{hint}</span>}
      </div>

      {children}

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5"
          >
            <AlertCircle size={12} className="text-red-400 shrink-0" />
            <span className="text-[12px] text-red-500 dark:text-red-400">{error}</span>
          </motion.div>
        ) : valid ? (
          <motion.div
            key="valid"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5"
          >
            <Check size={12} strokeWidth={3} className="text-emerald-500 shrink-0" />
            <span className="text-[12px] text-emerald-600 dark:text-emerald-400">Looks good</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
