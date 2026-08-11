"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react";
import {
  MONTHS,
  DAYS,
  addDays,
  getHolidays,
  getDurationChips,
  nextWeekday,
  CalendarMonth,
  TimePicker,
} from "./DatePicker";

/* ── Premium mobile date calendar ──────────────────────────────────────
 * Dedicated mobile-only calendar for MobileSearchSheet — large horizontally
 * swipeable month cards (CSS scroll-snap) with a sticky month header,
 * instead of DatePicker.jsx's vertically-stacked 6-month list. Reuses
 * DatePicker's exported CalendarMonth grid + pure date helpers so the
 * actual date logic (range selection, holiday marking, past-date
 * disabling) is the exact same code as the desktop picker, not a second,
 * drift-prone copy.
 *
 * Props deliberately mirror <DatePicker alwaysOpen .../>'s contract
 * (mode/startDate/endDate/onChangeStart/onChangeEnd/tint/category/
 * countryCode/onDurationChange) so swapping one for the other in
 * MobileSearchSheet.jsx only touches that one call site — no changes to
 * search logic, routing, or state shape.
 */
const MONTHS_AHEAD = 13; // current month + next 12 — a full year of runway without infinite-scroll machinery

export default function MobileDateCalendar({
  mode        = "single",   // "single" | "range" | "datetime"
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  tint,
  category    = "venues",
  countryCode = "in",
  /** Purely informational label (e.g. "Weekly", "Half Day") — mirrors
   *  DatePicker's onDurationChange contract exactly, see MobileSearchSheet
   *  for how it's folded into the summary text and search params. */
  onDurationChange,
  /** Optional (date) => number|string|null. No pricing-per-date data
   *  source exists in this codebase yet, so nothing passes this today —
   *  left wired (via CalendarMonth's getPrice slot) so real pricing can
   *  be plugged in later with no layout changes. */
  getPrice,
}) {
  const t = useTranslations("searchBar");
  const isRangeMode = mode === "range";
  const isDatetime  = mode === "datetime";
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const holidays = useMemo(() => getHolidays(countryCode), [countryCode]);
  const durationChips = useMemo(() => getDurationChips(category), [category]);

  // A duration chip like "Multiple Days" can turn an otherwise single-date
  // category into a real start+end range, same override mechanism
  // DatePicker.jsx's alwaysOpen mode already uses — kept identical so the
  // resulting state shape (both startDate AND endDate populated) matches
  // what the rest of the app already expects from this override today.
  const [rangeOverride, setRangeOverride] = useState(false);
  const isRange = isRangeMode || rangeOverride;

  const [hovered, setHovered]       = useState(null);
  const [activeDuration, setActiveDuration] = useState(null);
  const [viewIndex, setViewIndex]   = useState(0);
  // "exact" = the swipeable calendar (default). "flexible" = trip-length
  // presets (Weekend/1 Week/...) — the same DURATION_CHIPS data that used
  // to sit as a permanent row under the calendar, now its own Airbnb-style
  // tab. Resets to "exact" on remount (Date tab unmounts when the sheet
  // switches to another tab), so it never opens back up already flipped.
  const [dateSubTab, setDateSubTab] = useState("exact");
  // Index into `months` — which month the Flexible tab's "When do you
  // want to go?" row currently has selected. The two Flexible sections
  // are linked: this drives what base date every trip-length card's
  // preview (and the actual dates a tap applies) resolves against, same
  // as Airbnb's own Weekend/Week/Month + month-row combo. Defaults to the
  // current month (index 0), which resolves to `today` below — identical
  // to the old today-only behaviour until the user actually touches it.
  const [flexMonthIndex, setFlexMonthIndex] = useState(0);

  const months = useMemo(
    () => Array.from({ length: MONTHS_AHEAD }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1)),
    [today]
  );

  const scrollRef = useRef(null);
  const cardRefs  = useRef([]);

  /* Tracks which month card is most visible while swiping, so the sticky
     header can show "August 2026" etc. IntersectionObserver on purpose —
     scrollLeft's sign convention for RTL differs across browsers, but
     IntersectionObserver just reports what's actually visible regardless
     of scroll direction, so this needs no extra branching for Arabic. */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (best) {
          const idx = Number(best.target.dataset.index);
          if (!Number.isNaN(idx)) setViewIndex(idx);
        }
      },
      { root: container, threshold: [0.5, 0.6, 0.7, 0.8, 0.9] }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [months.length]);

  const goToIndex = (idx) => {
    const clamped = Math.max(0, Math.min(months.length - 1, idx));
    const card = cardRefs.current[clamped];
    if (scrollRef.current && card) {
      scrollRef.current.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  };

  const handleSelect = (day) => {
    setActiveDuration(null);
    onDurationChange?.(null);
    if (isRange) {
      if (!startDate || (startDate && endDate)) {
        onChangeStart?.(day);
        onChangeEnd?.(null);
      } else if (day < startDate) {
        onChangeStart?.(day);
        onChangeEnd?.(null);
      } else {
        onChangeEnd?.(day);
      }
    } else {
      onChangeStart?.(day);
    }
  };

  const clearDates = () => {
    onChangeStart?.(null);
    onChangeEnd?.(null);
    setActiveDuration(null);
    onDurationChange?.(null);
    setRangeOverride(false);
  };

  // `base` is now passed in explicitly (the linked "When do you want to
  // go?" month, resolved via monthBase below) instead of computed
  // internally from startDate — callers control exactly which date this
  // resolves against, which matters for the month-row's own onClick (it
  // needs to re-run this against the JUST-clicked month, not whatever
  // `flexMonthIndex` was before that click's state update lands).
  const applyDuration = (chip, base) => {
    setActiveDuration(chip.id);
    onDurationChange?.(chip.label);
    if (chip.kind === "tag") {
      onChangeStart?.(base);
      return;
    }
    if (chip.kind === "weekend") {
      const sat = nextWeekday(base, 6);
      onChangeStart?.(sat);
      onChangeEnd?.(addDays(sat, 1));
      setRangeOverride(true);
      return;
    }
    onChangeStart?.(base);
    onChangeEnd?.(addDays(base, chip.nights));
    setRangeOverride(true);
  };

  const nights = isRange && startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : 0;

  const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const summaryText = (() => {
    if (isRange) {
      if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
      if (startDate) return `${fmt(startDate)} – …`;
      return t("choose_travel_dates");
    }
    return startDate ? fmt(startDate) : t("choose_travel_dates");
  })();

  // The Flexible tab's linked base date — the 1st of whichever month is
  // selected in "When do you want to go?", or `today` if that month is
  // the current one (can't resolve to a date already in the past). Every
  // trip-length card's preview AND its actual applyDuration() call use
  // this, so changing the month live-updates every "9 – 16 Aug" preview
  // even before a trip-length card is tapped.
  const monthBase = (m) => {
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    return first < today ? today : first;
  };
  const flexBase = monthBase(months[flexMonthIndex] ?? today);

  // Pure preview of what tapping a Flexible option WOULD set — same date
  // math as applyDuration, just read-only, so each card can show "9 – 16
  // Aug" etc. under its label instead of leaving the user to guess which
  // actual dates "1 Week" resolves to before tapping it.
  const previewChipDates = (chip) => {
    if (chip.kind === "tag") return fmt(flexBase);
    if (chip.kind === "weekend") {
      const sat = nextWeekday(flexBase, 6);
      return `${fmt(sat)} – ${fmt(addDays(sat, 1))}`;
    }
    return `${fmt(flexBase)} – ${fmt(addDays(flexBase, chip.nights))}`;
  };

  const tintHex = tint?.hex ?? "#7c3aed";

  return (
    <div className="w-full flex flex-col">
      {/* Dates / Flexible toggle — Airbnb-style segmented switch, sits
          above everything else. Flexible reuses the exact same
          category-aware trip-length presets (DURATION_CHIPS in
          DatePicker.jsx) that used to sit as a permanent chip row under
          the calendar — picking one still just runs through the same
          onChangeStart/onChangeEnd callbacks a normal date tap does (same
          params sent to search, same auto-advance to Who), it's just its
          own dedicated tab now instead of an always-visible row. */}
      <div className="relative flex items-center p-1 rounded-full mb-3 shrink-0 bg-gray-100 dark:bg-white/[0.06]">
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-white dark:bg-white/[0.14] shadow-sm"
          style={{ width: "calc(50% - 4px)" }}
          animate={{ left: dateSubTab === "exact" ? 4 : "50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.9 }}
        />
        <button
          type="button"
          role="tab"
          aria-selected={dateSubTab === "exact"}
          onClick={() => setDateSubTab("exact")}
          className={`relative z-10 flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
            dateSubTab === "exact" ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-white/40"
          }`}
        >
          {t("dates_tab")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={dateSubTab === "flexible"}
          onClick={() => setDateSubTab("flexible")}
          className={`relative z-10 flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
            dateSubTab === "flexible" ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-white/40"
          }`}
        >
          {t("flexible_tab")}
        </button>
      </div>

      {dateSubTab === "exact" ? (
        <>
          {/* Empty-state prompt — spec's exact copy, shown only until a date exists */}
          {!startDate && (
            <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5">
              {t("choose_travel_dates")}
            </p>
          )}

          {/* Summary + Clear — moved above the calendar (was a sticky
              footer below it) so the current selection reads as a
              confirmation bar before scrolling into the months, matching
              where Airbnb places it. */}
          {startDate && (
            <div className="flex items-center gap-2 mb-3 px-3.5 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{summaryText}</p>
                {nights > 0 && (
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{t("nights_count", { count: nights })}</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearDates}
                className="shrink-0 h-9 px-3.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                {t("clear")}
              </button>
            </div>
          )}

          {/* Sticky month header — sticks to the top of this section's own
              scroll container (the sheet's content div), not the
              viewport, so it stays put while the months underneath it scroll. */}
          <div className="sticky top-0 z-10 flex items-center justify-between mb-2 py-1.5 -mt-0.5 bg-gray-50/95 dark:bg-gray-900/90 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => goToIndex(viewIndex - 1)}
              disabled={viewIndex === 0}
              aria-label={t("previous_month")}
              className="w-11 h-11 rounded-full flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="text-[15px] font-bold text-gray-800 dark:text-white tabular-nums">
              {months[viewIndex] ? `${MONTHS[months[viewIndex].getMonth()]} ${months[viewIndex].getFullYear()}` : ""}
            </span>
            <button
              type="button"
              onClick={() => goToIndex(viewIndex + 1)}
              disabled={viewIndex === months.length - 1}
              aria-label={t("next_month")}
              className="w-11 h-11 rounded-full flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* Fixed weekday row — sits above the swiping months and never
              moves, since every month card shares the same 7-column grid. */}
          <div className="grid grid-cols-7 gap-1 px-0.5 mb-1">
            {DAYS.map((d) => (
              <p key={d} className="text-center text-[11px] font-medium py-1 text-gray-400 dark:text-white/35">{d}</p>
            ))}
          </div>

          {/* Horizontally swipeable month cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollBehavior: "smooth" }}
            role="group"
            aria-label={t("choose_travel_dates")}
          >
            {months.map((m, i) => (
              <div
                key={`${m.getFullYear()}-${m.getMonth()}`}
                ref={(el) => (cardRefs.current[i] = el)}
                data-index={i}
                className="snap-start shrink-0 w-full px-0.5"
              >
                <CalendarMonth
                  year={m.getFullYear()}
                  month={m.getMonth()}
                  start={startDate}
                  end={endDate}
                  hovered={hovered}
                  range={isRange}
                  minDate={today}
                  tint={tint}
                  light
                  size="lg"
                  highlightWeekends
                  showWeekdays={false}
                  holidays={holidays}
                  onSelect={handleSelect}
                  onHover={isRange ? setHovered : undefined}
                  getPrice={getPrice}
                />
              </div>
            ))}
          </div>

          {/* Time — studios' "datetime" mode only. Every other category's
              config.dateMode is "single"/"range", so isDatetime is false and
              this never renders for them — same gating DatePicker.jsx used. */}
          {isDatetime && startDate && (
            <div className="mt-3 px-0.5">
              <TimePicker value={startDate} onChange={onChangeStart} label={t("start_time")} light />
            </div>
          )}
          {isDatetime && endDate && (
            <div className="mt-1 px-0.5">
              <TimePicker value={endDate} onChange={onChangeEnd} label={t("end_time")} light />
            </div>
          )}
        </>
      ) : (
        /* Flexible — two linked Airbnb-style sections, "When do you want
           to go?" (a month row) first, then "How long would you like to
           stay?" (category-aware trip-length cards) — matches picking a
           rough time before a length, same order Airbnb uses. Both read/
           write the same `flexMonthIndex` state: picking a month
           live-updates every trip-length card's date preview without
           needing to re-tap one, and if a trip-length is already active,
           picking a new month immediately re-applies it against the new
           month. Picking a trip-length card computes real start/end
           dates via the exact same onChangeStart/onChangeEnd path a
           calendar tap uses (same params, same auto-advance), then flips
           back to Dates so the result is visible/confirmable. */
        <div className="flex flex-col">
          <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5">
            {t("flexible_when_heading")}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {months.map((m, i) => {
              const isActive = flexMonthIndex === i;
              return (
                <button
                  key={`${m.getFullYear()}-${m.getMonth()}`}
                  type="button"
                  onClick={() => {
                    setFlexMonthIndex(i);
                    // Linked: if a trip-length is already active, moving
                    // the month immediately recomputes real dates against
                    // it instead of leaving the old selection stale.
                    // `monthBase(m)` (not `flexBase`) — this reads the
                    // month just clicked directly, sidestepping React's
                    // state-update batching so it can't apply against the
                    // PREVIOUS flexMonthIndex in the same click.
                    if (activeDuration) {
                      const chip = durationChips.find((c) => c.id === activeDuration);
                      if (chip) applyDuration(chip, monthBase(m));
                    }
                  }}
                  className={`shrink-0 w-24 flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-gray-100 dark:border-white/10 text-gray-800 dark:text-white hover:border-gray-200 dark:hover:border-white/20"
                  }`}
                  style={isActive ? { background: tintHex } : undefined}
                >
                  <CalendarDays className="w-4 h-4" style={{ color: isActive ? "#fff" : tintHex }} />
                  <span className="text-sm font-semibold">{MONTHS[m.getMonth()]}</span>
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400 dark:text-white/40"}`}>
                    {m.getFullYear()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/10 my-5" />

          <p className="text-[15px] font-bold text-gray-800 dark:text-white mb-3 px-0.5">
            {t("flexible_heading")}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {durationChips.map((chip) => {
              const isActive = activeDuration === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => { applyDuration(chip, flexBase); setDateSubTab("exact"); }}
                  className={`flex flex-col items-start gap-2 p-4 min-h-[44px] rounded-2xl border text-start transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-gray-100 dark:border-white/10 text-gray-800 dark:text-white hover:border-gray-200 dark:hover:border-white/20"
                  }`}
                  style={isActive ? { background: tintHex } : undefined}
                >
                  <Clock className="w-4 h-4" style={{ color: isActive ? "#fff" : tintHex }} />
                  <span className="text-sm font-semibold">{chip.label}</span>
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400 dark:text-white/40"}`}>
                    {previewChipDates(chip)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
