"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Landmark, ArrowRight, Sparkles, LayoutGrid, List } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import VenueCard from "./components/VenueCard";
import ListingsTable from "./components/ListingsTable";
import CategorySelectModal from "./components/CategorySelectModal";
import { usePropertyTypeModal } from "@/context/PropertyTypeModalContext";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import EditorLoadingOverlay from "@/app/[locale]/[country]/vendor/components/EditorLoadingOverlay";

import { LoadListing } from "@/services/vendor.service";

import { useCategory } from "@/context/CategoryContext";

import { listing_sub_check } from "@/services/listing.service";
import { prefetchParent } from "@/services/parent.service";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY META
───────────────────────────────────────────────────────────────────────────── */
const CATEGORY_META = {
  venues: {
    pageTitle: "Venue Listings",
    subtitle: "Manage, update and publish your venue properties.",
    accent: "from-violet-600 to-indigo-500",
    glow: "rgba(139,92,246,0.18)",
  },
  farmstays: {
    pageTitle: "Farmstay Listings",
    subtitle: "Manage your farmstay properties and availability.",
    accent: "from-emerald-600 to-teal-500",
    glow: "rgba(16,185,129,0.18)",
  },
  studios: {
    pageTitle: "Studio Listings",
    subtitle: "Manage your creative studios and booking slots.",
    accent: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.18)",
  },
  rentals: {
    pageTitle: "Rental Listings",
    subtitle: "Manage your rental properties and pricing.",
    accent: "from-blue-600 to-cyan-500",
    glow: "rgba(59,130,246,0.18)",
  },
  workspaces: {
    pageTitle: "Workspace Listings",
    subtitle: "Manage your coworking spaces and meeting rooms.",
    accent: "from-cyan-600 to-sky-500",
    glow: "rgba(6,182,212,0.18)",
  },
  experiences: {
    pageTitle: "Experience Listings",
    subtitle: "Manage your curated experiences and events.",
    accent: "from-rose-600 to-pink-500",
    glow: "rgba(244,63,94,0.18)",
  },
};

