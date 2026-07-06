"use client";

/**
 * Compare Page — premium, editorial property-comparison experience.
 *
 * Rebuilt from scratch per design brief: the previous version was a
 * single spreadsheet-style <table> — nothing from it is reused here,
 * it only informed which data points needed to be covered. Layout order:
 *   Hero → Category Selector → Sticky Compare Bar → Quick Compare Summary →
 *   Comparison Cards → Detailed Comparison Sections (Venue | Farmstay) →
 *   Recommendation
 *
 * Wired to the real backend (UserCompare / removeCompareAPI / wishlist)
 * via useCompareList — see that hook for the documented assumptions
 * about the (currently unverified) API response shape.
 *
 * Category handling: this page reads the SAME global CategoryContext used
 * across every listing page (useCategory) and reuses the site's universal
 * CategoryNavigator (the floating pill/FAB in the global nav) to switch
 * categories — no bespoke switcher lives on this page. Its z-index was
 * bumped (z-30 -> z-40 in CategoryNavigator.jsx) so it always renders above
 * this page's own sticky comparison bar instead of colliding/blurring with
 * it. Properties are always filtered to a single category — mixed-category
 * comparisons are never rendered.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_ORDER } from "@/config/categoryConfig";
import { useCompareList } from "./hooks/useCompareList";
import { detectExperience } from "./data/compareSchema";

import EmptyState from "./components/EmptyState";
import CompareHero from "./components/CompareHero";
import CategorySwitchNotice from "./components/CategorySwitchNotice";
import StickyCompareBar from "./components/StickyCompareBar";
import QuickCompareSummary from "./components/QuickCompareSummary";
import ComparisonCards from "./components/ComparisonCards";
import VenueComparisonExperience from "./components/VenueComparisonExperience";
import FarmstayComparisonExperience from "./components/FarmstayComparisonExperience";
import StudioComparisonExperience from "./components/StudioComparisonExperience";
import WorkspaceComparisonExperience from "./components/WorkspaceComparisonExperience";
import RentalComparisonExperience from "./components/RentalComparisonExperience";

// One comparison experience per category — never shared sections/wording.
const EXPERIENCE_COMPONENTS = {
  farmstay: FarmstayComparisonExperience,
  studio: StudioComparisonExperience,
  workspace: WorkspaceComparisonExperience,
  rental: RentalComparisonExperience,
  venue: VenueComparisonExperience,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function PageSkeleton() {
  return (
    // pt-16 / md:pt-[72px] mirrors the fixed Navbar's real height (h-[64px] / md:h-[72px], z-50)
    // so skeleton content never renders underneath it either.
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800/70 rounded-full mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-gray-100 dark:bg-gray-800/70" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { locale, country } = useParams();
  const { properties, loading, add, remove, toggleWishlist, wishlistIds } = useCompareList();
  const { activeCategory, setActiveCategory } = useCategory();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedShift, setSelectedShift] = useState("day");

  // Tracks an explicit category choice made anywhere on the site (the
  // universal category switcher in the global nav), separate from the
  // "jump to whichever category has items" fallback below. Needed so
  // picking an empty category is always honored here (shows that
  // category's own empty state) instead of being silently overridden —
  // that fallback should only ever apply on first load.
  const [manualCategory, setManualCategory] = useState(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setManualCategory(activeCategory);
  }, [activeCategory]);

  // How many saved-for-compare properties exist per category. Independent
  // comparison workspaces: switching categories only changes what's
  // *displayed* — every category's saved items live untouched in
  // `properties` the whole time, so nothing is ever lost or reset.
  const categoryCounts = useMemo(() => {
    const counts = {};
    properties.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [properties]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((id) => (categoryCounts[id] || 0) > 0),
    [categoryCounts]
  );

  // Never silently mix categories: if the site-wide active category has
  // nothing saved for compare (and the user hasn't explicitly chosen it
  // here), fall back to whichever category the user actually has
  // properties in. An explicit in-page choice (manualCategory) always wins.
  const focusedCategory = manualCategory
    ?? ((categoryCounts[activeCategory] || 0) > 0 ? activeCategory : (availableCategories[0] || activeCategory));

  const handleCategorySwitch = (id) => { setActiveCategory(id); setManualCategory(id); };

  const displayedProperties = useMemo(
    () => properties.filter((p) => p.category === focusedCategory),
    [properties, focusedCategory]
  );

  const experience = detectExperience(focusedCategory);
  const ExperienceComponent = EXPERIENCE_COMPONENTS[experience] || VenueComparisonExperience;

  if (loading) return <PageSkeleton />;

  // Nothing saved anywhere — the real empty state.
  if (properties.length === 0) {
    return (
      <div className="pt-16 md:pt-[72px] min-h-screen bg-white dark:bg-gray-950">
        <EmptyState locale={locale} country={country} />
      </div>
    );
  }

  return (
    // pt-16 / md:pt-[72px]: exact match for the fixed Navbar height so the
    // hero title is never hidden underneath it (same convention as
    // search/[type]/page.jsx).
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white dark:bg-gray-950 pb-20">
      {/* Category switching now happens through the site's universal
          category switcher in the global nav (CategoryNavigator) — no
          bespoke switcher on this page. */}
      <CompareHero count={displayedProperties.length} />

      {/* Per spec: never show an empty/short comparison table — a category
          with 0 or 1 saved items gets a dedicated notice instead. */}
      {displayedProperties.length < 2 ? (
        <CategorySwitchNotice
          category={focusedCategory}
          count={displayedProperties.length}
          otherCategories={availableCategories.filter((id) => id !== focusedCategory)}
          onSwitch={handleCategorySwitch}
          onAdd={add}
          excludeIds={new Set(displayedProperties.map((p) => p.childVenueId))}
          locale={locale}
          country={country}
        />
      ) : (
        <>
          <StickyCompareBar
            properties={displayedProperties}
            onRemove={remove}
            experience={experience}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
          />

          <QuickCompareSummary properties={displayedProperties} experience={experience} />

          <ComparisonCards
            properties={displayedProperties}
            onRemove={remove}
            onWishlistToggle={toggleWishlist}
            wishlistIds={wishlistIds}
            onAdd={add}
            category={focusedCategory}
            country={country}
          />

          <ExperienceComponent
            properties={displayedProperties}
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            locale={locale}
            country={country}
          />
        </>
      )}
    </div>
  );
}
