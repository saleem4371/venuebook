"use client";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";

const ROW_COLORS = [
  "bg-violet-50  dark:bg-violet-950/25 border-violet-100  dark:border-violet-900/40 text-violet-700  dark:text-violet-300",
  "bg-sky-50     dark:bg-sky-950/25    border-sky-100     dark:border-sky-900/40    text-sky-700     dark:text-sky-300",
  "bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "bg-amber-50   dark:bg-amber-950/25  border-amber-100   dark:border-amber-900/40  text-amber-700   dark:text-amber-300",
  "bg-rose-50    dark:bg-rose-950/25   border-rose-100    dark:border-rose-900/40   text-rose-700    dark:text-rose-300",
  "bg-indigo-50  dark:bg-indigo-950/25 border-indigo-100  dark:border-indigo-900/40 text-indigo-700  dark:text-indigo-300",
];

export default function ResponsiveSummaryCards({ data }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] rounded-xl shadow-sm dark:shadow-black/20 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
            <BarChart2 size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Online & Offline Summary</h2>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-1">
        {["Category", "Offline", "Online", "Total"].map((h, i) => (
          <span key={h} className={`text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide ${i > 0 ? "text-center" : ""}`}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2 overflow-y-auto max-h-[300px]">
        {data.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`grid grid-cols-4 gap-2 items-center px-3 py-2.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${ROW_COLORS[i % ROW_COLORS.length]}`}
          >
            <span className="text-xs font-medium truncate">{row.category}</span>
            {[row.offline, row.online, row.total].map((val, j) => (
              <div key={j} className="flex items-center justify-center">
                <span className={`text-sm font-bold ${j === 2 ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>{val}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
