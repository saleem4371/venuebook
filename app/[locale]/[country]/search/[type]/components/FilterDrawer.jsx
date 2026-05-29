"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FilterDrawer({
  open,
  setOpen,
  venueCount,
  filters,
  setFilters,
}) {
  const filterConfig = [
    {
      type: "category_cards",
      title: "Amenities",
      options: [
        { id: 1, label: "Wi-Fi", icon: "📶" },
        { id: 2, label: "AC", icon: "❄️" },
        { id: 3, label: "Catering", icon: "🍽️" },
        { id: 4, label: "Green Room", icon: "🚪" },
      ],
    },
    {
      type: "budget",
      title: "Budget",
      min: 200,
      max: 100000,
    },
    {
      type: "shift",
      title: "Shift",
      options: [
        { id: "1", label: "Morning" },
        { id: "2", label: "Afternoon" },
        { id: "3", label: "Evening" },
      ],
    },
    {
      type: "booking",
      title: "Booking",
      options: [
        { id: "3", label: "Instant" },
        { id: "2", label: "Reserve" },
        { id: "1", label: "Enquiry" },
      ],
    },
  ];

  const toggleOption = (type, id) => {
    setFilters((prev) => {
      const current = prev[type] || [];

      return {
        ...prev,
        [type]: current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id],
      };
    });
  };

  const removeTag = (type, id) => {
    setFilters((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((i) => i !== id),
    }));
  };

  const setBudget = (value) => {
    setFilters((prev) => ({
      ...prev,
      budget: value,
    }));
  };

  const clearAll = () => {
    setFilters({
      category_cards: [],
      shift: [],
      booking: [],
      budget: { min: 200, max: 100000 },
    });
  };

  const selectedTags = [];

  filterConfig.forEach((section) => {
    if (!section.options) return;

    section.options.forEach((opt) => {
      if (filters?.[section.type]?.includes(opt.id)) {
        selectedTags.push({
          type: section.type,
          id: opt.id,
          label: opt.label,
        });
      }
    });
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: -350 }}
            animate={{ x: 0 }}
            exit={{ x: -350 }}
            transition={{ duration: 0.25 }}
            className="
              fixed left-0 top-0 h-full
              w-full sm:w-[340px]
              bg-white z-50
              flex flex-col
              shadow-2xl
            "
          >
            {/* HEADER */}
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">
                    Filters
                  </h2>

                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Refine your search
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="
                    w-8 h-8 rounded-full
                    border border-gray-200
                    flex items-center justify-center
                    hover:bg-gray-100
                    transition
                  "
                >
                  <X size={15} />
                </button>
              </div>

              {/* SELECTED TAGS */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map((tag) => (
                    <div
                      key={`${tag.type}-${tag.id}`}
                      className="
                        flex items-center gap-1.5
                        bg-violet-50
                        border border-violet-200
                        text-violet-700
                        rounded-full
                        px-2.5 py-1
                        text-[11px]
                        font-medium
                      "
                    >
                      <span>{tag.label}</span>

                      <button
                        onClick={() =>
                          removeTag(tag.type, tag.id)
                        }
                        className="hover:text-red-500 transition"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto bg-[#fafafa] px-3 py-3 space-y-3">
              {/* AMENITIES */}
              <Section title="Amenities">
                <div className="grid grid-cols-2 gap-2">
                  {filterConfig[0].options.map((opt) => {
                    const active =
                      filters["category_cards"]?.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          toggleOption("category_cards", opt.id)
                        }
                        className={`
                          rounded-2xl border p-3 text-left transition-all
                          ${
                            active
                              ? "bg-violet-50 border-violet-300"
                              : "bg-white border-gray-200"
                          }
                        `}
                      >
                        <div className="text-lg">{opt.icon}</div>

                        <p
                          className={`
                            mt-2 text-[11px] font-medium
                            ${
                              active
                                ? "text-violet-700"
                                : "text-gray-700"
                            }
                          `}
                        >
                          {opt.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* BUDGET */}
              <Section title="Budget">
                <div>
                  <input
                    type="range"
                    min={200}
                    max={100000}
                    value={filters?.budget?.min || 200}
                    onChange={(e) =>
                      setBudget({
                        ...filters.budget,
                        min: Number(e.target.value),
                      })
                    }
                    className="w-full accent-violet-600"
                  />

                  <div className="flex justify-between mt-2">
                    <div className="bg-gray-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-gray-500">
                        Min
                      </p>

                      <p className="text-[11px] font-semibold">
                        ₹{filters?.budget?.min || 200}
                      </p>
                    </div>

                    <div className="bg-gray-100 rounded-xl px-3 py-2 text-right">
                      <p className="text-[10px] text-gray-500">
                        Max
                      </p>

                      <p className="text-[11px] font-semibold">
                        ₹{filters?.budget?.max || 100000}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>

              {/* SHIFT */}
              <Section title="Shift">
                <div className="flex flex-wrap gap-2">
                  {filterConfig[2].options.map((opt) => {
                    const active =
                      filters["shift"]?.includes(opt.id);

                    return (
                      <Chip
                        key={opt.id}
                        active={active}
                        label={opt.label}
                        onClick={() =>
                          toggleOption("shift", opt.id)
                        }
                      />
                    );
                  })}
                </div>
              </Section>

              {/* BOOKING */}
              <Section title="Booking">
                <div className="flex flex-wrap gap-2">
                  {filterConfig[3].options.map((opt) => {
                    const active =
                      filters["booking"]?.includes(opt.id);

                    return (
                      <Chip
                        key={opt.id}
                        active={active}
                        label={opt.label}
                        onClick={() =>
                          toggleOption("booking", opt.id)
                        }
                      />
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 p-3 bg-white flex gap-2">
              <button
                onClick={clearAll}
                className="
                  flex-1 h-10 rounded-xl
                  border border-gray-200
                  text-[12px] font-medium
                  hover:bg-gray-50
                  transition
                "
              >
                Clear
              </button>

              <button
                onClick={() => setOpen(false)}
                className="
                  flex-1 h-10 rounded-xl
                  bg-gradient-to-r from-violet-600 to-fuchsia-600
                  text-white text-[12px] font-semibold
                  shadow-lg shadow-violet-500/20
                  active:scale-[0.98]
                  transition
                "
              >
                Show {venueCount}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ================= SECTION ================= */

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3">
      <h3 className="text-[12px] font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* ================= CHIP ================= */

function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full
        text-[11px] font-medium
        border transition-all
        ${
          active
            ? "bg-violet-600 border-violet-600 text-white"
            : "bg-white border-gray-200 text-gray-700"
        }
      `}
    >
      {label}
    </button>
  );
}