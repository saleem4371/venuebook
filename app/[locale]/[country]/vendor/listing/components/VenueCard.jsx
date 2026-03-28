"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VenueCard({ venue }) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const basePath = `/${params?.locale}/${params?.country}/vendor/listing`;

  // 🔥 PREFETCH (instant feel)
  useEffect(() => {
    if (venue?.id) {
      router.prefetch(`${basePath}/${venue.id}`);
    }
  }, [venue?.id]);

  // 🔥 SMOOTH NAVIGATION
  const editor_open = (id) => {
    setLoading(true);

    setTimeout(() => {
      router.push(`${basePath}/${id}`);
    }, 180);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={venue.image}
            alt=""
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* STATUS */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-xs rounded-full bg-black/70 text-white backdrop-blur-md">
              ● {venue.status}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-3">
          {/* TITLE */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">
              {venue.name}
            </h3>
            <p className="text-sm text-gray-500">{venue.location}</p>
          </div>

          {/* ADDRESS */}
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {venue.address}
          </p>

          {/* STATS */}
          <div className="flex gap-3">
            <StatBox label="Guests" value={venue.guests} />
            <StatBox label="Leads" value={venue.leads} />
          </div>

          {/* BUTTON */}
          <PremiumButton onClick={() => editor_open(venue.id)}>
            Editor
          </PremiumButton>
        </div>
      </motion.div>

      {/* 🔥 LOADER OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-10 w-10 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500">
                Opening editor...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200 text-center hover:shadow-sm transition">
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function PremiumButton({
  children,
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-2 rounded-xl text-sm font-medium
        bg-gradient-to-r from-indigo-500 to-purple-500
        text-white shadow-sm
        transition-all duration-300
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}
