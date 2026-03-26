"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropdown } from "@/context/DropdownContext";
import { useRouter, usePathname, useParams } from "next/navigation";

const countries = [
  { name: "India", flag: "🇮🇳", code: "in" },
  { name: "UAE", flag: "🇦🇪", code: "ae" },
  { name: "USA", flag: "🇺🇸", code: "us" },
];

export default function CountryDropdown() {
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentCountry = params?.country || "in";

  const [selected, setSelected] = useState(countries[0]);

  // sync selected with URL
  useEffect(() => {
    const found = countries.find((c) => c.code === currentCountry);
    if (found) setSelected(found);
  }, [currentCountry]);

  const isOpen = openDropdown === "country";

  const handleSelect = (country) => {
    setSelected(country);
    closeAll();

    // replace country in URL
    const newPath = pathname.replace(
      `/${currentCountry}`,
      `/${country.code}`
    );

    router.push(newPath);
  };

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => toggleDropdown("country")}
        className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-full hover:shadow-md transition"
      >
        <span className="text-lg">{selected.flag}</span>

        <span className="text-sm font-medium hidden md:block">
          {selected.name}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-xs"
        >
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
            className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 transition ${
                  selected.code === c.code
                    ? "bg-purple-50 text-purple-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                {c.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}