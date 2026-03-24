"use client";

import { motion } from "framer-motion";
import VenueCard from "./VenueCard";

export default function VenueSection({ title, venues }) {
  return (
    <section className="w-full overflow-x-hidden px-4 md:px-10 py-8">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">
          {title}
        </h2>
        <p className="text-gray-500 text-sm">
          Choose From Our Most Popular Venue Categories
        </p>
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