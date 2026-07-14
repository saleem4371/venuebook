"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import {
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
  Bookmark,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useCategory } from "@/context/CategoryContext";

import LikeButton from "@/components/LikeButton";
import { logActivity } from "@/lib/activityLog";

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

// The only category keys this card's category-specific rendering
// (PRICE_SUFFIX, CategoryMeta, parent-name slot) actually understands.
const KNOWN_CATEGORIES = ["venues", "farmstays", "studios", "rentals", "workspaces", "experiences"];

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
   Independent single-line info row with icon + label. Fixed row height
   (not line-height-dependent) so every row — regardless of category or
   icon — occupies exactly the same vertical space, and stacking rows via
   a flex-column `gap` produces a consistent rhythm instead of relying on
   margin/padding between rows.

   Always renders the same h-4 slot, even with no label — rendering
   `null` here would make cards with missing data (no capacity, no type,
   etc.) shorter than cards with complete data. Same fix already used for
   the parent-name slot below.
   ═══════════════════════════════════════════════════════════════════════════ */
function MetaRow({ icon, label }) {
  const hasLabel = Boolean(label) || label === 0;
  return (
    <div
      className="flex items-center gap-1.5 h-4 text-xs text-gray-500 dark:text-gray-400 min-w-0"
      aria-hidden={!hasLabel}
    >
      {hasLabel && (
        <>
          <span className="flex-shrink-0 opacity-70 flex items-center justify-center">
            {icon}
          </span>
          <span className="truncate leading-none">{label}</span>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY-SPECIFIC METADATA FIELDS
   Pure data — returns the (icon, label) pairs for a category, nothing more.
   Kept separate from layout so CategoryMeta owns the row structure once,
   instead of every switch branch re-declaring its own wrapper.
   ═══════════════════════════════════════════════════════════════════════════ */
function getCategoryMetaFields(venue, category) {
  switch (category) {
    /* ── VENUE ─────────────────────────────────────────────────────────── */
    case "venues": {
      const capacity =
        venue.maxGuests ||
        venue.capacity ||
        venue.guestCapacity ||
        venue.maxCapacity;
      const type =
        venue.venueType ||
        venue.subcategory ||
        venue.propertyType ||
        venue.property_type;
      return [
        { icon: <Users size={11} />, label: capacity ? `Up to ${capacity} Guests` : null },
        { icon: <Briefcase size={11} />, label: type },
      ];
    }

    /* ── FARMSTAY ───────────────────────────────────────────────────────── */
    case "farmstays": {
      const beds = venue.bedrooms || venue.bedroom_count || venue.noOfBedrooms;
      const capacity = venue.maxGuests || venue.capacity || venue.guestCapacity;
      return [
        {
          icon: <BedDouble size={11} />,
          label: beds ? `${beds} Bedroom${Number(beds) !== 1 ? "s" : ""}` : null,
        },
        { icon: <Users size={11} />, label: capacity ? `${capacity} Guests` : null },
      ];
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
      return [
        { icon: <Camera size={11} />, label: type },
        {
          icon: <Ruler size={11} />,
          label: area ? `${Number(area).toLocaleString("en-IN")} Sq Ft` : null,
        },
      ];
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
      return [
        { icon: <Briefcase size={11} />, label: type },
        { icon: <Clock size={11} />, label: duration },
      ];
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
      return [
        { icon: <Users size={11} />, label: seats ? `${seats} Seats` : null },
        { icon: <Briefcase size={11} />, label: type },
      ];
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
      return [
        { icon: <Clock size={11} />, label: duration },
        { icon: <Users size={11} />, label: capacity ? `Up to ${capacity} Guests` : null },
      ];
    }

    default:
      return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY METADATA
   Guest count and category/type are independent rows with no wrapping
   container of their own — a Fragment, not a div. That way each row
   becomes a direct child of the card's own top-level flex-column and
   inherits ITS gap (the same rhythm as every other row in the card),
   instead of living inside a separate nested box with its own gap.
   ═══════════════════════════════════════════════════════════════════════════ */
function CategoryMeta({ venue, category }) {
  const fields = getCategoryMetaFields(venue, category);
  return (
    <>
      {fields.map((f, i) => (
        <MetaRow key={i} icon={f.icon} label={f.label} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICE BLOCK — always the last info block before card ends
   ═══════════════════════════════════════════════════════════════════════════ */
function PriceBlock({ venue, category }) {
  const price = venue.minPrice || venue.basePrice || venue.price;
  const suffix = PRICE_SUFFIX[category] || "Starting Price";

  return (
    // flex-nowrap (not flex-wrap) — this row must stay one line so a long
    // suffix ("Starting Price" etc.) never pushes the card taller than
    // one with a short one ("Enquiry" / "for Price").
    <div className="flex items-baseline gap-1.5 flex-nowrap min-w-0">
      <span className="text-[15px] font-bold text-gray-900 dark:text-gray-50 flex-shrink-0">
        {price ? formatINR(price) : "Enquiry"}
      </span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
        {price ? suffix : "for Price"}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAVE BUTTON — ghost bookmark control, right-aligned in the price row.
   Replaces the old floating "bucket" icon on the photo (Save to Collection
   redesign). Clicking it always opens the collection-picker modal — both to
   save (nothing selected yet) and to manage/remove (already saved, modal
   opens with the current collection pre-checked). No instant remove here,
   no card-height change — it sits inline with the price, same row.
   ═══════════════════════════════════════════════════════════════════════════ */
function SaveButton({ saved, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-label={saved ? "Manage collections" : "Save to collection"}
      aria-pressed={saved}
      className={`flex-shrink-0 flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
        saved
          ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <motion.span
        animate={{ scale: saved ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex items-center justify-center"
      >
        <Bookmark size={13} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
      </motion.span>
      {saved ? "Saved" : "Save"}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE SLIDER — pure translateX slide (not opacity fade). `slideVariants`
   is a module-level constant so it's never recreated on render. The whole
   slider is wrapped in React.memo and only takes the props it actually
   needs, so a wishlist/heart state change elsewhere in the card (which
   re-renders VenueCard) doesn't force the slider to re-evaluate/re-paint.
   ═══════════════════════════════════════════════════════════════════════════ */
const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (dir) => ({ x: dir >= 0 ? "-100%" : "100%" }),
};

const CardImageSlider = React.memo(function CardImageSlider({
  images,
  currentImage,
  slideDir,
  hovered,
  onNext,
  onPrev,
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={slideDir}>
          <motion.img
            key={currentImage}
            src={images[currentImage]}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.38, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ willChange: "transform" }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Preload the adjacent images (next + previous) so sliding to them
          is instant instead of popping in blank/half-loaded. */}
      {images.length > 1 && (
        <div style={{ display: "none" }} aria-hidden="true">
          <img src={images[(currentImage + 1) % images.length]} alt="" />
          <img
            src={images[(currentImage - 1 + images.length) % images.length]}
            alt=""
          />
        </div>
      )}

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* ARROWS */}
      {hovered && images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* DOTS — animate width/color smoothly instead of an instant switch */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            initial={false}
            animate={{
              width: i === currentImage ? 16 : 4,
              backgroundColor:
                i === currentImage
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.5)",
            }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        ))}
      </div>
    </>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   BIG HEART BURST — Instagram-double-tap-style like animation, shown
   dead-centered over the image. Filled with heart-red. Slow, deliberate
   pop (~1.1s total) instead of a quick flash.

   The glow is a SEPARATE blurred circle layered behind the heart rather
   than a CSS `drop-shadow` on the heart itself — a drop-shadow follows
   the heart's exact (stroke-less, gradient-filled) silhouette and can
   render as an uneven/blotchy halo. A plain radial-gradient circle stays
   a clean, centered bloom no matter what.

   Purely decorative (`pointer-events-none`) and only ever mounted for
   the duration of the burst — see `showBigHeart` in VenueCard.
   ═══════════════════════════════════════════════════════════════════════════ */
const BigHeartBurst = React.memo(function BigHeartBurst({ gradientId }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-[3] pointer-events-none"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 1.05] }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.9,
        times: [0, 0.4, 0.75, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Soft round glow, centered behind the heart */}
      <div
        style={{
          position: "absolute",
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,48,64,0.45) 0%, rgba(255,48,64,0) 70%)",
          filter: "blur(6px)",
        }}
      />

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3040" />
            <stop offset="100%" stopColor="#FF3040" />
          </linearGradient>
        </defs>
      </svg>
      <Heart
        size={84}
        fill={`url(#${gradientId})`}
        stroke="none"
        style={{ position: "relative" }}
      />
    </motion.div>
  );
});

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
  likedData,
  likedTotal,
  user,
  onHover,
  wishlist,
  compares,
  onLeave,
  onCompare,
  onRecentViews,
  onWishlist,
  onLikedProperty, //API CALL
  locale,
  country,
  compareList,
  setCompareList,
  hoverVenue,
  isMapHighlighted = false,
}) => {
  const { activeCategory } = useCategory();

  // This card renders inside a single-category grid (search page) as well
  // as mixed-category grids (My Collections' liked/saved sections). The
  // assumption that real API venues always carry a `venue.category` equal
  // to the page's activeCategory turned out to be false — real listing
  // rows can have a `category` field that isn't one of this app's known
  // category keys (e.g. a display/sub-type string), which silently broke
  // the parent-name slot, metadata rows (guests, bedrooms, etc.) and price
  // suffix on the live search page. Only trust venue.category when it's
  // one of the keys PRICE_SUFFIX/CategoryMeta actually understand;
  // otherwise defer to activeCategory exactly like before.
  const cardCategory = KNOWN_CATEGORIES.includes(venue.category)
    ? venue.category
    : activeCategory;

  const router = useRouter();

  /* ── STATE ──────────────────────────────────────────────────────────── */
  const [currentImage, setCurrentImage] = useState(0);
  const [slideDir, setSlideDir] = useState(0);
  const [hovered, setHovered] = useState(false);

  /* ── MAP HIGHLIGHT SCROLL ───────────────────────────────────────────── */
  const cardRef = useRef(null);
  useEffect(() => {
    if (isMapHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isMapHighlighted]);
  const [compareAnim, setCompareAnim] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
  const collections = wishlist?.some(
    (item) => item.venue_id === venue.childVenueId,
  );
  let liked = false;

  if (user) {
    if (likedData instanceof Set) {
      liked = likedData.has(venue.childVenueId);
    } else if (Array.isArray(likedData)) {
      liked = likedData.some((item) => item.venue_id === venue.childVenueId);
    }
  }

  /* ── OPTIMISTIC WISHLIST STATE ──────────────────────────────────────────
     `optimisticLiked`/`optimisticCount` are null until the user taps the
     heart, at which point they immediately hold the predicted next value
     so the UI updates instantly without waiting on the network. Once the
     real `liked` (derived from the parent's `likedData`, refreshed
     silently in the background) catches up to our prediction, we drop the
     override and trust the server value again. */
  const [optimisticLiked, setOptimisticLiked] = useState(null);
  const [optimisticCount, setOptimisticCount] = useState(null);

  useEffect(() => {
    if (optimisticLiked !== null && liked === optimisticLiked) {
      setOptimisticLiked(null);
      setOptimisticCount(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liked]);

  const displayLiked = optimisticLiked ?? liked;
  const displayCount = optimisticCount ?? Number(venue.totalLikes || 0);

  /* ── LIKE MICRO-INTERACTIONS ─────────────────────────────────────────────
     `countDelta` drives the slide direction of the floating count text
     (+1 slides up/in, -1 slides down/in). `showBigHeart` mounts the
     center Instagram-style burst only on a "like" (never on unlike), and
     unmounts itself after the animation finishes. `gradientId` is unique
     per card instance (via useId) so the SVG <linearGradient> id doesn't
     collide across the many cards rendered in the grid. */
  const [countDelta, setCountDelta] = useState(1);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const bigHeartTimerRef = useRef(null);
  const reactId = useId();
  const gradientId = `like-heart-gradient-${reactId}`;

  useEffect(() => () => clearTimeout(bigHeartTimerRef.current), []);

  /* ── IMAGES ─────────────────────────────────────────────────────────── */
  const images = useMemo(() => {
    if (!venue?.images?.length) {
      return [
        "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png",
      ];
    }
    return venue.images
      .map((item) => {
        const image =
          typeof item === "string" ? item : item?.image || item?.url || "";
        if (!image) return null;
        return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
      })
      .filter(Boolean);
  }, [venue?.images, BASE_URL]);

  const isActive = hoverVenue?.childVenueId === venue.childVenueId;

  /* ── SLIDER ─────────────────────────────────────────────────────────────
     Wrapped in useCallback (stable references across renders) so the
     memoized <CardImageSlider> below can actually skip re-rendering when
     an unrelated bit of card state changes (e.g. the wishlist heart). */
  const nextImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSlideDir(1);
      setCurrentImage((p) => (p + 1) % images.length);
    },
    [images.length],
  );

  const prevImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSlideDir(-1);
      setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
    },
    [images.length],
  );

  /* ── SLIDER — touch swipe ──────────────────────────────────────────────
     Simple threshold-based swipe (not framer's `drag`, to avoid fighting
     the card's own <Link> click-through). A tap that doesn't move past the
     threshold still bubbles as a normal click and opens the venue page. */
  const touchStartXRef = useRef(null);
  const onSliderTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  }, []);
  const onSliderTouchEnd = useCallback(
    (e) => {
      const startX = touchStartXRef.current;
      touchStartXRef.current = null;
      if (startX === null || images.length < 2) return;
      const endX = e.changedTouches[0]?.clientX ?? startX;
      const delta = endX - startX;
      const THRESHOLD = 40;
      if (delta <= -THRESHOLD) {
        setSlideDir(1);
        setCurrentImage((p) => (p + 1) % images.length);
      } else if (delta >= THRESHOLD) {
        setSlideDir(-1);
        setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
      }
    },
    [images.length],
  );

  /* Optimistic like/unlike: flips the heart + count instantly, fires the
     API call silently in the background, and rolls back only if it fails.
     No grid refetch, no skeleton — `onLikedProperty` (page.jsx) refreshes
     the underlying data with `refreshProperties({ silent: true })`. */
  const handleLikeToggle = async (nextLiked) => {
    if (!user) {
      // No optimistic flip if we're not logged in — just surface the
      // login prompt via the existing onLikedProperty(!user) branch.
      onLikedProperty?.(venue);
      return;
    }

    const prevLiked = displayLiked;
    const prevCount = displayCount;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setCountDelta(nextLiked ? 1 : -1);
    setOptimisticLiked(nextLiked);
    setOptimisticCount(nextCount);

    // Big center heart burst — only on "like" (Instagram double-tap
    // semantic), never on "unlike". Self-unmounts after the animation.
    if (nextLiked) {
      setShowBigHeart(true);
      clearTimeout(bigHeartTimerRef.current);
      bigHeartTimerRef.current = setTimeout(
        () => setShowBigHeart(false),
        1950,
      );
    }

    try {
      await onLikedProperty?.(venue);
      // Real, forward-only activity log for the My Collections page — only
      // logged once the like actually succeeds, only on "like" (not
      // unlike), matching the spec's timeline examples.
      if (nextLiked) logActivity("liked", { venueName: venue.venueName });
    } catch (err) {
      console.error("Wishlist error:", err);
      // Roll back on failure.
      setOptimisticLiked(prevLiked);
      setOptimisticCount(prevCount);
    }
  };

  // Always opens the Save to Collection modal — whether saving fresh or
  // managing/removing an existing save (the modal itself pre-checks the
  // current collection and handles the remove/move flow from there).
  const openSaveModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlist?.(venue);
  };

  /* ── COMPARE ─────────────────────────────────────────────────────────── */
  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = venue.childVenueId;
    const isAlreadyCompared = compares?.some(
      (item) => item.childVenueId === id,
    );
    if (isAlreadyCompared) {
      onCompare?.(venue, false);
      return;
    }
    if ((compares?.length || 0) >= 4) {
      alert("Only 4 venues allowed");
      return;
    }

    // FIX: actually trigger the pop animation on add-to-compare
    setCompareAnim(true);
    setTimeout(() => setCompareAnim(false), 300);

    onCompare?.(venue, true);
  };

  const compareIds = useMemo(() => {
    return new Set((compares ?? []).map((item) => String(item.childVenueId)));
  }, [compares]);

  const venueId = String(venue.childVenueId);

  const isCompared = compareIds.has(venueId);

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
    cardCategory === "venues" || cardCategory === "farmstays";

  /* ── RATING ──────────────────────────────────────────────────────────── */
  const rating = venue.rating || venue.avgRating || venue.averageRating;
  const reviewCount =
    venue.reviewCount || venue.review_count || venue.totalReviews;

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Link
      href={`/${locale || "en"}/${country || "in"}/search/${cardCategory}/${venue.childVenueId}`}
      className="block"
      target="_blank"
      onClickCapture={() => onRecentViews?.(venue)}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => {
          setHovered(true);
          onHover?.(venue);
        }}
        onMouseLeave={() => {
          setHovered(false);
          onLeave?.();
        }}
        style={{
          transform: isActive
            ? "translateY(-6px) scale(1.03)"
            : isMapHighlighted
              ? "translateY(-4px)"
              : "translateY(0) scale(1)",
          transition:
            "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
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
          <CardImageSlider
            images={images}
            currentImage={currentImage}
            slideDir={slideDir}
            hovered={hovered}
            onNext={nextImage}
            onPrev={prevImage}
            onTouchStart={onSliderTouchStart}
            onTouchEnd={onSliderTouchEnd}
          />

          {/* WISHLIST — just the circular glass heart. No count badge here;
              the count lives as a floating text overlay bottom-left (see
              below). Optimistic (see handleLikeToggle) — no grid refetch,
              no skeleton, only this card's local state changes. */}
          <LikeButton
            liked={displayLiked}
            onChange={handleLikeToggle}
            size={30}
            className="absolute top-3 right-3 z-[2]"
          />

          {/* BIG HEART BURST — Instagram-double-tap-style, centered over
              the image, only on "like" (never on unlike). Purely visual,
              self-clearing via the `showBigHeart` timer in handleLikeToggle. */}
          <AnimatePresence>
            {showBigHeart && (
              <BigHeartBurst key="big-heart" gradientId={gradientId} />
            )}
          </AnimatePresence>

          {/* COMPARE BUTTON */}
          {venue.minPrice && (
            <motion.button
              onClick={handleCompare}
              animate={{ scale: compareAnim ? 1.15 : 1 }}
              className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${
                isCompared
                  ? "bg-purple-600 text-white"
                  : "bg-white/80 text-gray-800"
              }`}
            >
              {isCompared ? "Compared ✓" : "Compare"}
            </motion.button>
          )}

          {/* LIKE COUNT — floating text overlay, bottom-left (symmetric
              with the Compare button, bottom-right). Deliberately NOT a
              pill/badge — just elegant white text over the photo, like a
              gallery caption. A dedicated bottom tint (separate from the
              slider's own top-fade overlay) sits behind it so the text
              stays legible over bright/busy photos. Slides+fades on
              change (~180ms): up on increase, down on decrease, keyed on
              the count itself so AnimatePresence swaps the old digit out
              and the new one in. */}
          {displayCount > 0 && (
            <>
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent pointer-events-none z-[1]" />
              <div className="absolute bottom-3 left-3 z-[2] pointer-events-none select-none overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={displayCount}
                    initial={{ y: countDelta > 0 ? 10 : -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: countDelta > 0 ? -10 : 10, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="block text-[12.5px] font-medium text-white"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
                  >
                    {displayCount} {displayCount === 1 ? "Like" : "Likes"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* CARD CONTENT
            Fixed structure — every card is the same height no matter what
            data it has:
            1. Category badge
            2. Primary name
            3. Parent name slot (always reserved; filled for venues/farmstays only)
            4. Location
            5. Two metadata rows (category-specific; always reserved, blank
               slot if a field is missing rather than collapsing away)
            6. Divider + price (always last, single line, never wraps)
        */}
        <div className="p-3 flex flex-col gap-1.5">
          {/* PRIMARY NAME */}
          <h3 className="text-sm font-semibold truncate leading-snug text-gray-900 dark:text-gray-50 mt-0.5">
            {venue.venueName}
          </h3>

          {/* 3 - PARENT NAME SLOT — clickable link for venues/farmstays */}
          {/* {showParentSlot && parentName ? (
            parentId ? (
              <Link
                href={`/${locale || "en"}/${country || "in"}/venue/${parentId}?from=${cardCategory}`}
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
          )} */}
          {showParentSlot && parentName ? (
            parentId ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  router.push(
                    `/${locale || "en"}/${country || "in"}/venue/${parentId}?from=${cardCategory}`,
                  );
                }}
                className="inline-flex items-center gap-1 text-xs text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline truncate -mt-0.5 font-medium w-fit max-w-full"
              >
                <span className="truncate">{parentName}</span>
                <ExternalLink size={9} className="flex-shrink-0 opacity-70" />
              </button>
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
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <MapPin size={11} className="flex-shrink-0 opacity-70" />
              <span className="truncate">
                {[venue.city, venue.state].filter(Boolean).join(" · ")}
              </span>
            </div>
            {rating && (
              <div className="flex items-center gap-0.5 shrink-0 text-xs text-gray-700 dark:text-gray-300">
                <Star
                  size={10}
                  className="fill-amber-400 text-amber-400 flex-shrink-0"
                />
                <span className="font-semibold">
                  {Number(rating).toFixed(1)}
                </span>
                {reviewCount && (
                  <span className="text-gray-400 dark:text-gray-500 ml-0.5">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 5 - CATEGORY METADATA — no wrapper div; each row is a direct
              child of this flex-column, so it uses the same gap-1.5
              rhythm as every other row in the card (location, price, etc).
              No nested container, no separate inner gap. */}
          <CategoryMeta venue={venue} category={cardCategory} />

          {/* 6 - PRICE + SAVE — always the final information block. Save
              sits right-aligned in the same row as price, vertically
              centered, never increasing card height. */}
          <div className="mt-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between gap-2">
            <PriceBlock venue={venue} category={cardCategory} />
            <SaveButton saved={!!collections} onClick={openSaveModal} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(VenueCard);
