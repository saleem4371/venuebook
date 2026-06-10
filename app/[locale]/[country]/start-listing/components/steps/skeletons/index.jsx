"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Skeleton Loading System — VenueBook Listing Wizard
//
//  Design spec:
//    • Base colour:  #F3F4F6  (dark: #1F2937)
//    • Shine colour: white 82%  (dark: white 5.5%)
//    • Animation:    sk-shimmer 1.2s ease-in-out infinite (GPU: transform only)
//    • The CSS is defined in app/globals.css — the `.sk-base` class handles
//      everything. React components just set dimensions and border-radius.
//
//  Usage rules:
//    • Only show when: initial load, data fetching, map loading, image upload,
//      address lookup, draft restoration.
//    • Never show for: button clicks, typing, checkbox/toggle/dropdown.
//    • Use `useSkeletonDelay` to avoid flicker on fast loads (<150ms).
//    • Once shown, keep visible ≥ 300ms (enforced by useSkeletonDelay).
//
//  Exports:
//    Primitives:        Sk, FormFieldSkeleton, MapSkeleton
//    Step skeletons:    BasicsSkeleton, LocationSkeleton, AmenitiesSkeleton,
//                       CapacitySkeleton, PricingSkeleton, MediaSkeleton,
//                       ReviewSkeleton, StepSkeleton
//    Hook:              useSkeletonDelay
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  Timing hook
//  Prevents flicker on fast loads: skeleton only appears if loading takes
//  longer than `threshold` ms. Once shown, stays for at least `minDisplay` ms.
// ─────────────────────────────────────────────────────────────────────────────

