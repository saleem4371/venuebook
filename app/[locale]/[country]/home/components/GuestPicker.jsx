"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

/* ── Guest field configs ──────────────────────────────────────
 *
 *  guests          → Venues: single total count (manual input allowed)
 *  guests_detailed → Farmstay / Rentals: adults+children+infants+pets
 *  attendees       → Studios / Workspaces: team size
 */
const GUEST_CONFIGS = {
  guests: [
    { id: "guests", label: "Guests", sub: "Total attendees", min: 1, max: 5000, icon: "👥" },
  ],
  guests_detailed: [
    { id: "adults",   label: "Adults",   sub: "Ages 13+",               min: 1, max: 100, icon: "🧑" },
    { id: "children", label: "Children", sub: "Ages 2–12",              min: 0, max: 20,  icon: "👦" },
    { id: "infants",  label: "Infants",  sub: "Under 2 · no seat",      min: 0, max: 5,   icon: "🍼" },
    { id: "pets",     label: "Pets",     sub: "Service animals welcome", min: 0, max: 5,   icon: "🐾" },
  ],
  attendees: [
    { id: "attendees", label: "Team Size", sub: "Attendees / members", min: 1, max: 500, icon: "💼" },
  ],
};

function buildDefault(type) {
  return Object.fromEntries(
    (GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests).map((f) => [
      f.id,
      f.id === "adults" || f.id === "guests" || f.id === "attendees" ? 1 : 0,
    ])
  );
}

