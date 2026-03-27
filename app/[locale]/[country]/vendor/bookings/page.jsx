"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Bookmark,
  Save,
  FileText,
  History,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BookingPage() {
  const actions = [
    { label: "Booking", icon: Plus, action: () => toast("New Booking") },
    { label: "Bookings", icon: Calendar, action: () => toast("All Bookings") },
    { label: "Reserve", icon: Bookmark, action: () => toast("Reserved") },
    { label: "Save Draft", icon: Save, action: () => toast("Draft Saved") },
    { label: "Quotation", icon: FileText, action: () => toast("Quotation") },
    { label: "Historical", icon: History, action: () => toast("History") },
  ];

  return (
    <div className="mb-6">

      {/* Glow Border */}
      <div className="relative">

        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur"></div>

        {/* Container */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-4">

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">

            {actions.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 shadow hover:shadow-lg transition"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Icon size={20} className="text-indigo-600" />
                  </motion.div>

                  {/* Label */}
                  <span className="text-[11px] font-medium text-gray-700 text-center">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}