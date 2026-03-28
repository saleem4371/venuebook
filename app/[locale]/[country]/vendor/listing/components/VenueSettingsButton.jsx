"use client";

import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VenueSettingsButton({
  progress = 0,
  allComplete = false,
}) {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const basePath = `/${params?.locale}/${params?.country}/vendor/listing/${params?.id}/venue_setting`;

  // 🔥 Prefetch
  useEffect(() => {
    if (basePath) router.prefetch(basePath);
  }, [basePath, router]);

  // 🔥 Navigate
  const editor_open = () => {
    if (loading) return;

    setLoading(true);

    setTimeout(() => {
      router.push(basePath);
    }, 220);
  };

  // 🔵 Progress ring math
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.button
      onClick={editor_open}
      whileTap={{ scale: 0.95 }}
      animate={loading ? { opacity: 0.6 } : { opacity: 1 }}
      className="cursor-pointer relative flex items-center gap-2 text-sm text-gray-600 hover:text-black transition group"
    >
      {/* 🔵 Icon + Progress */}
      <div className="relative flex items-center justify-center">
        
        {/* Progress Ring */}
        <svg className="absolute w-7 h-7 -top-1 -left-1">
          <circle
            cx="12"
            cy="12"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="2"
            fill="none"
          />
          <motion.circle
            cx="12"
            cy="12"
            r={radius}
            stroke="black"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.4 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 90 }}
          animate={loading ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <Settings className="w-5 h-5" />
        </motion.div>

        {/* 🔴 Dot (only if NOT complete) */}
        {!allComplete && !loading && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative h-2.5 w-2.5 rounded-full bg-red-600"></span>
          </span>
        )}
      </div>

      {/* Text */}
      <span className="relative font-medium">
        {loading ? "Opening..." : "Venue Setting"}

        {/* Premium underline */}
        <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
      </span>

      {/* 🔥 Loader bar */}
      {loading && (
        <motion.div
          layoutId="loader"
          className="absolute bottom-0 left-0 h-[2px] bg-black w-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "left" }}
        />
      )}
    </motion.button>
  );
}