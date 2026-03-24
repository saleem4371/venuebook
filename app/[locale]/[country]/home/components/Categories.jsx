"use client";

import { motion } from "framer-motion";

const categories = [
  { title: "Banquet", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Conference", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Resorts", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Community", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Convention", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Auditoriums", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Outdoor", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
  { title: "Wedding Lawns", img: "https://apitest.venuebook.in//event/banquet_front.jpg" },
];

export default function CategorySection() {
  return (
    <section className="px-4 md:px-10 py-10 bg-gray-50">
      
      {/* Heading */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
          India's First Innovative Venue Booking Platform
        </h2>
        <p className="text-gray-500 mt-3 text-sm md:text-base">
          Discover the perfect venue for your next event with ease.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6  ">
        {categories.map((cat, index) => (
          
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
          >
            
            {/* Image */}
            <img
              src={cat.img}
              alt={cat.title}
              className="w-full h-32 md:h-40 object-cover group-hover:scale-110 transition duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Glass Icon Box */}
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow">
              <span className="text-lg">🏢</span>
            </div>

            {/* Title */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-semibold text-sm md:text-base">
                {cat.title}
              </h3>
            </div>
          </motion.div>

        ))}
      </div>
    </section>
  );
}