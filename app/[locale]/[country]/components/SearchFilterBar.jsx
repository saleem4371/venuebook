"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Users, Calendar, Wallet, LayoutGrid, SlidersHorizontal, Map, X } from "lucide-react";
import { useUI } from "@/context/UIContext";

/**
 * SearchFilterBar — Airbnb-inspired sticky pill-style filter strip.
 *
 * Sits immediately below the global navbar (top-[70px]).
 * Pills: Search Destination | Guests | Date | Budget | Category | Filters | Map toggle
 * Respects dark mode. RTL-safe.
 */
export default function SearchFilterBar({ onFilterOpen, onMapToggle, showMap }) {
  const t = useTranslations();
  const [activePill, setActivePill] = useState(null);
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState(null);
  const [date, setDate] = useState(null);
  const [budget, setBudget] = useState(null);
  const containerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActivePill(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (pill) => setActivePill((prev) => (prev === pill ? null : pill));

  const pillBase = [
    "relative flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
    "border bg-white dark:bg-gray-900",
    "text-gray-700 dark:text-gray-200",
    "hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm",
  ].join(" ");

  const pillActive = "border-gray-900 dark:border-white shadow-sm";
  const pillInactive = "border-gray-200 dark:border-gray-700";

  const hasValue = (v) => v !== null && v !== "" && v !== undefined;

  return (
    <div
      className="sticky top-[70px] z-30 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <div
        ref={containerRef}
        className="flex items-center gap-2 px-4 py-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >

        {/* ── Destination ── */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => toggle("destination")}
            className={`${pillBase} ${activePill === "destination" ? pillActive : pillInactive} min-w-[160px]`}
          >
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <span className={hasValue(destination) ? "text-gray-900 dark:text-white" : "text-gray-400"}>
              {hasValue(destination) ? destination : t("search.destination")}
            </span>
            {hasValue(destination) && (
              <button
                onClick={(e) => { e.stopPropagation(); setDestination(""); }}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </button>

          {activePill === "destination" && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 z-50">
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-800">
                <Search size={14} className="text-gray-400" />
                <input
                  autoFocus
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t("search.search_destination")}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                {destination && (
                  <button onClick={() => setDestination("")}>
                    <X size={13} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* ── Guests ── */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => toggle("guests")}
            className={`${pillBase} ${activePill === "guests" ? pillActive : pillInactive}`}
          >
            <Users size={14} className="text-gray-400 flex-shrink-0" />
            <span className={hasValue(guests) ? "text-gray-900 dark:text-white" : "text-gray-400"}>
              {hasValue(guests) ? `${guests} ${t("guests")}` : t("search.any_guests")}
            </span>
            {hasValue(guests) && (
              <button onClick={(e) => { e.stopPropagation(); setGuests(null); }}>
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </button>

          {activePill === "guests" && (
            <div className="absolute top-full mt-2 left-0 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                {t("search.any_guests")}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setGuests((p) => Math.max(1, (p || 1) - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-500 transition"
                >–</button>
                <span className="text-lg font-semibold text-gray-800 dark:text-white">{guests || "—"}</span>
                <button
                  onClick={() => setGuests((p) => (p || 0) + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-500 transition"
                >+</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Date ── */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => toggle("date")}
            className={`${pillBase} ${activePill === "date" ? pillActive : pillInactive}`}
          >
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <span className={hasValue(date) ? "text-gray-900 dark:text-white" : "text-gray-400"}>
              {hasValue(date) ? date : t("search.any_date")}
            </span>
            {hasValue(date) && (
              <button onClick={(e) => { e.stopPropagation(); setDate(null); }}>
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </button>

          {activePill === "date" && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                {t("search.any_date")}
              </p>
              <input
                type="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 outline-none focus:border-purple-400"
              />
            </div>
          )}
        </div>

        {/* ── Budget ── */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => toggle("budget")}
            className={`${pillBase} ${activePill === "budget" ? pillActive : pillInactive}`}
          >
            <Wallet size={14} className="text-gray-400 flex-shrink-0" />
            <span className={hasValue(budget) ? "text-gray-900 dark:text-white" : "text-gray-400"}>
              {hasValue(budget) ? budget : t("search.any_budget")}
            </span>
            {hasValue(budget) && (
              <button onClick={(e) => { e.stopPropagation(); setBudget(null); }}>
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </button>

          {activePill === "budget" && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                {t("search.any_budget")}
              </p>
              {[
                { label: "Under ₹5,000", value: "Under ₹5,000" },
                { label: "₹5,000 – ₹15,000", value: "₹5K–₹15K" },
                { label: "₹15,000 – ₹50,000", value: "₹15K–₹50K" },
                { label: "₹50,000+", value: "₹50K+" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setBudget(opt.value); setActivePill(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1 ${
                    budget === opt.value
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* ── Filters ── */}
        <button
          onClick={onFilterOpen}
          className={`${pillBase} ${pillInactive} flex-shrink-0`}
        >
          <SlidersHorizontal size={14} className="text-gray-500 flex-shrink-0" />
          <span>{t("search.filter")}</span>
        </button>

        {/* ── Map toggle (desktop only) ── */}
        <button
          onClick={onMapToggle}
          className={[
            pillBase,
            "flex-shrink-0 hidden lg:inline-flex",
            showMap
              ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : pillInactive,
          ].join(" ")}
        >
          <Map size={14} className="flex-shrink-0" />
          <span>{showMap ? t("search.show_full_map") : t("search.show_map")}</span>
        </button>

      </div>
    </div>
  );
}
