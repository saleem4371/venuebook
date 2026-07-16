"use client";

import HorizontalRail from "./HorizontalRail";
import SkeletonCard from "./SkeletonCard";

const SKELETON_COUNT = 5;

/**
 * SkeletonRail
 * ─────────────────────────────────────────────────────────────
 * The loading state for any horizontal-rail section (Recommended,
 * Recently Viewed, Popular, Sponsored, ...) — same header, same
 * HorizontalRail mechanics, real cards swapped for SkeletonCard so
 * nothing resizes once the real data lands. Shared so every rail's
 * loading state looks and behaves identically instead of each
 * section inlining its own placeholder markup.
 */
export default function SkeletonRail({ title, subtitle, eyebrow, accent = "#7c3aed", variant = "medium" }) {
  return (
    <section className="w-full mb-8">
      <HorizontalRail title={title} subtitle={subtitle} eyebrow={eyebrow} count={0} accent={accent}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} variant={variant} />
        ))}
      </HorizontalRail>
    </section>
  );
}
