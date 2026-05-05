"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi",   native: "हिन्दी",  flag: "🇮🇳" },
];

const REGIONS = [
  { code: "in", name: "India",         flag: "🇮🇳", currency: "INR" },
  { code: "ae", name: "UAE",           flag: "🇦🇪", currency: "AED" },
  { code: "us", name: "United States", flag: "🇺🇸", currency: "USD" },
];

/* ------------------------------------------------------------------ */
/*  RegionLanguageModal                                                 */
/* ------------------------------------------------------------------ */

export default function RegionLanguageModal({ open, onClose }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useParams();
  const panelRef = useRef(null);

  const currentLocale  = params?.locale  || "en";
  const currentCountry = params?.country || "in";

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Focus panel */
  useEffect(() => { if (open) panelRef.current?.focus(); }, [open]);

  /* Body scroll lock — lock on open, unlock immediately on close */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Handlers */
  const handleLanguage = (code) => {
    onClose();
    router.push(pathname.replace(`/${currentLocale}`, `/${code}`));
  };

  const handleRegion = (code) => {
    onClose();
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) parts[1] = code;
    router.push("/" + parts.join("/"));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
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

          {/* Panel */}
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
                  Region &amp; Language
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

            <div className="px-6 py-5 space-y-6">

              {/* Language section */}
              <section>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  <LanguageIcon /> Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => {
                    const active = lang.code === currentLocale;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguage(lang.code)}
                        className={[
                          "relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left",
                          "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                        ].join(" ")}
                      >
                        <span className="text-xl leading-none select-none">{lang.flag}</span>
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium leading-tight truncate">{lang.label}</span>
                          <span className="text-xs leading-tight text-gray-400 dark:text-gray-500 truncate">{lang.native}</span>
                        </span>
                        {active && (
                          <span className="ml-auto shrink-0 h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-gray-800" />

              {/* Region section */}
              <section className="pb-1">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  <PinIcon /> Region
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {REGIONS.map((region) => {
                    const active = region.code === currentCountry;
                    return (
                      <button
                        key={region.code}
                        type="button"
                        onClick={() => handleRegion(region.code)}
                        className={[
                          "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5",
                          "text-sm transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          active
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                        ].join(" ")}
                      >
                        <span className="text-[26px] leading-none select-none">{region.flag}</span>
                        <span className="font-medium text-center leading-tight text-xs sm:text-sm">{region.name}</span>
                        <span className={[
                          "text-[11px] font-medium leading-none px-1.5 py-0.5 rounded-full",
                          active
                            ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                        ].join(" ")}>
                          {region.currency}
                        </span>
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

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                    */
/* ------------------------------------------------------------------ */

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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
