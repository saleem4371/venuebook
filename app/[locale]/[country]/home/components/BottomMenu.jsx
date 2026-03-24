"use client";

import { useEffect, useState } from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomMenu() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200); // 🔥 appear after scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
          <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full shadow-2xl border">

            <button className="flex flex-col items-center text-xs">
              <HomeIcon className="w-5" />
              Home
            </button>

            <button className="flex flex-col items-center text-xs">
              <MagnifyingGlassIcon className="w-5" />
              Search
            </button>

            <button className="flex flex-col items-center text-xs">
              <HeartIcon className="w-5" />
              Wishlist
            </button>

            <button className="flex flex-col items-center text-xs">
              <UserIcon className="w-5" />
              Profile
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
