"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  BedDouble,
  Camera,
  Briefcase,
  Clock,
  Ruler,
  Star,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { useCategory } from "@/context/CategoryContext";

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE CONFIG
   Colors per spec: Venue=Purple, Farmstay=Green, Studio=Blue,
   Rental=Orange, Workspace=Indigo, Experiences=Pink
   ═══════════════════════════════════════════════════════════════════════════ */
const BADGE_CONFIG = {
  venues: {
    label: "Venue",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-700/50",
  },
  farmstays: {
    label: "Farmstay",
    bg: "bg-green-50 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-700/50",
  },
  studios: {
    label: "Studio",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-700/50",
  },
  rentals: {
    label: "Rental",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-700/50",
  },
  workspaces: {
    label: "Workspace",
    bg: "bg-indigo-50 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-700/50",
  },
  experiences: {
    label: "Experience",
    bg: "bg-pink-50 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-700/50",
  },
};

/* Price unit suffix per category */
const PRICE_SUFFIX = {
  venues: "Starting Price",
  farmstays: "/ Night",
  studios: "/ Hour",
  rentals: "/ Day",
  workspaces: "/ Day",
  experiences: "/ Person",
};

/* ── Format price in INR (stores INR, displays INR per project rules) ──── */
function formatINR(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY BADGE
   Premium, subtle, compact — sits at the top of the card content
   ═══════════════════════════════════════════════════════════════════════════ */
function CategoryBadge({ category }) {
  const cfg = BADGE_CONFIG[category];
  if (!cfg) return null;
  return (
    <span
      className={`
        inline-flex items-center self-start px-2.5 py-[3px]
        rounded-full border text-[9px] font-bold tracking-widest uppercase
        ${cfg.bg} ${cfg.text} ${cfg.border}
      `}
    >
      {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   METADATA ROW
   Compact single-line info row with icon + label.
   Returns null if label is falsy → no gap, no broken layout.
   ═══════════════════════════════════════════════════════════════════════════ */
function MetaRow({ icon, label }) {
  if (!label && label !== 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
      <span className="flex-shrink-0 opacity-70">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY-SPECIFIC METADATA
   Renders exactly the right fields for each category.
   All fields are optional — missing fields are silently hidden.
   ═══════════════════════════════════════════════════════════════════════════ */
function CategoryMeta({ venue, category }) {
  switch (category) {
    /* ── VENUE ─────────────────────────────────────────────────────────── */
    case "venues": {
      const capacity =
        venue.maxGuests || venue.capacity || venue.guestCapacity || venue.maxCapacity;
      const type =
        venue.venueType || venue.subcategory || venue.propertyType || venue.property_type;
      return (
        <>
          <MetaRow
            icon={<Users size={11} />}
            label={capacity ? `Up to ${capacity} Guests` : null}
          />
          <MetaRow
            icon={<Briefcase size={11} />}
            label={type}
          />
        </>
      );
    }

    /* ── FARMSTAY ───────────────────────────────────────────────────────── */
    case "farmstays": {
      const beds =
        venue.bedrooms || venue.bedroom_count || venue.noOfBedrooms;
      const capacity =
        venue.maxGuests || venue.capacity || venue.guestCapacity;
      return (
        <>
          <MetaRow
            icon={<BedDouble size={11} />}
            label={
              beds
                ? `${beds} Bedroom${Number(beds) !== 1 ? "s" : ""}`
                : null
            }
          />
          <MetaRow
            icon={<Users size={11} />}
            label={capacity ? `${capacity} Guests` : null}
          />
        </>
      );
    }

    /* ── STUDIO ─────────────────────────────────────────────────────────── */
    case "studios": {
      const type =
        venue.studioType ||
        venue.studio_type ||
        venue.subcategory ||
        venue.propertyType;
      const area =
        venue.sizeSqft || venue.size_sqft || venue.area || venue.studioSize;
      return (
        <>
          <MetaRow
            icon={<Camera size={11} />}
            label={type}
          />
          <MetaRow
            icon={<Ruler size={11} />}
            label={
              area
                ? `${Number(area).toLocaleString("en-IN")} Sq Ft`
                : null
            }
          />
        </>
      );
    }

    /* ── RENTAL ─────────────────────────────────────────────────────────── */
    case "rentals": {
      const type =
        venue.rentalType ||
        venue.rental_type ||
        venue.subcategory ||
        venue.propertyType;
      const duration =
        venue.rentalDuration ||
        venue.rental_duration ||
        venue.pricingType ||
        venue.pricing_type;
      return (
        <>
          <MetaRow
            icon={<Briefcase size={11} />}
            label={type}
          />
          <MetaRow
            icon={<Clock size={11} />}
            label={duration}
          />
        </>
      );
    }

    /* ── WORKSPACE ──────────────────────────────────────────────────────── */
    case "workspaces": {
      const seats =
        venue.seatingCapacity ||
        venue.seating_capacity ||
        venue.maxGuests ||
        venue.capacity;
      const type =
        venue.workspaceType ||
        venue.workspace_type ||
        venue.subcategory ||
        venue.propertyType;
      return (
        <>
          <MetaRow
            icon={<Users size={11} />}
            label={seats ? `${seats} Seats` : null}
          />
          <MetaRow
            icon={<Briefcase size={11} />}
            label={type}
          />
        </>
      );
    }

    /* ── EXPERIENCES ────────────────────────────────────────────────────── */
    case "experiences": {
      const duration =
        venue.duration || venue.experience_duration || venue.durationLabel;
      const capacity =
        venue.maxParticipants ||
        venue.max_participants ||
        venue.maxGuests ||
        venue.capacity;
      return (
        <>
          <MetaRow
            icon={<Clock size={11} />}
            label={duration}
          />
          <MetaRow
            icon={<Users size={11} />}
            label={capacity ? `Up to ${capacity} Guests` : null}
          />
        </>
      );
    }

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICE BLOCK — always the last info block before card ends
   ═══════════════════════════════════════════════════════════════════════════ */
function PriceBlock({ venue, category }) {
  const price = venue.minPrice || venue.basePrice || venue.price;
  const suffix = PRICE_SUFFIX[category] || "Starting Price";

  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-[15px] font-bold text-gray-900 dark:text-gray-50">
        {price ? formatINR(price) : "Contact"}
      </span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
        {price ? suffix : "for Price"}
      </span>
    </div>
  );
}

/* =============================================================================
   VENUE CARD
   All existing functionality preserved:
   - Image slider with prev/next + dot pagination
   - Animated wishlist heart (pop animation)
   - Compare button (overlay)
   - Hover lift + map pan
   - Motion animations
   Only the card CONTENT is updated per category.
   ============================================================================= */
const VenueCard = ({
  venue,
  onHover,
  wishlist,
  compares,
  onLeave,
  onCompare,
  onRecentViews,
  onWishlist,
  onRemoveWishlist,
  locale,
  country,
  compareList,
  setCompareList,
  hoverVenue,
  isMapHighlighted = false,
}) => {
  const { activeCategory } = useCategory();

  /* ── STATE ──────────────────────────────────────────────────────────── */
  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);

  /* ── MAP HIGHLIGHT SCROLL ───────────────────────────────────────────── */
  const cardRef = useRef(null);
  useEffect(() => {
    if (isMapHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isMapHighlighted]);
  const [heartPop, setHeartPop] = useState(false);
  const [compareAnim, setCompareAnim] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
  const liked = wishlist?.some((item) => item.venue_id === venue.childVenueId);

  /* ── IMAGES ─────────────────────────────────────────────────────────── */
  const images = useMemo(() => {
    if (!venue?.images?.length) {
      return [
        "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png",
      ];
    }
    return venue.images
      .map((item) => {
        const image = typeof item === "string" ? item : item?.image || item?.url || "";
        if (!image) return null;
        return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
      })
      .filter(Boolean);
  }, [venue?.images, BASE_URL]);

  console.log(images);

  const isActive = hoverVenue?.childVenueId === venue.childVenueId;

  /* ── SLIDER ─────────────────────────────────────────────────────────── */
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((p) => (p + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
  };

  /* ── WISHLIST ───────────────────────────────────────────────────────── */
  const openWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWishlistModal(true);
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !liked;
    try {
      if (nextState) {
        setHeartPop(true);
        onWishlist?.(venue, nextState);
        setTimeout(() => setHeartPop(false), 650);
      } else {
        onRemoveWishlist?.(venue);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  /* ── COMPARE ─────────────────────────────────────────────────────────── */
  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = venue.childVenueId;
    const isAlreadyCompared = compares?.includes(id);
    if (isAlreadyCompared) { onCompare?.(venue, false); return; }
    if ((compares?.length || 0) >= 4) { alert("Only 4 venues allowed"); return; }
    onCompare?.(venue, true);
  };

  const compareIds = useMemo(
    () => new Set(compares?.map((c) => c.venue_id)),
    [compares],
  );
  const isCompared = compareIds.has(venue.childVenueId);

  /* ── PARENT NAME ─────────────────────────────────────────────────────── */
  const parentName =
    venue.parentVenueName ||
    venue.parent_venue_name ||
    venue.parentName ||
    venue.parent_name;

  const parentId =
    venue.parentVenueId ||
    venue.parent_venue_id ||
    venue.parentId ||
    venue.parent_id;

  const showParentSlot =
    activeCategory === "venues" || activeCategory === "farmstays";

  /* ── RATING ──────────────────────────────────────────────────────────── */
  const rating      = venue.rating || venue.avgRating || venue.averageRating;
  const reviewCount = venue.reviewCount || venue.review_count || venue.totalReviews;

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Link
      href={`/${locale || "en"}/${country || "in"}/search/${activeCategory}/${venue.childVenueId}`}
      className="block"
      target="_blank"
      onClickCapture={() => onRecentViews?.(venue)}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => { setHovered(true); onHover?.(venue); }}
        onMouseLeave={() => { setHovered(false); onLeave?.(); }}
        style={{
          transform: isActive
            ? "translateY(-6px) scale(1.03)"
            : isMapHighlighted
              ? "translateY(-4px)"
              : "translateY(0) scale(1)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
          boxShadow: isMapHighlighted
            ? "0 8px 24px rgba(124,58,237,0.20), 0 2px 8px rgba(0,0,0,0.06)"
            : undefined,
          borderColor: isMapHighlighted ? "#7c3aed" : undefined,
          borderWidth: isMapHighlighted ? "1.5px" : undefined,
        }}
        className="
          relative overflow-hidden rounded-2xl
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-gray-800
          shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
          hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]
          hover:border-gray-200 dark:hover:border-gray-700
          z-[1]
        "
      >
        {/* IMAGE SLIDER */}
        <div className="relative h-48 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </AnimatePresence>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* HEART POP */}
          <AnimatePresence>
            {heartPop && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none"
              >
                <Heart className="text-pink-500 fill-pink-500" size={70} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ARROWS */}
          {hovered && images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* DOTS */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentImage ? "w-4 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* WISHLIST BUTTON */}
          <motion.button
            type="button"
            onClick={toggleWishlist}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: liked ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.35 }}
            className="
              absolute top-3 left-3 z-[2]
              flex items-center justify-center h-10 w-10 rounded-full
              bg-white/85 backdrop-blur-md
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]
              border border-white/30
            "
          >
            <motion.div
              animate={{
                scale: liked ? [1, 1.4, 1] : 1,
                rotate: liked ? [0, -8, 8, 0] : 0,
              }}
              transition={{ duration: 0.45 }}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${
                  liked ? "fill-pink-500 text-pink-500" : "text-gray-700"
                }`}
              />
            </motion.div>
          </motion.button>

          {/* COMPARE BUTTON */}
          {venue.minPrice && (
            <motion.button
              onClick={handleCompare}
              animate={{ scale: compareAnim ? 1.15 : 1 }}
              className={`
                absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow
                ${isCompared ? "bg-purple-600 text-white" : "bg-white/80 text-gray-800"}
              `}
            >
              {isCompared ? "Compared ✓" : "Compare"}
            </motion.button>
          )}
        </div>

        {/* CARD CONTENT
            Fixed structure — uniform height across all categories:
            1. Category badge
            2. Primary name
            3. Parent name slot (always reserved; filled for venues/farmstays only)
            4. Location
            5. Two metadata rows (category-specific, hidden when field missing)
            6. Divider + price (always last)
        */}
        <div className="p-3 flex flex-col gap-1">

          {/* PRIMARY NAME */}
          <h3 className="text-sm font-semibold truncate leading-snug text-gray-900 dark:text-gray-50 mt-0.5">
            {venue.venueName}
          </h3>

          {/* 3 - PARENT NAME SLOT — clickable link for venues/farmstays */}
          {showParentSlot && parentName ? (
            parentId ? (
              <Link
                href={`/${locale || "en"}/${country || "in"}/venue/${parentId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline truncate -mt-0.5 font-medium w-fit max-w-full"
              >
                <span className="truncate">{parentName}</span>
                <ExternalLink size={9} className="flex-shrink-0 opacity-70" />
              </Link>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate -mt-0.5 font-medium">
                {parentName}
              </p>
            )
          ) : (
            <div className="h-[14px] flex-shrink-0" aria-hidden="true" />
          )}

          {/* 4 - LOCATION + RATING (same row) */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <MapPin size={11} className="flex-shrink-0 opacity-70" />
              <span className="truncate">
                {[venue.city, venue.state].filter(Boolean).join(" · ")}
              </span>
            </div>
            {rating && (
              <div className="flex items-center gap-0.5 shrink-0 text-xs text-gray-700 dark:text-gray-300">
                <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="font-semibold">{Number(rating).toFixed(1)}</span>
                {reviewCount && (
                  <span className="text-gray-400 dark:text-gray-500 ml-0.5">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 5 - CATEGORY METADATA */}
          <div className="flex flex-col gap-0.5 mt-0.5">
            <CategoryMeta venue={venue} category={activeCategory} />
          </div>

          {/* 6 - PRICE — always the final information block */}
          <div className="mt-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
            <PriceBlock venue={venue} category={activeCategory} />
          </div>

        </div>
      </div>
    </Link>
  );
};

export default React.memo(VenueCard);
