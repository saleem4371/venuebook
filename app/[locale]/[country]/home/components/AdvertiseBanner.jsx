"use client";

import { motion } from "framer-motion";

const DEFAULT_HEADING = "Advertise your space on VenueBook";
const DEFAULT_SUBTEXT = "Reach thousands of event planners, travellers and creators on India's #1 venue hire marketplace.";

export default function AdvertiseBanner({
  heading = DEFAULT_HEADING,
  subtext  = DEFAULT_SUBTEXT,
}) {
  return (
    <section className="w-full overflow-hidden">

      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[360px]">

        {/* Background Image */}
        <img
          src="https://beta.venuebook.in/img/top_venues_image.d6f9bad3.jpg"
          alt="Advertise Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">

          <motion.h2
            key={heading}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white font-bold text-xl sm:text-2xl md:text-3xl max-w-2xl"
          >
            {heading}
          </motion.h2>

          <motion.p
            key={subtext}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-gray-200 mt-2 text-sm sm:text-base max-w-xl"
          >
            {subtext}
          </motion.p>

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