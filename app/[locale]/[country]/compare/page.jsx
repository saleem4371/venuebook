"use client";

/**
 * Compare Page — premium, editorial property-comparison experience.
 *
 * Rebuilt from scratch per design brief: the previous version was a
 * single spreadsheet-style <table> — nothing from it is reused here,
 * it only informed which data points needed to be covered. Layout order:
 *   Hero → Sticky Compare Bar (mini cards + Add slots) → Detailed
 *   Comparison Sections (Venue | Farmstay | ...) → Recommendation
 *
 * There is deliberately no separate full-photo card grid between the
 * summary and the detail sections — the sticky bar's mini cards already
 * carry photo/name/type/location/rating and stay pinned + column-aligned
 * with everything below, so a second, larger card grid repeating the same
 * info added nothing but scroll length.
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
import { MAX_COMPARE_PROPERTIES, getCategoryAccentVars } from "./utils/compareHelpers";

import CompareHero from "./components/CompareHero";
import CategorySwitchNotice from "./components/CategorySwitchNotice";
import StickyCompareBar from "./components/StickyCompareBar";
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

/* Mirrors MiniPropertyCard's exact footprint (StickyCompareBar.jsx) so the
   skeleton settles into the same slot the real mini card will occupy,
   instead of guessing at an unrelated height. */
function SkeletonMiniCard() {
  return (
    <div className="flex-shrink-0 w-[212px] lg:w-full h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800" />
  );
}

/**
 * Loading placeholder — deliberately built from the SAME wrapper classes
 * and breakpoints as CompareHero / StickyCompareBar (max-w-[1400px]
 * mx-auto px-4 lg:px-8, the flex→lg:grid-cols-4 mini-card row) so real
 * content never reflows/jumps the instant it mounts.
 */
function PageSkeleton() {
  return (
    // pt-16 / md:pt-[72px] mirrors the fixed Navbar's real height (h-[64px] / md:h-[72px], z-50)
    // so skeleton content never renders underneath it either.
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white dark:bg-gray-950 animate-pulse">
      {/* Hero skeleton — same wrapper AND stacked layout as CompareHero
          (title, subtitle, badge all in one left-aligned column — not
          top-right, which is where the fixed universal category switcher
          floats). */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-8 pb-8">
        <div className="h-8 w-64 rounded-full bg-gray-200 dark:bg-gray-800 mb-3" />
        <div className="h-4 w-96 max-w-full rounded-full bg-gray-100 dark:bg-gray-800/70" />
        <div className="h-9 w-40 rounded-full bg-gray-100 dark:bg-gray-800/70 mt-4" />
      </div>

      {/* Sticky mini-card row skeleton — same breakpoints as StickyCompareBar */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
        <div className="flex lg:grid lg:grid-cols-4 gap-2 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMiniCard key={i} />
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
  const [selectedEventType, setSelectedEventType] = useState(null);

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


     
  // categoryProperties: EVERY saved item in the focused category, uncapped —
  // used for exclusion checks (so a hidden overflow item never looks
  // "not yet added" in the Add modal). displayedProperties: the actual
  // working set actually rendered/compared, hard-capped at
  // MAX_COMPARE_PROPERTIES (4) — comparing more than 4 side by side stops
  // being useful/legible, and previously nothing enforced this at all, so
  // repeated adds (e.g. via AddVenueModal) could silently balloon a
  // category's grid to 11+ cards.
  const categoryProperties = useMemo(
    () => properties.filter((p) => p.category === focusedCategory),
    [properties, focusedCategory]
  );
  const displayedProperties = useMemo(
    () => categoryProperties.slice(0, MAX_COMPARE_PROPERTIES),
    [categoryProperties]
  );

  console.log("Data Loading....")
  console.log(focusedCategory)

  const experience = detectExperience(focusedCategory);
  const ExperienceComponent = EXPERIENCE_COMPONENTS[experience] || VenueComparisonExperience;

  if (loading) return <PageSkeleton />;

  // Previously "nothing saved anywhere" (properties.length === 0) rendered a
  // completely different component (EmptyState.jsx — its own illustration,
  // generic "Explore Properties" copy, violet button) from "this ONE
  // category has nothing yet" (CategorySwitchNotice — grey box, category
  // name/color). Same real-world situation from the user's point of view
  // ("nothing to compare in Farmstays"), two unrelated-looking screens. Both
  // now always go through CategorySwitchNotice below — it already handles
  // 0 vs 1 saved items, shows the category's own name/brand color, and (via
  // FloatingDecorCards) the same illustrative background cards EmptyState
  // used to have exclusively.

  return (
    // pt-16 / md:pt-[72px]: exact match for the fixed Navbar height so the
    // hero title is never hidden underneath it (same convention as
    // search/[type]/page.jsx).
    <div
      className="pt-16 md:pt-[72px] min-h-screen bg-white dark:bg-gray-950 pb-20"
      style={getCategoryAccentVars(focusedCategory)}
    >
      {/* Category switching now happens through the site's universal
          category switcher in the global nav (CategoryNavigator) — no
          bespoke switcher on this page. The hero (title/subtitle/"Comparing
          N Properties" badge) only renders once there's an actual
          comparison to show — matching how the original true-empty state
          (EmptyState.jsx) never showed it either. Showing "Compare
          Farmstays" + a badge above CategorySwitchNotice's own "No
          Farmstays added yet" messaging read as two competing headlines
          stacked on top of each other. */}
      {displayedProperties.length >= 2 && (
        <CompareHero count={displayedProperties.length} category={focusedCategory} />
      )}

      {/* Per spec: never show an empty/short comparison table — a category
          with 0 or 1 saved items gets a dedicated notice instead. */}
      {displayedProperties.length < 2 ? (
        <CategorySwitchNotice
          category={focusedCategory}
          count={displayedProperties.length}
          properties={displayedProperties}
          onAdd={add}
          onRemove={remove}
          excludeIds={new Set(categoryProperties.map((p) => p.childVenueId))}
          remainingSlots={MAX_COMPARE_PROPERTIES - categoryProperties.length}
          locale={locale}
          country={country}
        />
      ) : (
        <>
          <StickyCompareBar
            properties={displayedProperties}
            onRemove={remove}
            onWishlistToggle={toggleWishlist}
            wishlistIds={wishlistIds}
            experience={experience}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            selectedEventType={selectedEventType}
            setSelectedEventType={setSelectedEventType}
            onAdd={add}
            category={focusedCategory}
            country={country}
            excludeIds={new Set(categoryProperties.map((p) => p.childVenueId))}
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
