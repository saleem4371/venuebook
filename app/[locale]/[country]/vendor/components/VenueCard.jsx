"use client";

import { motion } from "framer-motion";

export default function VenueCard({ venue }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={venue.image}
          alt=""
          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 text-xs rounded-full bg-red-500/90 text-white shadow-md backdrop-blur-md">
            ● {venue.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
            {venue.name}
          </h3>
          <p className="text-sm text-gray-500">{venue.location}</p>
        </div>

        {/* Address */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {venue.address}
        </p>

        {/* Stats */}
        <div className="flex gap-3">
          <StatBox label="Guests" value={venue.guests} />
          <StatBox label="Leads" value={venue.leads} />
        </div>

        {/* Button */}
        <PremiumButton>Editor</PremiumButton>
      </div>
    </motion.div>
  );
}
