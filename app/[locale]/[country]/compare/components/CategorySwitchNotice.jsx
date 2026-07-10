"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus, Search, Heart, MapPin, Star, X, Scale } from "lucide-react";
import { CATEGORIES } from "@/config/categoryConfig";
import { getCategoryAccent, darkenHex } from "../utils/compareHelpers";
import AddVenueModal from "./AddVenueModal";
import FloatingDecorCards from "./shared/FloatingDecorCards";

/**
 * Shown whenever the focused category isn't ready to render a full
 * comparison — either it has 0 saved items (never added anything here yet
 * — a "go browse" prompt makes sense) or exactly 1 (something WAS already
 * added, just one short — "add one more to compare" makes sense). These
 * are genuinely different moments for the user, so the heading/body copy
 * still differs between them (0 -> "No {category} added yet", 1 -> "Not
 * enough {category} to compare yet") — but everything else about the card
 * is now identical in both cases: same mini-card-if-one-exists slot, same
 * three actions, same layout. Previously the 1-count state didn't show
 * WHICH property was already saved (just text), and the 0-count state had
 * an extra "Switch to {other category}" row the 1-count state didn't —
 * two different-feeling cards for what's really one "not ready yet" state.
 *
 * Three actions, always in this order, for both states:
 *   1. Add {category} — opens the same AddVenueModal used on the full
 *      comparison grid.
 *   2. Explore {category} — jumps to that category's search/listing page.
 *   3. My Saved — jumps straight to the wishlist page.
 */
export default function CategorySwitchNotice({
  category, count = 0, properties = [], onAdd, onRemove, excludeIds, remainingSlots, locale, country,
}) {
  const t = useTranslations("compare.categorySwitch");
  const tCard = useTranslations("compare.card");
  const tAdd = useTranslations("compare.addVenue");
  const tCat = useTranslations("categories");
  const [modalOpen, setModalOpen] = useState(false);
  const isEmpty = count === 0;
  const route = CATEGORIES[category]?.route || category;
  const savedProperty = properties[0];
  const accent = getCategoryAccent(category);

   const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  return (
    // Same spacious, no-box illustration treatment the true "nothing saved
    // anywhere" state (EmptyState.jsx) always had — a single category being
    // short used to fall back to a plain grey card, which read as a
    // completely different, lesser experience from the one the user first
    // saw. Now every "not enough to compare yet" moment, for every
    // category, looks identical apart from the category's own name/color.
    <div className="relative min-h-[calc(100vh-160px)] flex items-center justify-center overflow-hidden px-4 lg:px-8 py-36 md:py-20">
      <FloatingDecorCards />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-[28px] flex items-center justify-center bg-[var(--cat-light)]">
            <Scale size={44} strokeWidth={1.5} className="text-[var(--cat-accent)]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-950 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <Heart size={18} className="text-pink-500 fill-pink-500" />
          </div>
        </div>

        <h2 className="text-[22px] md:text-[26px] font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
          {isEmpty ? t("emptyHeading", { category: tCat(category) }) : t("heading", { category: tCat(category) })}
        </h2>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-[320px]">
          {isEmpty ? t("emptyBody", { category: tCat(category) }) : t("body", { category: tCat(category) })}
        </p>

        {/* The one property already saved for this category — previously
            invisible here (only the count showed up, in the "Comparing 1
            Properties" badge above), leaving no way to tell WHICH property
            that was without opening the sticky bar / going elsewhere. */}
        {savedProperty && (
          <div className="relative flex items-center gap-3 max-w-[280px] w-full mt-5 p-2 rounded-2xl text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={`${BASE_URL}/${savedProperty.images?.[0]}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                {savedProperty.venueName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[10.5px] text-gray-400 dark:text-gray-500 truncate min-w-0">
                  <MapPin size={9} className="flex-shrink-0" />
                  <span className="truncate">{[savedProperty.city, savedProperty.state].filter(Boolean).join(", ")}</span>
                </span>
                {savedProperty.rating && (
                  <span className="flex items-center gap-0.5 text-[10.5px] font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                    <Star size={9} className="fill-amber-400 text-amber-400" />
                    {Number(savedProperty.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            {/* Lets the user empty the compare page from right here — without
                this, removing the one already-added item meant going to the
                sticky bar/detail page first, even though this card is
                already showing exactly what they'd be removing. */}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(savedProperty.childVenueId)}
                aria-label={tCard("remove")}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <X size={11} />
              </button>
            )}
          </div>
        )}

        {/* All three actions always on one row (wrapping to a second line
            only if the viewport is too narrow to fit them, via flex-wrap),
            same visual weight/height for all three so they read as one
            action group. Both secondary icons share the same explicit size
            + strokeWidth so Search and Heart render at matching visual
            weight (Heart's default path reads noticeably bolder than
            Search at the same size otherwise). */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 w-full sm:w-auto mx-auto">
          {onAdd && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 text-white text-[12px] sm:text-[13.5px] font-semibold px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl whitespace-nowrap transition active:scale-[0.98] hover:opacity-95"
              style={{ background: `linear-gradient(135deg, ${accent} 0%, ${darkenHex(accent)} 100%)` }}
            >
              <Plus size={13} strokeWidth={2.25} className="sm:w-[15px] sm:h-[15px]" />
              {tAdd("tileLabel", { category: tCat(category) })}
            </button>
          )}
          <Link
            href={`/${locale || "en"}/${country || "in"}/search/${route}`}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-300 text-[12px] sm:text-[13px] font-medium px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl whitespace-nowrap border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Search size={13} strokeWidth={2} className="sm:w-[15px] sm:h-[15px]" />
            {t("exploreButton", { category: tCat(category) })}
          </Link>
          <Link
            href={`/${locale || "en"}/${country || "in"}/collections`}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-300 text-[12px] sm:text-[13px] font-medium px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl whitespace-nowrap border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Heart size={13} strokeWidth={2} className="sm:w-[15px] sm:h-[15px]" />
            {t("mySaved")}
          </Link>
        </div>
      </motion.div>

      {onAdd && (
        <AddVenueModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={category}
          excludeIds={excludeIds}
          country={country}
          onAdd={onAdd}
          remainingSlots={remainingSlots}
        />
      )}
    </div>
  );
}
