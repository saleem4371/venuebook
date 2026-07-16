"use client";

/**
 * SkeletonTopDestinations
 * ─────────────────────────────────────────────────────────────
 * Loading placeholder for TopDestinations — same header + the same
 * responsive grid-cols steps (2/3/4/5) and aspect-[4/3] tiles, so
 * the grid doesn't reflow once the real destinations are ready.
 */
export default function SkeletonTopDestinations() {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <div className="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
        <div className="h-5 w-40 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
