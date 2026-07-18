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

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePreferredLocation } from "@/hooks/usePreferredLocation";

import { getAllRegions, getRegionByCountryCode } from "@/lib/region";
import { getAllCurrencies }                      from "@/lib/currency";
import { LANGUAGE_META }                        from "@/config/i18n";
import { useRegionContext }                     from "@/context/RegionContext";
import { useCurrency }                          from "@/hooks/useCurrency";


import { getCountry  } from '@/services/global.service';
import { SyncDestination  } from '@/services/listing.service';
import useCountryStore from "@/store/useCountryStore";
import useGlobalCountryStore from "@/store/useGlobalCountryStore";

  /* AUTO DETECT COUNTRY */
const detectCountry = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code;
  } catch (err) {
    console.log("Geo detect failed", err);
    return null;
  }
};



/* ── Build data from config ──────────────────────────────────────── */

// const ALL_REGIONS    = getAllRegions();
const ALL_CURRENCIES = getAllCurrencies();

/* ── Component ───────────────────────────────────────────────────── */

export default function RegionLanguageModal({ open, onClose }) {

   const { selectedCountry, setCountry } = useCountryStore();

  const router   = useRouter();
  const pathname = usePathname();
  const params   = useParams();
  const panelRef = useRef(null);

  const [loadcountry, setLoadCountry] = useState([]);

  //getCountry

   useEffect(() => {

    Load();

  }, []);

   const Load = async () => {

     const res =
        await getCountry(); 
        
        const countries = res.data || [];
      setLoadCountry(
        countries,
      );


       // 2. localStorage check
        const saved = localStorage.getItem("country");

        if (saved) {
          setCountry(JSON.parse(saved));
          setSelectedCountry(JSON.parse(saved));
          return;
        }

        // 3. detect IP country
        const code = await detectCountry();


        if (code && countries.length) {
          const match = countries.find(
            (c) => c.iso_code === code
          );


          if (match) {
            setCountry(match);
             setSelectedCountry(match)
            localStorage.setItem("country", JSON.stringify(match));
          }
         
        }

   }

  /* Active tab: "lang_region" | "currency" */
  const [activeTab, setActiveTab] = useState("lang_region");

  /* Pending selection — shows spinner, blocks further clicks */
  const [pending, setPending] = useState(null); // { type: "region"|"language", value: string }

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



  /* Reset state on open */
  useEffect(() => {
    if (open) {
      setActiveTab("lang_region");
      setPending(null);
      setPendingRegion(null);
      setLocDirty(false);
      setLocError(false);
      setLocQuery(preferredLocation?.label || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  /* ── Helpers ────────────────────────────────────────────────── */

  /* Show spinner on the clicked item for `delay` ms, then execute fn */
  const withDelay = useCallback((fn, type, value, delay = 700) => {
    if (pending) return;
    setPending({ type, value });
    setTimeout(() => { setPending(null); fn(); }, delay);
  }, [pending]);

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




  /* ── Preferred location ─────────────────────────────────────── */
  const { location: preferredLocation, setLocation, ipCountryCode } = usePreferredLocation();

  /* Location input state — synced to preferredLocation on mount */
  const [locQuery,   setLocQuery]   = useState("");
  const [locGoogle,  setLocGoogle]  = useState([]);
  const [locShow,    setLocShow]    = useState(false);
  const [locError,   setLocError]   = useState(false); // true when Confirm clicked with empty location
  const locWrapRef  = useRef(null);
  const locInputRef = useRef(null);

  /* pendingRegion: set when user clicks a region (not yet confirmed).
     locDirty: set when user picks a location suggestion (not yet saved). */
  const [pendingRegion, setPendingRegion] = useState(null);
  const [locDirty,      setLocDirty]      = useState(false);

  useEffect(() => {
    if (preferredLocation?.label) setLocQuery(preferredLocation.label);
  }, [preferredLocation?.label]);

  /* Restrict Places suggestions to the active or pending country */
  const locCountryCode = (pendingRegion?.iso_code || currentCountry).toLowerCase();

  /* Google Places suggestions — only fires when Maps script is loaded */
  useEffect(() => {
    if (typeof window === "undefined" || !window.google || locQuery.length < 2) {
      setLocGoogle([]); return;
    }
    const svc = new window.google.maps.places.AutocompleteService();
    svc.getPlacePredictions(
      { input: locQuery, componentRestrictions: { country: locCountryCode } },
      (preds) => { setLocGoogle(preds ?? []); }
    );
  }, [locQuery, locCountryCode]);

  /* Click-outside to close dropdown */
  useEffect(() => {
    if (!locShow) return;
    const handler = (e) => {
      if (locWrapRef.current && !locWrapRef.current.contains(e.target))
        setLocShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [locShow]);

  /* Stage the selection — geocoding + setLocation happens on Confirm */
  const handleLocSelect = (label) => {
    setLocQuery(label);
    setLocDirty(true);
    setLocShow(false);
  };

  /* Save location (with geocoding) and apply any pending region change */
  const handleConfirm = () => {
    /* Location is always required — block if empty */
    if (!locQuery.trim()) {
      setLocError(true);
      locInputRef.current?.focus();
      return;
    }
    setLocError(false);

    const applyChanges = async (loc) => {
      if (loc !== undefined) setLocation(loc);

      console.log(loc)
     

      if (pendingRegion) {
        const isoCode = pendingRegion.iso_code.toLowerCase();
        const regionData = { ...pendingRegion, iso_code: isoCode };
        setSelectedCountry(regionData);
        setCountry(regionData);
        localStorage.setItem("country", JSON.stringify(regionData));
        handleRegion(isoCode); // calls onClose() + router.push

        //Call Sync Destination API 
       

      } else {
        onClose();
      }
        // await SyncDestination(loc.label)
        void SyncDestination(loc.label).catch(console.error);
    };

    if (locDirty) {
      if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: locQuery }, (results, status) => {
          if (status === "OK" && results[0]) {
            const pos = results[0].geometry.location;
            applyChanges({ label: locQuery, lat: pos.lat(), lng: pos.lng() });
          } else {
            applyChanges({ label: locQuery, lat: null, lng: null });
          }
        });
      } else {
        applyChanges({ label: locQuery, lat: null, lng: null });
      }
    } else {
      applyChanges(undefined); // location unchanged — no write needed
    }
  };

  //country chnge
   const {
  setSelectedCountry,
  triggerCountryChange,
} = useGlobalCountryStore();

const AWS_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

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
              "w-[calc(100%-2rem)] max-w-[520px]",
              /* Fixed height — shrinks on small viewports */
              "h-[620px] max-h-[90vh]",
              "flex flex-col",
              "rounded-2xl overflow-hidden outline-none",
              "bg-white dark:bg-gray-900",
              "shadow-2xl shadow-black/15 dark:shadow-black/60",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ───────────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
              <h2 id="rl-title" className="text-[15px] font-semibold text-gray-900 dark:text-white">
                {t("heading")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full cursor-pointer text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ── Tabs ─────────────────────────────────────── */}
            <div className="shrink-0 flex border-b border-gray-100 dark:border-gray-800" role="tablist">
              {[
                { id: "lang_region", label: t("title") },
                { id: "currency",    label: t("currency") },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500",
                      isActive
                        ? "border-b-2 border-violet-600 text-violet-600 dark:text-violet-400 -mb-px"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── Tab content ──────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {activeTab === "lang_region" && (
                <>
                  {/* ── Region (first) ─────────────────────── */}
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
                      {t("region")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {loadcountry.map((region) => {
                        const isoLower  = region.iso_code.toLowerCase();
                        /* Highlight the pending region (if any), else the current one */
                        const active    = pendingRegion
                          ? pendingRegion.iso_code === isoLower
                          : isoLower === currentCountry.toLowerCase();
                        return (
                          <button
                            key={region.id}
                            type="button"
                            onClick={() => {
                              const regionData = { ...region, iso_code: isoLower };
                              setPendingRegion(regionData);
                              setLocError(false);
                              /* If switching to the user's physical country → pre-fill from IP */
                              if (isoLower === ipCountryCode && preferredLocation?.label) {
                                setLocQuery(preferredLocation.label);
                                setLocDirty(false);
                              } else {
                                /* Different country → clear; user must enter their city */
                                setLocQuery("");
                                setLocDirty(true);
                              }
                            }}
                            className={[
                              "relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-start",
                              "transition-all duration-200",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                              "cursor-pointer",
                              active
                                ? "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-600 text-gray-900 dark:text-white"
                                : "bg-gray-50 dark:bg-gray-800/40 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-200 dark:hover:border-gray-700",
                            ].join(" ")}
                          >
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center
                                            rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                             <Image
  src={
    region?.flag
      ? `${AWS_URL}/${region.flag}`
      : "/images/default-flag.png"
  }
  alt={region?.name || "flag"}
  width={28}
  height={20}
  className="object-contain"
/>
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="font-medium leading-normal text-[13px]">{region.name}</span>
                              <span className="text-[11px] leading-normal text-gray-400 dark:text-gray-500 mt-0.5">
                                {region.currency}
                              </span>
                            </span>
                            <span className="ms-auto shrink-0">
                              {active
                                ? <span className="h-2 w-2 rounded-full bg-violet-500 block" aria-hidden="true" />
                                : null
                              }
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* ── Location ───────────────────────────── */}
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
                      {t("location")}
                    </p>

                    <div className="relative" ref={locWrapRef}>
                      {/* Input row */}
                      <div className={[
                        "flex items-center gap-3 rounded-xl border px-4 py-3.5 bg-gray-50 dark:bg-gray-800/40 transition-colors",
                        locError
                          ? "border-red-400 dark:border-red-500 focus-within:border-red-400"
                          : "border-gray-200 dark:border-gray-700 focus-within:border-violet-400 dark:focus-within:border-violet-500",
                      ].join(" ")}>
                        <span className={`shrink-0 ${locError ? "text-red-400" : "text-violet-500"}`} aria-hidden="true">
                          <LocationPinIcon />
                        </span>
                        <input
                          ref={locInputRef}
                          value={locQuery}
                          onChange={(e) => { setLocQuery(e.target.value); setLocShow(true); setLocError(false); }}
                          onFocus={() => setLocShow(true)}
                          placeholder={t("location_placeholder")}
                          className="bg-transparent outline-none flex-1 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        {locQuery && (
                          <button
                            type="button"
                            onClick={() => { setLocQuery(""); setLocDirty(true); setLocShow(false); }}
                            className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                            aria-label="Clear location"
                          >
                            <CloseIcon />
                          </button>
                        )}
                      </div>

                      {/* Places suggestions dropdown */}
                      <AnimatePresence>
                        {locShow && locGoogle.length > 0 && (
                          <motion.div
                            key="loc-dropdown"
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0,  scale: 1    }}
                            exit={{   opacity: 0, y: 4,   scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full mt-1.5 left-0 right-0 z-[9999] rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                          >
                            {locGoogle.slice(0, 5).map((place) => (
                              <button
                                key={place.place_id}
                                type="button"
                                onClick={() => handleLocSelect(place.description)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                              >
                                <span className="shrink-0 text-gray-400">
                                  <LocationPinIcon />
                                </span>
                                <span className="flex flex-col min-w-0">
                                  <span className="text-gray-800 dark:text-white font-medium truncate">
                                    {place.structured_formatting?.main_text ?? place.description}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-500 text-[11px] truncate">
                                    {place.structured_formatting?.secondary_text ?? ""}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Validation error */}
                    {locError && (
                      <p className="text-[11px] text-red-500 mt-2 px-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" aria-hidden="true" />
                        Enter your city to continue
                      </p>
                    )}

                    {/* Auto-detected hint */}
                    {!locError && preferredLocation?.label && !pendingRegion && !locDirty && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 px-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" aria-hidden="true" />
                        {t("location_detected")}
                      </p>
                    )}

                    {/* Confirm button — appears when region or location is pending */}
                    {(pendingRegion || locDirty) && (
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="mt-3 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-sm"
                      >
                        {t("confirm")}
                      </button>
                    )}
                  </section>

                  <div className="h-px bg-gray-100 dark:bg-gray-800/60" />

                  {/* ── Language (second) ──────────────────── */}
                  <section className="pb-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
                      {t("language")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableLanguages.map((lang) => {
                        const active    = lang.code === currentLocale;
                        const isPending = pending?.type === "language" && pending?.value === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => withDelay(() => handleLanguage(lang.code), "language", lang.code)}
                            disabled={!!pending}
                            className={[
                              "relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-start",
                              "transition-all duration-200",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                              pending ? "cursor-not-allowed" : "cursor-pointer",
                              active
                                ? "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                                : "bg-gray-50 dark:bg-gray-800/40 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-200 dark:hover:border-gray-700",
                            ].join(" ")}
                          >
                            {/* Language ≠ Country — use a code badge instead of a flag */}
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center
                                            rounded-lg bg-gray-100 dark:bg-gray-800"
                                  aria-hidden="true">
                              <span className="text-[11px] font-bold tracking-wide
                                               text-gray-600 dark:text-gray-300">
                                {lang.code.toUpperCase()}
                              </span>
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="font-medium leading-normal text-[13px]">{lang.label}</span>
                              <span className="text-[11px] leading-normal text-gray-400 dark:text-gray-500 mt-0.5">
                                {lang.native}
                              </span>
                            </span>
                            <span className="ms-auto shrink-0">
                              {isPending
                                ? <ModalSpinner />
                                : active
                                  ? <span className="h-2 w-2 rounded-full bg-violet-500 block" aria-hidden="true" />
                                  : null
                              }
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {activeTab === "currency" && (
                <section className="pb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
                    {t("currency")}
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
                            "relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-start cursor-pointer",
                            "transition-all duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                            active
                              ? "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                              : "bg-gray-50 dark:bg-gray-800/40 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-200 dark:hover:border-gray-700",
                          ].join(" ")}
                        >
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center
                                          rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <Image
                              src={cur.flag}
                              alt={cur.name}
                              width={28}
                              height={20}
                              className="object-contain"
                            />
                          </span>
                          <span className="flex flex-col min-w-0">
                            {/* Primary: symbol + code — symbol sourced from config, never hardcoded here */}
                            <span className="inline-flex items-baseline gap-1.5 leading-normal">
                              <span className="font-semibold text-[14px]">{cur.symbol}</span>
                              <span className="font-medium text-[13px]">{cur.code}</span>
                            </span>
                            {/* Secondary: full name */}
                            <span className="text-[11px] leading-normal text-gray-400 dark:text-gray-500 mt-0.5">
                              {cur.name}
                            </span>
                          </span>
                          {active && (
                            <span className="ms-auto shrink-0 h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

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

function LocationPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ModalSpinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin text-violet-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path fill="currentColor" fillOpacity="0.8" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}