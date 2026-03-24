"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FilterDrawer({ open,
  setOpen,
  venueCount,
  filters,
  setFilters }) {

  const filterConfig = [
    {
      type: "category_cards",
      title: "Recommended for you",
      options: [
        { id: 1, label: "Wi-Fi", icon: "📶" },
        { id: 2, label: "AC", icon: "❄️" },
        { id: 3, label: "Catering", icon: "🍽️" },
        { id: 4, label: "Green Room", icon: "🚪" }
      ]
    },
    {
      type: "budget",
      title: "Budget Range",
      min: 5000,
      max: 100000
    },
    {
      type: "shift",
      title: "Shift",
      options: [
        { id: "morning", label: "Morning" },
        { id: "afternoon", label: "Afternoon" },
        { id: "evening", label: "Evening" }
      ]
    },
    {
      type: "booking",
      title: "Booking Type",
      options: [
        { id: "instant", label: "Instant Booking" },
        { id: "reserve", label: "Reserve" },
        { id: "enquiry", label: "Enquiry" }
      ]
    }
  ];

  const [selected, setSelected] = useState({});
 // const [budget, setBudget] = useState({ min: 5000, max: 100000 });

 const toggleOption = (type, id) => {
  setFilters((prev) => {
    const current = prev[type] || [];

    return {
      ...prev,
      [type]: current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id]
    };
  });
};

const setBudget = (value) => {
  setFilters((prev) => ({
    ...prev,
    budget: value
  }));
};

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setOpen(false)}
          />

          {/* ================= DESKTOP / TABLET ================= */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-full sm:w-[380px] bg-white z-50 shadow-xl hidden sm:flex flex-col"
          >

            {/* HEADER */}
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 pb-24">
              <FilterContent
                filterConfig={filterConfig}
                 selected={filters}
                toggleOption={toggleOption}
                 budget={filters.budget}
  setBudget={setBudget}
              />
            </div>

            {/* FOOTER */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelected({});
                    setBudget({ min: 5000, max: 100000 });
                  }}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Clear All
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg"
                >
                  Show {venueCount} Results
                </button>
              </div>
            </div>
          </motion.div>

          {/* ================= MOBILE ================= */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 h-[85vh] flex flex-col"
          >

            {/* HANDLE */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-3" />

            {/* HEADER */}
            <div className="flex justify-between items-center px-5 pb-3 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 pb-24">
               <FilterContent
                filterConfig={filterConfig}
                 selected={filters}
                toggleOption={toggleOption}
                 budget={filters.budget}
  setBudget={setBudget}
              />
            </div>

            {/* FOOTER */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-3">
                <button
                 onClick={() => {
  setFilters({
    category_cards: [],
    shift: [],
    booking: [],
    budget: { min: 5000, max: 100000 }
  });
}}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Clear All
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg"
                >
                  Show {venueCount} Results
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


/* ================= FILTER CONTENT ================= */

function FilterContent({ filterConfig, selected, toggleOption, budget, setBudget }) {

  const getFilter = (type) =>
    filterConfig?.find((f) => f.type === type);

  const categoryFilter = getFilter("category_cards");
  const budgetFilter = getFilter("budget");
  const shiftFilter = getFilter("shift");
  const bookingFilter = getFilter("booking");

  return (
    <>
      {/* CATEGORY */}
      {categoryFilter && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{categoryFilter.title}</h3>

          <div className="flex gap-3 overflow-x-auto">
            {categoryFilter.options.map((opt) => {
              const active = selected["category_cards"]?.includes(opt.id);

              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOption("category_cards", opt.id)}
                  className={`min-w-[90px] border rounded-xl p-3 text-center cursor-pointer
                  ${active ? "bg-purple-100 border-purple-500" : ""}
                  `}
                >
                  <div className="text-2xl">{opt.icon}</div>
                  <p className="text-xs mt-1">{opt.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUDGET */}
      {budgetFilter && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{budgetFilter.title}</h3>

          <input
            type="range"
            min={budgetFilter.min}
            max={budgetFilter.max}
            value={budget.min}
            onChange={(e) =>
              setBudget({ ...budget, min: Number(e.target.value) })
            }
            className="w-full"
          />

          <div className="flex justify-between text-sm mt-2">
            <span>₹{budget.min}</span>
            <span>₹{budget.max}</span>
          </div>
        </div>
      )}

      {/* SHIFT */}
      {shiftFilter && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{shiftFilter.title}</h3>

          <div className="flex flex-wrap gap-3">
            {shiftFilter.options.map((opt) => {
              const active = selected["shift"]?.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption("shift", opt.id)}
                  className={`border px-3 py-2 rounded-full
                  ${active ? "bg-purple-600 text-white" : ""}
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BOOKING */}
      {bookingFilter && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{bookingFilter.title}</h3>

          <div className="flex flex-wrap gap-3">
            {bookingFilter.options.map((opt) => {
              const active = selected["booking"]?.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption("booking", opt.id)}
                  className={`border px-3 py-2 rounded-full
                  ${active ? "bg-purple-600 text-white" : ""}
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}