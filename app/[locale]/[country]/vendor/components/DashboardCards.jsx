"use client";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, TrendingUp, Clock, ChevronRight } from "lucide-react";

const BAR_COLORS = [
  "bg-red-500 dark:bg-red-400",
  "bg-amber-400 dark:bg-amber-300",
  "bg-blue-500 dark:bg-blue-400",
  "bg-emerald-500 dark:bg-emerald-400",
];

const CARD = [
  "bg-white dark:bg-[#0f172a]",
  "border border-gray-200/80 dark:border-white/[0.06]",
  "rounded-xl shadow-sm dark:shadow-black/20 transition-shadow duration-300 p-5 flex flex-col",
].join(" ");

export default function DashboardCards({ agingData, bookings }) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">

      {/* Aging Report */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Aging Report</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">By days</span>
        </div>
        <div className="space-y-3 flex-1">
          {agingData.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.percentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                />
              </div>
            </div>
          ))}
        </div>
        {agingData.length === 0 && <Empty icon={TrendingUp} label="No aging data" sub="Report will appear here" />}
      </motion.div>

      {/* Bookings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <BookOpen size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Bookings</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Last 5</span>
        </div>
        {bookings.length > 0 ? (
          <div className="space-y-1.5 flex-1 max-h-72 overflow-y-auto pr-0.5">
            {bookings.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-7 h-7 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {b.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">{b.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">#{b.id} · {b.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{b.amount.toLocaleString("en-IN")}</span>
                  <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Empty icon={BookOpen} label="No bookings yet" sub="Recent bookings will appear here" />
        )}
      </motion.div>

      {/* Reservations */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              <Clock size={15} className="text-rose-500 dark:text-rose-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reservations</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Last 5</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl">
            <AlertCircle size={28} className="text-rose-300 dark:text-rose-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No reservations</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Reservations will appear here once created</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

function Empty({ icon: Icon, label, sub }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
        <Icon size={26} className="text-gray-300 dark:text-gray-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
