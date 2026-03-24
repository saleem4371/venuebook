"use client";

import { motion } from "framer-motion";

export default function AdvertiseBanner() {
  return (
    <section className="w-full overflow-hidden">
      
      <div className="relative w-full h-[250px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
        
        {/* Background Image */}
        <img
          src="https://beta.venuebook.in/img/top_venues_image.d6f9bad3.jpg" // replace with your image
          alt="Advertise Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold text-xl sm:text-2xl md:text-4xl"
          >
            Advertise your venue to visitors
          </motion.h2>

          <p className="text-gray-200 mt-2 text-sm sm:text-base md:text-lg max-w-2xl">
            Reach social, wedding and corporate clients on India's #1 venue hire marketplace.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-5 py-2 sm:px-6 sm:py-3 rounded-lg 
                       bg-gradient-to-r from-blue-500 to-purple-500 
                       text-white font-medium shadow-lg"
          >
            How it Works For Venues
          </motion.button>

        </div>
      </div>

    </section>
  );
}