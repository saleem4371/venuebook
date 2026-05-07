"use client";

/**
 * /app/[locale]/[country]/home/components/RegionLanguageModal.jsx
 *
 * Region & Language selection modal.
 *
 * Data is sourced from:
 *   - /lib/region.js        → region list (IN, AE) with currencies
 *   - /config/i18n.js       → language metadata
 *
 * No hardcoded region or language arrays in this file.
 * To add a new region or language, update the config files only.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getAllRegions, getRegionByCountryCode } from "@/lib/region";
import { getAllCurrencies }                      from "@/lib/currency";
import { LANGUAGE_META }                        from "@/config/i18n";
import { useRegionContext }                     from "@/context/RegionContext";
import { useCurrency }                          from "@/hooks/useCurrency";

/* ── Build data from config ──────────────────────────────────────── */

const ALL_REGIONS    = getAllRegions();
const ALL_CURRENCIES = getAllCurrencies();

/* ── Component ───────────────────────────────────────────────────── */

export default function RegionLanguageModal({ open, onClose }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useParams();
  const panelRef = useRef(null);

  const t = useTranslations("modal");

  const { setRegion }                       = useRegionContext();
  const { currency, setCurrency, mounted: currencyMounted } = useCurrency();

  const currentLocale  = params?.locale  || "en";
  const currentCountry = params?.country || "in";

  /* Derive available languages for the currently selected region */
  const currentRegion      = getRegionByCountryCode(currentCountry);
  const availableLanguages = (currentRegion?.languages || ["en"]).map(
    (code) => LANGUAGE_META[code]
  ).filter(Boolean);

  /* ── ESC to close ───────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ── Focus panel on open ────────────────────────────────────── */
  useEffect(() => { if (open) panelRef.current?.focus(); }, [open]);

  /* ── Body scroll lock ───────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleLanguage = (code) => {
    onClose();
    try { localStorage.setItem("vb_language", code); } catch (_) {}
    router.push(pathname.replace(`/${currentLocale}/`, `/${code}/`));
  };

  const handleRegion = (countryCode) => {
    onClose();
    /* 1. Sync context + localStorage immediately (before navigation) */
    const regionData = getRegionByCountryCode(countryCode);
    if (regionData) setRegion(regionData.code);

    /* 2. Validate current locale against the new region's allowed languages.
     *    If the locale is not supported, fall back to the region's default. */
    const allowedLocales = regionData?.languages ?? ["en"];
    const targetLocale   = allowedLocales.includes(currentLocale)
      ? currentLocale
      : (regionData?.defaultLocale ?? "en");

    if (targetLocale !== currentLocale) {
      try { localStorage.setItem("vb_language", targetLocale); } catch (_) {}
    }

    /* 3. Build new URL — update both locale (parts[0]) and country (parts[1]) */
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 1) parts[0] = targetLocale;
    if (parts.length >= 2) parts[1] = countryCode;
    router.push("/" + parts.join("/"));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────── */}
          <motion.div
            key="rl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* ── Panel ────────────────────────────────────────── */}
          <motion.div
            key="rl-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rl-title"
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed left-1/2 top-1/2 z-[90]",
              "-translate-x-1/2 -translate-y-1/2",
              "w-[calc(100%-2rem)] max-w-[500px]",
              "rounded-2xl overflow-hidden outline-none",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-2xl shadow-black/20 dark:shadow-black/60",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <GlobeIcon />
                </span>
                <h2 id="rl-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t("title")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* ── Language Section ─────────────────────────── */}
              <section>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  <LanguageIcon /> {t("language")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableLanguages.map((lang) => {
                    const active = lang.code === currentLocale;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguage(lang.code)}
                        className={[
                          "relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left",
                          "transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                        ].join(" ")}
                      >
                        <span className="text-xl leading-none select-none">{lang.flag}</span>
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium leading-tight truncate">{lang.label}</span>
                          <span className="text-xs leading-tight text-gray-400 dark:text-gray-500 truncate">
                            {lang.native}
                          </span>
                        </span>
                        {active && (
                          <span className="ml-auto shrink-0 h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="h-px bg-gray-100 dark:bg-gray-800" />

              {/* ── Region Section ───────────────────────────── */}
              <section>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  <PinIcon /> {t("region")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_REGIONS.map((region) => {
                    const active = region.countryCode === currentCountry;
                    return (
                      <button
                        key={region.code}
                        type="button"
                        onClick={() => handleRegion(region.countryCode)}
                        className={[
                          "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5",
                          "text-sm transition cursor-pointer",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                        ].join(" ")}
                      >
                        <span className="text-[26px] leading-none select-none">{region.flag}</span>
                        <span className="font-medium text-center leading-tight text-xs sm:text-sm">
                          {region.name}
                        </span>
                        <span
                          className={[
                            "text-[11px] font-medium leading-none px-1.5 py-0.5 rounded-full",
                            active
                              ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                          ].join(" ")}
                        >
                          {region.currency}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="h-px bg-gray-100 dark:bg-gray-800" />

              {/* ── Currency Section ─────────────────────────── */}
              <section className="pb-1">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  <CurrencyIcon /> {t("currency")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CURRENCIES.map((cur) => {
                    const active = currencyMounted && currency === cur.code;
                    return (
                      <button
                        key={cur.code}
                        type="button"
                        onClick={() => setCurrency(cur.code)}
                        className={[
                          "relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left",
                          "transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                        ].join(" ")}
                      >
                        <span className="text-xl leading-none select-none">{cur.flag}</span>
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium leading-tight truncate">{cur.code}</span>
                          <span className="text-xs leading-tight text-gray-400 dark:text-gray-500 truncate">
                            {cur.name}
                          </span>
                        </span>
                        {active && (
                          <span className="ml-auto shrink-0 h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Inline SVG icons ─────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8l6 6" /><path d="M4 14s1-1 2-1 2.5 2 2.5 2-1 1-2 1-2.5-2-2.5-2z" />
      <path d="M12 4v4M8 4h8" /><path d="M13 4l4 8" /><path d="M13 12l4-8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="18" />
    </svg>
  );
}
