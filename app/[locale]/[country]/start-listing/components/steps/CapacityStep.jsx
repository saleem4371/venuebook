"use client";

import { useState } from "react";
import { LayoutGrid, Check, Lock } from "lucide-react";
import { CAPACITY_CONFIG, SEATING_STYLES } from "./config/capacityConfig";

// ─── Shared input class ────────────────────────────────────────────────────

const inputCls = (invalid) => [
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
  "text-gray-900 dark:text-white text-sm outline-none transition",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  invalid
    ? "border-red-400 ring-1 ring-red-400"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
].join(" ");

// ─── SVG icons per seating style ──────────────────────────────────────────

const SEATING_ICONS = {
  theatre: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Stage bar */}
      <rect x="3" y="3" width="26" height="3" rx="1" strokeWidth="0" fill="currentColor" opacity="0.3"/>
      {/* Row 1 */}
      <circle cx="7"  cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/>
      <circle cx="17" cy="12" r="1.8"/><circle cx="22" cy="12" r="1.8"/>
      <circle cx="27" cy="12" r="1.8"/>
      {/* Row 2 */}
      <circle cx="7"  cy="19" r="1.8"/><circle cx="12" cy="19" r="1.8"/>
      <circle cx="17" cy="19" r="1.8"/><circle cx="22" cy="19" r="1.8"/>
      <circle cx="27" cy="19" r="1.8"/>
      {/* Row 3 */}
      <circle cx="7"  cy="26" r="1.8"/><circle cx="12" cy="26" r="1.8"/>
      <circle cx="17" cy="26" r="1.8"/><circle cx="22" cy="26" r="1.8"/>
      <circle cx="27" cy="26" r="1.8"/>
    </svg>
  ),
  classroom: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* 3 rows of desk+2seats */}
      {[6, 14, 22].map((y) => (
        <g key={y}>
          <rect x="4" y={y} width="10" height="4" rx="1"/>
          <circle cx="6.5" cy={y - 3} r="1.6"/>
          <circle cx="11" cy={y - 3} r="1.6"/>
          <rect x="18" y={y} width="10" height="4" rx="1"/>
          <circle cx="20.5" cy={y - 3} r="1.6"/>
          <circle cx="25" cy={y - 3} r="1.6"/>
        </g>
      ))}
    </svg>
  ),
  ushape: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* U path */}
      <path d="M6 4 L6 22 Q6 28 16 28 Q26 28 26 22 L26 4"/>
      {/* Seats on left */}
      <circle cx="2"  cy="8"  r="1.8"/><circle cx="2" cy="15" r="1.8"/>
      {/* Seats on right */}
      <circle cx="30" cy="8"  r="1.8"/><circle cx="30" cy="15" r="1.8"/>
      {/* Seats on bottom curve */}
      <circle cx="11" cy="30" r="1.8"/><circle cx="21" cy="30" r="1.8"/>
    </svg>
  ),
  boardroom: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Central table */}
      <rect x="6" y="9" width="20" height="14" rx="2"/>
      {/* Top seats */}
      <circle cx="11" cy="5.5" r="1.8"/><circle cx="16" cy="5.5" r="1.8"/><circle cx="21" cy="5.5" r="1.8"/>
      {/* Bottom seats */}
      <circle cx="11" cy="26.5" r="1.8"/><circle cx="16" cy="26.5" r="1.8"/><circle cx="21" cy="26.5" r="1.8"/>
      {/* Side seats */}
      <circle cx="2.5" cy="14" r="1.8"/><circle cx="2.5" cy="19" r="1.8"/>
      <circle cx="29.5" cy="14" r="1.8"/><circle cx="29.5" cy="19" r="1.8"/>
    </svg>
  ),
  banquet: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Table 1 (left) */}
      <circle cx="10" cy="16" r="5"/>
      <circle cx="10" cy="7"  r="1.8"/>
      <circle cx="10" cy="25" r="1.8"/>
      <circle cx="3"  cy="12" r="1.8"/>
      <circle cx="3"  cy="20" r="1.8"/>
      {/* Table 2 (right) */}
      <circle cx="22" cy="16" r="5"/>
      <circle cx="22" cy="7"  r="1.8"/>
      <circle cx="22" cy="25" r="1.8"/>
      <circle cx="29" cy="12" r="1.8"/>
      <circle cx="29" cy="20" r="1.8"/>
    </svg>
  ),
  cocktail: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* High tables */}
      <circle cx="8"  cy="8"  r="3.5"/>
      <circle cx="24" cy="8"  r="3.5"/>
      <circle cx="8"  cy="24" r="3.5"/>
      <circle cx="24" cy="24" r="3.5"/>
      <circle cx="16" cy="16" r="3.5"/>
      {/* Stems */}
      <line x1="8"  y1="11.5" x2="8"  y2="15"/>
      <line x1="24" y1="11.5" x2="24" y2="15"/>
      <line x1="16" y1="19.5" x2="16" y2="23"/>
    </svg>
  ),
  cabaret: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Stage bar */}
      <rect x="3" y="3" width="26" height="2.5" rx="1" strokeWidth="0" fill="currentColor" opacity="0.3"/>
      {/* Groups of 3: two groups */}
      <circle cx="7"  cy="13" r="1.8"/><circle cx="11" cy="13" r="1.8"/><circle cx="9"  cy="17" r="1.8"/>
      <circle cx="19" cy="13" r="1.8"/><circle cx="23" cy="13" r="1.8"/><circle cx="21" cy="17" r="1.8"/>
      {/* Second row groups */}
      <circle cx="7"  cy="23" r="1.8"/><circle cx="11" cy="23" r="1.8"/><circle cx="9"  cy="27" r="1.8"/>
      <circle cx="19" cy="23" r="1.8"/><circle cx="23" cy="23" r="1.8"/><circle cx="21" cy="27" r="1.8"/>
    </svg>
  ),
  hollow_square: (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Square outline (hollow) */}
      <rect x="8" y="8" width="16" height="16" rx="1"/>
      {/* Seats outside each edge */}
      <circle cx="16" cy="3.5" r="1.8"/>
      <circle cx="16" cy="28.5" r="1.8"/>
      <circle cx="3.5" cy="16" r="1.8"/>
      <circle cx="28.5" cy="16" r="1.8"/>
      {/* Corner seats */}
      <circle cx="7"  cy="7"  r="1.8"/>
      <circle cx="25" cy="7"  r="1.8"/>
      <circle cx="7"  cy="25" r="1.8"/>
      <circle cx="25" cy="25" r="1.8"/>
    </svg>
  ),
};

