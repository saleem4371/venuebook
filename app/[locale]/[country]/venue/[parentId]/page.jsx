"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import EstateHero from "./components/EstateHero";
import EstateStats from "./components/EstateStats";
import CategoryCards from "./components/CategoryCards";
import AboutEstate from "./components/AboutEstate";
import EstateSocialLinks from "./components/EstateSocialLinks";
import CategoryBlock from "./components/CategoryBlock";
import CategoryVideos from "./components/CategoryVideos";
import EstateLocation from "./components/EstateLocation";
import EstateOperatingHours from "./components/EstateOperatingHours";

import {
  getEstateData,
  getActiveCategoryKeys,
  computeCategoryStats,
} from "./data/estateData";
import { CATEGORY_LABELS, getCategoryTheme, normalizeEstateCategory } from "./utils/estateTheme";

export default function EstatePublicPage() {
  const { parentId } = useParams();
  const searchParams = useSearchParams();

  const estate = useMemo(() => getEstateData(parentId), [parentId]);
  // Estate page currently only supports Venues and Farmstays — Studios
  // and Workspace are intentionally excluded here (Studios has real
  // listings elsewhere in the app, just not surfaced on this page yet).
  const activeCategoryKeys = useMemo(
    () => getActiveCategoryKeys(estate).filter((k) => k === "venues" || k === "farmstays"),
    [estate]
  );

  // ── DYNAMIC CATEGORY ORDER ──────────────────────────────────────────────
  // The category the visitor arrived FROM (?from=venues|farmstays|studios|
  // workspaces) is selected by default — every linking surface (property
  // card, property profile "Part of" block) appends this query param when
  // it points here.
  const originCategory = normalizeEstateCategory(searchParams.get("from"), activeCategoryKeys);
  const [activeCat, setActiveCat] = useState(originCategory);

  // Everything below the switcher is driven by this one piece of state —
  // Hero, Stats, About, Listings, Amenities, Videos, Reels, and Location
  // all key off `activeCat`/`catLabel`/`catTheme`.
  const catLabel = CATEGORY_LABELS[activeCat] ?? activeCat;
  const catTheme = getCategoryTheme(activeCat);
  const stats = useMemo(() => computeCategoryStats(estate, activeCat), [estate, activeCat]);

  // Unified search — category switch + guests/price filter, scoped to this
  // estate's own inventory only.
  const [guests, setGuests] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const activeListings = estate.categories[activeCat]?.listings ?? [];
  const filteredListings = useMemo(() => {
    return activeListings.filter((l) => {
      if (guests > 0 && l.capacity < guests) return false;
      if (maxPrice > 0 && l.priceINR > maxPrice) return false;
      return true;
    });
  }, [activeListings, guests, maxPrice]);

  // Switching categories no longer jump-scrolls anywhere — the switcher
  // sits right below the Hero now, so the user already sees the Hero
  // (and everything else) update in place without losing their scroll
  // position. The Hero's own "View {label}" CTA still scrolls down to
  // the listings for someone who wants to jump straight there.
  const handleSelectCategory = (key) => setActiveCat(key);

  const scrollToListings = () => {
    document.getElementById(`category-${activeCat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-10 pt-16 md:pt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <EstateHero
          estate={estate}
          categoryKey={activeCat}
          catLabel={catLabel}
          onViewListings={scrollToListings}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-10">
        <CategoryCards
          categoryKeys={activeCategoryKeys}
          activeCat={activeCat}
          onSelect={handleSelectCategory}
        />

        <EstateStats stats={stats} theme={catTheme} />

        {/* Reel section temporarily removed — see CategoryReels.jsx, still
            intact and ready to re-enable, just not rendered here for now. */}
        <AboutEstate estate={estate} categoryKey={activeCat} catLabel={catLabel} />

        <EstateSocialLinks estate={estate} />

        <CategoryBlock
          estate={estate}
          categoryKey={activeCat}
          id={`category-${activeCat}`}
          filteredListings={guests > 0 || maxPrice > 0 ? filteredListings : undefined}
        />

        <CategoryVideos cat={estate.categories[activeCat]} categoryKey={activeCat} label={catLabel} />

        <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8 grid sm:grid-cols-3 gap-8 items-start">
          <div className="sm:col-span-2">
            <EstateLocation estate={estate} categoryKey={activeCat} label={catLabel} theme={catTheme} />
          </div>
          <EstateOperatingHours estate={estate} />
        </div>
      </div>
    </div>
  );
}
