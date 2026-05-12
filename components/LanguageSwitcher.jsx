"use client";

/**
 * /components/LanguageSwitcher.jsx
 *
 * Airbnb-style language switcher dropdown.
 *
 * • Shows only the languages available for the current region.
 * • Highlights the active language.
 * • Updates URL locale instantly via useLocale hook.
 * • Persists selection to localStorage.
 * • Fully RTL-safe and dark-mode aware.
 * • Zero prop-drilling — reads region/locale from hooks.
 *
 * Usage:
 *   <LanguageSwitcher />
 */

import { useState, useRef, useEffect } from "react";
import { useLocale }  from "@/hooks/useLocale";
import { useRegion }  from "@/hooks/useRegion";
import { LANGUAGE_META } from "@/config/i18n";

export default function LanguageSwitcher() {
  const { locale, switchLocale, isRTL } = useLocale();
  const { regionConfig }                = useRegion();
  const [open, setOpen]                 = useState(false);
  const containerRef                    = useRef(null);

  /* Build the list of languages available for the current region */
  const availableLanguages = (regionConfig?.languages || ["en"]).map(
    (code) => LANGUAGE_META[code]
  ).filter(Boolean);

  const activeMeta = LANGUAGE_META[locale] || LANGUAGE_META.en;

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = (code) => {
    setOpen(false);
    if (code !== locale) switchLocale(code);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={[
          "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
          "transition-all duration-150 select-none",
          "bg-white dark:bg-gray-900",
          "border-gray-200 dark:border-gray-700",
          "text-gray-700 dark:text-gray-200",
          "hover:border-violet-400 dark:hover:border-violet-500",
          "hover:bg-violet-50 dark:hover:bg-violet-950/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
          open ? "border-violet-400 dark:border-violet-500 shadow-sm" : "",
        ].join(" ")}
      >
        <span className="text-base" aria-hidden="true">
          {activeMeta.flag}
        </span>
        <span className="hidden sm:inline">{activeMeta.native}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={[
            "absolute z-50 mt-2 min-w-[180px]",
            /* Position: flip to left when in RTL so panel doesn't overflow */
            isRTL ? "right-0" : "left-0",
            "rounded-2xl border border-gray-100 dark:border-gray-800",
            "bg-white dark:bg-gray-900",
            "shadow-xl shadow-black/10 dark:shadow-black/40",
            "py-1.5 overflow-hidden",
            "animate-fade-in-down",
          ].join(" ")}
        >
          {/* Section header */}
          <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Language
          </p>

          {availableLanguages.map((lang) => {
            const isActive = lang.code === locale;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left",
                  "transition-colors duration-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500",
                  isActive
                    ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                <span className="text-lg shrink-0" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-medium leading-normal">
                    {lang.native}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
                    {lang.label}
                  </span>
                </span>
                {isActive && (
                  <span className="ms-auto shrink-0">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Inline icons ─────────────────────────────────────────────────── */

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 text-gray-400 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-violet-500"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
