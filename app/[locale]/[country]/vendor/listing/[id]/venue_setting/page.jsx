"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  "publication",
  "tags",
  "deposit",
  "reserve",
  "pax",
  "payment",
  "availability",
];

export default function SettingsPremiumFinal() {
  const router = useRouter();
  const [active, setActive] = useState("publication");

  const [form, setForm] = useState({
    publication: true,
    tags: false,
    deposit: false,
    reserve: false,
    pax: false,
    payment: false,
    availability: false,
  });

  const allComplete = useMemo(
    () => sections.every((s) => form[s]),
    [form]
  );

  const progress = useMemo(() => {
    const done = sections.filter((s) => form[s]).length;
    return Math.round((done / sections.length) * 100);
  }, [form]);

  const toggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!allComplete) {
      const firstIncomplete = sections.find((s) => !form[s]);
      if (firstIncomplete) setActive(firstIncomplete);
    }
  }, [form]);

  return (
    <div className="flex flex-col md:flex-row  bg-gray-50">

      <div className="hidden md:flex w-72 flex-col bg-white border-r gap-3 p-3">
        <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
        <h2 className="font-semibold text-lg mb-2">Settings</h2>

        <div className="flex flex-col gap-2">
          {sections.map((s) => {
            const isError = !form[s];
            const isActive = active === s;
            return (
              <motion.div
                key={s}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActive(s)}
                className={`p-3 rounded-2xl cursor-pointer border transition-all
                  ${
                    isActive
                      ? "bg-black text-white shadow-lg"
                      : "bg-white shadow-sm hover:shadow-md"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{s}</span>
                  {isError ? (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  ) : (
                    <span className="text-green-500 text-xs font-bold">✔</span>
                  )}
                </div>
                <p className="text-xs mt-1 opacity-70">
                  {isError ? "Required" : "Completed"}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <p className="text-xs mb-1">{progress}% complete</p>
          <div className="h-2 bg-gray-200 rounded">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-black"
            />
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* 📱 MOBILE TOP BAR */}
        <div className="md:hidden sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center p-3 gap-2">
            {/* 🔙 Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Horizontal Scroll Sections */}
            <div className="flex overflow-x-auto gap-2 no-scrollbar ml-2">
              {sections.map((s) => {
                const isError = !form[s];
                const isActive = active === s;
                return (
                  <button
                    key={s}
                    onClick={() => setActive(s)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition
                      ${
                        isActive
                          ? "bg-black text-white shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                  >
                    <span className="capitalize">{s}</span>
                    {isError && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TOP PROGRESS BAR */}
        <div className="h-[3px] bg-gray-200">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl space-y-6"
            >
              <h1 className="text-xl font-semibold capitalize">{active}</h1>

              <div className="p-4 bg-white border rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium">Enable {active}</p>
                  <p className="text-xs text-gray-500">
                    Configure {active} settings
                  </p>
                </div>
                <Toggle enabled={form[active]} onChange={() => toggle(active)} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ALL COMPLETE */}
        <AnimatePresence>
          {allComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              🎉 All settings completed!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* 🎚 Toggle */
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow"
        animate={{ x: enabled ? 28 : 0 }}
      />
    </button>
  );
}