"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(d, start, end) {
  if (!start || !end) return false;
  const t = d.getTime(), s = start.getTime(), e = end.getTime();
  return t > s && t < e;
}
function toDisplay(d, withTime) {
  if (!d) return "";
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return base;
  return `${base} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/* ── Static holiday list — illustrative only ─────────────────────────────
   No holiday-calendar API/service exists anywhere in this codebase, so this
   is a small hand-picked set of fixed-date national holidays per country
   (month/day pairs, evaluated against every year the calendar renders).
   Good enough to demonstrate "highlight holidays / long weekends" without
   inventing a fake backend dependency; swap for a real holiday API later
   if precision matters (moving holidays like Diwali/Eid aren't included
   since their dates shift every year and can't be hard-coded correctly). */
const HOLIDAYS_IN = [
  { month: 0,  day: 1,  name: "New Year's Day" },
  { month: 0,  day: 26, name: "Republic Day" },
  { month: 7,  day: 15, name: "Independence Day" },
  { month: 9,  day: 2,  name: "Gandhi Jayanti" },
  { month: 11, day: 25, name: "Christmas" },
];
const HOLIDAYS_AE = [
  { month: 0,  day: 1,  name: "New Year's Day" },
  { month: 11, day: 1,  name: "Commemoration Day" },
  { month: 11, day: 2,  name: "National Day" },
  { month: 11, day: 3,  name: "National Day Holiday" },
];
function getHolidays(countryCode) {
  return countryCode === "ae" ? HOLIDAYS_AE : HOLIDAYS_IN;
}
function isHoliday(date, holidays) {
  return holidays.some((h) => h.month === date.getMonth() && h.day === date.getDate());
}
/* A "long weekend" cell is a holiday that lands on/adjacent to a Sat/Sun,
   OR a Sat/Sun that's adjacent to one — the whole connected span gets the
   softer long-weekend tint instead of just the single holiday date. */
function isLongWeekendSpan(date, holidays) {
  const dow = date.getDay(); // 0 Sun .. 6 Sat
  if (dow === 0 || dow === 6) {
    return isHoliday(addDays(date, -1), holidays) || isHoliday(addDays(date, 1), holidays) ||
      isHoliday(addDays(date, -2), holidays) || isHoliday(addDays(date, 2), holidays);
  }
  if (isHoliday(date, holidays)) {
    // Holiday itself counts as a long weekend if it sits next to Fri/Mon->weekend
    return dow === 1 || dow === 5 || isHoliday(addDays(date, -1), holidays) || isHoliday(addDays(date, 1), holidays);
  }
  return false;
}

/* ── Calendar month grid ─────────────────────────────────────── */
function CalendarMonth({ year, month, start, end, hovered, onSelect, onHover, tint, range, minDate, light = false, holidays = [] }) {
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells     = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(new Date(year, month, d));

  const dayHeaderCls = light ? "text-gray-400 dark:text-white/30" : "text-white/30";
  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <p key={d} className={`text-center text-[10px] font-medium py-1 ${dayHeaderCls}`}>{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const isPast      = minDate && day < minDate;
          const isStart     = isSameDay(day, start);
          const isEnd       = isSameDay(day, end);
          const isInRange   = range && isBetween(day, start, end || hovered);
          const isHovered   = isSameDay(day, hovered);
          const isToday     = isSameDay(day, today);
          const holidayHere = isHoliday(day, holidays);
          const longWeekend = holidays.length > 0 && isLongWeekendSpan(day, holidays);

          const normalCls = light
            ? "text-gray-700 dark:text-white/75 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
            : "text-white/75 hover:bg-white/10 hover:text-white";
          const pastCls   = light ? "text-gray-200 dark:text-white/15" : "text-white/15";
          const rangeCls  = light ? "text-gray-700 dark:text-white/90" : "text-white/90";
          const hovCls    = light ? "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white" : "bg-white/10 text-white";
          const longWeekendCls = light ? "bg-amber-50 dark:bg-amber-500/10" : "bg-amber-400/10";

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onSelect(day)}
              onMouseEnter={() => onHover?.(day)}
              onMouseLeave={() => onHover?.(null)}
              title={holidayHere ? holidays.find((h) => h.month === day.getMonth() && h.day === day.getDate())?.name : undefined}
              style={
                isStart || isEnd
                  ? { background: tint?.hex ?? "#7c3aed", color: "#fff" }
                  : isInRange
                  ? { background: light ? (tint?.light ?? "rgba(124,58,237,0.12)") : (tint?.light ?? "rgba(124,58,237,0.15)") }
                  : {}
              }
              className={[
                "relative flex items-center justify-center text-[12px] h-8 rounded-lg transition-all",
                isPast
                  ? `cursor-not-allowed ${pastCls}`
                  : isStart || isEnd
                  ? "font-bold shadow-sm"
                  : isInRange
                  ? rangeCls
                  : isHovered
                  ? hovCls
                  : longWeekend
                  ? `font-medium ${longWeekendCls} ${normalCls}`
                  : normalCls,
                // Today gets a ring instead of a fill so it stays legible
                // even when it also happens to be selected/in-range.
                isToday && !isStart && !isEnd ? "ring-1 ring-inset " + (light ? "ring-gray-300 dark:ring-white/30" : "ring-white/30") : "",
              ].join(" ")}
            >
              {day.getDate()}
              {holidayHere && !isStart && !isEnd && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: light ? "#f59e0b" : "#fbbf24" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Time selector ───────────────────────────────────────────── */
function TimePicker({ value, onChange, label, light = false }) {
  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const borderCls  = light ? "border-t border-gray-100 dark:border-white/10"  : "border-t border-white/10";
  const labelCls   = light ? "text-gray-400 dark:text-white/40"               : "text-white/40";
  const selectCls  = light
    ? "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/15 text-gray-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
    : "bg-white/10 border-white/15 text-white [color-scheme:dark]";

  return (
    <div className={`${borderCls} pt-3 mt-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${labelCls}`}>{label}</p>
      <div className="flex items-center gap-2">
        <select
          value={value?.getHours() ?? 9}
          onChange={(e) => {
            const d = new Date(value ?? Date.now());
            d.setHours(+e.target.value);
            onChange(d);
          }}
          className={`rounded-lg text-sm px-2 py-1.5 outline-none flex-1 border ${selectCls}`}
        >
          {hours.map((h) => (
            <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>
          ))}
        </select>
        <select
          value={value?.getMinutes() ?? 0}
          onChange={(e) => {
            const d = new Date(value ?? Date.now());
            d.setMinutes(+e.target.value);
            onChange(d);
          }}
          className={`rounded-lg text-sm px-2 py-1.5 outline-none flex-1 border ${selectCls}`}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>{String(m).padStart(2,"0")} min</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── Category-aware quick-date presets (mobile only) ──────────────────
   Each preset computes { start, end, label } from "today". Weekend presets
   always resolve to an actual Saturday→Sunday span regardless of mode —
   for single/datetime modes only `start` is used (set to the Saturday). */
function nextWeekday(from, targetDow, offsetWeeks = 0) {
  const d = new Date(from);
  const diff = (targetDow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff + offsetWeeks * 7);
  return d;
}
function buildQuickDates(today) {
  const thisSat = nextWeekday(today, 6);
  const thisSun = addDays(thisSat, 1);
  const nextSat = addDays(thisSat, 7);
  const nextSun = addDays(nextSat, 1);
  return [
    { id: "today",        label: "Today",        start: today,               end: today },
    { id: "tomorrow",     label: "Tomorrow",      start: addDays(today, 1),   end: addDays(today, 1) },
    { id: "this-weekend", label: "This Weekend",  start: thisSat,             end: thisSun },
    { id: "next-weekend", label: "Next Weekend",  start: nextSat,             end: nextSun },
    { id: "custom",       label: "Custom Dates",  start: null,                end: null },
  ];
}

/* ── Category-aware duration chips (mobile only) ───────────────────────
   These describe how a booking is measured, which varies a lot by
   category. Where a chip maps cleanly onto an actual date span (nights,
   weekend, week, daily/weekly/monthly workspace terms) selecting it
   recomputes start/end from the current start date. Where it's a
   same-day daypart with no second date to set (Half Day/Morning/Evening/
   Hourly), there's no real second field to write to today — selecting one
   just ensures a start date exists and reports the label upward via
   onDurationChange so the parent (and the live summary bar) can display
   it, without inventing a new backend param. */
const DURATION_CHIPS = {
  venues: [
    { id: "half-day", label: "Half Day",       kind: "tag" },
    { id: "morning",  label: "Morning",        kind: "tag" },
    { id: "evening",  label: "Evening",        kind: "tag" },
    { id: "full-day", label: "Full Day",       kind: "tag" },
    { id: "multi-day",label: "Multiple Days",  kind: "range", nights: 2 },
  ],
  farmstays: [
    { id: "1-night",  label: "1 Night",  kind: "range", nights: 1 },
    { id: "2-nights", label: "2 Nights", kind: "range", nights: 2 },
    { id: "weekend",  label: "Weekend",  kind: "weekend" },
    { id: "1-week",   label: "1 Week",   kind: "range", nights: 7 },
  ],
  studios: [
    { id: "hourly",   label: "Hourly",   kind: "tag" },
    { id: "half-day", label: "Half Day", kind: "tag" },
    { id: "full-day", label: "Full Day", kind: "tag" },
  ],
  workspaces: [
    { id: "hourly",  label: "Hourly",  kind: "tag" },
    { id: "daily",   label: "Daily",   kind: "range", nights: 1 },
    { id: "weekly",  label: "Weekly",  kind: "range", nights: 7 },
    { id: "monthly", label: "Monthly", kind: "range", nights: 30 },
  ],
  rentals: [
    { id: "1-night",  label: "1 Night",  kind: "range", nights: 1 },
    { id: "weekend",  label: "Weekend",  kind: "weekend" },
    { id: "1-week",   label: "1 Week",   kind: "range", nights: 7 },
  ],
  experiences: [
    { id: "half-day", label: "Half Day", kind: "tag" },
    { id: "full-day", label: "Full Day", kind: "tag" },
  ],
};
function getDurationChips(category) {
  return DURATION_CHIPS[(category || "").toLowerCase()] ?? DURATION_CHIPS.venues;
}

/* ── Main DatePicker ─────────────────────────────────────────── */
export default function DatePicker({
  mode        = "single",   // "single" | "range" | "datetime"
  startDate, endDate,
  onChangeStart, onChangeEnd,
  tint,
  placeholder = "Select date",
  label,
  textClass,
  placeholderClass,
  /** When true, renders the calendar inline (no trigger button, no popup). For mobile sheets. */
  alwaysOpen  = false,
  /** When true, popup uses white bg in light mode / dark bg in dark mode. */
  lightMode   = false,
  /** Active category — drives which Quick Date / Duration chips show. Mobile (alwaysOpen) only. */
  category    = "venues",
  /** Country code — selects which static holiday list to mark. Mobile (alwaysOpen) only. */
  countryCode = "in",
  /** Fires with the tapped duration chip's label (or null) — mobile only,
   *  purely informational (e.g. so the live summary bar can show "Today · Evening"). */
  onDurationChange,
  /** Desktop popup + mode="range" only: `{ start: "Check In", end: "Check Out" }`.
   *  Renders two separate labeled trigger cells (own label + own value,
   *  visually the same two fields as before) that both open the SAME
   *  single calendar — one shared range selection instead of two
   *  independent single-date pickers that could produce an inverted range. */
  splitLabels,
}) {
  const [open,     setOpen]     = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [hovered,  setHovered]  = useState(null);
  const [rangeOverride, setRangeOverride] = useState(false); // "Multiple Days" on an otherwise single-date category
  const [activeDuration, setActiveDuration] = useState(null);
  const ref                     = useRef(null);

  const today      = new Date(); today.setHours(0,0,0,0);
  const isRange    = mode === "range" || rangeOverride;
  const isDatetime = mode === "datetime";

  /* Outside click (only in popup mode) */
  useEffect(() => {
    if (alwaysOpen || !open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, alwaysOpen]);

  const handleSelect = (day) => {
    setActiveDuration(null);
    onDurationChange?.(null);
    if (isRange) {
      if (!startDate || (startDate && endDate)) {
        onChangeStart?.(day); onChangeEnd?.(null);
      } else {
        if (day < startDate) { onChangeStart?.(day); onChangeEnd?.(null); }
        else { onChangeEnd?.(day); if (!alwaysOpen) setOpen(false); }
      }
    } else {
      onChangeStart?.(day);
      if (!isDatetime && !alwaysOpen) setOpen(false);
    }
  };

  /* Clears whatever is currently picked — was previously only possible by
     picking a different date, with no way to get back to an empty field
     short of the whole sheet's "Clear all". Resets the duration/quick-date
     override too so a stale "Weekend"/"Multiple Days" state doesn't linger
     once the actual dates are gone. */
  const clearDates = () => {
    onChangeStart?.(null);
    onChangeEnd?.(null);
    setActiveDuration(null);
    onDurationChange?.(null);
    setRangeOverride(false);
  };

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  /* ── Quick Date shortcut handling (mobile only) ── */
  const quickDates = buildQuickDates(today);
  const activeQuickId = (() => {
    if (!startDate) return null;
    for (const q of quickDates) {
      if (q.id === "custom") continue;
      if (isSameDay(q.start, startDate) && (isRange ? isSameDay(q.end, endDate) : true)) return q.id;
    }
    return "custom";
  })();

  const applyQuickDate = (q) => {
    setActiveDuration(null);
    onDurationChange?.(null);
    if (q.id === "custom") return; // just a visual "none of the above" state
    onChangeStart?.(q.start);
    onChangeEnd?.(isRange ? q.end : null);
    setViewDate(q.start);
  };

  /* ── Duration chip handling (mobile only) ── */
  const durationChips = getDurationChips(category);
  const applyDuration = (chip) => {
    setActiveDuration(chip.id);
    onDurationChange?.(chip.label);
    const base = startDate ?? today;
    if (chip.kind === "tag") {
      if (!startDate) onChangeStart?.(today);
      return;
    }
    if (chip.kind === "weekend") {
      const sat = nextWeekday(base, 6);
      onChangeStart?.(sat);
      onChangeEnd?.(addDays(sat, 1));
      setRangeOverride(true);
      setViewDate(sat);
      return;
    }
    // kind === "range"
    onChangeStart?.(base);
    onChangeEnd?.(addDays(base, chip.nights));
    setRangeOverride(true);
    setViewDate(base);
  };

  /* ── Calendar body (shared between inline + popup) ── */
  const navBtnCls  = lightMode
    ? "p-1.5 rounded-lg text-gray-400 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition"
    : "p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition";
  const monthLblCls = lightMode
    ? "text-gray-700 dark:text-white/80 font-semibold text-sm"
    : "text-white/80 font-semibold text-sm";
  const hintCls = lightMode
    ? "text-center text-gray-400 dark:text-white/35 text-[11px] mt-3"
    : "text-center text-white/35 text-[11px] mt-3";

  const holidays = getHolidays(countryCode);

  // Two months side by side — desktop range-picker dropdowns only (Check
  // In/Check Out and the like). Makes picking a span that crosses a month
  // boundary a single glance instead of two clicks of "next month".
  const showTwoMonths = !alwaysOpen && isRange;
  const nextViewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  // Mobile sheet: months stacked one below the other (scroll to browse),
  // not a single month behind prev/next arrows — easier to both scan
  // ahead and land on a date without repeated taps. Starts at the real
  // current month regardless of `viewDate` (there's no paging state left
  // to page from once arrows are gone). 6 months comfortably covers every
  // quick-date/duration preset without needing infinite-scroll machinery.
  const STACKED_MONTHS = 6;
  const stackedMonths = alwaysOpen
    ? Array.from({ length: STACKED_MONTHS }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1))
    : [];

  const monthGridProps = {
    start: startDate,
    end: endDate,
    hovered,
    range: isRange,
    minDate: today,
    tint,
    light: lightMode,
    holidays: alwaysOpen ? holidays : [],
    onSelect: handleSelect,
    onHover: isRange ? setHovered : undefined,
  };

  const clearBtnCls = lightMode
    ? "text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/80"
    : "text-white/40 hover:text-white/80";

  const calendarBody = (
    <>
      {/* Prev/next month nav only makes sense when there's a single page
         to page through — the mobile stacked list is browsed by scrolling
         instead, so it skips this row entirely. */}
      {!alwaysOpen && (
        <div className="flex items-center justify-between mb-1">
          <button type="button" onClick={prevMonth} className={navBtnCls}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={monthLblCls}>
            {showTwoMonths
              ? `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()} – ${MONTHS[nextViewDate.getMonth()]} ${nextViewDate.getFullYear()}`
              : `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
          </span>
          <button type="button" onClick={nextMonth} className={navBtnCls}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clear — only worth showing once there's actually something to
         clear. Kept as a plain text link (not another icon button) so it
         doesn't compete visually with the month-nav arrows above it. */}
      <div className={`flex justify-end h-4 ${alwaysOpen ? "mb-2" : "mb-3"}`}>
        {startDate && (
          <button
            type="button"
            onClick={clearDates}
            className={`text-[11px] font-semibold underline-offset-2 hover:underline transition ${clearBtnCls}`}
          >
            Clear {isRange ? "dates" : "date"}
          </button>
        )}
      </div>

      {alwaysOpen ? (
        <div className="space-y-7">
          {stackedMonths.map((m) => (
            <div key={`${m.getFullYear()}-${m.getMonth()}`}>
              <p className={`text-center mb-3 ${monthLblCls}`}>
                {MONTHS[m.getMonth()]} {m.getFullYear()}
              </p>
              <CalendarMonth year={m.getFullYear()} month={m.getMonth()} {...monthGridProps} />
            </div>
          ))}
        </div>
      ) : showTwoMonths ? (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <CalendarMonth year={viewDate.getFullYear()} month={viewDate.getMonth()} {...monthGridProps} />
          </div>
          <div className="flex-1 min-w-0">
            <CalendarMonth year={nextViewDate.getFullYear()} month={nextViewDate.getMonth()} {...monthGridProps} />
          </div>
        </div>
      ) : (
        <CalendarMonth year={viewDate.getFullYear()} month={viewDate.getMonth()} {...monthGridProps} />
      )}

      {isDatetime && startDate && (
        <TimePicker value={startDate} onChange={onChangeStart} label="Start time" light={lightMode} />
      )}
      {isDatetime && endDate && (
        <TimePicker value={endDate} onChange={onChangeEnd} label="End time" light={lightMode} />
      )}

      {isRange && startDate && !endDate && (
        <p className={hintCls}>Select checkout date</p>
      )}
    </>
  );

  /* ── Inline / always-open mode (mobile sheet) ── */
  if (alwaysOpen) {
    const chipBase = "shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all active:scale-95";
    const chipInactive = lightMode
      ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/15"
      : "bg-white/10 text-white/70 hover:bg-white/15";

    return (
      <div className="w-full">
        {/* Quick Date shortcuts */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {quickDates.map((q) => {
            const isActive = activeQuickId === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => applyQuickDate(q)}
                className={`${chipBase} ${isActive ? "text-white shadow-sm" : chipInactive}`}
                style={isActive ? { background: tint?.hex ?? "#7c3aed" } : undefined}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        {/* Calendar — its own premium panel instead of sitting flush */}
        <div
          className={[
            "rounded-2xl p-4 w-full",
            lightMode
              ? "bg-white dark:bg-[rgba(10,10,16,0.97)] border border-gray-100 dark:border-white/15 shadow-sm"
              : "",
          ].join(" ")}
          style={lightMode ? {} : {
            background: "rgba(10,10,16,0.97)",
            border:     `1px solid ${tint?.border ?? "rgba(255,255,255,0.15)"}`,
          }}
        >
          {calendarBody}
        </div>

        {/* Duration chips — category-aware */}
        <div className="mt-3">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-0.5 ${lightMode ? "text-gray-400 dark:text-white/35" : "text-white/35"}`}>
            Duration
          </p>
          <div className="flex flex-wrap gap-2">
            {durationChips.map((chip) => {
              const isActive = activeDuration === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => applyDuration(chip)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${isActive ? "text-white shadow-sm" : chipInactive}`}
                  style={isActive ? { background: tint?.hex ?? "#7c3aed" } : undefined}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Popup mode (desktop hero search) ── */
  const displayText = (() => {
    if (isRange) {
      if (startDate && endDate) return `${toDisplay(startDate)} → ${toDisplay(endDate)}`;
      if (startDate)            return `${toDisplay(startDate)} → …`;
      return placeholder;
    }
    return toDisplay(startDate, isDatetime) || placeholder;
  })();

  /* Shared by both the single-trigger and split-trigger layouts below —
     one calendar, one open/viewDate/hovered state, regardless of how many
     trigger cells sit above it. */
  const popupDropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: 8,   scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={lightMode ? { insetInlineStart: 0 } : {
            background:       "rgba(12,12,18,0.95)",
            border:           `1px solid ${tint?.border ?? "rgba(255,255,255,0.15)"}`,
            boxShadow:        `0 20px 60px rgba(0,0,0,0.6), ${tint?.glow ?? "0 0 24px rgba(255,255,255,0.05)"}`,
            insetInlineStart: 0,
          }}
          className={[
            "absolute top-full mt-1.5 z-[9999] rounded-2xl p-4",
            showTwoMonths ? "min-w-[560px] max-w-[620px]" : "min-w-[300px]",
            lightMode
              ? "bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
              : "backdrop-blur-2xl",
          ].join(" ")}
        >
          {calendarBody}
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* Two separate labeled cells (Check In / Check Out) that both open the
     one shared calendar above — same two fields visually as before this
     was ever merged, just backed by a single range selection instead of
     two independent single-date pickers. */
  if (splitLabels && isRange) {
    const fieldLabelCls = lightMode
      ? "text-gray-500 dark:text-white/45"
      : "text-white/40";
    const dividerCls = lightMode
      ? "bg-gray-100 dark:bg-white/10"
      : "bg-white/10";
    return (
      // No `relative` here — same as the single-trigger layout below and
      // LocationAutoComplete's own popup, the absolute calendar anchors to
      // the SearchField's own positioned wrapper (one consistent anchor
      // point for every field's dropdown, not a second nested one).
      <div ref={ref} className="w-full flex items-stretch">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 min-w-0 text-start bg-transparent text-sm outline-none"
        >
          <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 whitespace-nowrap ${fieldLabelCls}`}>
            {splitLabels.start}
          </p>
          <span className={startDate ? (textClass ?? "text-white") : (placeholderClass ?? "text-white/40")}>
            {startDate ? toDisplay(startDate) : "Select date"}
          </span>
        </button>
        <div className={`w-px shrink-0 self-stretch mx-3 ${dividerCls}`} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 min-w-0 text-start bg-transparent text-sm outline-none"
        >
          <p className={`text-[9px] font-semibold uppercase tracking-[0.1em] mb-1 whitespace-nowrap ${fieldLabelCls}`}>
            {splitLabels.end}
          </p>
          <span className={endDate ? (textClass ?? "text-white") : (placeholderClass ?? "text-white/40")}>
            {endDate ? toDisplay(endDate) : "Select date"}
          </span>
        </button>
        {popupDropdown}
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-start bg-transparent text-sm outline-none"
      >
        <span className={startDate
          ? (textClass ?? "text-white")
          : (placeholderClass ?? "text-white/40")
        }>
          {displayText}
        </span>
      </button>

      {popupDropdown}
    </div>
  );
}