function summarize(type, values) {
  if (type === "attendees") {
    const n = values.attendees ?? 1;
    return `${n} attendee${n !== 1 ? "s" : ""}`;
  }
  if (type === "guests") {
    const n = values.guests ?? 1;
    return `${n} guest${n !== 1 ? "s" : ""}`;
  }
  const adults   = values.adults   ?? 1;
  const children = values.children ?? 0;
  const infants  = values.infants  ?? 0;
  const pets     = values.pets     ?? 0;
  const parts    = [`${adults} adult${adults !== 1 ? "s" : ""}`];
  if (children) parts.push(`${children} child${children !== 1 ? "ren" : ""}`);
  if (infants)  parts.push(`${infants} infant${infants !== 1 ? "s" : ""}`);
  if (pets)     parts.push(`${pets} pet${pets !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

/* ── Individual stepper row ───────────────────────────────────
 *  allowInput=true  → clicking the count opens a text input (venues only)
 *  allowInput=false → count shown wider, no text entry
 *  lightMode=true   → dark text for light backgrounds (mobile sheet)
 */
function StepRow({ field, value, onChange, allowInput = false, lightMode = false }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState("");
  const inputRef              = useRef(null);

  const atMin = value <= field.min;
  const atMax = value >= field.max;
  const clamp = (v) => Math.max(field.min, Math.min(field.max, v));

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };
  const commitEdit = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n)) onChange(clamp(n));
    setEditing(false);
  };

  const labelClass = lightMode ? "text-gray-800 dark:text-white"   : "text-white";
  const subClass   = lightMode ? "text-gray-400 dark:text-white/40" : "text-white/40";
  const btnClass   = lightMode
    ? "border-gray-300 dark:border-white/20 text-gray-600 dark:text-white hover:border-gray-400 dark:hover:border-white/50 hover:bg-gray-100 dark:hover:bg-white/10"
    : "border-white/20 text-white hover:border-white/50 hover:bg-white/10";
  const countClass = lightMode ? "text-gray-800 dark:text-white"   : "text-white";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.07] last:border-0">
      <div className="min-w-0 pe-3">
        <p className={`text-sm font-semibold leading-snug ${labelClass}`}>{field.label}</p>
        <p className={`text-[11px] mt-0.5 ${subClass}`}>{field.sub}</p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Decrement */}
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={atMin}
          className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-25 active:scale-90 transition-all ${btnClass}`}
          aria-label={`Decrease ${field.label}`}
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>

        {/* Count — editable for venues only */}
        {allowInput && editing ? (
          <input
            ref={inputRef}
            type="number"
            value={draft}
            min={field.min}
            max={field.max}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter")  { e.preventDefault(); commitEdit(); }
              if (e.key === "Escape") { setEditing(false); }
            }}
            className="w-14 text-center bg-white/10 border border-white/30 rounded-lg text-white text-sm font-bold tabular-nums outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : allowInput ? (
          <button
            type="button"
            onClick={startEdit}
            className={`min-w-[2.75rem] text-center font-bold text-sm tabular-nums rounded-lg py-0.5 transition hover:bg-white/10 ${countClass}`}
            title="Click to type a number"
          >
            {value}
          </button>
        ) : (
          <span className={`min-w-[2.75rem] text-center font-bold text-sm tabular-nums ${countClass}`}>
            {value}
          </span>
        )}

        {/* Increment */}
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={atMax}
          className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-25 active:scale-90 transition-all ${btnClass}`}
          aria-label={`Increase ${field.label}`}
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function GuestPicker({
  type        = "guests",
  tint,
  onChange,
  textClass,
  chevronClass,
  /** When true, renders steppers inline (no trigger/popup). Used in MobileSearchSheet. */
  inline      = false,
  /**
   * Placeholder text shown in the trigger BEFORE the user has made a selection.
   * When omitted the trigger shows the computed summary immediately (existing behaviour).
   */
  placeholder,
  /** When true, popup uses white bg in light mode / dark bg in dark mode. */
  lightMode   = false,
}) {
  const [open,          setOpen]          = useState(false);
  const [values,        setValues]        = useState(() => buildDefault(type));
  const [hasInteracted, setHasInteracted] = useState(false);
  const ref                               = useRef(null);

  const fields     = GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests;
  const allowInput = type === "guests";

  useEffect(() => { setValues(buildDefault(type)); }, [type]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleChange = (id, newVal) => {
    setHasInteracted(true);
    setValues((prev) => {
      const next = { ...prev, [id]: newVal };
      onChange?.(next);
      return next;
    });
  };

  /* ── Inline mode: render steppers directly (MobileSearchSheet) ── */
  if (inline) {
    return (
      <div className="pt-1">
        {fields.map((field) => (
          <StepRow
            key={field.id}
            field={field}
            value={values[field.id] ?? field.min}
            onChange={(v) => handleChange(field.id, v)}
            allowInput={allowInput}
            lightMode
          />
        ))}
      </div>
    );
  }

  /* ── Popup mode (desktop hero search bar) ─────────────────── */
  const summary = summarize(type, values);
  const label   =
    type === "guests_detailed" ? "Who's coming?"
    : type === "attendees"     ? "Team size"
    : "Guests";

  return (
    <div ref={ref} className=" w-full">

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 bg-transparent text-sm outline-none text-start ${textClass ?? "text-white"}`}
      >
        <span className="truncate flex-1">
          {(placeholder && !hasInteracted) ? placeholder : summary}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${chevronClass ?? "text-white/50"}`}
        />
      </button>

      {/* Popup — closes via Done or outside click */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8,  scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 6,   scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={lightMode ? { insetInlineStart: 0 } : {
              background:       "rgba(10,10,16,0.97)",
              border:           `1px solid ${tint?.activeBorder ?? tint?.border ?? "rgba(255,255,255,0.15)"}`,
              boxShadow:        `0 24px 48px rgba(0,0,0,0.5), ${tint?.activeGlow ?? tint?.glow ?? "0 0 20px rgba(0,0,0,0.2)"}`,
              insetInlineStart: 0,
            }}
            className={[
              "absolute top-full mt-1.5 min-w-[320px] max-w-[400px] z-[9999] rounded-2xl px-4 pt-3 pb-4",
              lightMode
                ? "bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)] backdrop-blur-md"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest pb-2 mb-1 border-b ${
              lightMode
                ? "text-gray-400 dark:text-white/35 border-gray-100 dark:border-white/[0.07]"
                : "text-white/35 border-white/[0.07]"
            }`}>
              {label}
            </p>

            {fields.map((field) => (
              <StepRow
                key={field.id}
                field={field}
                value={values[field.id] ?? field.min}
                onChange={(v) => handleChange(field.id, v)}
                allowInput={allowInput}
                lightMode={lightMode}
              />
            ))}

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: tint?.hex ?? "#7c3aed" }}
              className="mt-3 w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
