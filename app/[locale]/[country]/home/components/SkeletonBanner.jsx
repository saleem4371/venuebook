"use client";

/**
 * SkeletonBanner
 * ─────────────────────────────────────────────────────────────
 * Loading placeholder for PremiumBanner — same rounded-2xl box,
 * same 250px min-height, so the layout doesn't jump once the real
 * banner (with its background image + copy) is ready.
 */
export default function SkeletonBanner() {
  return (
    <div
      className="w-full rounded-2xl mb-8 bg-gray-200 dark:bg-gray-800 animate-pulse"
      style={{ minHeight: 250 }}
    />
  );
}
