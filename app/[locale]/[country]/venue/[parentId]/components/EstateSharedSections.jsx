"use client";

/**
 * Estate-level sections that belong to the whole property, never to a
 * single listing: shared facilities, shared highlights, and estate
 * experiences. Rendered once, regardless of which category is active.
 */
export default function EstateSharedSections({ estate }) {
  return (
    <div className="space-y-8">
      {/* Shared Facilities */}
      {estate.sharedFacilities?.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Shared Facilities</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {estate.sharedFacilities.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]"
              >
                {Icon && <Icon size={18} className="text-gray-500 dark:text-gray-400" />}
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Highlights */}
      {estate.sharedHighlights?.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Estate Highlights</h2>
          <div className="flex flex-wrap gap-2">
            {estate.sharedHighlights.map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/40"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estate Experiences */}
      {estate.experiences?.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Estate Experiences</h2>
          <div className="flex flex-wrap gap-2">
            {estate.experiences.map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby */}
      {estate.nearby?.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Nearby</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {estate.nearby.map((n) => (
              <div key={n.label} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{n.label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{n.distance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
