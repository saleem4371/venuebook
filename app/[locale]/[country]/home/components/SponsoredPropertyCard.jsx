"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

/**
 * SponsoredPropertyCard
 * ─────────────────────────────────────────────────────────────
 * Completely different from PropertyCard on purpose: a thin gold
 * gradient border, a "Sponsored" ribbon, an optional partner logo,
 * and a highlighted price chip — so a paid placement never gets
 * mistaken for organic discovery content. Used only by the
 * Sponsored rail.
 */
export default function SponsoredPropertyCard({ item, tint, partnerLogo }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group w-full cursor-pointer"
    >
      {/* Gradient "border" — a gold-gradient box with 1.5px of padding
          around a solid inner card is the simplest reliable way to get
          a gradient ring without fighting border-image shorthand. */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-[0_2px_10px_rgba(0,0,0,0.06)] group-hover:shadow-[0_14px_30px_rgba(180,131,7,0.22)] transition-shadow duration-300">
        <div className="rounded-[15px] overflow-hidden bg-white dark:bg-gray-900">
          <div className="relative h-24 md:h-28 lg:h-32 overflow-hidden">
            <motion.img
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4 }}
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

            {/* Sponsored ribbon — gold, always distinct from themed badges */}
            <span className="absolute top-1.5 start-1.5 md:top-2 md:start-2 text-[8px] md:text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 shadow-sm">
              Sponsored
            </span>

            {partnerLogo && (
              <img
                src={partnerLogo}
                alt=""
                className="absolute bottom-1.5 end-1.5 md:bottom-2 md:end-2 h-4 w-4 md:h-5 md:w-5 rounded-full object-cover ring-2 ring-white/80"
              />
            )}
          </div>

          <div className="p-2 md:p-2.5 flex flex-col gap-1">
            <p className="text-gray-800 dark:text-white font-semibold text-[11px] md:text-[12px] lg:text-[12.5px] truncate">{item.name}</p>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] lg:text-[11px] min-w-0">
              <MapPin className="w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0 opacity-70" />
              <span className="truncate">{item.location}</span>
            </div>

            {item.price && (
              <span className="inline-block w-fit mt-0.5 text-[10px] md:text-[11px] lg:text-[12px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                {item.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
