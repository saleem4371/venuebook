"use client";

import ListingCard from "./ListingCard";
import CategoryAmenities from "./CategoryAmenities";
import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

/**
 * Listings + Amenities only — the category title/description now lives
 * in the page-level About section (right after Quick Stats), and Videos
 * is its own top-level section (see CategoryVideos), so this component
 * no longer repeats either.
 */
export default function CategoryBlock({ estate, categoryKey, id, filteredListings }) {
  const cat = estate.categories[categoryKey];
  const theme = getCategoryTheme(categoryKey);
  const label = CATEGORY_LABELS[categoryKey] ?? categoryKey;

  if (!cat) return null;

  // filteredListings (from the unified search bar's guests/price filters)
  // takes precedence when provided; falls back to the full category list.
  const listings = filteredListings ?? cat.listings ?? [];

  if (cat.comingSoon && (cat.listings?.length ?? 0) === 0) {
    return (
      <div id={id} className="scroll-mt-24 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label} — Coming Soon</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{cat.overview}</p>
      </div>
    );
  }

  return (
    <div id={id} className="scroll-mt-24 space-y-6">
      {/* Listings */}
      {cat.listings?.length > 0 && (
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{label} at this Estate</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Explore all {label.toLowerCase()} available inside this estate.
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${theme.bg} ${theme.textBold}`}>
              {cat.listings.length} {label}
            </span>
          </div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} estateId={estate.id} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-4">No {label.toLowerCase()} match your current filters.</p>
          )}
        </div>
      )}

      {/* Amenities */}
      <CategoryAmenities groups={cat.amenities} theme={theme} label={label} />
    </div>
  );
}
