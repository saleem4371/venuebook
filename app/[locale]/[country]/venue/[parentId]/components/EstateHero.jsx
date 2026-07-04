"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck, MapPin, Star, PlayCircle, Phone, Navigation,
  Share2, Heart, ChevronDown,
} from "lucide-react";
import { CATEGORY_LABELS } from "../utils/estateTheme";

export default function EstateHero({
  estate,
  availableCategoryKeys,
  onViewListings,
  onWatchReel,
}) {
  const [saved, setSaved] = useState(false);
  const yearsOperating = new Date().getFullYear() - estate.establishedYear;
  const locationLabel = [estate.location?.city, estate.location?.state].filter(Boolean).join(", ");

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
          src={estate.heroImage}
          alt={estate.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* ── CONTENT ── */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 max-w-5xl">
          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center text-2xl sm:text-3xl font-black text-gray-900 shadow-lg shrink-0">
              {estate.logoInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                  {estate.name}
                </h1>
                {estate.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[10px] sm:text-xs font-semibold">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5">{estate.tagline}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/85 text-xs sm:text-sm mb-3">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="opacity-80" /> {locationLabel}
            </span>
            <span className="opacity-40">·</span>
            <span>{yearsOperating} Years Operating</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{estate.rating}</span>
              <span className="opacity-70">({estate.reviewCount.toLocaleString()} reviews)</span>
            </span>
          </div>

          {/* Categories available */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {availableCategoryKeys.map((key) => (
              <span
                key={key}
                className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] sm:text-xs font-medium backdrop-blur-sm"
              >
                {CATEGORY_LABELS[key] ?? key}
              </span>
            ))}
          </div>

          {/* Short description */}
          <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed mb-5 line-clamp-2 sm:line-clamp-3">
            {estate.shortDescription}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onViewListings}
              className="px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              View Listings
            </button>
            {estate.heroVideo && (
              <button
                onClick={onWatchReel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <PlayCircle size={16} /> Watch Reel
              </button>
            )}
            {estate.contact?.estateOffice && (
              <a
                href={`tel:${estate.contact.estateOffice}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <Phone size={15} /> Call
              </a>
            )}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(estate.name + " " + locationLabel)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Navigation size={15} /> Directions
            </a>
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
