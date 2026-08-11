"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown, Minus, Plus, User, Users, UsersRound, Users2 } from "lucide-react";

/* ── Guest field configs (desktop / legacy, keyed by `type`) ──────────
 *
 *  guests          → Venues: single total count (manual input allowed)
 *  guests_detailed → Farmstay / Rentals: adults+children+infants+pets
 *  attendees       → Studios / Workspaces: team size
 *
 *  Kept exactly as before so the desktop popup (HeroSection, keyed by
 *  `guestType` in SEARCH_CONFIG) is completely unaffected. The mobile
 *  sheet now drives its field set off CATEGORY_GUEST_CONFIGS below instead.
 */
const GUEST_CONFIGS = {
  guests: [
    { id: "guests", label: "Guests", sub: "Total attendees", min: 1, max: 5000 },
  ],
  guests_detailed: [
    { id: "adults",   label: "Adults",   sub: "Ages 13+",                min: 1, max: 100 },
    { id: "children", label: "Children", sub: "Ages 2–12",               min: 0, max: 20  },
    { id: "infants",  label: "Infants",  sub: "Under 2 · no seat",       min: 0, max: 5   },
    { id: "pets",     label: "Pets",     sub: "Service animals welcome", min: 0, max: 5   },
  ],
  attendees: [
    { id: "attendees", label: "Team Size", sub: "Attendees / members", min: 1, max: 500 },
  ],
};

/* ── Category-aware field sets (mobile sheet only) ─────────────────────
 * Distinct per real category, per spec — venues get event-staffing fields
 * instead of one generic "Guests" counter, workspaces get room/cabin
 * counts, studios get production-crew fields. Rentals/experiences don't
 * have a spec'd field set, so they fall back to the legacy generic ones.
 */
const CATEGORY_GUEST_CONFIGS = {
  venues:  GUEST_CONFIGS.guests,
  farmstays: GUEST_CONFIGS.guests_detailed,
  workspaces: [
    { id: "people",       label: "People",        sub: "Total headcount",           min: 1, max: 500 },
    { id: "meetingRooms", label: "Meeting Rooms", sub: "Private rooms needed",       min: 0, max: 20  },
    { id: "cabins",       label: "Cabins",        sub: "Dedicated cabins needed",    min: 0, max: 20  },
  ],
  studios: [
    { id: "crew",   label: "Crew",   sub: "Production crew",  min: 0, max: 100 },
    { id: "models", label: "Models", sub: "On-camera talent", min: 0, max: 50  },
    { id: "guests", label: "Guests", sub: "Additional guests",min: 0, max: 50  },
  ],
  rentals: GUEST_CONFIGS.guests_detailed,
  experiences: GUEST_CONFIGS.guests,
};
export function getCategoryFields(category) {
  return CATEGORY_GUEST_CONFIGS[(category || "").toLowerCase()] ?? null;
}
export { GUEST_CONFIGS };

/* ── Event Type — venues only, lives inside the Guests panel per spec
   ("Below guest counts: Event Type"), not a new top-level search field. */
const EVENT_TYPES = ["Wedding", "Reception", "Birthday", "Corporate", "Conference"];

/* ── Quick group-size presets — cardMode (mobile) only, sits above the
   fine-tune steppers. `value` is the default the primary field (fields[0]
   — Adults/Guests/People/Crew depending on category) gets set to when
   tapped; `min`/`max` define the range used to decide which preset reads
   as "active" for whatever the current count actually is, so stepping
   the count manually below keeps this row in sync instead of only
   reflecting the last-tapped preset. This only ever touches fields[0] —
   Children/Infants/Pets/etc stay exactly as fine-tuned, untouched. */
