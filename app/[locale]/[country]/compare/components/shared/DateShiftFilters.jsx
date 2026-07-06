"use client";

/**
 * DateShiftFilters — replaces the native <input type="date"> / <select>
 * pair in StickyCompareBar with custom-styled equivalents that match the
 * rest of the design system (no browser-default calendar flyout, no
 * browser-default dropdown list). Built on @headlessui/react's Popover /
 * Listbox (already a project dependency) rather than a new library, to
 * keep the bundle minimal.
 */

import { Fragment, useMemo, useState } from "react";
import { Popover, Listbox, Transition } from "@headlessui/react";
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, Check } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

/** Locale-aware weekday short labels (Su, Mo, ... in en; translated equivalents elsewhere). */
function weekdayLabels(locale) {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2023-01-01 is a Sunday — a stable, arbitrary week to read labels off of.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
}

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseISO(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

/** Always-6-rows (42 cell) month grid, leading/trailing days from adjacent months included and greyed out. */
function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, y: month === 0 ? year - 1 : year, m: month === 0 ? 11 : month - 1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, y: year, m: month });
  }
  while (cells.length < 42) {
    const d = cells.length - (firstWeekday + daysInMonth) + 1;
    cells.push({ day: d, inMonth: false, y: month === 11 ? year + 1 : year, m: month === 11 ? 0 : month + 1 });
  }
  return cells;
}

function DatePickerField({ value, onChange, todayLabel, prevMonthLabel, nextMonthLabel, locale }) {
  const selected = useMemo(() => parseISO(value), [value]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
  const displayLabel = selected.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const goMonth = (delta) => {
    let y = viewYear, m = viewMonth + delta;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewYear(y); setViewMonth(m);
  };

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <Popover className="relative">
      <Popover.Button className="flex sm:inline-flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 text-[13px] font-medium text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-violet-400 transition">
        <CalendarDays size={14} className="text-violet-500 flex-shrink-0" />
        <span className="truncate">{displayLabel}</span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Panel className="absolute z-50 mt-2 w-[280px] max-w-[90vw] rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4">
          {({ close }) => (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => goMonth(-1)} aria-label={prevMonthLabel} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">{monthLabel}</span>
                <button type="button" onClick={() => goMonth(1)} aria-label={nextMonthLabel} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1 mb-1">
                {weekdays.map((w, i) => (
                  <span key={i} className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-500 text-center">{w}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {grid.map((cell, i) => {
                  const iso = toISO(cell.y, cell.m, cell.day);
                  const isSelected = iso === value;
                  const isToday = iso === todayISO;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { onChange(iso); close(); }}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[12px] transition
                        ${!cell.inMonth ? "text-gray-300 dark:text-gray-700" : "text-gray-700 dark:text-gray-200"}
                        ${isSelected ? "bg-violet-500 text-white font-semibold hover:bg-violet-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                        ${isToday && !isSelected ? "ring-1 ring-violet-300 dark:ring-violet-700 font-semibold" : ""}`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => { const t = new Date(); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); onChange(todayISO); close(); }}
                  className="text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {todayLabel}
                </button>
              </div>
            </>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

function ShiftDropdown({ value, onChange, options }) {
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="flex sm:inline-flex w-full sm:w-auto items-center gap-2 text-[13px] font-medium text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-violet-400 transition sm:min-w-[112px]">
          <span className="flex-1 text-left truncate">{current?.label}</span>
          <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-150" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options className="absolute z-50 mt-2 w-full min-w-[140px] rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_12px_32px_rgba(0,0,0,0.12)] py-1.5 focus:outline-none">
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt.value} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={`flex items-center justify-between gap-2 px-3.5 py-2 text-[12.5px] font-medium cursor-pointer
                      ${selected ? "text-violet-600 dark:text-violet-400" : "text-gray-700 dark:text-gray-200"}
                      ${active ? "bg-gray-50 dark:bg-gray-800/60" : ""}`}
                  >
                    {opt.label}
                    {selected && <Check size={13} />}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default function DateShiftFilters({ selectedDate, setSelectedDate, selectedShift, setSelectedShift, t }) {
  const { locale } = useLocale();
  const shiftOptions = [
    { value: "day", label: t("shiftDay") },
    { value: "evening", label: t("shiftEvening") },
    { value: "fullday", label: t("shiftFullDay") },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
      <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400 sm:flex-shrink-0">
        {t("checkingFor")}
      </span>
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
        <DatePickerField
          value={selectedDate}
          onChange={setSelectedDate}
          todayLabel={t("today")}
          prevMonthLabel={t("prevMonth")}
          nextMonthLabel={t("nextMonth")}
          locale={locale}
        />
        <ShiftDropdown value={selectedShift} onChange={setSelectedShift} options={shiftOptions} />
      </div>
    </div>
  );
}