// ─── Counter widget (tap + / − or type) ───────────────────────────────────

function Counter({ value, onChange, min = 0, max = 9999, invalid = false }) {
  const num = Number(value) || 0;
  return (
    <div className={[
      "flex items-center gap-0 rounded-xl border overflow-hidden bg-white dark:bg-gray-900 h-11",
      invalid
        ? "border-red-400 ring-1 ring-red-400"
        : "border-gray-200 dark:border-gray-700",
    ].join(" ")}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, num - 1))}
        disabled={num <= min}
        className="w-11 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition border-r border-gray-200 dark:border-gray-700 text-lg font-light select-none"
      >
        −
      </button>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) { onChange(""); return; }
          const n = Number(raw);
          if (n >= min && n <= max) onChange(n);
        }}
        className="flex-1 text-center text-sm font-semibold text-gray-900 dark:text-white bg-transparent outline-none appearance-none"
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, num + 1))}
        disabled={num >= max}
        className="w-11 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition border-l border-gray-200 dark:border-gray-700 text-lg font-light select-none"
      >
        +
      </button>
    </div>
  );
}

// ─── Dynamic Counter bounds ────────────────────────────────────────────────

const MAX_GUESTS  = 100000;
const MAX_PERSONS = 9999;

function getCounterBounds(fieldKey, capacity) {
  switch (fieldKey) {
    case "minGuests":
      return {
        min: 0,
        max: Number(capacity.maxGuests) > 0 ? Number(capacity.maxGuests) : MAX_GUESTS,
      };
    case "maxGuests":
      return {
        min: Number(capacity.minGuests) > 0 ? Number(capacity.minGuests) : 1,
        max: MAX_GUESTS,
      };
    case "minParticipants":
      return {
        min: 0,
        max: Number(capacity.maxParticipants) > 0 ? Number(capacity.maxParticipants) : MAX_PERSONS,
      };
    case "maxParticipants":
      return {
        min: Number(capacity.minParticipants) > 0 ? Number(capacity.minParticipants) : 1,
        max: MAX_PERSONS,
      };
    default:
      return { min: 0, max: MAX_PERSONS };
  }
}