const GUEST_GROUP_PRESETS = [
  { id: "solo",   labelKey: "guest_group_solo",   subKey: "guest_group_solo_sub",   icon: User,       value: 1, min: -Infinity, max: 1 },
  { id: "couple", labelKey: "guest_group_couple", subKey: "guest_group_couple_sub", icon: Users,      value: 2, min: 2,         max: 2 },
  { id: "small",  labelKey: "guest_group_small",  subKey: "guest_group_small_sub",  icon: UsersRound, value: 3, min: 3,         max: 8 },
  { id: "large",  labelKey: "guest_group_large",  subKey: "guest_group_large_sub",  icon: Users2,     value: 9, min: 9,         max: Infinity },
];

/* ── One group-size preset card ── */
function GroupPresetCard({ preset, isActive, onSelect, tint }) {
  const t = useTranslations("searchBar");
  const Icon = preset.icon;
  const tintHex = tint?.hex ?? "#7c3aed";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border text-center transition-all active:scale-[0.98] ${
        isActive
          ? "border-transparent text-white shadow-sm"
          : "border-gray-100 dark:border-white/10 text-gray-800 dark:text-white hover:border-gray-200 dark:hover:border-white/20"
      }`}
      style={isActive ? { background: tintHex } : undefined}
    >
      <Icon className="w-5 h-5" style={{ color: isActive ? "#fff" : tintHex }} />
      <span className="text-sm font-bold">{t(preset.labelKey)}</span>
      <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400 dark:text-white/40"}`}>
        {t(preset.subKey)}
      </span>
    </button>
  );
}

/* ── Generic summary builder — works for ANY field set (legacy `type`-based
   or the new category-based ones), so both the desktop popup trigger and
   MobileSearchSheet's collapsed-header text can share one implementation
   instead of two hand-maintained copies drifting apart. */
export function summarizeFields(fields, values) {
  // Field labels ("Children", "Staff", "People", "Crew", ...) are already
  // the right display form at any count — several are irregular plurals
  // (or already plural-invariant), so appending a generic "s" suffix would
  // produce real bugs ("2 peoples", "3 childrens"). Showing "1 guests" for
  // the n=1 case is a minor, harmless grammar nit by comparison.
  const parts = [];
  fields.forEach((f) => {
    const n = values?.[f.id] ?? 0;
    if (f.min === 0 && n === 0) return; // optional fields only show once > 0
    parts.push(`${n} ${f.label.toLowerCase()}`);
  });
  return parts.join(", ");
}

function buildDefault(fields) {
  return Object.fromEntries(fields.map((f) => [f.id, f.min >= 1 ? f.min : 0]));
}

/* ── Individual stepper row ───────────────────────────────────
 *  allowInput=true  → clicking the count opens a text input (venues only)
 *  allowInput=false → count shown wider, no text entry
 *  lightMode=true   → dark text for light backgrounds (mobile sheet)
 */
