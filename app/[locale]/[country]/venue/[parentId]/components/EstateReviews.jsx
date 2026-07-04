"use client";

import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { CATEGORY_LABELS } from "../utils/estateTheme";

export default function EstateReviews({ estate, categoryKeys }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return estate.reviews;
    return estate.reviews.filter((r) => r.category === filter);
  }, [estate.reviews, filter]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Reviews
          <span className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Star size={14} className="fill-amber-400 text-amber-400" /> {estate.rating}
          </span>
          <span className="ml-1 text-sm font-normal text-gray-400">({estate.reviewCount.toLocaleString()})</span>
        </h2>

        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["all", ...categoryKeys].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10]"
              }`}
            >
              {f === "all" ? "All" : CATEGORY_LABELS[f] ?? f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet for this category.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-transparent">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Star size={11} className="fill-amber-400 text-amber-400" /> {r.rating}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">{r.text}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                {CATEGORY_LABELS[r.category] ?? r.category} · {new Date(r.date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
