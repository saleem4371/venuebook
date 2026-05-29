"use client";

import { motion } from "framer-motion";
import ScrollCarousel from "./ScrollCarousel";
import VenueCard      from "./VenueCard";

/* ── Premium full-width banner ──────────────────────────────── */
export function PremiumBanner({ tint, badge, headline, subtext, cta, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden my-6"
      style={{ minHeight: 140 }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div
        className="absolute inset-y-0 start-0 w-1 rounded-s-2xl"
        style={{ background: tint?.hex ?? "#7c3aed" }}
      />
      <div className="relative z-10 flex flex-wrap  items-center justify-between gap-6 px-8 py-7">
        <div className="min-w-0">
          {badge && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{
                background: tint?.light ?? "rgba(124,58,237,0.2)",
                color:      tint?.hex   ?? "#7c3aed",
                border:     `1px solid ${tint?.border ?? "rgba(124,58,237,0.3)"}`,
              }}
            >
              {badge}
            </span>
          )}
          <h3 className="text-white font-bold text-lg md:text-xl leading-snug">{headline}</h3>
          {subtext && <p className="text-white/55 text-sm mt-1 max-w-lg">{subtext}</p>}
        </div>
        {cta && (
          <button
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
            style={{ background: tint?.hex ?? "#7c3aed" }}
          >
            {cta}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Popular {category} — same card style as Recommended ────────
 *  Mobile  → 2-col flex-wrap grid (no scroll)
 *  Desktop → horizontal scroll carousel (no arrows)
 *  "See all" hidden when ≤ 5 items
 */
export function PopularCategoryRow({ tint, categoryLabel = "Venues", items }) {
  if (!items?.length) return null;
  const title      = `Popular ${categoryLabel}`;
  const showSeeAll = items.length > 5;

  return (
    <div className="my-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1"
            style={{ background: tint?.light ?? "rgba(124,58,237,0.1)", color: tint?.hex ?? "#7c3aed" }}
          >
            Popular
          </span>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">{title}</h3>
        </div>
        {showSeeAll && (
          <button
            className="text-sm font-medium hover:opacity-70 transition"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            See all →
          </button>
        )}
      </div>

      {/*
        Mobile  → flex-wrap 2-col (no overflow)
        Desktop → horizontal scroll carousel
      */}
      <div
        className="flex flex-wrap gap-3 overflow-visible sm:flex-nowrap sm:gap-4 sm:overflow-x-auto sm:scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}
            className="w-[calc(50%-6px)] shrink-0 sm:w-[220px] md:w-[240px]"
          >
            <VenueCard
              venue={{
                name:     item.name,
                location: item.location,
                image:    item.image,
                rating:   item.rating ?? 4.7,
                reviews:  item.reviews ?? Math.floor(Math.random() * 300 + 50),
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Ad card — used only by SponsoredCategoryRow ────────────── */
function VenueAdCard({ item, tint }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-white/[0.06] cursor-pointer transition-all"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
    >
      <div className="relative h-32">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span
          className="absolute top-2 end-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ background: tint?.hex ?? "#7c3aed" }}
        >
          AD
        </span>
      </div>
      <div className="p-3">
        <p className="text-gray-800 dark:text-white font-semibold text-xs truncate">{item.name}</p>
        <p className="text-gray-500 dark:text-gray-400 text-[11px] truncate mt-0.5">{item.location}</p>
        {item.price && (
          <p className="text-xs font-bold mt-1.5" style={{ color: tint?.hex ?? "#7c3aed" }}>
            {item.price}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Sponsored {category} — scrollable carousel WITH arrows ─────
 *  Scrollable on ALL screen sizes (per spec).
 *  "See all" hidden when ≤ 5 items.
 */
export function SponsoredCategoryRow({ tint, categoryLabel = "Venues", items }) {
  if (!items?.length) return null;
  const title      = `Sponsored ${categoryLabel}`;
  const showSeeAll = items.length > 5;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: tint?.light ?? "rgba(124,58,237,0.1)", color: tint?.hex ?? "#7c3aed" }}
          >
            Sponsored
          </span>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base">{title}</h3>
        </div>
        {showSeeAll && (
          <button
            className="text-sm font-medium hover:opacity-70 transition"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            See all →
          </button>
        )}
      </div>

      {/* showArrows=true — only this section gets nav arrows */}
      <ScrollCarousel gap="gap-4" scrollBy={240} fadeSize={40} showArrows={true}>
        {items.map((item, i) => (
          <VenueAdCard key={i} item={item} tint={tint} />
        ))}
      </ScrollCarousel>
    </div>
  );
}

/* ── Host spotlight ─────────────────────────────────────────── */
export function HostSpotlight({ tint, host }) {
  if (!host) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden my-6 p-5 border"
      style={{
        background: `linear-gradient(135deg, ${tint?.light ?? "rgba(124,58,237,0.06)"}, rgba(0,0,0,0.01))`,
        border:     `1px solid ${tint?.border ?? "rgba(124,58,237,0.15)"}`,
      }}
    >
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4"
        style={{ background: tint?.light ?? "rgba(124,58,237,0.1)", color: tint?.hex ?? "#7c3aed" }}
      >
        Featured Host
      </span>
      <div className="flex items-center gap-4">
        <img
          src={host.avatar}
          alt={host.name}
          className="w-14 h-14 rounded-2xl object-cover shrink-0"
          style={{ boxShadow: `0 0 0 2px ${tint?.border ?? "rgba(124,58,237,0.3)"}` }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-800 dark:text-white text-base">{host.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{host.tagline}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-yellow-500 text-xs">⭐ {host.rating}</span>
            <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{host.listings} listings</span>
          </div>
        </div>
        <button
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
          style={{ background: tint?.hex ?? "#7c3aed" }}
        >
          View Properties
        </button>
      </div>
    </motion.div>
  );
}

/* ── Top Destinations — premium image cards ─────────────────────
 *  Mobile  → flex-wrap 2-col (no scroll)
 *  Desktop → horizontal scroll carousel (no arrows)
 *  "View all" hidden when ≤ 5 items
 */
export function TopDestinations({ tint, title = "Top Destinations", items }) {
  if (!items?.length) return null;
  const showViewAll = items.length > 5;

  return (
    <div className="my-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            Explore More
          </p>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">{title}</h3>
        </div>
        {showViewAll && (
          <button
            className="text-sm font-medium hover:opacity-70 transition mb-0.5"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            View all →
          </button>
        )}
      </div>

      {/*
        Mobile  → flex-wrap 2-col
        Desktop → horizontal scroll (no arrows)
      */}
      <div
        className="flex flex-wrap gap-3 overflow-visible sm:flex-nowrap sm:gap-4 sm:overflow-x-auto sm:scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer w-[calc(50%-6px)] sm:w-[220px] sm:h-[160px]"
            style={{ height: 148 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {item.badge && (
              <span
                className="absolute top-3 start-3 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full text-white"
                style={{ background: tint?.hex ?? "#7c3aed" }}
              >
                {item.badge}
              </span>
            )}

            <div className="absolute bottom-3 start-3 end-3">
              <p className="text-white font-bold text-sm leading-snug">{item.name}</p>
              <p className="text-white/65 text-xs mt-0.5 leading-snug">{item.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Backward compat aliases ─────────────────────────────────── */
export const LuxuryStrip  = TopDestinations;
export const SponsoredRow = SponsoredCategoryRow;
export function PopularVenuesRow({ tint, title = "Popular Venues", items }) {
  return <SponsoredCategoryRow tint={tint} categoryLabel={title.replace("Popular ", "")} items={items} />;
}
