"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Star,
  Share2, Heart, ChevronDown,
} from "lucide-react";

/**
 * Hero now reacts to whichever category is selected in the switcher
 * below it: background image, tagline, and rating all switch to that
 * category's own content instead of always showing fixed estate-level
 * copy. Brand identity (logo, estate name, location, years operating)
 * stays constant — "the estate itself stays the same" — only the
 * category-specific layer changes. The "categories available" pill row
 * was dropped: the switcher immediately below the hero now owns that
 * job, so showing both was a duplicate control.
 */
export default function EstateHero({
  estate,
  categoryKey,
  catLabel,
  onViewListings,
  parents
}) {
  const [saved, setSaved] = useState(false);
  const yearsOperating = new Date().getFullYear() - parents?.result?.[0]?.build_year ;
  const locationLabel = [estate.location?.city, estate.location?.state].filter(Boolean).join(", ");

  const cat = estate.categories?.[categoryKey];
  const listings = cat?.listings ?? [];


  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const heroImage = BASE_URL+'/'+parents?.result?.[0]?.banner_image || estate.heroImage;
  const heroTagline = cat?.heroTagline || estate.tagline;

  const categoryRating = useMemo(() => {
    const ratings = listings.map((l) => l.rating).filter(Boolean);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }, [listings]);

  const displayRating = categoryRating ?? estate.rating;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: estate.name, url }); } catch (_) {}
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch (_) {}
    }
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-3xl overflow-hidden">
      {/* ── BACKGROUND ── */}
      <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] w-full">
        <img
          key={heroImage}
          src={heroImage}
          alt={`${catLabel} at ${estate.name}`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* ── SHARE + SAVE — top right ── */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/25 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>
          <motion.button
            onClick={() => setSaved((s) => !s)}
            whileTap={{ scale: 0.85 }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/25 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Save"
          >
            <Heart size={15} className={saved ? "fill-pink-500 text-pink-500" : ""} />
          </motion.button>
        </div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 max-w-5xl">
          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center text-2xl sm:text-3xl font-black text-gray-900 shadow-lg shrink-0">
              {estate.logoInitial}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                {parents?.result?.[0]?.venue_name}
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5"> {parents?.result?.[0]?.banner_content}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/85 text-xs sm:text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="opacity-80" /> {parents?.result?.[0]?.venue_address}
            </span>
            <span className="opacity-40">·</span>
            <span>{yearsOperating} Years in Operation</span>
            {parents?.result?.[0]?.rating && (
              <>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{Number(parents?.result?.[0]?.rating).toFixed(1)}</span>
                  <span className="opacity-70">{catLabel}</span>
                </span>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onViewListings}
              className="w-full sm:w-auto sm:min-w-[220px] px-8 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg text-center"
            >
              View {catLabel}
            </button>
          </div>
        </div>

        {/* scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="hidden sm:flex absolute bottom-4 right-6 z-10 text-white/60"
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>
    </div>
  );
}
