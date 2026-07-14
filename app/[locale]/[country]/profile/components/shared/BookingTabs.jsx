"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/BookingTabs.jsx
 *
 * Horizontal, scrollable pill tab bar shared by BookingsSection.jsx (the
 * full list, used on mobile and inside the "view all" drawer) and
 * BookingsPanel.jsx (the compact fixed-dashboard widget) — one filter
 * implementation instead of two.
 *
 * Two independent axes are exposed as a single flat tab list:
 *   - All / Upcoming / Completed / Cancelled → bookingStatus (a
 *     reservation's lifecycle).
 *   - Reservation / Enquiry / Drafted → bookingType (what kind of booking
 *     row this is at all — see mockProfileData.js header comment for why
 *     these are kept separate from bookingStatus).
 *
 * 7 tabs rarely fit one row in a phone-width or 560px-drawer-width
 * container, so the row scrolls — and left/right arrow buttons appear
 * only when there's actually somewhere to scroll to (checked against real
 * scrollWidth/clientWidth, not guessed from tab count), so a wide desktop
 * viewport that fits every tab doesn't grow dead chrome.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const BOOKING_TABS = ["all", "upcoming", "completed", "cancelled", "reservation", "enquiry", "drafted"];

const STATUS_TABS = new Set(["upcoming", "completed", "cancelled"]);
const TYPE_TAB_MAP = { reservation: "reservation", enquiry: "enquiry", drafted: "draft" };

export function filterBookingsByTab(bookings, tab) {
  if (!tab || tab === "all") return bookings;
  if (STATUS_TABS.has(tab)) return bookings.filter((b) => b.bookingStatus === tab);
  const type = TYPE_TAB_MAP[tab];
  return bookings.filter((b) => b.bookingType === type);
}

export default function BookingTabs({ active, onChange, t, compact = false }) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (dir) => scrollerRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  const arrowSize = compact ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className="flex items-center gap-1">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll tabs left"
          className={`shrink-0 ${arrowSize} rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
        >
          <ChevronLeft size={compact ? 12 : 14} />
        </button>
      )}

      <div
        ref={scrollerRef}
        className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth ${compact ? "pb-1" : "pb-1.5"}`}
        role="tablist"
      >
        {BOOKING_TABS.map((tab) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={`shrink-0 rounded-full font-semibold transition-colors whitespace-nowrap ${
                compact ? "px-2.5 py-1 text-[10.5px]" : "px-3 py-1.5 text-[11.5px]"
              } ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll tabs right"
          className={`shrink-0 ${arrowSize} rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
        >
          <ChevronRight size={compact ? 12 : 14} />
        </button>
      )}
    </div>
  );
}
