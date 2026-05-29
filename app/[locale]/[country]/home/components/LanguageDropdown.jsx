"use client";

import { Globe } from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropdown } from "@/context/DropdownContext";
import { useRegionContext } from "@/context/RegionContext";
import { LANGUAGE_META } from "@/config/i18n";

export default function LanguageDropdown() {
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();
  const { regionConfig } = useRegionContext();

  const router   = useRouter();
  const pathname = usePathname();
  const params   = useParams();

  const currentLocale = params?.locale || "en";

  /* Derive allowed languages from the active region — fully dynamic */
  const languages = (regionConfig?.languages ?? ["en"])
    .map((code) => LANGUAGE_META[code])
    .filter(Boolean);

  const currentLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  const isOpen = openDropdown === "language";

  const changeLanguage = (lang) => {
    closeAll();
    try { localStorage.setItem("vb_language", lang.code); } catch (_) {}
    const newPath = pathname.replace(`/${currentLocale}/`, `/${lang.code}/`);
    router.push(newPath);
  };

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => toggleDropdown("language")}
        className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-full hover:shadow-md transition cursor-pointer"
      >
        <Globe size={16} />

        {/* Show name */}
        <span className="text-sm font-medium hidden md:block">
          {currentLang?.label}
        </span>

        {/* Mobile short — uppercase first two chars of code */}
        <span className="text-xs md:hidden">
          {currentLang?.code?.toUpperCase().slice(0, 2)}
        </span>

        {/* Arrow */}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-xs">
          ▼
        </motion.span>
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition cursor-pointer ${
                  currentLang?.code === lang.code
                    ? "bg-purple-50 dark:bg-violet-950/40 text-purple-600 dark:text-violet-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg shrink-0">{lang.flag}</span>
                <span className="flex flex-col min-w-0">
                  <span className="truncate leading-normal">{lang.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
                    {lang.native}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}