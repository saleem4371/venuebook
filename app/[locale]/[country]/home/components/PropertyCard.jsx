"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addLikedProperty } from "@/services/venues.service";
import LikeButton from "@/components/LikeButton";
import BigHeartBurst from "@/components/BigHeartBurst";

/**
 * PropertyCard
 * ─────────────────────────────────────────────────────────────
 * The Homepage-only discovery card — Airbnb Explore / Apple Cards
 * territory, not a search result. One design language, several
 * proportions (`variant`), so sections don't all look identical:
 *
 *   editorial   – Recommended: large, tall hero image
 *   medium      – Recently Viewed: a size down from editorial
 *   landscape   – Popular: wide image, shorter card
 *   compact     – Trending / dense rows: small and tight
 *
 * Every variant keeps: an Airbnb-style split where the image is its
 * own fully-rounded card (16px radius, soft shadow that deepens on
 * hover, 6px lift, 1.04 zoom) and the name/location/price sit
 * unboxed directly below it — no shared white card, no border. The
 * like button is the same shared `LikeButton` the Search page uses
 * (top-right, no backdrop), so it's identical rather than a
 * lookalike. Corners: optional coloured badge top-left, like
 * top-right, likes count bottom-left (Search's exact spot), rating
 * pill bottom-right.
 *
 * This component is intentionally separate from:
 *   - search/[type]/components/VenueCard.jsx      (Search results)
 *   - venue/[parentId]/components/ListingCard.jsx (Estate page)
 *   - compare/... card components                  (Compare page)
 * None of those are touched by anything in here.
 *
 * Props
 *   venue      – venue/listing object (same shape used across the app)
 *   dataSource – "api" prefixes relative image paths with the AWS bucket URL
 *   category   – active category key, drives the price suffix
 *   badge      – optional: "new" | "trending" | "popular" | "premium" |
 *                "featured" | "bestseller" — each has its own colour
 *   variant    – "editorial" | "medium" | "landscape" | "compact" (default "medium")
 */

const FALLBACK_IMAGE =
  "https://api.venuebook.in/Gallery/venue_images/parent_venue_a709df8e-9490-4813-8eb0-b85c1d78fbeb/child_venue_c1a5667c-3c82-4ad2-b005-ae6700d405dc/thumbnail_69e68ecdc2158.png";

const PRICE_SUFFIX = {
  venues:      "Starting Price",
  farmstays:   "/ Night",
  studios:     "/ Hour",
  rentals:     "/ Day",
  workspaces:  "/ Day",
  experiences: "/ Person",
};

/* Each badge owns its own colour, per spec */
const BADGE_STYLES = {
  new:        { label: "New",         bg: "#10b981" },
  trending:   { label: "Trending",    bg: "#f43f5e" },
  popular:    { label: "Popular",     bg: "#f59e0b" },
  premium:    { label: "Premium",     bg: "#7c3aed" },
  featured:   { label: "Featured",    bg: "#2563eb" },
  bestseller: { label: "Best Seller", bg: "#ea580c" },
};

/* One language, different proportions — this is what keeps sections
   from all feeling like the same row of cards. Padding is top-only:
   the image is now its own fully-rounded card and the text sits
   unboxed below it (Airbnb-style), flush with the image's edges.
   `nameSize` steps up across breakpoints instead of one fixed size —
   the card's own width already scales per breakpoint (HorizontalRail's
   basis), so a constant font size looked cramped on the smaller sub-md
   card and under-filled on the bigger lg/xl one. */
const VARIANTS = {
  editorial: { imageAspect: "aspect-[6/5]",   padding: "pt-2.5", nameSize: "text-[13px] md:text-sm lg:text-base" },
  medium:    { imageAspect: "aspect-[5/4]",   padding: "pt-2",   nameSize: "text-[13px] md:text-sm lg:text-[15px]" },
  landscape: { imageAspect: "aspect-[16/10]", padding: "pt-2",   nameSize: "text-[13px] md:text-sm lg:text-[15px]" },
  compact:   { imageAspect: "aspect-square",  padding: "pt-1.5", nameSize: "text-[11px] md:text-[12px] lg:text-[13px]" },
};

