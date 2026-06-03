"use client";

import { motion } from "framer-motion";
import VenueCard from "./VenueCard";

/*
 * VenueSection
 * ─────────────────────────────────────────────────────────────
 * Mobile  (<sm): 2-column flex-wrap grid — no horizontal scroll
 * Desktop (sm+): horizontal scroll carousel
 *
 * "View all" is hidden when there are 5 or fewer venues.
 */
export default function VenueSection({ title, subtitle, venues, dataSource, tint }) {
  if (!venues?.length) return null;

  const showViewAll = venues.length > 5;

  return (
    <section className="w-full py-7">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {showViewAll && (
          <button
            className="text-sm font-medium shrink-0 hover:opacity-70 transition"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            View all →
          </button>
        )}
      </div>

      {/*
        Responsive track:
          Mobile  → flex-wrap (2-col), overflow-visible
          Desktop → flex-nowrap + horizontal scroll
      */}
      <div
        className="flex flex-wrap gap-3 overflow-visible sm:flex-nowrap sm:gap-4 sm:overflow-x-auto sm:scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {venues.map((venue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}
            /* Mobile: 2 per row; sm+: fixed carousel width */
            className="w-[calc(50%-6px)] shrink-0 sm:w-[220px] md:w-[240px]"
          >
            <VenueCard venue={venue} dataSource = {dataSource} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
