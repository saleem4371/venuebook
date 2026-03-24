"use client";

import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function DesktopSearch() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden md:flex mt-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 gap-4 items-center max-w-3xl"
    >
      <input
        placeholder="Location"
        className="flex-1 bg-transparent outline-none text-white"
      />
      <input type="date" className="flex-1 bg-transparent text-white" />
      <input
        type="number"
        placeholder="Guests"
        className="flex-1 bg-transparent text-white"
      />

      <button className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
        <MagnifyingGlassIcon className="w-5 text-white" />
      </button>
    </motion.div>
  );
}
