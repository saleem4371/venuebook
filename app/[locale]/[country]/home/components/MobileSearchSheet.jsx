"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import LocationAutoComplete from "./LocationAutoComplete";

const regions = [
  { name: "Bengaluru", desc: "Premium luxury weddings with elite venues." },
  { name: "Mysuru", desc: "Royal palace-style heritage weddings." },
  { name: "Mangaluru", desc: "Coastal venues with scenic charm." },
  { name: "Hubballi", desc: "Grand community celebrations." },
];

export default function MobileSearchSheet({ open, setOpen }) {
  const [step, setStep] = useState("where");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const isSearchEnabled = location && date && guests;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999]">

          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={() => setOpen(false)}
          />

          {/* SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 w-full h-[92vh] bg-gray-50 rounded-t-3xl flex flex-col"
          >

            {/* HEADER */}
            <div className="sticky top-0 bg-gray-50 z-20 px-5 pt-4 pb-3 border-b flex justify-between">
              <h2 className="font-semibold">Search Venues</h2>
              <button onClick={() => setOpen(false)}>
                <XMarkIcon className="w-6" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

              {/* WHERE */}
              <div
                onClick={() => setStep("where")}
                className={`p-4 rounded-2xl transition ${
                  step === "where" ? "bg-white shadow" : "bg-gray-100"
                }`}
              >
                <p className="text-xs text-gray-500 mb-2">WHERE</p>

                <div className="flex items-center gap-2 border rounded-xl px-3 py-3 bg-white">
                  <MagnifyingGlassIcon className="w-5 text-gray-400" />

                  <div className="flex-1 relative z-[999]">
                    <LocationAutoComplete
                      value={location}
                      setValue={(val) => {
                        setLocation(val);
                        setStep("when"); // 👉 move next
                      }}
                    />
                  </div>
                </div>

                {/* REGION LIST */}
                {step === "where" && !location && (
                  <div className="mt-4 space-y-3">
                    {regions.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setLocation(item.name);
                          setStep("when");
                        }}
                        className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.desc}
                          </p>
                        </div>
                        <span>›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WHEN */}
              <div
                onClick={() => location && setStep("when")}
                className={`p-4 rounded-2xl transition ${
                  step === "when" ? "bg-white shadow" : "bg-gray-100"
                }`}
              >
                <p className="text-xs text-gray-500 mb-2">WHEN</p>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setStep("who"); // 👉 next step
                  }}
                  className="w-full border p-3 rounded-xl"
                />
              </div>

              {/* WHO */}
              <div
                onClick={() => date && setStep("who")}
                className={`p-4 rounded-2xl transition ${
                  step === "who" ? "bg-white shadow" : "bg-gray-100"
                }`}
              >
                <p className="text-xs text-gray-500 mb-2">WHO</p>

                <input
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="Add guests"
                  className="w-full border p-3 rounded-xl"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-white border-t px-5 py-3 flex justify-between items-center">
              <button
                onClick={() => {
                  setLocation("");
                  setDate("");
                  setGuests("");
                  setStep("where");
                }}
                className="underline text-gray-600"
              >
                Clear all
              </button>

              <button
                disabled={!isSearchEnabled}
                className={`px-6 py-3 rounded-xl text-white transition ${
                  isSearchEnabled
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
