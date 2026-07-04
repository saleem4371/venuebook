"use client";

import { ArrowRight, Clock } from "lucide-react";
import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

export default function CategoryCards({ estate, categoryKeys, activeCat, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {categoryKeys.map((key) => {
        const cat = estate.categories[key];
        const theme = getCategoryTheme(key);
        const isActive = key === activeCat;
        const comingSoon = !!cat?.comingSoon && (cat?.listings?.length ?? 0) === 0;
        const count = cat?.listings?.length ?? 0;

        return (
          <button
            key={key}
            disabled={comingSoon}
            onClick={() => !comingSoon && onSelect(key)}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
              comingSoon
                ? "opacity-60 cursor-not-allowed border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]"
                : isActive
                ? `${theme.bg} ${theme.border} shadow-sm`
                : "border-gray-100 dark:border-white/[0.07] bg-white dark:bg-transparent hover:border-gray-200 dark:hover:border-white/[0.14] hover:shadow-sm"
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mb-3 ${theme.dot}`} />
            <p className="font-semibold text-sm sm:text-[15px] text-gray-900 dark:text-white leading-tight">
              {CATEGORY_LABELS[key] ?? key}
            </p>
            <p className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              {comingSoon ? "Coming Soon" : `${count} Listing${count === 1 ? "" : "s"}`}
            </p>
            {!comingSoon && (
              <span className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${theme.text}`}>
                View <ArrowRight size={12} />
              </span>
            )}
            {comingSoon && (
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-gray-400 dark:text-gray-600">
                <Clock size={12} /> Notify me
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