function formatINR(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default function PropertyCard({ venue, dataSource, category, badge, variant = "medium" }) {
  const { user } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
  const v = VARIANTS[variant] ?? VARIANTS.medium;

  /* ── Single hero thumbnail ────────────────────────────────────── */
  const rawImage = venue.images?.length ? venue.images[0] : venue.image;
  const rawSrc =
    typeof rawImage === "string" ? rawImage : rawImage?.image || rawImage?.url || "";
  const image = !rawSrc
    ? FALLBACK_IMAGE
    : rawSrc.startsWith("http")
      ? rawSrc
      : dataSource === "api"
        ? `${BASE_URL}/${rawSrc}`
        : rawSrc;

  /* ── Derived fields ───────────────────────────────────────────── */
  const name     = venue.venueName || venue.name || "";
  const location = [venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || "";
  const ratingRaw = venue.rating || venue.avgRating || venue.averageRating;
  const rating   = Number(ratingRaw) > 0 ? Number(ratingRaw) : null;
  const price    = venue.minPrice || venue.basePrice || venue.price;
  const suffix   = PRICE_SUFFIX[category] || "Starting Price";
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  /* ── Like — same shared LikeButton the Search page uses (size 30,
     no backdrop circle, light stroke, red fill, glow pulse), plus the
     same two micro-interactions Search layers on top of it: a
     center Instagram-style big-heart burst on like, and an animated
     likes counter (slides up on +1, down on -1). LikeButton calls
     preventDefault/stopPropagation internally, so this handler just
     needs the resulting boolean. ── */
  const [liked, setLiked] = useState(Boolean(venue.isLiked || venue.liked));
  const [count, setCount] = useState(Number(venue.totalLikes || 0));
  const [countDelta, setCountDelta] = useState(1);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const bigHeartTimerRef = useRef(null);
  const reactId = useId();
  const gradientId = `home-like-heart-gradient-${reactId}`;

  useEffect(() => () => clearTimeout(bigHeartTimerRef.current), []);

  const handleLikeChange = async (nextLiked) => {
    const prevLiked = liked;
    const prevCount = count;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setCountDelta(nextLiked ? 1 : -1);
    setLiked(nextLiked);
    setCount(nextCount);

    if (nextLiked) {
      setShowBigHeart(true);
      clearTimeout(bigHeartTimerRef.current);
      bigHeartTimerRef.current = setTimeout(() => setShowBigHeart(false), 1950);
    }

    if (!user) return; // signed out: local-only toggle, same as elsewhere in the app

    const id = venue.childVenueId ?? venue.id ?? venue._id;
    if (!id) return;
    try {
      await addLikedProperty({ property_id: id, property_type: category });
    } catch (err) {
      console.error("Like error:", err);
      setLiked(prevLiked); // roll back on failure
      setCount(prevCount);
    }
  };

  return (
    <motion.div whileHover={{ y: -6 }} 
    transition={{ duration: 0.2 }} className="group w-full cursor-pointer">
      {/* Hero image — its own fully-rounded card, the whole thing clickable */}
      <div className={`relative ${v.imageAspect} rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.14)] transition-shadow duration-300`}>
        <motion.img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />

        {/* Overlay — a touch stronger on hover so the like/rating chrome stays legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/5 group-hover:from-black/40 transition-colors duration-300 pointer-events-none" />

        {/* Optional themed badge — top-left (rating moved off this corner below) */}
        {badgeStyle && (
          <span
            className="absolute top-2 start-2 md:top-2.5 md:start-2.5 text-[8.5px] md:text-[9.5px] lg:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-white shadow-sm z-[2]"
            style={{ background: badgeStyle.bg }}
          >
            {badgeStyle.label}
          </span>
        )}

        {/* Like — same component/behaviour as the Search page (size 30 at
            its own reference scale), scaled down on smaller cards via a
            CSS transform on this wrapper rather than touching LikeButton's
            own `size` prop — LikeButton is shared with Search, so its
            fixed size=30 there stays exactly as explicitly requested;
            this wrapper only affects how big it renders on THIS card. */}
        <div className="absolute top-2 end-2 md:top-2.5 md:end-2.5 z-[2] origin-top-right scale-[0.72] md:scale-[0.86] lg:scale-100">
          <LikeButton liked={liked} onChange={handleLikeChange} size={30} />
        </div>

        {/* Big center heart burst — Instagram-double-tap-style, only on "like" */}
        <AnimatePresence>
          {showBigHeart && <BigHeartBurst key="big-heart" gradientId={gradientId} />}
        </AnimatePresence>

        {/* Likes counter — bottom-left, same spot + slide-up/down digit
            animation as Search (badge lives top-left now, so this corner
            is free). */}
        {count > 0 && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-10 md:h-12 lg:h-14 bg-gradient-to-t from-black/55 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-2 start-2 md:bottom-3 md:start-3 z-[2] pointer-events-none select-none overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ y: countDelta > 0 ? 10 : -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: countDelta > 0 ? -10 : 10, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="block text-[10px] md:text-[11.5px] lg:text-[12.5px] font-medium text-white"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
                >
                  {count} {count === 1 ? "Like" : "Likes"}
                </motion.span>
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Rating — bottom-right glass badge, moved off top-left to make
            room for the themed badge there */}
        {rating && (
          <div className="absolute bottom-2 end-2 md:bottom-2.5 md:end-2.5 z-[2] flex items-center gap-1 bg-white/90 dark:bg-gray-900/85 backdrop-blur-md px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-full shadow-sm">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] md:text-[11px] lg:text-[12px] font-bold text-gray-800 dark:text-gray-100">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content — unboxed, sits below the image card. Every size step is
          responsive (base → md → lg) rather than one fixed value, since
          the card itself is a different physical width at each of those
          breakpoints; every line still uses `truncate` (ellipsis, not
          wrap) so a long venue name/location/price never pushes the card
          taller or bumps to a second line. */}
      <div className={`${v.padding} flex flex-col gap-0.5 min-w-0`}>
        <h3 className={`${v.nameSize} font-semibold leading-snug text-gray-900 dark:text-gray-50 truncate`}>
          {name}
        </h3>

        <p className="text-[10px] md:text-[11px] lg:text-xs text-gray-500 dark:text-gray-400 truncate">{location}</p>

        <p className="truncate">
          <span className="text-xs md:text-sm lg:text-[15px] font-bold text-gray-900 dark:text-gray-50">
            {price ? formatINR(price) : "Contact"}
          </span>
          <span className="text-[9px] md:text-[10px] lg:text-[11px] text-gray-500 dark:text-gray-400"> {price ? suffix : "for Price"}</span>
        </p>
      </div>
    </motion.div>
  );
}
