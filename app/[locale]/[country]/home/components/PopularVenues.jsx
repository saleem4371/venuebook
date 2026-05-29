"use client";

import { motion } from "framer-motion";

export default function PopularVenues({ venues }) {
  return (
    <section className="my-10 px-4 md:px-16">
      <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
      <div className="overflow-x-auto flex space-x-4">
        {venues.map((venue, index) => (
          <motion.div
            key={index}
            className="min-w-[250px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold">{venue.name}</h3>
              <p className="text-gray-500 text-sm">{venue.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
