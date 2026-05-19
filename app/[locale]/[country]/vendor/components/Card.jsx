"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ACCENT = {
  Revenue:          { bg: "bg-purple-50  dark:bg-purple-950/30", icon: "text-violet-600 dark:text-violet-400",  glow: "hover:shadow-purple-100  dark:hover:shadow-purple-900/30"  },
  Users:            { bg: "bg-blue-50    dark:bg-blue-950/30",   icon: "text-sky-600    dark:text-sky-400",     glow: "hover:shadow-blue-100    dark:hover:shadow-blue-900/30"    },
  Bookings:         { bg: "bg-green-50   dark:bg-green-950/30",  icon: "text-emerald-600 dark:text-emerald-400",glow: "hover:shadow-green-100   dark:hover:shadow-green-900/30"   },
  Recognised:       { bg: "bg-orange-50  dark:bg-orange-950/30", icon: "text-amber-600  dark:text-amber-400",   glow: "hover:shadow-orange-100  dark:hover:shadow-orange-900/30"  },
  Advance:          { bg: "bg-pink-50    dark:bg-pink-950/30",   icon: "text-rose-600   dark:text-rose-400",    glow: "hover:shadow-pink-100    dark:hover:shadow-pink-900/30"    },
  "Total Views":    { bg: "bg-indigo-50  dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400",  glow: "hover:shadow-indigo-100  dark:hover:shadow-indigo-900/30"  },
  "Enquiry Clicks": { bg: "bg-cyan-50    dark:bg-cyan-950/30",   icon: "text-teal-600   dark:text-teal-400",    glow: "hover:shadow-cyan-100    dark:hover:shadow-cyan-900/30"    },
  "Venues Listed":  { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",icon: "text-fuchsia-600 dark:text-fuchsia-400",glow: "hover:shadow-fuchsia-100 dark:hover:shadow-fuchsia-900/30" },
};
const DEF = { bg: "bg-gray-50 dark:bg-gray-800/40", icon: "text-gray-500 dark:text-gray-400", glow: "hover:shadow-gray-100 dark:hover:shadow-gray-800/30" };

export default function GlassCard({ title, value, icon: Icon, trend, trendValue }) {
  const a = ACCENT[title] || DEF;

  const TIcon  = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const tColor = trend === "up"
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
    : trend === "down"
    ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
    : "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/40";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
      className={[
        "relative flex flex-col justify-between p-5 rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-900",
        "border border-gray-100 dark:border-gray-800",
        " hover:shadow-lg transition-all duration-300",
        a.glow,
      ].join(" ")}
    >
      {/* Glow blob */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06] blur-2xl bg-current pointer-events-none" aria-hidden="true" />

      {/* Top: icon + trend */}
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`p-2 rounded-xl ${a.bg}`}>
            <Icon size={16} className={a.icon} />
          </div>
        )}
        {trend && trendValue && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${tColor}`}>
            <TIcon size={11} />
            {trendValue}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">{value}</h2>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-widest">{title}</p>
      </div>
    </motion.div>
  );
}
