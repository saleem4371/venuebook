"use client";

import { motion } from "framer-motion";

const destinations = [
  { name: "Bengaluru",  sub: "Event capital of the south", img: "https://beta.venuebook.in/img/Bengaluru.dc2ad72e.jpg"  },
  { name: "Mysuru",     sub: "Royal venues & heritage",    img: "https://beta.venuebook.in/img/Mysuru.ec341da8.jpg"     },
  { name: "Mangaluru",  sub: "Coastal charm & culture",   img: "https://beta.venuebook.in/img/Mangaluru.268c4f41.jpg"  },
  { name: "Hubballi",   sub: "Corporate & community",     img: "https://beta.venuebook.in/img/Hubballi.87cebd76.jpg"   },
  { name: "Udupi",      sub: "Beach venues & resorts",    img: "https://beta.venuebook.in/img/Udupi.acdc1b2f.jpg"      },
];

export default function DestinationSection() {
  return (
    <section className="w-full py-10">

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Top Destinations in Karnataka
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Explore venues in Karnataka's most popular cities
        </p>
      </div>

      {/*
        Mobile  → flex-wrap (2-col), no scroll
        Desktop → horizontal scroll carousel
      */}
      <div
        className="flex flex-wrap gap-3 overflow-visible sm:flex-nowrap sm:gap-4 sm:overflow-x-auto sm:scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {destinations.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer group w-[calc(50%-6px)] sm:w-[200px] md:w-[220px]"
            style={{ height: 160 }}
          >
            <img
              src={item.img}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-3 start-3 end-3">
              <h3 className="text-white font-bold text-sm leading-snug">{item.name}</h3>
              <p className="text-white/65 text-xs mt-0.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
