"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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

/* ── Calendar month grid ─────────────────────────────────────── */
function CalendarMonth({ year, month, start, end, hovered, onSelect, onHover, tint, range, minDate, light = false }) {
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells     = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(new Date(year, month, d));

  const dayHeaderCls = light ? "text-gray-400 dark:text-white/30" : "text-white/30";

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
          const isPast     = minDate && day < minDate;
          const isStart    = isSameDay(day, start);
          const isEnd      = isSameDay(day, end);
          const isInRange  = range && isBetween(day, start, end || hovered);
          const isHovered  = isSameDay(day, hovered);

          const normalCls = light
            ? "text-gray-700 dark:text-white/75 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
            : "text-white/75 hover:bg-white/10 hover:text-white";
          const pastCls   = light ? "text-gray-200 dark:text-white/15" : "text-white/15";
          const rangeCls  = light ? "text-gray-700 dark:text-white/90" : "text-white/90";
          const hovCls    = light ? "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white" : "bg-white/10 text-white";

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onSelect(day)}
              onMouseEnter={() => onHover?.(day)}
              onMouseLeave={() => onHover?.(null)}
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
                  : normalCls,
              ].join(" ")}
            >
              {day.getDate()}
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
}) {
  const [open,     setOpen]     = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [hovered,  setHovered]  = useState(null);
  const ref                     = useRef(null);

  const today      = new Date(); today.setHours(0,0,0,0);
  const isRange    = mode === "range";
  const isDatetime = mode === "datetime";

  /* Outside click (only in popup mode) */
  useEffect(() => {
    if (alwaysOpen || !open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, alwaysOpen]);

  const handleSelect = (day) => {
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

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

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

  const calendarBody = (
    <>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className={navBtnCls}>
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className={monthLblCls}>
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button type="button" onClick={nextMonth} className={navBtnCls}>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      <CalendarMonth
        year={viewDate.getFullYear()}
        month={viewDate.getMonth()}
        start={startDate}
        end={endDate}
        hovered={hovered}
        range={isRange}
        minDate={today}
        tint={tint}
        light={lightMode}
        onSelect={handleSelect}
        onHover={isRange ? setHovered : undefined}
      />

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
    return (
      <div
        className={[
          "rounded-2xl p-4 mt-1 w-full",
          lightMode
            ? "bg-white dark:bg-[rgba(10,10,16,0.97)] border border-gray-200 dark:border-white/15"
            : "",
        ].join(" ")}
        style={lightMode ? {} : {
          background: "rgba(10,10,16,0.97)",
          border:     `1px solid ${tint?.border ?? "rgba(255,255,255,0.15)"}`,
        }}
      >
        {calendarBody}
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

      {/* Calendar popup */}
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
              "absolute top-full mt-1.5 z-[9999] rounded-2xl p-4 min-w-[300px]",
              lightMode
                ? "bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            {calendarBody}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
