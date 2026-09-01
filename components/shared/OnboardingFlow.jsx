"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";
import { Check, ChevronRight, Lock, ChevronLeft, Building2, TreePine } from "lucide-react";

export default function OnboardingFlow({ onComplete, loadCookiePreferences, saveCookiePreferences }) {
  const [cookieAction, setCookieAction] = useState(null);
  const [locationCountry, setLocationCountry] = useState("");
  const [locationCity, setLocationCity] = useState("");

  const [view, setView] = useState("main"); // "main", "preferences", "category"
  const [draftPrefs, setDraftPrefs] = useState({ required: true, analytics: false, marketing: false });
  const [animatingCategory, setAnimatingCategory] = useState(null);

  const isLocationComplete = locationCountry !== "" && locationCity !== "";
  const isSetupComplete = cookieAction !== null && isLocationComplete;

  const handleCookieSelect = (action) => {
    setCookieAction(action);
    if (action === "accept") {
      saveCookiePreferences({ required: true, analytics: true, marketing: true });
    } else if (action === "reject") {
      saveCookiePreferences({ required: true, analytics: false, marketing: false });
    } else if (action === "manage") {
      setDraftPrefs(loadCookiePreferences());
      setView("preferences");
    }
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(draftPrefs);
    setCookieAction("manage");
    setView("main");
  };

  const handleConfirm = () => {
    if (isSetupComplete) {
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
        
        // Calculate delta to the center of the 5th bottom-nav item
        // Bottom nav is 5 equal columns, so 5th item center is at 90% of screen width.
        // Height is 68px, so center is ~34px from bottom.
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
        }, 600); // Wait for animation
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
      className="fixed inset-0 z-[999990] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <header className="flex items-center justify-center p-5 border-b border-gray-100 dark:border-gray-800 shrink-0 relative">
          {view === "preferences" && (
            <button
              onClick={() => setView("main")}
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
                <div className="mb-3 flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${cookieAction ? 'bg-green-500' : 'bg-purple-600'}`}>
                    {cookieAction ? <Check size={12} /> : "1"}
                  </span>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cookies Setting</h2>
                </div>
                
                <div className="flex flex-row items-center gap-2 ml-7">
                  <button
                    onClick={() => handleCookieSelect("accept")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "accept"
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleCookieSelect("reject")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "reject"
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleCookieSelect("manage")}
                    className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${
                      cookieAction === "manage"
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Manage
                  </button>
                </div>
              </section>

              <section 
                className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border transition-opacity duration-300 ${
                  cookieAction ? "opacity-100 border-gray-200 dark:border-gray-700" : "opacity-40 border-gray-200 dark:border-gray-700 pointer-events-none grayscale-[50%]"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${isLocationComplete ? 'bg-green-500' : (cookieAction ? 'bg-purple-600' : 'bg-gray-400')}`}>
                    {isLocationComplete ? <Check size={12} /> : "2"}
                  </span>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Location</h2>
                </div>

                <div className="flex flex-col gap-3 ml-7">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <select 
                      value={locationCountry}
                      onChange={(e) => setLocationCountry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="IN">IN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <select 
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select City</option>
                      <option value="Mangalore">Mangalore</option>
                    </select>
                  </div>
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
                        Required for login, search, booking, payments, and security. Cannot be disabled.
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
                        Help us understand how you use our site to improve your experience.
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
                        Used to deliver customized offers and measure campaign performance.
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
