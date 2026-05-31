"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users, CalendarDays, MapPin, Pencil,
} from "lucide-react";

import { useVendorCategory } from "@/context/VendorCategoryContext";

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM VENUE CARD
   - Full-bleed cover image with cinematic gradient overlay
   - Glassmorphism status badge
   - Hover: shadow bloom + image scale + subtle lift
   - Dark mode aware
   - Bottom section: stats + Editor CTA
───────────────────────────────────────────────────────────────────────────── */
export default function VenueCard({ venue }) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

   const { activeCategory } = useVendorCategory();

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  const basePath = `/${params?.locale}/${params?.country}/vendor/listing`;

  useEffect(() => {
    if (venue?.id) router.prefetch(`${basePath}/${venue.id}`);
  }, [venue?.id]);

  const openEditor = (id) => {
    setLoading(true);
    setTimeout(() => router.push(`${basePath}/${id}?category=${activeCategory}`), 160);
  };

  const isActive = venue.status === 1;


  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.005 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="
          group relative isolate w-full flex flex-col
          rounded-2xl overflow-hidden
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-white/[0.06]
          shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]
          hover:shadow-[0_20px_56px_rgba(99,102,241,0.16),0_8px_24px_rgba(0,0,0,0.10)]
          dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]
         dark:hover:shadow-[0_10px_30px_rgba(139,92,246,0.18)]
          transition-all duration-500  
        "
      >
        {/* ── IMAGE AREA ── */}
        <div className="relative aspect-[16/10] overflow-hidden shrink-0 bg-black">

          {/* Fix rendering gaps */}
  <div className="absolute inset-0 overflow-hidden ">

          {/* Shimmer skeleton while loading */}
          <AnimatePresence>
            {!imgLoaded && (
              <motion.div
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
              />
            )}
          </AnimatePresence>

          <img
            src={`${BASE_URL}/${venue.image}`}
            alt={venue.name}
            onLoad={() => setImgLoaded(true)}
  className="
  absolute inset-0 block
  w-full h-full object-cover
  will-change-transform
  scale-[1.01]
  transition-transform duration-700 ease-out
  group-hover:scale-[1.06]
"
style={{
  transformOrigin: "center center",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  transform: "translate3d(0,0,0)",
}}
          />

          {/* Cinematic gradient overlay — bottom ⅔ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Status badge — glass pill top-right */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5
              rounded-full backdrop-blur-md
              text-[10px] font-bold tracking-wider
              border
              ${isActive
                ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                : "bg-red-500/20 border-red-400/30 text-red-300"
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
              {isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          {/* Title + address over image */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
            <h3 className="
              text-[17px] font-bold text-white leading-snug line-clamp-2
              drop-shadow-sm
              group-hover:text-violet-200 transition-colors duration-300
            ">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin size={11} className="text-white/60 shrink-0" />
              <p className="text-[11px] text-white/60 line-clamp-1 leading-tight">
                {venue.address}
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* ── CARD BODY ── */}
        <div className="
  relative flex flex-col flex-1
  px-5 pt-4 pb-5
  bg-white dark:bg-[#0f172a]
  before:absolute before:top-0 before:left-0 before:right-0
  before:h-[2px]
  before:bg-white dark:before:bg-[#0f172a]
  before:-translate-y-[1px]
  ">

          {/* Parent label */}
          <p className="text-[11px] font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-4">
            {venue.parentName}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatChip
              icon={<Users size={13} className="text-violet-500 dark:text-violet-400" />}
              value={venue.guests ?? 0}
              label="Guests"
              iconBg="bg-violet-50 dark:bg-violet-500/10"
            />
            <StatChip
              icon={<CalendarDays size={13} className="text-emerald-500 dark:text-emerald-400" />}
              value={venue.leads ?? 0}
              label="Leads"
              iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            />
          </div>

          {/* Editor CTA */}
          <button
            onClick={() => openEditor(venue.id)}
            className="
              w-full flex items-center justify-center gap-2
              py-[11px] rounded-xl
              text-[13px] font-semibold text-white
              bg-gradient-to-r from-violet-600 to-indigo-500
              hover:from-violet-700 hover:to-indigo-600
              shadow-[0_2px_12px_rgba(139,92,246,0.30)]
              hover:shadow-[0_6px_22px_rgba(139,92,246,0.46)]
              active:scale-[0.97]
              transition-all duration-200 cursor-pointer
            "
          >
            <Pencil size={13} />
            Edit Listing
          </button>
        </div>
      </motion.div>

      {/* ── GLOBAL PAGE TRANSITION LOADER ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Backdrop blur layer */}
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/80 backdrop-blur-xl" />

            {/* Loader pill */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative flex flex-col items-center gap-4"
            >
              {/* Gradient ring spinner */}
              <div className="relative w-14 h-14">
                <svg className="animate-spin w-14 h-14" viewBox="0 0 56 56">
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none" stroke="url(#spinGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="100 52"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-[5px] rounded-full bg-white dark:bg-gray-950" />
              </div>

              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-800 dark:text-white">
                  Opening Editor
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 max-w-[160px] truncate">
                  {venue.name}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CHIP
───────────────────────────────────────────────────────────────────────────── */
function StatChip({ icon, value, label, iconBg }) {
  return (
    <div className="
      flex items-center gap-3 px-3.5 py-3
      rounded-xl border border-gray-100 dark:border-white/[0.06]
      bg-gray-50/60 dark:bg-white/[0.03]
    ">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[18px] font-bold text-gray-900 dark:text-white leading-none tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-[3px]">
          {label}
        </p>
      </div>
    </div>
  );
}
