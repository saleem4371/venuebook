"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";
import { Check, ChevronRight, Lock, ChevronLeft, Building2, TreePine, MapPin, X } from "lucide-react";
import { detectUserLocation, getStoredLocation } from "@/hooks/usePreferredLocation";
import { useModal } from "@/context/ModalContext";

const DEFAULT_CITIES = {
  IN: ["Mangalore", "Kalaburagi", "Bengaluru", "Mumbai"],
  AE: ["Dubai", "Abu Dhabi", "Sharjah"],
};

export default function OnboardingFlow({ onComplete, loadCookiePreferences, saveCookiePreferences, getSavedCookieAction }) {
  const { requestModal, releaseModal } = useModal();
  const [cookieAction, setCookieAction] = useState(null);
  const [locationCountry, setLocationCountry] = useState("IN");
  const [locationCity, setLocationCity] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [view, setView] = useState("main");
  const [draftPrefs, setDraftPrefs] = useState({ required: true, analytics: false, marketing: false });
  const [animatingCategory, setAnimatingCategory] = useState(null);

  const cookieConsentResolved = cookieAction !== null;
  const isLocationComplete = !isLoadingLocation && (
    (locationCountry !== "" && locationCity !== "") ||
    (!isEditingLocation && !!locationData)
  );
  const isSetupComplete = cookieConsentResolved && isLocationComplete;

  const saveResolvedLocation = (loc) => {
    if (!loc) return;
    try {
      localStorage.setItem("vb_onboarding_location", JSON.stringify(loc));
      if (loc.city) {
        localStorage.setItem("vb_preferred_location", loc.city);
      } else if (loc.label) {
        localStorage.setItem("vb_preferred_location", loc.label);
      }
      const code = (loc.countryCode || "in").toLowerCase();
      localStorage.setItem(
        `vb_preferred_location_${code}`,
        JSON.stringify({
          label: loc.label,
          lat: loc.lat || null,
          lng: loc.lng || null,
        })
      );
      localStorage.setItem(
        `vb_preferred_location_source_${code}`,
        loc.source || "ip"
      );
      if (loc.countryCode) {
        localStorage.setItem("vb_ip_country", code);
      }
      window.dispatchEvent(
        new CustomEvent("vb:preferred-location-change", {
          detail: {
            countryCode: code,
            loc: { label: loc.label, lat: loc.lat, lng: loc.lng },
          },
        })
      );
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      let saved = null;
      try {
        const raw = localStorage.getItem("vb_onboarding_location");
        if (raw) {
          saved = JSON.parse(raw);
        }
      } catch {
        // Ignore
      }

      if (!saved) {
        try {
          const prefCity = localStorage.getItem("vb_preferred_location");
          const storedIn = getStoredLocation("in");
          const storedAe = getStoredLocation("ae");
          const stored = storedIn || storedAe;
          if (prefCity || stored) {
            const countryCode = storedIn ? "IN" : storedAe ? "AE" : "IN";
            const countryName = countryCode === "AE" ? "UAE" : "India";
            const city = prefCity || stored?.label?.split(",")?.[0]?.trim() || "";
            saved = {
              city,
              country: countryName,
              countryCode,
              label: stored?.label || (city ? `${city}, ${countryName}` : countryName),
              source: "manual",
            };
          }
        } catch {
          // Ignore
        }
      }

      if (saved && (saved.city || saved.country || saved.label)) {
        if (!isMounted) return;
        setLocationData(saved);
        setLocationCountry(saved.countryCode || "IN");
        setLocationCity(saved.city || "");
        setIsEditingLocation(false);
        setIsLoadingLocation(false);
        return;
      }

      setIsLoadingLocation(true);
      const detected = await detectUserLocation(3500);

      if (!isMounted) return;

      if (detected && (detected.city || detected.country)) {
        setLocationData(detected);
        setLocationCountry(detected.countryCode || "IN");
        setLocationCity(detected.city || "");
        setIsEditingLocation(false);
        setIsLoadingLocation(false);
        saveResolvedLocation(detected);
      } else {
        setIsLoadingLocation(false);
        setIsEditingLocation(true);
      }
    };

    initLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setLocationCountry(newCountry);
    setLocationCity("");
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setLocationCity(newCity);
    if (newCity && locationCountry) {
      const countryName = locationCountry === "AE" ? "UAE" : "India";
      const manualLoc = {
        city: newCity,
        country: countryName,
        countryCode: locationCountry,
        label: `${newCity}, ${countryName}`,
        source: "manual",
      };
      setLocationData(manualLoc);
      saveResolvedLocation(manualLoc);
    }
  };

  const handleClearCity = () => {
    setLocationCity("");
    if (locationData && locationData.source === "manual") {
      setLocationData(null);
    }
  };

  const currentRegionCities = DEFAULT_CITIES[locationCountry] || DEFAULT_CITIES.IN;
  const cityOptions = locationCity && !currentRegionCities.includes(locationCity)
    ? [locationCity, ...currentRegionCities]
    : currentRegionCities;

  useEffect(() => {
    if (getSavedCookieAction) {
      const saved = getSavedCookieAction();
      if (saved) {
        setCookieAction(saved);
        return;
      }
    }
    try {
      const action = localStorage.getItem("vb_cookie_action");
      if (action) {
        setCookieAction(action);
      } else {
        const saved = localStorage.getItem("vb_cookie_prefs");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.analytics && parsed.marketing) setCookieAction("accept");
          else if (!parsed.analytics && !parsed.marketing) setCookieAction("reject");
          else setCookieAction("manage");
        }
      }
    } catch {}
  }, [getSavedCookieAction]);

  const handleCookieSelect = (action) => {
    setCookieAction(action);
    if (action === "accept") {
      saveCookiePreferences({ required: true, analytics: true, marketing: true }, "accept");
    } else if (action === "reject") {
      saveCookiePreferences({ required: true, analytics: false, marketing: false }, "reject");
    } else if (action === "manage") {
      requestModal("cookie_preferences");
      setDraftPrefs(loadCookiePreferences());
      setView("preferences");
    }
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(draftPrefs, "manage");
    setCookieAction("manage");
    releaseModal("cookie_preferences");
    setView("main");
  };

  const handleConfirm = () => {
    if (isSetupComplete) {
      if (locationData) {
        saveResolvedLocation(locationData);
      }
      setView("category");
    }
  };

  const [animProps, setAnimProps] = useState({});

  const handleCategorySelect = (cat, e) => {
    if (cat === "venues") {
      localStorage.setItem("activeCategory", "venues");
      window.dispatchEvent(new Event("activeCategoryChanged"));
      onComplete();
    } else if (cat === "farmstays") {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        const buttonEl = e.currentTarget;
        const rect = buttonEl.getBoundingClientRect();
        
        const targetX = window.innerWidth * 0.9;
        const targetY = window.innerHeight - 34;

        const deltaX = targetX - (rect.left + rect.width / 2);
        const deltaY = targetY - (rect.top + rect.height / 2);

        setAnimProps({ x: deltaX, y: deltaY, scale: 0.15, opacity: 0 });
        setAnimatingCategory("farmstays");
        
        setTimeout(() => {
          localStorage.setItem("activeCategory", "farmstays");
          window.dispatchEvent(new Event("activeCategoryChanged"));
          onComplete();
        }, 600);
      } else {
        localStorage.setItem("activeCategory", "farmstays");
        window.dispatchEvent(new Event("activeCategoryChanged"));
        onComplete();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999990] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors duration-300"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        <header className="flex items-center justify-center p-5 border-b border-gray-100 dark:border-gray-800 shrink-0 relative">
          {view === "preferences" && (
            <button
              onClick={() => {
                releaseModal("cookie_preferences");
                setView("main");
              }}
              className="absolute left-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <img
            src={lightLogo.src || lightLogo}
            alt="Venuebook.in"
            className="h-6 w-auto object-contain dark:hidden"
            draggable={false}
          />
          <img
            src={darkLogo.src || darkLogo}
            alt="Venuebook.in"
            className="h-6 w-auto object-contain hidden dark:block"
            draggable={false}
          />
        </header>

        <div className={`p-6 flex flex-col gap-6 ${animatingCategory ? "overflow-visible" : "overflow-y-auto"}`}>
          {view === "category" ? (
            <>
              <div className="text-center space-y-1 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Switch Category</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Choose what you're looking for
                </p>
              </div>

              <div className="flex flex-row justify-center gap-4 px-2">
                <button
                  onClick={(e) => handleCategorySelect("venues", e)}
                  className="flex-1 max-w-[160px] flex flex-col items-center justify-center p-6 rounded-[24px] bg-gray-50 dark:bg-gray-800/80 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                >
                  <div className="bg-violet-500 text-white p-4 rounded-[20px] mb-4 group-hover:scale-105 transition-transform shadow-sm">
                    <Building2 size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-200">venue</span>
                </button>

                <div className="relative flex-1 max-w-[160px]">
                  <motion.button
                    onClick={(e) => handleCategorySelect("farmstays", e)}
                    animate={animatingCategory === "farmstays" ? animProps : {}}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className={`w-full flex flex-col items-center justify-center p-6 rounded-[24px] border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all group relative ${animatingCategory === "farmstays" ? "z-[9999]" : "z-50"}`}
                  >
                    <div className="bg-emerald-500 text-white p-4 rounded-[20px] mb-4 group-hover:scale-105 transition-transform shadow-sm">
                      <TreePine size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">farmstay</span>
                  </motion.button>
                </div>
              </div>
            </>
          ) : view === "main" ? (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome to Venuebook</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Let's set up your preferences.
                </p>
              </div>

              <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white transition-colors ${isLocationComplete ? 'bg-green-500' : 'bg-purple-600'}`}>
                      {isLocationComplete ? <Check size={12} /> : "1"}
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Location</h2>
                  </div>

                  {!isLoadingLocation && locationData && !isEditingLocation && (
                    <button
                      type="button"
                      onClick={() => setIsEditingLocation(true)}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors"
                    >
                      Change
                    </button>
                  )}

                  {isEditingLocation && locationData && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationCountry(locationData.countryCode || "IN");
                          setLocationCity(locationData.city || "");
                          setIsEditingLocation(false);
                        }}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      {locationCountry && locationCity && (
                        <button
                          type="button"
                          onClick={() => {
                            const countryName = locationCountry === "AE" ? "UAE" : "India";
                            const manualLoc = {
                              city: locationCity,
                              country: countryName,
                              countryCode: locationCountry,
                              label: `${locationCity}, ${countryName}`,
                              source: "manual",
                            };
                            setLocationData(manualLoc);
                            saveResolvedLocation(manualLoc);
                            setIsEditingLocation(false);
                          }}
                          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline transition-colors"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-7">
                  {isLoadingLocation ? (
                    <div className="flex items-center gap-2.5 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Detecting your location...</span>
                    </div>
                  ) : !isEditingLocation && locationData ? (
                    <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin className="text-purple-600 shrink-0" size={16} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {locationData.label || (locationData.city ? `${locationData.city}, ${locationData.country}` : locationData.country)}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {locationData.source === "manual" ? "Selected location" : "Auto-detected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Region</label>
                        <div className="relative">
                          <select 
                            value={locationCountry}
                            onChange={handleCountryChange}
                            className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 pl-3 pr-8 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          >
                            <option value="" disabled>Select Region</option>
                            <option value="IN">IN India</option>
                            <option value="AE">AE UAE</option>
                          </select>
                          <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={14} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Location</label>
                        <div className="relative">
                          <select 
                            value={locationCity}
                            onChange={handleCityChange}
                            className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 pl-8 pr-8 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          >
                            <option value="" disabled>Select City</option>
                            {cityOptions.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none" size={14} strokeWidth={2.5} />
                          {locationCity ? (
                            <button 
                              type="button"
                              onClick={handleClearCity} 
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              <X size={14} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={14} strokeWidth={2.5} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white transition-colors ${cookieConsentResolved ? 'bg-green-500' : 'bg-purple-600'}`}>
                      {cookieConsentResolved ? <Check size={12} /> : "2"}
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cookies Setting</h2>
                  </div>
                  {cookieConsentResolved && (
                    <span className="text-[11px] font-medium text-green-600 dark:text-green-400">
                      Saved
                    </span>
                  )}
                </div>
                
                <div className="flex flex-row items-center gap-2 ml-7">
                  <button
                    type="button"
                    onClick={() => handleCookieSelect("accept")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "accept"
                        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCookieSelect("reject")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "reject"
                        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCookieSelect("manage")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "manage"
                        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Manage
                  </button>
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cookie Preferences</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Choose which optional cookie categories you want to allow.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Booking Engine, Payment & Security</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Required for core functionality.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full shrink-0">
                      <Lock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Required</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Analytics & Performance</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Improve your site experience.
                      </p>
                    </div>
                    <button
                      onClick={() => setDraftPrefs({ ...draftPrefs, analytics: !draftPrefs.analytics })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${draftPrefs.analytics ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${draftPrefs.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Personalized Marketing</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Customized offers and campaigns.
                      </p>
                    </div>
                    <button
                      onClick={() => setDraftPrefs({ ...draftPrefs, marketing: !draftPrefs.marketing })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${draftPrefs.marketing ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${draftPrefs.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {view !== "category" && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
            {view === "main" ? (
              <button
                onClick={handleConfirm}
                disabled={!isSetupComplete}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSetupComplete 
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]" 
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                CONFIRM
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSavePreferences}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Save Preferences
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
