"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/OffersPanel.jsx
 *
 * Left column (default) — compact offer chips stacked one below the other
 * (not a horizontal scroller), since the left column is a narrow
 * fixed-width rail rather than a wide ribbon. Same MOCK_OFFERS data as
 * OffersSection.jsx (mobile fallback), just laid out as a slim row per
 * offer (icon + title + tag) so all three fit without feeling oversized.
 *
 * `expanded` — used when page.jsx's Bookings↔Offers layout swap puts this
 * in the CENTER column instead (see page.jsx's header comment, and
 * BookingsPanel.jsx's `compact` prop for the widget going the other way):
 * a bigger card grid filling the center column's full height, since it's
 * now the dashboard's main content rather than a side rail.
 *
 * `embedded` — used together with `expanded` when this sits BELOW the new
 * Greeting/Reels/Suggestions feed instead of being the center column's
 * sole content (see BookingsPanel.jsx's own `embedded` doc comment for the
 * full rationale — same idea, same single-scroll-owner requirement).
 *
 * The `expanded` grid caps itself at 2 rows (6 cards, 3-up) rather than
 * growing indefinitely — a "View All" button appears BELOW the grid
 * (centered, not a header link like every other section, since it's
 * closing off a grid rather than a list) only once there's actually a 3rd
 * row's worth hiding, and opens a centered modal (same visual language as
 * BookingDetailModal.jsx: dark backdrop, white rounded-3xl panel) listing
 * every offer instead of navigating anywhere — there's no dedicated
 * "all offers" route to send someone to.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Sparkles, X } from "lucide-react";

import { SectionCard, SectionHeading } from "../shared/ui";
import { MOCK_OFFERS } from "../../data/mockProfileData";

const GRID_COLS = 3;
const GRID_ROWS = 2;
const VISIBLE_LIMIT = GRID_COLS * GRID_ROWS; // 6 — exactly 2 full rows at 3-up

export default function OffersPanel({ expanded = false, flat = false, embedded = false }) {
  const t = useTranslations("profile.offers");
  const [showAll, setShowAll] = useState(false);

  if (expanded) {
    const visibleOffers = MOCK_OFFERS.slice(0, VISIBLE_LIMIT);
    const hasMore = MOCK_OFFERS.length > VISIBLE_LIMIT;

    return (
      <>
        <SectionCard
          flat={flat}
          className={embedded ? "flex flex-col" : "flex flex-col min-h-0 flex-1"}
          padded={false}
        >
          <div className="p-4 pb-0">
            <SectionHeading
              title={t("title")}
              subtitle={t("subtitle")}
              icon={
                <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-900/30">
                  <Sparkles size={18} className="text-violet-600" />
                </span>
              }
            />
          </div>
          <div className={embedded ? "px-4 pb-4 pt-1" : "flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-1"}>
            {/* Smaller, denser cards (3-up instead of 2-up, ~96px tall
                instead of 150px) with a colour-matched glow shadow — sitting
                in a flat feed next to neutral white cards (Reels thumbnails,
                Suggestions), a plain flat gradient tile read as just another
                block; the tinted shadow + hover lift gives these a bit of
                pop instead of blending in. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visibleOffers.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-3.5">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[11.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  {t("viewAll")}
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAll(false)}
              className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="w-full sm:max-w-2xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">{t("allTitle")}</h3>
                  <button
                    onClick={() => setShowAll(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MOCK_OFFERS.map((o) => (
                      <OfferCard key={o.id} offer={o} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        compact
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/30">
            <Sparkles size={12} className="text-violet-600" />
          </span>
        }
      />
      <div className="flex flex-col gap-2">
        {MOCK_OFFERS.map((o) => (
          <motion.div
            key={o.id}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="relative overflow-hidden rounded-xl px-3 py-2.5 text-white flex items-center gap-2.5"
            style={{ background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})` }}
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/15 blur-lg" />
            <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 shrink-0">
              <Tag size={12} />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-[11.5px] font-bold leading-snug truncate">{o.title}</p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur text-[8.5px] font-mono font-semibold">
                {o.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}

/* Shared between the expanded grid's visible 2 rows and the "View All"
   modal's full grid, so the two never drift into two slightly different
   card designs. */
function OfferCard({ offer: o }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl p-3.5 text-white flex flex-col justify-between min-h-[96px]"
      style={{
        background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})`,
        boxShadow: `0 10px 22px -6px ${o.colorFrom}80, 0 2px 6px rgba(0,0,0,0.12)`,
      }}
    >
      <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-white/15 blur-xl" />
      <span className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 shrink-0">
        <Tag size={14} />
      </span>
      <div className="relative mt-2">
        <p className="text-[12.5px] font-bold leading-snug">{o.title}</p>
        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur text-[9px] font-mono font-semibold">
          {o.tag}
        </span>
      </div>
    </motion.div>
  );
}
