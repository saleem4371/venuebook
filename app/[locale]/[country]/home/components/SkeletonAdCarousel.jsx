"use client";

/**
 * SkeletonAdCarousel
 * ─────────────────────────────────────────────────────────────
 * Loading placeholder for AdCarousel — same rounded-3xl box and
 * the same responsive height steps, so nothing jumps once the
 * real slider mounts.
 */
export default function SkeletonAdCarousel() {
  return (
    <div className="w-full rounded-3xl mb-8 h-[210px] sm:h-[260px] md:h-[300px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
  );
}
