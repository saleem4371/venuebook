"use client";

import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

export default function CategoryCards({
  categoryKeys,
  activeCat,
  onSelect,
  parents,
}) {
  const tabs = parents?.category || [];

  // Hide tabs if there is only one category
  if (tabs.length <= 1) {
    return null;
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((key) => {
        const theme = getCategoryTheme(key);
        const isActive = key === activeCat;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? `${theme.solid} text-white`
                : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-white" : theme.dot
              }`}
            />
            {CATEGORY_LABELS[key] ?? key}
          </button>
        );
      })}
    </div>
  );
}