"use client";

import { useState } from "react";
import SupportModal from "@/components/shared/SupportModal";

export default function StandardFooter({ vendorType }) {
  const [supportOpen, setSupportOpen] = useState(false);

  if (vendorType !== "STANDARD") return null;

  return (
    <div className="mt-10">

      {/* Glow Border */}
      <div className="relative">

        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur"></div>

        {/* Footer Content */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Left */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Upgrade to Premium 🚀
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Unlock unlimited leads, analytics & priority support
            </p>
          </div>

          {/* Right */}
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700 hover:scale-105 transition cursor-pointer"
          >
            SUPPORT
          </button>
        </div>
      </div>

      <SupportModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </div>
  );
}