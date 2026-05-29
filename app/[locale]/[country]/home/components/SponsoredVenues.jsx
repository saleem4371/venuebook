"use client";

import { motion } from "framer-motion";

export default function SponsoredVenues({ venues }) {
  return (
    <section className="my-10 px-4 md:px-16">
      <h2 className="text-2xl font-bold mb-6">Sponsored Venues</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {venues.map((venue, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2 border-yellow-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold">{venue.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
