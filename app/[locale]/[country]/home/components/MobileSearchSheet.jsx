"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileSearchSheet({ open, setOpen }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">

          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={() => setOpen(false)}
          />

          {/* SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 400 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120) setOpen(false);
            }}
            className="absolute bottom-0 w-full bg-white rounded-t-3xl p-5"
          >

            {/* HANDLE */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Search</h2>
              <button onClick={() => setOpen(false)}>
                <XMarkIcon className="w-6" />
              </button>
            </div>

            {/* FORM */}
            <div className="flex flex-col gap-4">
              <input className="border p-3 rounded-xl" placeholder="Location" />
              <input type="date" className="border p-3 rounded-xl" />
              <input className="border p-3 rounded-xl" placeholder="Guests" />

              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl">
                Search
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
