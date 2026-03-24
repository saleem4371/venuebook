"use client";

import { motion } from "framer-motion";

const destinations = [
  { name: "Bengaluru", img: "https://beta.venuebook.in/img/Bengaluru.dc2ad72e.jpg" },
  { name: "Mysuru", img: "https://beta.venuebook.in/img/Mysuru.ec341da8.jpg" },
  { name: "Mangaluru", img: "https://beta.venuebook.in/img/Mangaluru.268c4f41.jpg" },
  { name: "Hubballi", img: "https://beta.venuebook.in/img/Hubballi.87cebd76.jpg" },
  { name: "Udupi", img: "https://beta.venuebook.in/img/Udupi.acdc1b2f.jpg" },
];

export default function DestinationSection() {
  return (
    <section className="w-full overflow-hidden bg-gray-50 py-12">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
            Top Destinations in Karnataka
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Explore venues in Karnataka's most popular cities
          </p>
        </div>

        {/* Grid */}
        <div className="
          grid gap-4
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
        ">
          
          {destinations.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.04 }}
              className="relative rounded-xl overflow-hidden cursor-pointer group"
            >
              
              {/* Image */}
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-40 md:h-44 object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

              {/* Text */}
              <div className="absolute bottom-3 left-3">
                <h3 className="text-white font-semibold text-sm md:text-base">
                  {item.name}
                </h3>
                <p className="text-gray-200 text-xs">
                  Karnataka
                </p>
              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}