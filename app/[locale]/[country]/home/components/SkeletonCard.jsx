"use client";

/**
 * SkeletonCard
 * ─────────────────────────────────────────────────────────────
 * A loading placeholder shaped like PropertyCard — same image
 * aspect ratio per `variant`, same content block underneath — so a
 * loading rail doesn't visibly jump/resize once the real cards
 * arrive. Pure CSS `animate-pulse`, no framer-motion needed for a
 * static shimmer.
 */
const IMAGE_ASPECT = {
  editorial: "aspect-[6/5]",
  medium: "aspect-[5/4]",
  landscape: "aspect-[16/10]",
  compact: "aspect-square",
};

export default function SkeletonCard({ variant = "medium" }) {
  const aspect = IMAGE_ASPECT[variant] ?? IMAGE_ASPECT.medium;

  return (
    <div className="w-full animate-pulse">
      <div className={`${aspect} rounded-2xl bg-gray-200 dark:bg-gray-800`} />
      <div className="pt-2 flex flex-col gap-1.5">
        <div className="h-3.5 w-3/4 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-2.5 w-1/2 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-2/5 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
