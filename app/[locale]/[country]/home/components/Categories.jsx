"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import ScrollCarousel from "./ScrollCarousel";

/* ── Realistic Unsplash images per category chip ──────────────────
   Replace img URLs with DB images once available.
───────────────────────────────────────────────────────────────── */
import { useRouter, useParams } from "next/navigation";

const CATEGORY_HEADINGS = {
  venues: {
    title: "India's First Innovative Venue Booking Platform",
    sub: "Discover the perfect venue for your next event with ease.",
  },
  farmstays: {
    title: "Escape to Nature's Best Farmstays",
    sub: "Weekend retreats, heritage estates & nature stays across India.",
  },
  studios: {
    title: "Book Creator & Production Spaces",
    sub: "Photography studios, podcast booths & creative spaces on-demand.",
  },
  rentals: {
    title: "Flexible Rental Spaces for Every Occasion",
    sub: "Short-term & long-term space rentals for events, pop-ups & more.",
  },
  workspaces: {
    title: "Find Your Perfect Workspace",
    sub: "Coworking desks, private offices & meeting rooms across India.",
  },
  experiences: { title: "", sub: "" },
};

/* Loading placeholder for a single chip — same responsive width steps as
   the real chip button, so nothing reflows once the real data lands. */
function SkeletonChip() {
  return (
    <div className="flex flex-col items-center shrink-0 w-[38%] sm:w-[28%] md:w-36 animate-pulse">
      <div className="w-full h-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2.5 h-3 w-2/3 rounded-full bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

const SKELETON_CHIP_COUNT = 8;

export default function CategorySection(loadData) {

  const router = useRouter();
  const params = useParams();
  const locale  = params?.locale  || "en";
  const country = params?.country || countryCode || "in";

  const { activeCategory } = useCategory();

  const heading = CATEGORY_HEADINGS[activeCategory] ?? CATEGORY_HEADINGS.venues;
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;
  const loading = loadData.loading;

  // findPropertyname(activeCategory) is a real API fetch — while it's in
  // flight, show a skeleton row instead of silently rendering nothing
  // (the previous behaviour: this whole section just vanished until data
  // arrived, with no loading affordance at all).

const category_click = (e, id) => {
  e.preventDefault();

  router.replace(
    `/${locale}/${country}/search/${activeCategory}?id=${id}`,
    { scroll: false }
  );
};

  if (!loading && !loadData.loadData.length) return null;

  return (
    <section className="relative py-7 bg-white dark:bg-gray-950/80">
      {/* Per-category tint overlay — works in both light & dark */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tint.bg }}
      />

      {/* Heading */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-h"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="relative z-[1] mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-5"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {heading.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {heading.sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Chips — horizontal carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-chips"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          /* Below md (no arrows — touch swipe only) the end-padding is
             dropped so the row bleeds to the viewport edge: it maximises
             the exposed track width, which is what actually guarantees the
             next chip peeks into view instead of ending flush with nothing
             hinting there's more to scroll. From md up, arrows take over
             as the "there's more" cue, so padding goes back to symmetric. */
          className="relative z-[1] mx-auto lg:max-w-[1400px] ps-4 pe-0 md:px-6 lg:px-8"
        >
          <ScrollCarousel
            gap="gap-3"
            scrollBy={320}
            fadeSize={0}
            arrowClass="hidden md:flex"
          >
            {loading
              ? Array.from({ length: SKELETON_CHIP_COUNT }).map((_, i) => (
                  <SkeletonChip key={i} />
                ))
              : loadData.loadData.map((chip, i) => (
              <motion.button
                key={chip.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.22 }}
                whileTap={{ scale: 0.96 }}
               onClick={(e) => category_click(e, chip.id)}
                /* Fixed w-36 only holds from md up (where arrows exist, so a
                   flush fit is fine). Below md it's a % of the track width
                   instead — with a fixed 144px card, whether the next one
                   peeks at all depends entirely on whether the viewport
                   happens to divide evenly into 144px steps, which is pure
                   coincidence and was landing on "flush, no peek" often
                   enough to be the actual bug. A percentage width can never
                   land flush: it guarantees a fractional card is always
                   sitting right at the edge. */
                className="group flex flex-col items-center shrink-0 w-[38%] sm:w-[28%] md:w-36 cursor-pointer text-center"
              >
                {/* Icon — same field the search page's CategoryBar uses (chip.icon) — a soft
                    tinted tile behind it keeps every icon reading at the same visual scale
                    (source illustrations have wildly different internal padding) */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full h-28 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-200"
                  style={{ background: tint.light }}
                >
                  {chip.icon && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${chip.icon}`}
                      alt=""
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </motion.div>
                <p className="mt-2.5 text-gray-800 dark:text-gray-100 font-semibold text-[13px] leading-snug truncate w-full">
                  {chip.name}
                </p>
              </motion.button>
            ))}
            {/* Trailing gutter so the last chip clears the viewport edge once scrolled fully */}
            <div className="shrink-0 w-4" />
          </ScrollCarousel>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
