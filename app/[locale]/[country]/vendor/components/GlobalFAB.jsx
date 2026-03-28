"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function GlobalFAB({ actions }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* FULLSCREEN BACKDROP */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FIXED TOP-RIGHT FAB */}
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3 md:hidden">
        {/* Action Buttons */}
        <AnimatePresence>
          {open &&
            actions.map((item, i) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2"
                >
                  {/* Label */}
                  <div
                    className={`px-3 py-1 text-xs rounded-lg backdrop-blur-md shadow-lg border border-white/20 transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-white/70 text-gray-800"
                    }`}
                  >
                    {item.label}
                  </div>

                  {/* Icon */}
                  <Link href={item.href}>
                    <div
                      onClick={() => setOpen(false)}
                      className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-indigo-600"
                          : "bg-white/90 hover:bg-indigo-50"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-white" : "text-indigo-600"}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* TOGGLE BUTTON */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl flex items-center justify-center border border-white/20"
        >
          {open ? <X size={22} /> : <Plus size={22} />}
        </motion.button>
      </div>
    </>
  );
}