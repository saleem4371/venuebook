"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, Star, MapPin } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

/**
 * Tiny floating "ghost" property card used as background decoration on
 * every "not enough to compare yet" surface (the true zero-state and every
 * per-category empty/short state) — built to actually resemble a real
 * search-result card (photo, name, location, rating, price) rather than a
 * generic skeleton of grey bars. A real photo (not a flat gradient block)
 * so it reads as an actual listing at a glance; no category label, since
 * this is background decoration, not a real filtered result. Purely
 * illustrative (pointer-events-none, no real data), but every string still
 * comes from translations — no hardcoded UI copy.
 *
 * Extracted out of EmptyState.jsx so CategorySwitchNotice.jsx can reuse the
 * exact same decoration — previously the two "nothing to compare" surfaces
 * (global zero vs. a single category being short) looked completely
 * different (one had these cards + a big illustration, the other a plain
 * grey box), even though from the user's point of view they're the same
 * situation ("nothing here yet").
 */
function FloatingCard({ className, delay = 0, image, name, location, rating, price }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{ opacity: { duration: 0.6, delay }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay } }}
      className={`flex flex-col absolute rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_10px_24px_rgba(0,0,0,0.10)] md:shadow-[0_16px_40px_rgba(0,0,0,0.08)] w-28 md:w-44 select-none pointer-events-none ${className}`}
    >
      {/* Photo area — a real image, not a flat color block */}
      <div className="relative h-14 md:h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <Heart size={10} className="absolute top-1.5 right-1.5 md:top-2 md:right-2 text-white drop-shadow" />
      </div>

      {/* Content */}
      <div className="p-1.5 md:p-2.5 flex flex-col gap-1">
        <p className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-snug">
          {name}
        </p>
        <div className="flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 min-w-0">
          <MapPin size={9} className="flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 mt-0.5 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-0.5 text-[9.5px] font-semibold text-gray-700 dark:text-gray-300">
            <Star size={9} className="fill-amber-400 text-amber-400" />
            {rating}
          </span>
          <span className="text-[10px] font-bold text-gray-900 dark:text-gray-100">{price}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Same illustrative demo photo pool already used across the app's static
// search-page mock data (app/[locale]/[country]/search/[type]/data/staticVenues.js)
// — reused here rather than inventing new external URLs.
const DEMO_IMAGES = {
  venue: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80",
  studio: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
  farmstay: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80",
  workspace: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
};

export default function FloatingDecorCards() {
  const t = useTranslations("compare.empty");
  const { format } = useCurrency();

  return (
    <>
      <FloatingCard
        className="top-2 left-[4%] md:top-6 md:left-[8%] rotate-[-6deg]"
        delay={0.1}
        image={DEMO_IMAGES.venue}
        name={t("floatingName1")}
        location={t("floatingLocation2")}
        rating="4.8"
        price={format(85000)}
      />

      <FloatingCard
        className="top-4 right-[4%] md:top-10 md:right-[10%] rotate-[5deg]"
        delay={0.35}
        image={DEMO_IMAGES.studio}
        name={t("floatingName2")}
        location={t("floatingLocation3")}
        rating="4.9"
        price={format(3500)}
      />

      <FloatingCard
        className="bottom-2 left-[4%] md:bottom-10 md:left-[14%] rotate-[4deg]"
        delay={0.55}
        image={DEMO_IMAGES.farmstay}
        name={t("floatingName3")}
        location={t("floatingLocation")}
        rating="4.7"
        price={format(12000)}
      />

      <FloatingCard
        className="bottom-4 right-[4%] md:bottom-16 md:right-[8%] rotate-[-4deg]"
        delay={0.2}
        image={DEMO_IMAGES.workspace}
        name={t("floatingName4")}
        location={t("floatingLocation4")}
        rating="4.6"
        price={format(1500)}
      />
    </>
  );
}
