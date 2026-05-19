"use client";

import { motion } from "framer-motion";
import VenueCard from "./VenueCard";

export default function VenueSection({ title, subtitle, venues }) {
  return (
    <section className="w-full overflow-x-hidden py-8">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* ✅ PURE GRID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="
          w-full grid gap-4
          grid-cols-2
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
        "
      >
        {venues.map((venue, i) => (
          <VenueCard key={i} venue={venue} />
        ))}
      </motion.div>

    </section>
  );
}