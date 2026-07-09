"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, ShoppingBasket, Star, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import LikeButton from "@/components/LikeButton";

/**
 * Matches the search results page's VenueCard exactly — same rounded-2xl
 * shell, h-48 image with wishlist heart, collection basket, live-updating
 * like count and Compare pill, location+rating row, metadata row, and
 * border-t price row. This page has no wishlist/collections/compare
 * backend wired up yet, so all three buttons run on local component
 * state (same mock-data convention as the rest of this page) rather than
 * a shared context — visually identical, not yet cross-card persistent.
 * The parent-name link row from VenueCard is dropped since it's
 * redundant here (we're already on that parent's own page).
 */
export default function ListingCard({ listing, estateId }) {
  const { locale, country } = useParams();
  const { format } = useCurrency();

  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [compareAnim, setCompareAnim] = useState(false);

  const likeCount = (listing.likes || 0) + (liked ? 1 : 0);

  const toggleSaved = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCompared((c) => !c);
    setCompareAnim(true);
    setTimeout(() => setCompareAnim(false), 300);
  };

  return (
    <Link
      href={`/${locale || "en"}/${country || "in"}/search/${listing.type}/${listing.id}?estate=${estateId}`}
      className="group block rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <LikeButton liked={liked} onChange={setLiked} size={20} className="absolute top-3 right-3 z-[2]" />

        <motion.button
          type="button"
          onClick={toggleSaved}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: saved ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.35 }}
          className="absolute top-3 left-3 z-[2] flex items-center justify-center h-10 w-10 rounded-full bg-white/85 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/30"
        >
          <ShoppingBasket size={18} className={saved ? "fill-pink-500 text-pink-500" : "text-gray-700"} />
        </motion.button>

        <motion.button
          type="button"
          onClick={toggleCompare}
          animate={{ scale: compareAnim ? 1.15 : 1 }}
          className={`absolute bottom-3 right-3 z-[2] px-3 py-1 rounded-full text-xs font-semibold shadow ${
            compared ? "bg-purple-600 text-white" : "bg-white/80 text-gray-800"
          }`}
        >
          {compared ? "Compared ✓" : "Compare"}
        </motion.button>

        {likeCount > 0 && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-3 left-3 z-[2] pointer-events-none select-none overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={likeCount}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="block text-[12.5px] font-medium text-white"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
                >
                  {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                </motion.span>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold truncate leading-snug text-gray-900 dark:text-gray-50 mt-0.5">
          {listing.name}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <MapPin size={11} className="flex-shrink-0 opacity-70" />
            <span className="truncate">{[listing.city, listing.state].filter(Boolean).join(" · ")}</span>
          </div>
          {listing.rating && (
            <div className="flex items-center gap-0.5 shrink-0 text-xs text-gray-700 dark:text-gray-300">
              <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="font-semibold">{Number(listing.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 h-4 text-xs text-gray-500 dark:text-gray-400 min-w-0">
          <Users size={11} className="flex-shrink-0 opacity-70" />
          <span className="truncate">Up to {listing.capacity} Guests</span>
        </div>

        <div className="mt-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-gray-900 dark:text-gray-50">{format(listing.priceINR)}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{listing.priceUnit}</span>
        </div>
      </div>
    </Link>
  );
}
