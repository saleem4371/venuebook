"use client";

import { motion } from "framer-motion";

export default function VenueCard({ venue }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 h-full">

        {/* Image */}
        <div className="relative overflow-hidden h-40">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate leading-snug">
            {venue.name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-snug mt-0.5">
            {venue.location}
          </p>

          <div className="flex items-center gap-1 mt-1.5 text-xs">
            <span className="text-yellow-500 leading-none">⭐</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {venue.rating}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              ({venue.reviews})
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}