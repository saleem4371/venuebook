"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDropdown } from "@/context/DropdownContext";

export default function UserDropdown() {
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();

  const isOpen = openDropdown === "user";

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => toggleDropdown("user")}
        className="flex items-center gap-2 border border-gray-200  px-3 py-2 rounded-full hover:shadow-md transition"
      >
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-600">
          U
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-200  z-50 overflow-hidden will-change-transform"
          >
            {/* Header */}
            <div className="p-4 border-b border-b-gray-200 ">
              <p className="font-semibold">Welcome 👋</p>
              <p className="text-sm text-gray-500">
                Login to access account
              </p>
            </div>

            {/* Menu */}
            <div className="flex flex-col text-sm">
              <button
                onClick={closeAll}
                className="px-4 py-3 hover:bg-gray-100 text-left transition"
              >
                My Bookings
              </button>

              <button
                onClick={closeAll}
                className="px-4 py-3 hover:bg-gray-100 text-left transition"
              >
                Wishlist
              </button>

              <button
                onClick={closeAll}
                className="px-4 py-3 hover:bg-gray-100 text-left transition"
              >
                Settings
              </button>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-t-gray-200 ">
              <button
                onClick={closeAll}
                className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}