export function useSkeletonDelay(isLoading, threshold = 150, minDisplay = 300) {
  const [visible, setVisible] = useState(false);
  const ref = useRef({ showTimer: null, hideTimer: null, shownAt: null });

  useEffect(() => {
    const r = ref.current;

    if (isLoading) {
      clearTimeout(r.hideTimer);
      r.shownAt = null;

      r.showTimer = setTimeout(() => {
        setVisible(true);
        r.shownAt = Date.now();
      }, threshold);
    } else {
      clearTimeout(r.showTimer);

      if (r.shownAt !== null) {
        // Already visible — enforce minimum display duration
        const elapsed   = Date.now() - r.shownAt;
        const remaining = Math.max(0, minDisplay - elapsed);
        r.hideTimer = setTimeout(() => {
          setVisible(false);
          r.shownAt = null;
        }, remaining);
      } else {
        // Never became visible — hide immediately
        setVisible(false);
      }
    }

    return () => {
      clearTimeout(r.showTimer);
      clearTimeout(r.hideTimer);
    };
  }, [isLoading, threshold, minDisplay]);

  return visible;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Base shimmer block — the single primitive every skeleton is built from.
//  All sizing and shape is applied via className; `.sk-base` adds the animation.
// ─────────────────────────────────────────────────────────────────────────────

export const Sk = memo(function Sk({ className = "", style }) {
  return (
    <div
      className={`sk-base ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  FormFieldSkeleton — label line + input (or textarea) block
// ─────────────────────────────────────────────────────────────────────────────

export const FormFieldSkeleton = memo(function FormFieldSkeleton({
  labelW   = "w-32",
  textarea = false,
  counter  = false,
}) {
  return (
    <div className="space-y-2">
      <Sk className={`h-4 rounded-md ${labelW}`} />
      <Sk className={`w-full rounded-xl ${textarea ? "h-28" : "h-11"}`} />
      {counter && (
        <div className="flex justify-end">
          <Sk className="h-3 w-10 rounded-full" />
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  MapSkeleton — road-grid pattern matching the real map's h-60 sm:h-72 block
// ─────────────────────────────────────────────────────────────────────────────

export const MapSkeleton = memo(function MapSkeleton({ className = "h-60 sm:h-72" }) {
  return (
    <div
      className={`relative ${className} rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700`}
      aria-hidden="true"
    >
      {/* Base shimmer fill */}
      <Sk className="absolute inset-0" style={{ borderRadius: 0 }} />

      {/* Faint road-grid lines — gives a "map-like" feel */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.18 }}>
        <div className="absolute inset-x-0 top-[30%]  h-px bg-gray-500 dark:bg-gray-400" />
        <div className="absolute inset-x-0 top-[60%]  h-px bg-gray-500 dark:bg-gray-400" />
        <div className="absolute inset-y-0 left-[25%] w-px bg-gray-500 dark:bg-gray-400" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-gray-500 dark:bg-gray-400" />
        <div className="absolute inset-y-0 left-[75%] w-px bg-gray-500 dark:bg-gray-400" />
        {/* Diagonal "road" suggestion */}
        <div
          className="absolute bg-gray-400 dark:bg-gray-500"
          style={{ width: 1, height: "40%", top: "30%", left: "38%", transform: "rotate(30deg)", transformOrigin: "top" }}
        />
      </div>

      {/* Centre pin placeholder */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
        <Sk className="w-8 h-10 rounded-t-full rounded-b-sm" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
        <div className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* Bottom hint bar */}
      <div className="absolute bottom-0 inset-x-0 h-9 bg-white/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center px-4">
        <Sk className="h-2.5 w-56 rounded-full" />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  STEP SKELETONS
//  Each skeleton precisely mirrors the final step's visual structure so there
//  is zero layout shift when real content renders.
// ─────────────────────────────────────────────────────────────────────────────

// ── Basics step: property name + description + subcategory chips ─────────────
export const BasicsSkeleton = memo(function BasicsSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading basic details…">

      {/* Property name */}
      <div className="space-y-2">
        <Sk className="h-4 w-36 rounded-md" />
        <Sk className="h-11 w-full rounded-xl" />
        <div className="flex justify-between">
          <div className="w-1" />
          <Sk className="h-3 w-10 rounded-full" />
        </div>
      </div>

      {/* About / description */}
      <div className="space-y-2">
        <Sk className="h-4 w-44 rounded-md" />
        <Sk className="h-28 w-full rounded-xl" />
        <div className="flex justify-between">
          <div className="w-1" />
          <Sk className="h-3 w-12 rounded-full" />
        </div>
      </div>

      {/* Subcategory chips */}
      <div className="space-y-3">
        <Sk className="h-4 w-28 rounded-md" />
        <Sk className="h-3 w-64 rounded-full" />
        <div className="flex flex-wrap gap-2 pt-1">
          {[72, 88, 96, 80, 104, 80, 68, 92].map((w, i) => (
            <Sk key={i} className="h-9 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

    </div>
  );
});

// ── Location step: country → search → map → 4 address fields ────────────────
export const LocationSkeleton = memo(function LocationSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading location…">

      {/* Country selector */}
      <div className="space-y-2">
        <Sk className="h-4 w-20 rounded-md" />
        <Sk className="h-11 w-full rounded-xl" />
        <Sk className="h-3 w-72 rounded-full" />
      </div>

      {/* Search bar */}
      <div className="space-y-2">
        <Sk className="h-4 w-32 rounded-md" />
        <Sk className="h-11 w-full rounded-xl" />
        <Sk className="h-3 w-80 rounded-full" />
      </div>

      {/* Map block — matches h-60 sm:h-72, rounded-2xl */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Sk className="h-4 w-28 rounded-md" />
          <Sk className="h-4 w-24 rounded-full" />
        </div>
        <MapSkeleton className="h-60 sm:h-72" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
        <Sk className="h-3 w-32 rounded-full" />
        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Street address */}
      <FormFieldSkeleton labelW="w-32" />

      {/* City + State row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormFieldSkeleton labelW="w-16" />
        <FormFieldSkeleton labelW="w-24" />
      </div>

      {/* Postal + Country row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormFieldSkeleton labelW="w-24" />
        <FormFieldSkeleton labelW="w-20" />
      </div>

    </div>
  );
});

// ── Amenities step: group headers + chip grids ───────────────────────────────
const AMENITY_ROW_COUNTS = [9, 8, 8];  // mirrors typical API group sizes

export const AmenitiesSkeleton = memo(function AmenitiesSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading amenities…">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <Sk className="h-4 w-44 rounded-md" />
      </div>

      {/* Category groups */}
      {AMENITY_ROW_COUNTS.map((count, gi) => (
        <div key={gi}>
          <Sk className="h-3 w-24 mb-3 rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: count }, (_, ci) => (
              <Sk key={ci} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>
      ))}

      {/* Insight card placeholder */}
      <Sk className="h-16 rounded-xl" />

    </div>
  );
});

// ── Capacity step: guest inputs + seating card grid ──────────────────────────
export const CapacitySkeleton = memo(function CapacitySkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading capacity…">

      {/* Max + Min guest inputs — single row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Sk className="h-4 w-28 rounded-md" />
            <Sk className="h-11 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Section heading + lock hint */}
      <div className="space-y-1.5">
        <Sk className="h-4 w-48 rounded-md" />
        <Sk className="h-3 w-64 rounded-full" />
      </div>

      {/* Seating card grid — 2 / 3 / 4 cols matching real grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }, (_, i) => (
          <Sk key={i} className="h-24 rounded-xl" />
        ))}
      </div>

    </div>
  );
});

// ── Pricing step: rate + check-in/out + deposit ──────────────────────────────
export const PricingSkeleton = memo(function PricingSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading pricing…">

      {/* Mode / header card */}
      <Sk className="h-16 rounded-xl" />

      {/* Main rate field */}
      <FormFieldSkeleton labelW="w-28" />

      {/* Check-in / Check-out */}
      <div className="grid grid-cols-2 gap-4">
        <FormFieldSkeleton labelW="w-20" />
        <FormFieldSkeleton labelW="w-20" />
      </div>

      {/* Weekend rate toggle */}
      <Sk className="h-14 rounded-xl" />

      {/* Security deposit */}
      <FormFieldSkeleton labelW="w-36" />

      {/* Info note */}
      <Sk className="h-10 rounded-xl" />

    </div>
  );
});

// ── Media step: counter bar + image grid + drop zone ─────────────────────────
export const MediaSkeleton = memo(function MediaSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading photos…">

      {/* Counter bar */}
      <div className="flex items-center justify-between">
        <Sk className="h-4 w-36 rounded-md" />
        <Sk className="h-9 w-32 rounded-xl" />
      </div>

      {/* Image grid — 2 cols mobile / 3 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="relative">
            <Sk className="aspect-square rounded-2xl" />
            {/* Cover badge on first card */}
            {i === 0 && (
              <div className="absolute top-2 left-2">
                <Sk className="h-5 w-14 rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drop zone / add hint */}
      <Sk className="h-11 rounded-xl" />

    </div>
  );
});

// ── Review step: hero + section cards + submit CTA ───────────────────────────
const REVIEW_SECTION_ROWS = [4, 4, 2, 3, 3, 1];  // rows per section card

export const ReviewSkeleton = memo(function ReviewSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading review…">

      {/* Hero cover image */}
      <Sk className="h-44 sm:h-52 rounded-2xl" />

      {/* 6 section cards */}
      {REVIEW_SECTION_ROWS.map((rows, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Sk className="h-4 w-32 rounded-md" />
            <Sk className="h-4 w-8 rounded-full" />
          </div>
          {/* Card body — key/value rows */}
          <div className="px-5 py-4 space-y-3">
            {Array.from({ length: rows }, (_, j) => (
              <div key={j} className="flex gap-3 items-center">
                <Sk className="h-3 rounded-full flex-shrink-0" style={{ width: 100 + (j % 3) * 12 }} />
                <Sk className="h-3 rounded-full flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Submit CTA card */}
      <Sk className="h-16 rounded-2xl" />

    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  StepSkeleton — unified switcher used by WizardShell
// ─────────────────────────────────────────────────────────────────────────────

export const StepSkeleton = memo(function StepSkeleton({ stepKey }) {
  switch (stepKey) {
    case "basics":    return <BasicsSkeleton />;
    case "location":  return <LocationSkeleton />;
    case "amenities": return <AmenitiesSkeleton />;
    case "capacity":  return <CapacitySkeleton />;
    case "pricing":   return <PricingSkeleton />;
    case "media":     return <MediaSkeleton />;
    case "review":    return <ReviewSkeleton />;
    default:          return (
      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, i) => <FormFieldSkeleton key={i} />)}
      </div>
    );
  }
});
