"use client";

/**
 * Category-dependent — shows what THIS category is (venues, farmstays,
 * studios, ...) rather than always retelling the estate's founding
 * story, so the copy actually changes when the switcher above it does.
 */
export default function AboutEstate({ estate, categoryKey, catLabel , parents }) {
  const cat = estate.categories?.[categoryKey];
  if (!cat?.overview) return null;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">About the {catLabel}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{parents?.result?.[0]?.about_venues ?? 'No about found'}</p>
    </div>
  );
}