// ─── Cross-field validation error ─────────────────────────────────────────

function getCrossError(fieldKey, capacity) {
  const min  = Number(capacity.minGuests       || 0);
  const max  = Number(capacity.maxGuests       || 0);
  const minP = Number(capacity.minParticipants || 0);
  const maxP = Number(capacity.maxParticipants || 0);

  if (fieldKey === "minGuests"       && min > 0 && max > 0 && min > max)  return "Must be ≤ maximum guests";
  if (fieldKey === "maxGuests"       && min > 0 && max > 0 && max < min)  return "Must be ≥ minimum guests";
  if (fieldKey === "minParticipants" && minP > 0 && maxP > 0 && minP > maxP) return "Must be ≤ maximum participants";
  if (fieldKey === "maxParticipants" && minP > 0 && maxP > 0 && maxP < minP) return "Must be ≥ minimum participants";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CapacityStep — category-specific capacity inputs
// ─────────────────────────────────────────────────────────────────────────────

export default function CapacityStep({ form, updateForm, attempted }) {
  const [touched, setTouched] = useState({});

  const touch   = (f) => setTouched((p) => ({ ...p, [f]: true }));
  const showErr = (f) => touched[f] || !!attempted?.capacity;

  // ── Farmstay: delegate to custom component ────────────────────────────
  if (form.category === "farmstay") {
    const capacity = form.capacity || {};
    return (
      <FarmstayCapacity
        capacity={capacity}
        updateCap={(key, val) => updateForm({ capacity: { ...capacity, [key]: val } })}
        updateCapObj={(obj) => updateForm({ capacity: { ...capacity, ...obj } })}
        attempted={attempted}
        touched={touched}
        touch={touch}
      />
    );
  }

  const category = form.category || "venue";
  const config   = CAPACITY_CONFIG[category] || CAPACITY_CONFIG.venue;
  const capacity = form.capacity || {};

  

  const updateCap = (key, val) =>
    updateForm({ capacity: { ...capacity, [key]: val } });

  // ── Venue-specific: seating styles ────────────────────────────────────
  const seating   = capacity.seatingStyles || {};
  const maxGuests = Number(capacity.maxGuests) || 0;

  // Seating is only unlocked once both minGuests and maxGuests are valid
  const minSet      = Number(capacity.minGuests) > 0;
  const maxSet      = maxGuests > 0;
  const seatingReady = minSet && maxSet && maxGuests >= Number(capacity.minGuests || 0);

  const toggleSeating = (key) => {
    if (!seatingReady) return;
    const cur = seating[key] || { enabled: false, capacity: "" };
    updateCap("seatingStyles", { ...seating, [key]: { ...cur, enabled: !cur.enabled } });
  };
  const setSeatingCap = (key, val) => {
    const clamped = maxGuests > 0 ? Math.min(Number(val) || 0, maxGuests) : val;
    const cur = seating[key] || { enabled: true, capacity: "" };
    updateCap("seatingStyles", { ...seating, [key]: { ...cur, capacity: clamped || "" } });
  };

  return (
    <div className="space-y-8">

      {/* ── Counter fields ── */}
      <div className={`grid gap-5 ${config.fields.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {config.fields.map((field) => {
          const val        = capacity[field.key] ?? "";
          const bounds     = getCounterBounds(field.key, capacity);
          const crossErr   = showErr(field.key) ? getCrossError(field.key, capacity) : null;
          const missingErr = showErr(field.key) && field.required && (!val || Number(val) <= 0);
          const isInvalid  = !!crossErr || missingErr;

          return (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              <div className="flex items-center gap-3">
                {field.unit !== "sq ft" ? (
                  <div className="flex-1">
                    <Counter
                      value={val}
                      onChange={(v) => { updateCap(field.key, v); touch(field.key); }}
                      min={bounds.min}
                      max={bounds.max}
                      invalid={isInvalid}
                    />
                  </div>
                ) : (
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => { updateCap(field.key, e.target.value); touch(field.key); }}
                      onBlur={() => touch(field.key)}
                      placeholder={field.placeholder}
                      className={inputCls(isInvalid)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      sq ft
                    </span>
                  </div>
                )}

                {field.unit !== "sq ft" && (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0 w-16">
                    {field.unit}
                  </span>
                )}
              </div>

              {crossErr ? (
                <p className="text-xs text-red-500 mt-1.5">{crossErr}</p>
              ) : missingErr ? (
                <p className="text-xs text-red-500 mt-1.5">{field.label} is required</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ── Seating styles (venue only) ── */}
      {config.seatingStyles && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Seating arrangements
            </h3>
            {!seatingReady && (
              <span className="inline-flex items-center gap-1 ml-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Lock size={11} />
                Enter max &amp; min guests first
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Enable the layouts your venue supports and enter capacity for each
            {seatingReady && maxGuests < MAX_GUESTS && (
              <span className="ml-1 text-violet-500 font-medium">
                (max {maxGuests.toLocaleString("en-IN")} guests)
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SEATING_STYLES.map((style) => {
              const entry      = seating[style.key] || { enabled: false, capacity: "" };
              const enabled    = !!entry.enabled && seatingReady;
              const seatMax    = maxGuests > 0 ? maxGuests : MAX_GUESTS;
              const seatInvalid = !!attempted?.capacity && enabled &&
                (!entry.capacity || Number(entry.capacity) <= 0);

              return (
                <div
                  key={style.key}
                  role="button"
                  tabIndex={seatingReady ? 0 : -1}
                  onClick={() => toggleSeating(style.key)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleSeating(style.key)}
                  className={[
                    "relative rounded-xl border transition-all duration-150 select-none",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    !seatingReady
                      ? "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 opacity-50 pointer-events-none"
                      : enabled
                        ? "border-violet-400 dark:border-violet-600 bg-violet-50/60 dark:bg-violet-950/30 cursor-pointer"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer",
                  ].join(" ")}
                >
                  {/* Selected checkmark badge */}
                  {enabled && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center pointer-events-none z-10">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </span>
                  )}

                  <div className="flex flex-col items-center gap-1.5 p-3 pt-4">
                    {/* Icon */}
                    <span className={[
                      "transition-colors",
                      enabled ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500",
                    ].join(" ")}>
                      {SEATING_ICONS[style.key]}
                    </span>

                    {/* Label */}
                    <p className={[
                      "text-xs font-semibold text-center leading-tight",
                      enabled ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-300",
                    ].join(" ")}>
                      {style.label}
                    </p>

                    {/* Capacity input — visible only when selected */}
                    {enabled && (
                      <div
                        className="w-full mt-1"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min="1"
                          max={seatMax}
                          value={entry.capacity || ""}
                          onChange={(e) => setSeatingCap(style.key, e.target.value)}
                          placeholder="Capacity"
                          className={[
                            "w-full px-2 py-1.5 rounded-lg border text-xs text-center outline-none transition",
                            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400",
                            seatInvalid
                              ? "border-red-400 ring-1 ring-red-400"
                              : "border-violet-200 dark:border-violet-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
                          ].join(" ")}
                        />
                        {seatInvalid && (
                          <p className="text-[10px] text-red-500 text-center mt-0.5">Required</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FarmstayCapacity
//  Rendered ONLY when category === "farmstay". All other categories untouched.
//
//  form.capacity keys:
//    maxAdults (req), maxKids, roomTypes[], bathroomFacilities[],
//    roomCombination ('yes'|'no'), bedTypes[], extraMattress ('yes'|'no'),
//    propertyArea, propertyAreaUnit, guestSpaces[]
// ─────────────────────────────────────────────────────────────────────────────

const FS_ROOM_TYPES  = ["Private Rooms","Family Rooms","Dormitory Rooms","Cottages","Luxury Tents"];
const FS_BATHROOM    = ["Attached Bathrooms","Common Bathrooms","Western Toilets","Indian Toilets","Hot Water","Toiletries Provided"];
const FS_BED_TYPES   = ["King Bed","Queen Bed","Double Bed","Single Bed","Bunk Bed","Floor Mattress"];
const FS_GUEST_SPACES = ["Swimming Pool","Garden","Farm Area","Lake / Pond","Rooftop","Bonfire Area","Children's Play Area","Open Lawn","Event Space"];

function FsChipGrid({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = (selected || []).includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={[
              "px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              active
                ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-600",
            ].join(" ")}
          >
            {active && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-violet-600 align-middle" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FsRadio({ label, subLabel, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{label}</p>
      {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{subLabel}</p>}
      <div className="flex gap-3 mt-3">
        {["Yes","No"].map((opt) => {
          const v = opt.toLowerCase();
          const active = value === v;
          return (
            <button key={v} type="button" onClick={() => onChange(active ? "" : v)}
              className={[
                "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                active
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-300",
              ].join(" ")}
            >
              <span className={["w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", active ? "border-violet-600" : "border-gray-300 dark:border-gray-600"].join(" ")}>
                {active && <span className="w-2 h-2 rounded-full bg-violet-600" />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FsSection({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function FarmstayCapacity({ capacity, updateCap, attempted, touched, touch }) {
  const showErr       = (f) => touched[f] || !!attempted?.capacity;
  const adultsInvalid = showErr("maxAdults") && (!capacity.maxAdults || Number(capacity.maxAdults) <= 0);
  const roomsInvalid  = !!attempted?.capacity && !(capacity.roomTypes || []).length;

  const toggleArr = (field, val) => {
    const arr = capacity[field] || [];
    updateCap(field, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="space-y-8">

      {/* Maximum Occupancy */}
      <FsSection title="Maximum Occupancy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Maximum adults <span className="text-red-500">*</span>
            </label>
            <Counter value={capacity.maxAdults ?? ""} onChange={(v) => { updateCap("maxAdults", v); touch("maxAdults"); }} min={1} invalid={adultsInvalid} />
            {adultsInvalid && <p className="text-xs text-red-500 mt-1.5">Maximum adults is required</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Maximum kids</label>
            <Counter value={capacity.maxKids ?? ""} onChange={(v) => updateCap("maxKids", v)} min={0} />
          </div>
        </div>
      </FsSection>

      {/* Room Types */}
      <FsSection title="Room Types Available">
        <FsChipGrid options={FS_ROOM_TYPES} selected={capacity.roomTypes} onToggle={(v) => toggleArr("roomTypes", v)} />
        {roomsInvalid && <p className="text-xs text-red-500">Select at least one room type</p>}
      </FsSection>

      {/* Bathroom Facilities */}
      <FsSection title="Bathroom Facilities">
        <FsChipGrid options={FS_BATHROOM} selected={capacity.bathroomFacilities} onToggle={(v) => toggleArr("bathroomFacilities", v)} />
      </FsSection>

      {/* Room Combination */}
      <FsSection title="Room Configuration">
        <FsRadio label="Can rooms be combined for larger groups?" value={capacity.roomCombination || ""} onChange={(v) => updateCap("roomCombination", v)} />
      </FsSection>

      <FsSection title="">
        <FsRadio label="Pets Allowed ?" value={capacity.pet_allowed || ""} onChange={(v) => updateCap("pet_allowed", v)} />
      </FsSection>

      {/* Bed Types */}
      <FsSection title="Bed Types">
        <FsChipGrid options={FS_BED_TYPES} selected={capacity.bedTypes} onToggle={(v) => toggleArr("bedTypes", v)} />
      </FsSection>

      {/* Extra Mattress */}
      <FsRadio label="Can extra mattresses be provided?" value={capacity.extraMattress || ""} onChange={(v) => updateCap("extraMattress", v)} />

      {/* Property Area */}
      <FsSection title="Property Area">
        <div className="flex gap-3">
          <input
            type="number" min="0"
            value={capacity.propertyArea || ""}
            onChange={(e) => updateCap("propertyArea", e.target.value)}
            placeholder="e.g. 5"
            className="flex-[4] px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <select
            value={capacity.propertyAreaUnit || "Acres"}
            onChange={(e) => updateCap("propertyAreaUnit", e.target.value)}
            className="flex-[1] px-3 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none transition cursor-pointer border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          >
            <option>Acres</option>
            <option>Sq Ft</option>
          </select>
        </div>
      </FsSection>

      {/* Guest Accessible Spaces */}
      <FsSection title="Guest Accessible Spaces">
        <FsChipGrid options={FS_GUEST_SPACES} selected={capacity.guestSpaces} onToggle={(v) => toggleArr("guestSpaces", v)} />
      </FsSection>

    </div>
  );
}
