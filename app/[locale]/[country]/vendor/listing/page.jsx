"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, ArrowRight, Sparkles } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import VenueCard from "./components/VenueCard";
import { usePropertyTypeModal } from "@/context/PropertyTypeModalContext";
import { useVendorCategory } from "@/context/VendorCategoryContext";

import { LoadListing } from "@/services/vendor.service";

import { useCategory } from "@/context/CategoryContext";

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
  const { activeCategory } = useVendorCategory();
  const [parentLoading, setParentLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [loadData, setLoadData] = useState([]);


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

  const openParent = () => {
    setParentLoading(true);
    setTimeout(() => router.push(parentPath), 180);
  };

  const handleCreateListing = () => {
    openPropertyModal({
      accentFrom: accent.from,
      accentTo:   accent.to,
      category:   activeCategory,
      onContinue: (type) => {
        if (type === "single") {
          router.push(startPath(activeCategory));
        } else {
          router.push(`/${locale}/${country}/start-listing/${activeCategory}/parent-setup`);
        }
      },
    });
  };
  
useEffect(() => {
  load();
}, [activeCategory]);

const load = async () => {
  try {
    setPageLoading(true);

    const res = await LoadListing(activeCategory);

    setLoadData(res?.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setPageLoading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* ── PARENT VENUE CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
          relative overflow-hidden
          flex items-center justify-between gap-4
          px-6 py-5 rounded-2xl
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_1px_8px_rgba(0,0,0,0.05)]
          dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]
        "
      >
        {/* Ambient background glow */}
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${meta.glow}, transparent)`,
          }}
        />

        <div className="flex items-center gap-4 min-w-0 relative z-10">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(139,92,246,0.30)]`}
          >
            <Building2 size={19} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
              Parent Venue Details
            </p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-1">
              Manage main venue info, amenities, and brand settings.
            </p>
          </div>
        </div>

        <button
          onClick={openParent}
          className={`
            relative z-10 shrink-0 flex items-center gap-1.5
            px-5 py-2.5 rounded-xl
            text-[13px] font-semibold text-white
            bg-gradient-to-r ${meta.accent}
            hover:opacity-90
            shadow-[0_2px_10px_rgba(139,92,246,0.28)]
            hover:shadow-[0_4px_18px_rgba(139,92,246,0.40)]
            active:scale-[0.97] transition-all duration-200 cursor-pointer
          `}
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

        <button
          onClick={handleCreateListing}
          className={`
            shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-xl
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

      {/* ── CARDS GRID ── */}
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

      {/* ── GLOBAL PARENT LOADER ── */}
      <AnimatePresence>
        {parentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/80 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative flex flex-col items-center gap-4"
            >
              <div className="relative w-14 h-14">
                <svg className="animate-spin w-14 h-14" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="url(#parentGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="100 52"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="parentGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-[5px] rounded-full bg-white dark:bg-gray-950" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-800 dark:text-white">
                  Loading Parent Details
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Please wait…
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06]">
      {/* Image shimmer */}
      <div className="aspect-[16/10] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
      {/* Body shimmer */}
      <div className="px-5 pt-4 pb-5 space-y-3">
        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
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