function StepRow({ field, value, onChange, step = 1, allowInput = false, lightMode = false, compact = false }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState("");
  const inputRef              = useRef(null);

  const atMin = value <= field.min;
  const atMax = value >= field.max;
  const clamp = (v) => Math.max(field.min, Math.min(field.max, v));

  // Snap to step multiples when step > 1
  const decrement = () => {
    if (step <= 1) { onChange(clamp(value - 1)); return; }
    const prev = Math.floor((value - 0.001) / step) * step;
    onChange(Math.max(field.min, prev));
  };
  const increment = () => {
    if (step <= 1) { onChange(clamp(value + 1)); return; }
    const next = Math.ceil((value + 0.001) / step) * step;
    onChange(Math.min(field.max, next));
  };

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
    <div className={`flex items-center justify-between border-b border-gray-100 dark:border-white/[0.07] last:border-0 ${compact ? "py-1.5" : "py-3"}`}>
      <div className="min-w-0 pe-3">
        <p className={`text-sm font-semibold leading-snug ${labelClass}`}>{field.label}</p>
        <p className={`text-[11px] mt-0.5 ${subClass}`}>{field.sub}</p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Decrement */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={decrement}
          disabled={atMin}
          className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-25 transition-colors ${btnClass}`}
          aria-label={`Decrease ${field.label}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </motion.button>

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
            className={`w-14 text-center rounded-lg text-sm font-bold tabular-nums outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${lightMode ? "bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/30 text-gray-800 dark:text-white focus:border-gray-400 dark:focus:border-white/60" : "bg-white/10 border border-white/30 text-white focus:border-white/60"}`}
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
          <motion.span
            key={value}
            initial={{ scale: 1.25, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className={`min-w-[2.75rem] text-center font-bold text-sm tabular-nums ${countClass}`}
          >
            {value}
          </motion.span>
        )}

        {/* Increment */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={increment}
          disabled={atMax}
          className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-25 transition-colors ${btnClass}`}
          aria-label={`Increase ${field.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

/* ── Elevated stepper card — mobile sheet "card per type" per the premium
   redesign spec. Same value/onChange/min/max/step/allowInput contract as
   StepRow above (this is a visual variant, not new logic) — an elevated
   rounded card with 44px+ circular +/- buttons instead of a flat bordered
   row, used only when GuestPicker is rendered with `cardMode`. */
function StepCard({ field, value, onChange, step = 1, allowInput = false, tint }) {
  const t = useTranslations("searchBar");
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState("");
  const inputRef              = useRef(null);

  const atMin = value <= field.min;
  const atMax = value >= field.max;
  const clamp = (v) => Math.max(field.min, Math.min(field.max, v));

  const decrement = () => {
    if (step <= 1) { onChange(clamp(value - 1)); return; }
    const prev = Math.floor((value - 0.001) / step) * step;
    onChange(Math.max(field.min, prev));
  };
  const increment = () => {
    if (step <= 1) { onChange(clamp(value + 1)); return; }
    const next = Math.ceil((value + 0.001) / step) * step;
    onChange(Math.min(field.max, next));
  };

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

  const tintHex = tint?.hex ?? "#7c3aed";
  const active  = value > (field.min >= 1 ? field.min : 0);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 mb-2.5 last:mb-0 transition-all duration-200 ${
        active
          ? "border-gray-200 dark:border-white/20 bg-white dark:bg-white/[0.04] shadow-sm"
          : "border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]"
      }`}
    >
      <div className="min-w-0 pe-2">
        <p className="text-sm font-bold text-gray-800 dark:text-white leading-snug">{field.label}</p>
        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{field.sub}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={decrement}
          disabled={atMin}
          className="w-11 h-11 rounded-full border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white flex items-center justify-center disabled:opacity-25 hover:border-gray-400 dark:hover:border-white/50 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label={t("decrease_field", { label: field.label })}
        >
          <Minus className="w-4 h-4" />
        </motion.button>

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
            className="w-12 text-center rounded-lg text-base font-bold tabular-nums outline-none py-1 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/30 text-gray-800 dark:text-white focus:border-gray-400 dark:focus:border-white/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : allowInput ? (
          <button
            type="button"
            onClick={startEdit}
            className="min-w-[2.5rem] text-center font-bold text-base tabular-nums rounded-lg py-1 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
            title="Click to type a number"
          >
            {value}
          </button>
        ) : (
          <motion.span
            key={value}
            initial={{ scale: 1.25, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="min-w-[2.5rem] text-center font-bold text-base tabular-nums text-gray-800 dark:text-white"
          >
            {value}
          </motion.span>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={increment}
          disabled={atMax}
          className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 transition-all text-white shadow-sm"
          style={{ background: tintHex }}
          aria-label={t("increase_field", { label: field.label })}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
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
  placeholderClass,
  chevronClass,
  /** When true, renders steppers inline (no trigger/popup). Used in MobileSearchSheet. */
  inline      = false,
  /** When true, reduces vertical padding on each stepper row. Inline only. */
  compact     = false,
  /** When true (inline only), renders each field as an elevated card with
   *  44px+ touch targets and a total-guests summary, per the mobile
   *  search redesign spec, instead of the flat bordered StepRow list.
   *  Defaults false — every existing inline caller is pixel-identical
   *  unless it opts in. */
  cardMode    = false,
  placeholder,
  /** When true, popup uses white bg in light mode / dark bg in dark mode. */
  lightMode   = false,
  defaultValue,
  step        = 1,
  maxCapacity,
  /** Active category — selects the richer field set (Adults/VIP/Staff/…
   *  for venues, People/Meeting Rooms/Cabins for workspaces, etc). Only
   *  consumed when `inline` is true, so the desktop popup (still driven by
   *  `type`) is completely unaffected. */
  category,
  /** Fires with the selected event type label — venues + inline only. */
  onEventTypeChange,
  /** Fires once, only on a real open→close transition (not on mount, not
   *  on opening, and not in inline mode) — lets the search-bar field
   *  wrapper collapse itself back to its display pill the moment this
   *  popup closes, however it closes. */
  onOpenChange,
}) {
  const t = useTranslations("searchBar");
  const [open, setOpen] = useState(false);

  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (inline) return;
    if (wasOpenRef.current && !open) onOpenChange?.(false);
    wasOpenRef.current = open;
  }, [open, inline, onOpenChange]);

  // Mobile sheet uses the category-specific field set when available;
  // desktop popup always uses the legacy `type`-based set.
  const categoryFields = inline ? getCategoryFields(category) : null;
  const fields = (categoryFields ?? GUEST_CONFIGS[type] ?? GUEST_CONFIGS.guests).map((f) => ({
    ...f,
    max: maxCapacity != null ? maxCapacity : f.max,
    min: step > 1 ? Math.max(f.min, step) : f.min,
  }));
  // Mobile category fields can run into the thousands (venue Adults maxes
  // at 5000) — tap-to-type beats tapping the stepper hundreds of times, so
  // every inline field gets it, not just the legacy single "guests" count.
  const allowInput = inline || type === "guests";

  const [values, setValues] = useState(() => {
    const base = buildDefault(fields);
    const n = Number(defaultValue);
    if (n > 0 && fields[0]) return { ...base, [fields[0].id]: n };
    return base;
  });
  const [hasInteracted, setHasInteracted] = useState(Number(defaultValue) > 0);
  const [eventType, setEventType] = useState(null);
  const ref = useRef(null);

  /* No type-reset effect needed — GuestPicker is always keyed by
     `${activeCategory}-${field.id}` in the parent, so it remounts
     automatically when the category (and therefore type) changes.
     A useEffect here would fire on mount and overwrite the
     defaultValue-seeded state, especially in React 18 Strict Mode
     where effects run twice. */

  // "click", not "mousedown" — see the matching comment in
  // SearchSelectField.jsx: closing on mousedown could reflow the whole
  // search bar (active-grows ↔ equal-width) before the browser dispatched
  // "click", so a click aimed at another field's pill could miss it once
  // layout shifted underneath the cursor. "click" fires after the target
  // pill's own onClick in the same bubble pass, so the intended field
  // activates first, in one gesture.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  /* Escape closes the popup, same as clicking outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* Keep the popup on-screen — same fix as DatePicker.jsx's popupDropdown
     and SearchSelectField.jsx (see DatePicker.jsx for the full rationale).
     Measures the rendered popup and nudges it back on-screen with a
     horizontal shift applied as Framer's `x`, composed with the existing
     y/scale animation, instead of always trusting insetInlineStart: 0. */
  const popupRef = useRef(null);
  const [shiftX, setShiftX] = useState(0);
  useLayoutEffect(() => {
    if (!open) { setShiftX(0); return; }
    const margin = 16;
    const measure = () => {
      const el = popupRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const overflowRight = rect.right - (window.innerWidth - margin);
      const overflowLeft = margin - rect.left;
      if (overflowRight > 0) setShiftX((prev) => prev - overflowRight);
      else if (overflowLeft > 0) setShiftX((prev) => prev + overflowLeft);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  const handleChange = (id, newVal) => {
    setHasInteracted(true);
    setValues((prev) => {
      const next = { ...prev, [id]: newVal };
      onChange?.(next);
      return next;
    });
  };

  const isVenueMobile = inline && (category || "").toLowerCase() === "venues";

  /* ── Inline mode: render steppers directly (MobileSearchSheet) ── */
  if (inline) {
    const totalGuests = fields.reduce((sum, f) => sum + Number(values[f.id] ?? f.min ?? 0), 0);

    // Which preset (Solo/Couple/Small Group/Large Group) currently
    // matches fields[0]'s value — recomputed from the live count, not
    // just whichever was last tapped, so stepping the count manually
    // below keeps this row honest.
    const primaryValue = fields[0] ? (values[fields[0].id] ?? fields[0].min) : 0;
    const activePresetId = GUEST_GROUP_PRESETS.find((p) => primaryValue >= p.min && primaryValue <= p.max)?.id ?? null;

    return (
      <div className={compact ? "" : "pt-1"}>
        {cardMode ? (
          <>
            {fields[0] && (
              <>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {GUEST_GROUP_PRESETS.map((preset) => (
                    <GroupPresetCard
                      key={preset.id}
                      preset={preset}
                      isActive={activePresetId === preset.id}
                      tint={tint}
                      onSelect={() => {
                        const clamped = Math.max(fields[0].min, Math.min(fields[0].max, preset.value));
                        handleChange(fields[0].id, clamped);
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between px-0.5 mb-2">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                    {t("fine_tune_count")}
                  </span>
                  {totalGuests > 0 && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: tint?.light ?? "rgba(124,58,237,0.10)", color: tint?.hex ?? "#7c3aed" }}
                    >
                      {t("total_guests_count", { count: totalGuests })}
                    </span>
                  )}
                </div>
              </>
            )}
            {fields.map((field) => (
              <StepCard
                key={field.id}
                field={field}
                value={values[field.id] ?? field.min}
                onChange={(v) => handleChange(field.id, v)}
                step={step}
                allowInput={allowInput}
                tint={tint}
              />
            ))}
          </>
        ) : (
          fields.map((field) => (
            <StepRow
              key={field.id}
              field={field}
              value={values[field.id] ?? field.min}
              onChange={(v) => handleChange(field.id, v)}
              step={step}
              allowInput={allowInput}
              lightMode
              compact={compact}
            />
          ))
        )}

        {/* Event Type — venues only, sits below the guest counts per spec */}
        {isVenueMobile && (
          <div className="pt-3 mt-1 border-t border-gray-100 dark:border-white/[0.07]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/35 mb-2">
              Event Type
            </p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((et) => {
                const isActive = eventType === et;
                return (
                  <button
                    key={et}
                    type="button"
                    onClick={() => {
                      const next = isActive ? null : et;
                      setEventType(next);
                      onEventTypeChange?.(next);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                      isActive
                        ? "text-white shadow-sm"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15"
                    }`}
                    style={isActive ? { background: tint?.hex ?? "#7c3aed" } : undefined}
                  >
                    {et}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Popup mode (desktop hero search bar) — unchanged ─────────── */
  const summary = summarizeFields(fields, values) || (fields[0] ? `${values[fields[0].id] ?? fields[0].min} ${fields[0].label.toLowerCase()}` : "");
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
        className="w-full flex items-center gap-2 bg-transparent text-sm outline-none text-start"
      >
        <span
          className={`truncate flex-1 ${
            placeholder && !hasInteracted
              ? (placeholderClass ?? "text-white/40")
              : (textClass ?? "text-white")
          }`}
        >
          {(placeholder && !hasInteracted) ? placeholder : summary}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${chevronClass ?? "text-white/50"}`}
        />
      </button>

      {/* Popup — closes via Done or outside click */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 8,  scale: 0.97, x: shiftX }}
            animate={{ opacity: 1, y: 0,  scale: 1,    x: shiftX }}
            exit={{   opacity: 0, y: 6,   scale: 0.97, x: shiftX }}
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
                step={step}
                allowInput={allowInput}
                lightMode={lightMode}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
