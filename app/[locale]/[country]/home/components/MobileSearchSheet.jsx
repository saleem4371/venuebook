"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, MagnifyingGlassIcon, MapPinIcon, CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import LocationAutoComplete from "./LocationAutoComplete";
import DatePicker           from "./DatePicker";
import GuestPicker          from "./GuestPicker";

import { useCategory }      from "@/context/CategoryContext";
import { CATEGORY_TINTS }   from "@/config/categoryConfig";

/* ── Per-category sheet config ─────────────────────────────────── */
const SHEET_CONFIG = {
  venues:      { title: "Find a Venue",      guestType: "guests",          dateMode: "single",   dateLabel: "Event Date"  },
  farmstays:   { title: "Find a Farmstay",   guestType: "guests_detailed", dateMode: "range",    dateLabel: "Check In → Out" },
  studios:     { title: "Book a Studio",     guestType: "attendees",       dateMode: "datetime", dateLabel: "Start Time"  },
  rentals:     { title: "Rent a Space",      guestType: "guests",          dateMode: "single",   dateLabel: "Event Date"  },
  workspaces:  { title: "Find a Workspace",  guestType: "attendees",       dateMode: "range",    dateLabel: "Start → End" },
  experiences: { title: "Find Experiences",  guestType: "guests",          dateMode: "single",   dateLabel: "Date"        },
};

const STEPS = ["where", "when", "who"];

function StepIcon({ step }) {
  if (step === "where") return <MapPinIcon   className="w-4 h-4" />;
  if (step === "when")  return <CalendarIcon className="w-4 h-4" />;
  return                       <UsersIcon    className="w-4 h-4" />;
}

export default function MobileSearchSheet({ open, setOpen }) {
  const { activeCategory }    = useCategory();
  const tint                  = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const config                = SHEET_CONFIG[activeCategory]   ?? SHEET_CONFIG.venues;

  const [step,      setStep]      = useState("where");
  const [location,  setLocation]  = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate,   setEndDate]   = useState(null);
  const [guests,    setGuests]    = useState({});

  const isRange    = config.dateMode === "range";
  const isDatetime = config.dateMode === "datetime";

  const hasLocation = !!location;
  const hasDate     = !!startDate;
  const isReady     = hasLocation && hasDate;

  const handleClear = () => {
    setLocation(""); setStartDate(null); setEndDate(null); setGuests({});
    setStep("where");
  };

  const stepActive = (s) => {
    const idx    = STEPS.indexOf(s);
    const curIdx = STEPS.indexOf(step);
    return idx === curIdx;
  };
  const stepDone = (s) => {
    if (s === "where") return hasLocation;
    if (s === "when")  return hasDate;
    return Object.keys(guests).length > 0;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998] md:hidden">

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute bottom-0 w-full h-[94svh] bg-white dark:bg-gray-900 rounded-t-3xl flex flex-col overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4 border-b border-gray-100 dark:border-white/[0.08] flex items-center justify-between">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">{config.title}</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="px-5 pt-4 pb-3 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => {
                      if (s === "where" || (s === "when" && hasLocation) || (s === "who" && hasDate)) {
                        setStep(s);
                      }
                    }}
                    className={[
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                      stepActive(s)
                        ? "text-white"
                        : stepDone(s)
                        ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                        : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-500",
                    ].join(" ")}
                    style={stepActive(s) ? { background: tint.hex } : {}}
                  >
                    <StepIcon step={s} />
                    {s === "where" ? "Where" : s === "when" ? "When" : "Who"}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              <AnimatePresence mode="wait">

                {/* WHERE */}
                {step === "where" && (
                  <motion.div
                    key="where"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4 pt-2"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                        Where are you looking?
                      </p>
                      {/* Location wrapped in a visible input-like container */}
                      <div className="flex items-center gap-2 border border-gray-200 dark:border-white/15 rounded-xl px-3 py-3 bg-white dark:bg-gray-800">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <LocationAutoComplete
                            category={activeCategory}
                            tint={tint}
                            placeholder="City or area"
                            textClass="text-gray-800 dark:text-white"
                            placeholderClass="placeholder-gray-400 dark:placeholder-white/35"
                            clearClass="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/80"
                          />
                        </div>
                      </div>
                    </div>

                    {location && (
                      <button
                        onClick={() => setStep("when")}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                        style={{ background: tint.hex }}
                      >
                        Next: When?
                      </button>
                    )}
                  </motion.div>
                )}

                {/* WHEN */}
                {step === "when" && (
                  <motion.div
                    key="when"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                    className="pt-2"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                      {config.dateLabel}
                    </p>

                    {/* Inline date picker trigger */}
                    <div className="border border-gray-200 dark:border-white/15 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                      <DatePicker
                        mode={config.dateMode}
                        tint={tint}
                        startDate={startDate}
                        endDate={endDate}
                        onChangeStart={(d) => {
                          setStartDate(d);
                          if (!isRange && !isDatetime) setStep("who");
                        }}
                        onChangeEnd={(d) => {
                          setEndDate(d);
                          if (isRange && d) setStep("who");
                        }}
                        placeholder={`Select ${config.dateLabel.toLowerCase()}`}
                        textClass="text-gray-800 dark:text-white"
                        placeholderClass="text-gray-400 dark:text-white/40"
                      />
                    </div>

                    {hasDate && (
                      <button
                        onClick={() => setStep("who")}
                        className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                        style={{ background: tint.hex }}
                      >
                        Next: Who?
                      </button>
                    )}
                  </motion.div>
                )}

                {/* WHO */}
                {step === "who" && (
                  <motion.div
                    key="who"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                    className="pt-2"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                      {config.guestType === "attendees" ? "Team size" : "Guests"}
                    </p>

                    <div className="border border-gray-200 dark:border-white/15 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                      <GuestPicker
                        type={config.guestType}
                        tint={tint}
                        onChange={setGuests}
                        textClass="text-gray-800 dark:text-white"
                        chevronClass="text-gray-400 dark:text-white/50"
                      />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.08] bg-white dark:bg-gray-900 flex items-center justify-between gap-4">
              <button
                onClick={handleClear}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                Clear all
              </button>

              <button
                onClick={() => setOpen(false)}
                disabled={!isReady}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: tint.hex, boxShadow: tint.activeGlow }}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
