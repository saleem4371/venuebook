"use client";

import { ArrowRight, Clock } from "lucide-react";
import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

/**
 * "This Estate also includes" — every category the estate offers EXCEPT
 * the one currently active/originating. This is the cross-category
 * discovery surface called out as critical in the spec: it must never
 * repeat the category the visitor arrived from or is currently viewing.
 */
export default function CrossCategoryDiscovery({ estate, categoryKeys, activeCat, onSelect }) {
  const others = categoryKeys.filter((k) => k !== activeCat);
  if (!others.length) return null;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">This Estate also includes</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Keep exploring — one estate, several ways to experience it.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {others.map((key) => {
          const cat = estate.categories[key];
          const theme = getCategoryTheme(key);
          const comingSoon = !!cat?.comingSoon && (cat?.listings?.length ?? 0) === 0;
          const cover = cat?.listings?.[0]?.image ?? cat?.gallery?.[0];

          return (
            <button
              key={key}
              disabled={comingSoon}
              onClick={() => !comingSoon && onSelect(key)}
              className={`relative text-left rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] group ${
                comingSoon ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg transition-shadow"
              }`}
            >
              <div className="relative h-28 sm:h-32">
                {cover ? (
                  <img
                    src={cover}
                    alt={CATEGORY_LABELS[key]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-full ${theme.bg}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white text-sm font-semibold">{CATEGORY_LABELS[key] ?? key}</p>
                  <p className="text-white/80 text-[11px] flex items-center gap-1">
                    {comingSoon ? (
                      <><Clock size={10} /> Coming Soon</>
                    ) : (
                      <>{(cat?.listings?.length ?? 0)} Listing{(cat?.listings?.length ?? 0) === 1 ? "" : "s"} <ArrowRight size={10} /></>
                    )}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
