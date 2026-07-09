"use client";

import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

/**
 * Category switcher — a sticky tab bar, and the single control on the
 * page for what "selected category" means: everything below it (stats,
 * about copy, listings, amenities, videos, reels, map) reacts to
 * whichever tab is active here. Sits directly under the Hero so the
 * user always knows what they're browsing before scrolling further.
 *
 * `categoryKeys` is expected to already be filtered to categories worth
 * showing a tab for (i.e. ones with real listings) — this component
 * doesn't apply its own filter on top, so an empty/"coming soon"
 * category like Workspace simply never gets passed in.
 */
export default function CategoryCards({ categoryKeys, activeCat, onSelect }) {
  const tabs = categoryKeys;

  return (
    <div className="sticky top-16 md:top-[72px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.08]">
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
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
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : theme.dot}`} />
              {CATEGORY_LABELS[key] ?? key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
