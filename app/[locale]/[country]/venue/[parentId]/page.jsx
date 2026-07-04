"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import Breadcrumb from "../../components/Breadcrumb";
import EstateHero from "./components/EstateHero";
import EstateUnifiedSearch from "./components/EstateUnifiedSearch";
import EstateStats from "./components/EstateStats";
import CategoryCards from "./components/CategoryCards";
import AboutEstate from "./components/AboutEstate";
import CategoryBlock from "./components/CategoryBlock";
import CrossCategoryDiscovery from "./components/CrossCategoryDiscovery";
import EstateSharedSections from "./components/EstateSharedSections";
import EstateLocation from "./components/EstateLocation";
import EstateReviews from "./components/EstateReviews";
import StickyCTA from "./components/StickyCTA";

import {
  getEstateData,
  getAvailableCategoryKeys,
  getActiveCategoryKeys,
  computeEstateStats,
} from "./data/estateData";
import { normalizeEstateCategory, CATEGORY_LABELS } from "./utils/estateTheme";

export default function EstatePublicPage() {
  const { locale, country, parentId } = useParams();
  const searchParams = useSearchParams();

  const estate = useMemo(() => getEstateData(parentId), [parentId]);
  const availableCategoryKeys = useMemo(() => getAvailableCategoryKeys(estate), [estate]);
  const activeCategoryKeys = useMemo(() => getActiveCategoryKeys(estate), [estate]);
  const stats = useMemo(() => computeEstateStats(estate), [estate]);

  // ── DYNAMIC CATEGORY ORDER ──────────────────────────────────────────────
  // The category the visitor arrived FROM (?from=venues|farmstays|studios|
  // workspaces) always renders first, immediately after Hero/About — every
  // linking surface (property card, property profile "Part of" block,
  // breadcrumb) appends this query param when it points here.
  const originCategory = normalizeEstateCategory(searchParams.get("from"), activeCategoryKeys);
  const [activeCat, setActiveCat] = useState(originCategory);

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

  const handleSelectCategory = (key) => {
    setActiveCat(key);
    requestAnimationFrame(() => {
      document.getElementById(`category-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToActiveBlock = () => {
    document.getElementById(`category-${activeCat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-24 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <Breadcrumb
          items={[
            { label: "Home", href: `/${locale || "en"}/${country || "in"}/home` },
            { label: CATEGORY_LABELS[originCategory] ?? "Venues", href: `/${locale || "en"}/${country || "in"}/search/${originCategory}` },
            { label: estate.name },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3">
        <EstateHero
          estate={estate}
          availableCategoryKeys={availableCategoryKeys}
          onViewListings={scrollToActiveBlock}
          onWatchReel={() => {}}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-10">
        <EstateUnifiedSearch
          categoryKeys={activeCategoryKeys}
          activeCat={activeCat}
          onCategoryChange={handleSelectCategory}
          guests={guests}
          onGuestsChange={setGuests}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <EstateStats stats={stats} />

        <AboutEstate estate={estate} />

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Categories Available</h2>
          <CategoryCards
            estate={estate}
            categoryKeys={availableCategoryKeys}
            activeCat={activeCat}
            onSelect={handleSelectCategory}
          />
        </div>

        {/* ── Originating category always first ── */}
        <CategoryBlock
          estate={estate}
          categoryKey={activeCat}
          id={`category-${activeCat}`}
          filteredListings={guests > 0 || maxPrice > 0 ? filteredListings : undefined}
        />

        <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8">
          <CrossCategoryDiscovery
            estate={estate}
            categoryKeys={availableCategoryKeys}
            activeCat={activeCat}
            onSelect={handleSelectCategory}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8">
          <EstateSharedSections estate={estate} />
        </div>

        <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8">
          <EstateLocation estate={estate} />
        </div>

        <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8">
          <EstateReviews estate={estate} categoryKeys={activeCategoryKeys} />
        </div>

        {estate.faqs?.length > 0 && (
          <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">FAQs</h2>
            <div className="space-y-3">
              {estate.faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-gray-100 dark:border-white/[0.08] p-4">
                  <summary className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer list-none">
                    {f.q}
                  </summary>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {(estate.contact || estate.social) && (
          <div className="border-t border-gray-100 dark:border-white/[0.08] pt-8 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {estate.contact?.estateOffice && <ContactRow label="Estate Office" value={estate.contact.estateOffice} />}
              {estate.contact?.salesOffice && <ContactRow label="Sales Office" value={estate.contact.salesOffice} />}
              {estate.contact?.reservation && <ContactRow label="Reservation" value={estate.contact.reservation} />}
              {estate.contact?.weddingDesk && <ContactRow label="Wedding Desk" value={estate.contact.weddingDesk} />}
              {estate.contact?.farmstayDesk && <ContactRow label="Farmstay Desk" value={estate.contact.farmstayDesk} />}
              {estate.contact?.emergency && <ContactRow label="Emergency" value={estate.contact.emergency} urgent />}
            </div>
          </div>
        )}
      </div>

      <StickyCTA estate={estate} onViewAvailability={scrollToActiveBlock} />
    </div>
  );
}

function ContactRow({ label, value, urgent }) {
  return (
    <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${urgent ? "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20" : "border-gray-100 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.04]"}`}>
      <span className={`font-medium ${urgent ? "text-rose-700 dark:text-rose-300" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
      <a href={`tel:${value}`} className={`font-semibold ${urgent ? "text-rose-700 dark:text-rose-300" : "text-gray-900 dark:text-white"}`}>{value}</a>
    </div>
  );
}
