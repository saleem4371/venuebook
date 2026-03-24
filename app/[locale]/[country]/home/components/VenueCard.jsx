"use client";

import { motion } from "framer-motion";

export default function VenueCard({ venue }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <div className="rounded-xl overflow-hidden bg-white hover:shadow-lg transition h-full">
        
        {/* Image */}
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-40 object-cover"
        />

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm truncate">
            {venue.name}
          </h3>

          <p className="text-xs text-gray-500 truncate">
            {venue.location}
          </p>

          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className="text-yellow-500">⭐</span>
            <span className="text-gray-700 font-medium">
              {venue.rating}
            </span>
            <span className="text-gray-400">
              ({venue.reviews})
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}