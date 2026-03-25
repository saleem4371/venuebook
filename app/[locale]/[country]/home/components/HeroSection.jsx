"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import MobileSearchSheet from "./MobileSearchSheet";
import LocationAutoComplete from "./LocationAutoComplete";

const words = ["Farmstays", "Venues"];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("venues");
  const [openSearch, setOpenSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  // ✅ Fix SSR hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Word animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // ✅ Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) return null; // 🔥 avoid hydration flicker

  return (
    <>
      <section className="relative min-h-[82vh] md:min-h-[86vh] md:flex md:items-center overflow-hidden">
        
        {/* 📱 MOBILE IMAGE */}
        {isMobile && (
          <div
            className="w-full h-[40vh] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://beta.venuebook.in/img/sintra.6885ed95.png')",
            }}
          />
        )}

        {/* 💻 DESKTOP VIDEO */}
        {!isMobile && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source
              src="https://apitest.venuebook.in/Upload/Video/HomePage.mp4"
              type="video/mp4"
            />
          </video>
        )}

        {/* 🌑 OVERLAY */}
        {!isMobile && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60 backdrop-blur-[2px]" />
        )}

        {/* 🔥 CONTENT */}
        <div
          className={`relative z-10 w-full px-4 md:px-20 transition-all duration-500
          ${
            isMobile
              ? "bg-white text-black pt-6 pb-10 rounded-t-[30px] -mt-14 shadow-2xl"
              : "text-white pt-32 md:pt-40 pb-10"
          }`}
        >
          {/* 🔥 TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`font-bold leading-tight max-w-3xl ${
              isMobile ? "text-2xl sm:text-3xl" : "text-4xl md:text-6xl"
            }`}
          >
            Your Next Great Story <br />
            Starts with the Right{" "}

            {/* ✨ Animated Word */}
            <span className="relative inline-block min-w-[140px] h-[1.2em] align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[index]}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                  className="absolute left-0 top-0 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-3 md:mt-4 max-w-xl ${
              isMobile
                ? "text-sm text-gray-600"
                : "text-base text-gray-300"
            }`}
          >
            Find the perfect, personal space—from unique city hideaways to
            inspiring country escapes.
          </motion.p>

          {/* 🔥 TABS */}
          <div className="flex gap-3 mt-5 md:mt-6">
            <button
              onClick={() => setActiveTab("venues")}
              className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300
                ${
                  activeTab === "venues"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                    : isMobile
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white/10 border border-white/20 text-white"
                }`}
            >
              Venues
            </button>

            <button
              onClick={() => setActiveTab("farm")}
              className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-2 transition-all duration-300
                ${
                  activeTab === "farm"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                    : isMobile
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white/10 border border-white/20 text-white"
                }`}
            >
              Farmstay & Villas
              <span className="text-[9px] md:text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </button>
          </div>

          {/* 💻 DESKTOP SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 gap-4 items-center max-w-4xl shadow-2xl"
          >
            <div className="flex-1">
              <p className="text-xs text-gray-300">Location</p>
             <LocationAutoComplete />
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex-1">
              <p className="text-xs text-gray-300">Date</p>
              <input
                type="date"
                className="bg-transparent text-white outline-none w-full"
              />
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex-1">
              <p className="text-xs text-gray-300">How Many</p>
              <input
                placeholder="4300 guests"
                className="bg-transparent text-white outline-none w-full"
              />
            </div>

            <button className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl shadow-lg hover:scale-110 transition">
              <MagnifyingGlassIcon className="w-5 text-white" />
            </button>
          </motion.div>

          {/* 📱 MOBILE SEARCH */}
          <div className="md:hidden mt-6">
            <button
              onClick={() => setOpenSearch(true)}
              className="w-full bg-white border border-gray-200 text-gray-500 rounded-xl p-4 flex justify-between items-center shadow-lg active:scale-95 transition"
            >
              Search location, date, guests
              <MagnifyingGlassIcon className="w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 📱 MOBILE SHEET */}
      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}