/* Hex accents for PropertyTypeModal (mirrors Tailwind classes above) */
const CATEGORY_ACCENT_HEX = {
  venues:      { from: "#7c3aed", to: "#6366f1" },
  farmstays:   { from: "#059669", to: "#14b8a6" },
  studios:     { from: "#f59e0b", to: "#f97316" },
  rentals:     { from: "#2563eb", to: "#06b6d4" },
  workspaces:  { from: "#0891b2", to: "#0ea5e9" },
  experiences: { from: "#e11d48", to: "#ec4899" },
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA (replace with API)
───────────────────────────────────────────────────────────────────────────── */
const MOCK_LISTINGS = {
  venues: [
    {
      id: 1,
      name: "The Zenith of Coastal Elegance",
      parentName: "SYFTE Venues",
      address:
        "VVG5+976, Mallikatte, Bendoor, Mangaluru, Karnataka 575002, India",
      status: "ACTIVE",
      guests: 2000,
      leads: 40,
      image:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    },
    {
      id: 2,
      name: "The Azure Pavilion",
      parentName: "SYFTE Venues",
      address:
        "VVG5+976, Mallikatte, Bendoor, Mangaluru, Karnataka 575002, India",
      status: "ACTIVE",
      guests: 200,
      leads: 5,
      image:
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    },
    {
      id: 3,
      name: "Heritage Manor Estate",
      parentName: "SYFTE Venues",
      address: "Civil Lines, Jaipur, Rajasthan 302006, India",
      status: "INACTIVE",
      guests: 1000,
      leads: 0,
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    },
  ],
  farmstays: [
    {
      id: 10,
      name: "Green Valley Organic Farmstay",
      parentName: "SYFTE Retreats",
      address: "Coorg Hill Estates, Madikeri, Karnataka 571201, India",
      status: "ACTIVE",
      guests: 30,
      leads: 12,
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    },
    {
      id: 11,
      name: "Sunrise Mountain Farm",
      parentName: "SYFTE Retreats",
      address: "Nilgiri Hills, Ooty, Tamil Nadu 643001, India",
      status: "ACTIVE",
      guests: 20,
      leads: 7,
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    },
  ],
  studios: [
    {
      id: 20,
      name: "Creative Loft Studio",
      parentName: "SYFTE Studios",
      address: "Indiranagar, Bangalore, Karnataka 560038, India",
      status: "ACTIVE",
      guests: 20,
      leads: 15,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function ListingPage() {
  const { activeCategory, vendorCategories } = useVendorCategory();
  const [parentLoading, setParentLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [loadData, setLoadData] = useState([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"


  const router = useRouter();
  const { locale, country } = useParams();

  const meta = CATEGORY_META[activeCategory] ?? CATEGORY_META.venues;
  const listings = MOCK_LISTINGS[activeCategory] ?? [];

  const parentPath = `/${locale}/${country}/vendor/listing/parent_details`;
  const startPath = (cat) => `/${locale}/${country}/start-listing/${cat}?category=${activeCategory}`; //activeCategory

  /* Simulate initial data load — replace with real fetch */
  useEffect(() => {
    setPageLoading(true);
    const t = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(t);
  }, [activeCategory]);

  useEffect(() => {
    router.prefetch(parentPath);
  }, []);

  const { openPropertyModal } = usePropertyTypeModal();
  const accent = CATEGORY_ACCENT_HEX[activeCategory] ?? CATEGORY_ACCENT_HEX.venues;

  /* Kick off the parent-details data fetch as early as possible — on
     hover/focus, before the tap even happens — so by the time the route
     actually changes the request is already in flight (or resolved).
     consumeParentPrefetch() on the destination page picks this up instead
     of starting a fresh, sequential fetch after mount. */
  const warmParentPrefetch = () => prefetchParent(activeCategory);

  const openParent = () => {
    warmParentPrefetch();
    setParentLoading(true);
    /* Short delay just long enough for the overlay's fade-in to be
       perceptible before the route swap — not an artificial wait for
       data (that's already running in parallel via the prefetch above). */
    setTimeout(() => router.push(`${parentPath}?cat=${activeCategory}`), 60);
  };

  // Step 1: open category picker
  const handleCreateListing = () => {
    setCatModalOpen(true);
  };

  // Step 2: category chosen → check if listings exist, then maybe show PropertyTypeModal
  const handleCategorySelected = async (selectedCat) => {
    setCatModalOpen(false);

    const catAccent = CATEGORY_ACCENT_HEX[selectedCat] ?? CATEGORY_ACCENT_HEX.venues;

    // Check if this category already has listings
    let hasExisting = false;
    if (selectedCat === activeCategory) {
      hasExisting = loadData.length > 0;
    } else {
      try {
        const res = await LoadListing(selectedCat);
        hasExisting = (res?.data ?? []).length > 0;
      } catch (_) {}
    }

    if (hasExisting) {
      // Skip property-type modal — structure already established
      router.push(`/${locale}/${country}/start-listing/${selectedCat}?category=${selectedCat}`);
    } else {
      // New category: let vendor pick Standalone vs Multi-space
      openPropertyModal({
        accentFrom: catAccent.from,
        accentTo:   catAccent.to,
        category:   selectedCat,
        onContinue: (type) => {
          if (type === "single") {
            router.push(`/${locale}/${country}/start-listing/${selectedCat}?category=${selectedCat}`);
          } else {
            router.push(`/${locale}/${country}/start-listing/${selectedCat}/parent-setup`);
          }
        },
      });
    }
  };
  
useEffect(() => {
  load();
}, [activeCategory]);

const load = async () => {
  
  try {
    setPageLoading(true);

    const res = await LoadListing(activeCategory);

    setLoadData(res?.data || []);

    const bills = await listing_sub_check(activeCategory);

if(bills.data.length ==0)
{
  const category = activeCategory?.replace(/s$/, "");
router.push(`/${locale}/${country}/start-listing/${category}/payment`);
}
    
 

  } catch (err) {
    console.error(err);
  } finally {
    setPageLoading(false);
  }
};



  return (
    <div className="space-y-6">
      {/* ── PARENT VENUE SECTION ── plain row, not a card: no bg/border/
          shadow box, just an icon + copy + text-link CTA sitting flush
          on the page, separated from what's below by a hairline. ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-white/[0.07]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center shrink-0`}
          >
            <Landmark size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
              Parent Venue Details
            </p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-1">
              Manage main venue info, amenities, and brand settings.
            </p>
          </div>
        </div>

        <button
          onClick={openParent}
          onMouseEnter={warmParentPrefetch}
          onFocus={warmParentPrefetch}
          className="
            shrink-0 flex items-center gap-1
            text-[13px] font-semibold
            text-gray-700 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
            transition-colors cursor-pointer
          "
        >
          View Details <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* ── SECTION HEADER ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.h2
              key={activeCategory + "-title"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.16 }}
              className="text-[22px] font-bold text-gray-900 dark:text-white leading-tight"
            >
              {meta.pageTitle}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeCategory + "-sub"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, delay: 0.05 }}
              className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5"
            >
              {meta.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Grid / table view toggle — single button, icon shows the
              view you'll switch TO (not the current one). */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === "grid" ? "table" : "grid"))}
            aria-label={viewMode === "grid" ? "Switch to table view" : "Switch to grid view"}
            className="
              flex items-center justify-center h-10 w-10 rounded-xl shrink-0
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-white/[0.08]
              shadow-[0_1px_3px_rgba(0,0,0,0.04)]
              text-gray-500 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              hover:border-gray-300 dark:hover:border-white/[0.14]
              hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]
              active:scale-[0.95]
              transition-all duration-150 cursor-pointer
            "
          >
            {viewMode === "grid" ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>

          <button
            onClick={handleCreateListing}
            className={`
              shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-xl
              text-[12px] font-semibold text-white
              bg-gradient-to-r ${meta.accent}
              hover:opacity-90
              shadow-[0_1px_8px_rgba(139,92,246,0.28)]
              hover:shadow-[0_4px_14px_rgba(139,92,246,0.40)]
              active:scale-[0.97] transition-all duration-200 cursor-pointer
            `}
          >
            <Plus size={13} />
            New Listing
          </button>
        </div>
      </div>


      {/* ── LISTINGS — grid or table ── */}
      <AnimatePresence mode="wait">
        {pageLoading ? (
          /* Skeleton shimmer grid */
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          >
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : listings.length > 0 ? (
          viewMode === "table" ? (
            <motion.div
              key={activeCategory + "-table"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <ListingsTable listings={loadData} />
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory + "-grid"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
              {loadData.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.24 }}
                  className="flex"
                >
                  <VenueCard venue={listing} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          <motion.div
            key={activeCategory + "-empty"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyState
              meta={meta}
              activeCategory={activeCategory}
              onCreateListing={handleCreateListing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CATEGORY SELECT MODAL (Step 1 of New Listing flow) ── */}
      <CategorySelectModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onSelect={handleCategorySelected}
        availableCategories={vendorCategories ?? [activeCategory]}
        defaultCategory={activeCategory}
      />

      {/* ── GLOBAL PARENT LOADER ──
          Shared EditorLoadingOverlay (same component listing→editor uses)
          so this reads as the SAME overlay that parent_details/page.jsx
          shows right after — no handoff between two different loaders. */}
      <EditorLoadingOverlay show={parentLoading} title="Opening Parent Details" subtitle="Please wait…" />

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  /* Matches VenueCard's current shape: one aspect-[4/3] image block, no
     separate white footer underneath (that was the old two-section
     layout) — so the skeleton mirrors the real card's silhouette instead
     of the design it used to have. */
  return (
    <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
      {/* Faint placeholders for where the name / address / stat pills
          will sit, so the skeleton reads as "card loading", not just a
          blank rectangle. */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 space-y-2.5">
        <div className="h-4 w-2/3 rounded-full bg-gray-300/70 dark:bg-gray-600/50 animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-gray-300/50 dark:bg-gray-600/40 animate-pulse" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-20 rounded-lg bg-gray-300/50 dark:bg-gray-600/40 animate-pulse" />
          <div className="h-6 w-20 rounded-lg bg-gray-300/50 dark:bg-gray-600/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────────────────── */
function EmptyState({ meta, activeCategory, onCreateListing }) {
  const label =
    CATEGORY_META[activeCategory]?.pageTitle?.replace(" Listings", "") ??
    "listings";
  return (
    <div
      className="
      flex flex-col items-center justify-center py-24 px-6
      rounded-2xl
      bg-white dark:bg-gray-900
      border border-dashed border-gray-200 dark:border-white/[0.08]
    "
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.accent} flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(139,92,246,0.28)]`}
      >
        <Sparkles size={26} className="text-white" />
      </div>
      <h3 className="text-[17px] font-bold text-gray-800 dark:text-white mb-2">
        No {label.toLowerCase()} yet
      </h3>
      <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-8 text-center max-w-xs leading-relaxed">
        Create your first {label.toLowerCase()} to start attracting bookings and
        growing your revenue.
      </p>
      <button
        onClick={onCreateListing}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl
          text-[13px] font-semibold text-white
          bg-gradient-to-r ${meta.accent}
          shadow-[0_2px_14px_rgba(139,92,246,0.32)]
          hover:shadow-[0_4px_20px_rgba(139,92,246,0.46)]
          hover:opacity-90 active:scale-[0.97]
          transition-all duration-200 cursor-pointer
        `}
      >
        <Plus size={14} />
        Create First Listing
      </button>
    </div>
  );
}
