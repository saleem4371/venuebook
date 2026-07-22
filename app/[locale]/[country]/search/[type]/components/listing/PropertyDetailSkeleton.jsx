"use client";

/**
 * PropertyDetailSkeleton
 *
 * Full-page loading skeleton for the Property Details page (Venue + Farmstay).
 * Rendered while the property API call is in-flight — users never see ₹NaN,
 * "undefined" text, "No photos available", or empty booking widgets.
 *
 * Design rules:
 * • Uses the global .sk-base class (CSS var shimmer, dark-mode aware, GPU-only)
 * • Layout dimensions precisely mirror the real page — near-zero layout shift
 *   when data loads and the real page replaces this.
 * • Mobile gallery mirrors the real full-bleed slider height formula.
 * • Desktop gallery mirrors the exact 5-panel grid.
 * • Split column ratio: lg:grid-cols-[1fr_380px] — same as real page.
 */

/** Base shimmer block. Pass Tailwind classes to size/shape. */
function Sk({ className = "", style }) {
  return <div className={`sk-base rounded-xl ${className}`} style={style} />;
}

/** Thin horizontal divider that matches the real section borders */
function Divider() {
  return <div className="border-t border-gray-100 dark:border-gray-800" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-SECTION SKELETONS
───────────────────────────────────────────────────────────────────────────── */

/** Mirrors the real title block (h1 + badge + attributes + location + price + rating) */
function HeaderSkeleton({ isFarmstay }) {
  return (
    <div className="pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
      {/* Left: name + badge + attributes */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Property name */}
        <Sk className="h-7 w-3/4 lg:w-2/3" />
        {/* Sub-type badge */}
        <Sk className="h-5 w-28 rounded-full" />
        {/* Attribute row: bedrooms · beds · bathrooms · guests */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
          {[80, 60, 90, 100].map((w, i) => (
            <Sk key={i} className="h-4 rounded-full" style={{ width: w }} />
          ))}
        </div>
        {/* Location */}
        <div className="flex items-center gap-1.5 mt-2">
          <Sk className="w-3.5 h-3.5 rounded-full flex-none" />
          <Sk className="h-4 w-52 rounded-full" />
        </div>
        {/* Price + rating row */}
        <div className="flex items-center gap-4 mt-2">
          <Sk className="h-5 w-40 rounded-full" />
          <Sk className="h-4 w-24 rounded-full" />
        </div>
      </div>

      {/* Right: parent property card */}
      <div className="flex-none flex items-center md:flex-col md:items-center gap-3 md:gap-3
                      px-5 py-4 md:px-4 md:py-5 rounded-2xl border border-gray-100
                      dark:border-gray-800 w-full md:w-52 lg:w-48 xl:w-52">
        <Sk className="w-12 h-12 rounded-2xl flex-none md:w-14 md:h-14" />
        <div className="flex-1 md:text-center space-y-2 md:w-full">
          <Sk className="h-2.5 w-12 rounded-full md:mx-auto" />
          <Sk className="h-4 w-28 md:w-full" />
          <Sk className="h-3 w-20 rounded-full md:mx-auto" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors HeroHighlights — 4 feature cards */
function HeroHighlightsSkeleton() {
  return (
    <div className="pt-6 pb-6">
      <Sk className="h-6 w-48 mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-gray-800
                       bg-gray-50/60 dark:bg-gray-900/60 p-4 space-y-3"
          >
            <Sk className="w-9 h-9 rounded-xl" />
            <Sk className="h-4 w-24" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors the Calendar section (height matches real PremiumCalendar) */
function CalendarSkeleton({ isFarmstay }) {
  return (
    <div className="py-4">
      <Sk className="h-6 w-36 mb-4" />
      {isFarmstay ? (
        /* Farmstay: date range picker — wider, two-month layout on desktop */
        <Sk className="h-72 md:h-80 w-full rounded-2xl" />
      ) : (
        /* Venue: single-month grid + shift selector */
        <div className="space-y-3">
          <Sk className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => <Sk key={i} className="h-12 rounded-xl" />)}
          </div>
        </div>
      )}
    </div>
  );
}

/** Mirrors About section */
function AboutSkeleton() {
  return (
    <div className="pt-6 pb-6 space-y-3">
      <Sk className="h-6 w-40" />
      <Sk className="h-3.5 w-full" />
      <Sk className="h-3.5 w-full" />
      <Sk className="h-3.5 w-5/6" />
      <Sk className="h-3.5 w-4/5" />
      <Sk className="h-4 w-20 rounded-full mt-1" />
    </div>
  );
}

/** Mirrors ExperienceBlock — event type pill grid */
function EventsSkeleton() {
  const widths = [88, 110, 72, 96, 120, 80, 104, 92, 76, 100];
  return (
    <div className="pt-6 pb-6">
      <Sk className="h-6 w-44 mb-5" />
      <div className="flex flex-wrap gap-2">
        {widths.map((w, i) => (
          <Sk key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

/** Mirrors AmenitiesGrid — icon + label rows */
function AmenitiesSkeleton() {
  return (
    <div className="pt-6 pb-6">
      <Sk className="h-6 w-32 mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl
                       border border-gray-100 dark:border-gray-800"
          >
            <Sk className="w-8 h-8 rounded-lg flex-none" />
            <Sk className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <Sk className="h-10 w-36 rounded-xl mt-4" />
    </div>
  );
}

/** Mirrors StayInformation sleeping / rules / arrival sections (farmstay) */
function StayInfoSkeleton() {
  return (
    <div className="space-y-0">
      {["Rooms & Sleeping", "House Rules", "Arrival Info"].map((_, i) => (
        <div key={i}>
          <Divider />
          <div className="pt-6 pb-6 space-y-4">
            <Sk className="h-6 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-start gap-3 p-3 rounded-xl
                             border border-gray-100 dark:border-gray-800"
                >
                  <Sk className="w-8 h-8 rounded-lg flex-none mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-4 w-32" />
                    <Sk className="h-3 w-full" />
                    <Sk className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors SocialProofHub — rating summary + review cards */
function ReviewsSkeleton() {
  return (
    <div className="pt-6 pb-6">
      {/* Rating header */}
      <div className="flex items-center gap-4 mb-6">
        <Sk className="h-7 w-10" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => <Sk key={i} className="w-4 h-4 rounded-full" />)}
        </div>
        <Sk className="h-4 w-24 rounded-full" />
      </div>
      {/* Review cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Sk className="w-9 h-9 rounded-full flex-none" />
              <div className="flex-1 space-y-1.5">
                <Sk className="h-3.5 w-24" />
                <Sk className="h-3 w-16" />
              </div>
              <Sk className="h-4 w-10 rounded-full flex-none" />
            </div>
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-5/6" />
            <Sk className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors Location section — header + map block */
function LocationSkeleton() {
  return (
    <div className="pt-6 pb-6 mb-12">
      <Sk className="h-6 w-24 mb-4" />
      <div className="flex items-center gap-2 mb-5">
        <Sk className="w-3.5 h-3.5 rounded-full flex-none" />
        <Sk className="h-4 w-56 rounded-full" />
      </div>
      <Sk className="w-full rounded-2xl" style={{ height: "320px" }} />
    </div>
  );
}

/** Right-column booking card skeleton */
function BookingCardSkeleton({ isFarmstay }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Card header */}
      <div className="p-4 pb-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <Sk className="w-9 h-9 rounded-xl flex-none" />
        <Sk className="h-4 w-36" />
      </div>

      <div className="p-4 space-y-4">
        {/* Price + badge */}
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <Sk className="h-8 w-28" />
            <Sk className="h-3.5 w-18 rounded-full" />
          </div>
          <Sk className="h-6 w-24 rounded-full" />
        </div>

        {/* Date / slot fields */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isFarmstay ? (
            /* Farmstay: check-in + checkout */
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              {["Check-in", "Checkout"].map((_, i) => (
                <div key={i} className="p-3 space-y-1.5">
                  <Sk className="h-2.5 w-14 rounded-full" />
                  <Sk className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            /* Venue: event date + time slot */
            <>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
                {["Event Date", "Time Slot"].map((_, i) => (
                  <div key={i} className="p-3 space-y-1.5">
                    <Sk className="h-2.5 w-16 rounded-full" />
                    <Sk className="h-4 w-22" />
                  </div>
                ))}
              </div>
              {/* Guest capacity */}
              <div className="p-3 space-y-1.5">
                <Sk className="h-2.5 w-24 rounded-full" />
                <Sk className="h-4 w-28" />
              </div>
            </>
          )}
        </div>

        {/* CTA button */}
        <Sk className="h-11 w-full rounded-xl" />

        {/* Trust badges */}
        <div className="flex justify-around pt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Sk className="w-6 h-6 rounded-full" />
              <Sk className="h-2.5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function PropertyDetailSkeleton({ catKey = "venues" }) {
  const isFarmstay = catKey === "farmstays";

  return (
    <div className="flex flex-col relative bg-white dark:bg-gray-950 min-h-screen">

      {/* ── GALLERY ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full md:pt-6 lg:pt-6 xl:pt-6">
        {/* Breadcrumb skeleton — hidden on mobile, matches real Breadcrumb's pt-3 pb-1 */}
        <div className="hidden md:flex items-center gap-2 pt-3 pb-1">
          {[40, 60, 80, 130].map((w, i) => (
            <span key={i} className="flex items-center gap-2">
              <Sk className="h-3 rounded-full" style={{ width: w }} />
              {i < 3 && <Sk className="w-3 h-3 rounded-full flex-none" />}
            </span>
          ))}
        </div>

        <div className="pb-2" style={{ paddingTop: 14 }}>

          {/* Mobile: full-bleed slider height (matches Gallery.jsx clamp formula) */}
          <div
            className="md:hidden -mx-4 sm:-mx-6 sk-base"
            style={{ height: "clamp(300px, 85vw, 460px)", borderRadius: 0 }}
          />

          {/* Desktop: 5-panel grid (exactly mirrors Gallery.jsx grid) */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[480px]">
            {/* Main large panel (row-span-2) */}
            <Sk className="row-span-2 rounded-none" />
            {/* 4 side panels */}
            {[...Array(4)].map((_, i) => (
              <Sk key={i} className="rounded-none" />
            ))}
          </div>

        </div>

        {/* ── SPLIT LAYOUT ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 mt-4">

          {/* ════ LEFT COLUMN ════ */}
          <div className="min-w-0">

            <HeaderSkeleton isFarmstay={isFarmstay} />

            <Divider />
            <HeroHighlightsSkeleton />

            <Divider />
            <CalendarSkeleton isFarmstay={isFarmstay} />

            <Divider />
            <AboutSkeleton />

            {!isFarmstay && (
              <>
                <Divider />
                <EventsSkeleton />
              </>
            )}

            <Divider />
            <AmenitiesSkeleton />

            {isFarmstay && <StayInfoSkeleton />}

            <Divider />
            <ReviewsSkeleton />

            <Divider />
            <LocationSkeleton />

          </div>

          {/* ════ RIGHT COLUMN — booking card ════ */}
          <div className="hidden lg:block">
            {/* sticky top matches BookingCard's sticky top-[calc(57px+44px+16px)] */}
            <div className="sticky top-[calc(57px+44px+16px)]">
              <BookingCardSkeleton isFarmstay={isFarmstay} />
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ────────────────────────────────────────────────
          Matches the real mobile bar's fixed positioning and height.        */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[40]
                      bg-white dark:bg-gray-950
                      border-t border-gray-100 dark:border-gray-800
                      px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <Sk className="h-5 w-28" />
            <Sk className="h-3 w-18 rounded-full" />
          </div>
          <Sk className="h-11 w-32 rounded-full flex-none" />
        </div>
      </div>

    </div>
  );
}
