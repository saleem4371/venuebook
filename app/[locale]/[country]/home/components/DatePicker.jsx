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
function CalendarMonth({ year, month, start, end, hovered, onSelect, onHover, tint, range, minDate }) {
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells     = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <p className="text-center text-white/80 text-sm font-semibold mb-3">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <p key={d} className="text-center text-white/30 text-[10px] font-medium py-1">{d}</p>
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
                  ? { background: tint?.light ?? "rgba(124,58,237,0.15)" }
                  : {}
              }
              className={[
                "relative flex items-center justify-center text-[12px] h-8 rounded-lg transition-all",
                isPast
                  ? "text-white/15 cursor-not-allowed"
                  : isStart || isEnd
                  ? "font-bold shadow-sm"
                  : isInRange
                  ? "text-white/90"
                  : isHovered
                  ? "bg-white/10 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
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
function TimePicker({ value, onChange, label }) {
  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="border-t border-white/10 pt-3 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <select
          value={value?.getHours() ?? 9}
          onChange={(e) => {
            const d = new Date(value ?? Date.now());
            d.setHours(+e.target.value);
            onChange(d);
          }}
          className="bg-white/10 border border-white/15 rounded-lg text-white text-sm px-2 py-1.5 outline-none flex-1 [color-scheme:dark]"
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
          className="bg-white/10 border border-white/15 rounded-lg text-white text-sm px-2 py-1.5 outline-none flex-1 [color-scheme:dark]"
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
  mode      = "single",   // "single" | "range" | "datetime"
  startDate, endDate,
  onChangeStart, onChangeEnd,
  tint,
  placeholder = "Select date",
  label,
  textClass,
  placeholderClass,
}) {
  const [open,    setOpen]    = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [hovered, setHovered] = useState(null);
  const ref                   = useRef(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const isRange    = mode === "range";
  const isDatetime = mode === "datetime";

  /* Outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleSelect = (day) => {
    if (isRange) {
      if (!startDate || (startDate && endDate)) {
        onChangeStart?.(day); onChangeEnd?.(null);
      } else {
        if (day < startDate) { onChangeStart?.(day); onChangeEnd?.(null); }
        else { onChangeEnd?.(day); setOpen(false); }
      }
    } else {
      onChangeStart?.(day);
      if (!isDatetime) setOpen(false);
    }
  };

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const displayText = (() => {
    if (isRange) {
      if (startDate && endDate) return `${toDisplay(startDate)} → ${toDisplay(endDate)}`;
      if (startDate)            return `${toDisplay(startDate)} → …`;
      return placeholder;
    }
    return toDisplay(startDate, isDatetime) || placeholder;
  })();

  return (
    <div ref={ref} className="relative w-full">
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
            style={{
              background:       "rgba(12,12,18,0.95)",
              border:           `1px solid ${tint?.border ?? "rgba(255,255,255,0.15)"}`,
              boxShadow:        `0 20px 60px rgba(0,0,0,0.6), ${tint?.glow ?? "0 0 24px rgba(255,255,255,0.05)"}`,
              insetInlineStart: 0,
            }}
            className="absolute top-full mt-3 z-[9999] rounded-2xl backdrop-blur-2xl p-4 min-w-[300px]"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-white/80 font-semibold text-sm">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
              >
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
              onSelect={handleSelect}
              onHover={isRange ? setHovered : undefined}
            />

            {/* Time picker for datetime mode */}
            {isDatetime && startDate && (
              <TimePicker
                value={startDate}
                onChange={onChangeStart}
                label="Start time"
              />
            )}
            {isDatetime && endDate && (
              <TimePicker
                value={endDate}
                onChange={onChangeEnd}
                label="End time"
              />
            )}

            {/* Range hint */}
            {isRange && startDate && !endDate && (
              <p className="text-center text-white/35 text-[11px] mt-3">
                Select checkout date
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
