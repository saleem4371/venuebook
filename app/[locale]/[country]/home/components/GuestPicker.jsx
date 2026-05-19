"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UsersIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

/* ── Guest field configs per category type ────────────────── */
const GUEST_CONFIGS = {
  guests: [
    { id: "guests", label: "Guests", sub: "Total attendees", min: 1, max: 5000, icon: "👥" },
  ],
  guests_detailed: [
    { id: "adults",   label: "Adults",   sub: "Ages 13+",      min: 1, max: 50, icon: "🧑" },
    { id: "children", label: "Children", sub: "Ages 2–12",     min: 0, max: 20, icon: "👦" },
    { id: "pets",     label: "Pets",     sub: "Service animals welcome", min: 0, max: 5, icon: "🐾" },
  ],
  attendees: [
    { id: "attendees", label: "Team Size", sub: "Attendees / members", min: 1, max: 500, icon: "💼" },
  ],
};

function buildDefault(type) {
  return Object.fromEntries(
    (GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests).map((f) => [f.id, f.id === "adults" || f.id === "guests" || f.id === "attendees" ? 1 : 0])
  );
}

function summarize(type, values) {
  const fields = GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests;
  const total  = fields.reduce((sum, f) => sum + (values[f.id] ?? 0), 0);
  if (type === "guests_detailed") {
    const adults   = values.adults   ?? 1;
    const children = values.children ?? 0;
    const pets     = values.pets     ?? 0;
    const parts    = [`${adults} adult${adults !== 1 ? "s" : ""}`];
    if (children) parts.push(`${children} child${children !== 1 ? "ren" : ""}`);
    if (pets)     parts.push(`${pets} pet${pets !== 1 ? "s" : ""}`);
    return parts.join(", ");
  }
  if (type === "attendees") return `${values.attendees ?? 1} attendee${(values.attendees ?? 1) !== 1 ? "s" : ""}`;
  return `${values.guests ?? 1} guest${(values.guests ?? 1) !== 1 ? "s" : ""}`;
}

export default function GuestPicker({ type = "guests", tint, onChange, placeholder, textClass, chevronClass }) {
  const [open,   setOpen]   = useState(false);
  const [values, setValues] = useState(() => buildDefault(type));
  const ref                 = useRef(null);

  const fields = GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests;

  /* Reset when type changes */
  useEffect(() => {
    setValues(buildDefault(type));
  }, [type]);

  /* Outside click close */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const adjust = (id, delta, min, max) => {
    setValues((prev) => {
      const next = { ...prev, [id]: Math.max(min, Math.min(max, (prev[id] ?? 0) + delta)) };
      onChange?.(next);
      return next;
    });
  };

  const summary = summarize(type, values);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 bg-transparent text-sm outline-none text-start ${textClass ?? "text-white"}`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${chevronClass ?? "text-white/50"}`}
        />
      </button>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{   opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              background:       "rgba(12,12,18,0.97)",
              border:           `1px solid ${tint?.activeBorder ?? tint?.border ?? "rgba(255,255,255,0.18)"}`,
              boxShadow:        `0 20px 56px rgba(0,0,0,0.6), ${tint?.activeGlow ?? tint?.glow ?? "0 0 20px rgba(255,255,255,0.06)"}`,
              insetInlineStart: 0,
            }}
            className="absolute top-full mt-3 min-w-[270px] z-[9999] rounded-2xl backdrop-blur-2xl p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-3">
              {type === "guests_detailed" ? "Who's coming?" : type === "attendees" ? "Team size" : "Guests"}
            </p>

            <div className="flex flex-col gap-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg leading-none shrink-0">{field.icon}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium leading-snug break-words">{field.label}</p>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed break-words">{field.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => adjust(field.id, -1, field.min, field.max)}
                      disabled={(values[field.id] ?? 0) <= field.min}
                      className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:border-white/40 hover:bg-white/10 transition"
                    >
                      <ChevronDownIcon className="w-3 h-3" />
                    </button>
                    <span className="text-white font-semibold text-sm w-5 text-center tabular-nums">
                      {values[field.id] ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjust(field.id, +1, field.min, field.max)}
                      disabled={(values[field.id] ?? 0) >= field.max}
                      className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:border-white/40 hover:bg-white/10 transition"
                    >
                      <ChevronUpIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: tint?.hex ?? "#7c3aed" }}
              className="mt-4 w-full py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
