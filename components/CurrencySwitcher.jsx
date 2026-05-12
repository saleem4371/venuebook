"use client";

/**
 * /components/CurrencySwitcher.jsx
 *
 * Airbnb-style currency switcher dropdown.
 *
 * • Lists all supported currencies (INR, AED) from lib/currency.js.
 * • Highlights the currently selected currency.
 * • Persists selection to localStorage via useCurrency hook.
 * • Fully RTL-safe and dark-mode aware.
 * • Shows a live formatted sample price to preview the selection.
 *
 * Usage:
 *   <CurrencySwitcher sampleAmount={5000} />
 */

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { getAllCurrencies, formatPrice } from "@/lib/currency";
import { useLocale } from "@/hooks/useLocale";

const ALL_CURRENCIES = getAllCurrencies();

export default function CurrencySwitcher({ sampleAmount = 5000 }) {
  const { currency, setCurrency, currencyConfig } = useCurrency();
  const { isRTL }                                 = useLocale();
  const [open, setOpen]                           = useState(false);
  const containerRef                              = useRef(null);

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
    setCurrency(code);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select currency"
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
          {currencyConfig?.flag}
        </span>
        <span className="font-semibold tracking-wide">{currency}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Currency options"
          className={[
            "absolute z-50 mt-2 min-w-[220px]",
            isRTL ? "right-0" : "left-0",
            "rounded-2xl border border-gray-100 dark:border-gray-800",
            "bg-white dark:bg-gray-900",
            "shadow-xl shadow-black/10 dark:shadow-black/40",
            "py-1.5 overflow-hidden",
          ].join(" ")}
        >
          {/* Section header */}
          <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Currency
          </p>

          {ALL_CURRENCIES.map((cur) => {
            const isActive = cur.code === currency;
            /* Show preview of sample price in this currency */
            const preview = formatPrice(sampleAmount, cur.code);

            return (
              <button
                key={cur.code}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => handleSelect(cur.code)}
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
                  {cur.flag}
                </span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold leading-normal">{cur.code}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
                    {cur.name}
                  </span>
                </span>
                <span
                  className={[
                    "ms-auto text-xs font-medium tabular-nums shrink-0",
                    isActive
                      ? "text-violet-500 dark:text-violet-400"
                      : "text-gray-400 dark:text-gray-500",
                  ].join(" ")}
                >
                  {preview}
                </span>
                {isActive && (
                  <span className="ms-2 shrink-0">
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
