"use client";
import { motion } from "framer-motion";
import { Target, ChevronRight } from "lucide-react";

const STAGES = [
  { label: "New Lead",       count: 24, value: "₹4,80,000", color: "#6366f1", pct: 100 },
  { label: "Contacted",      count: 18, value: "₹3,60,000", color: "#0ea5e9", pct: 75  },
  { label: "Quote Sent",     count: 12, value: "₹2,40,000", color: "#f59e0b", pct: 50  },
  { label: "Negotiation",    count: 8,  value: "₹1,60,000", color: "#f97316", pct: 33  },
  { label: "Reserved",       count: 5,  value: "₹1,00,000", color: "#a44bf3", pct: 21  },
  { label: "Converted",      count: 3,  value: "₹60,000",   color: "#10b981", pct: 13  },
  { label: "Lost",           count: 4,  value: "₹80,000",   color: "#ef4444", pct: 17  },
];

const SUMMARY = [
  { label: "Pipeline Value",  value: "₹9,80,000", color: "text-violet-600  dark:text-violet-400"  },
  { label: "Conversion Rate", value: "12.5%",      color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Avg Deal Size",   value: "₹20,000",    color: "text-sky-600     dark:text-sky-400"     },
  { label: "Lost Deals",      value: "4",           color: "text-red-500     dark:text-red-400"     },
];

export default function LeadsTracker() {
  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 p-4 sm:p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-50 dark:bg-violet-950/40 rounded-lg">
            <Target size={14} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Leads Pipeline</h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">24 active leads · 12.5% conversion rate</p>
          </div>
        </div>
        <button className="flex items-center gap-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">
          View All <ChevronRight size={12} />
        </button>
      </div>

      {/* Pipeline board — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage, i) => (
            <motion.button
              key={stage.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2.5 w-[92px] group"
            >
              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: stage.color }}
                />
              </div>

              {/* Count badge */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[14px] shadow-md"
                style={{ background: stage.color }}
              >
                {stage.count}
              </motion.div>

              {/* Labels */}
              <div className="text-center">
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-snug">{stage.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{stage.value}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
        {SUMMARY.map(s => (
          <div key={s.label}
            className="flex-1 min-w-[80px] bg-gray-50 dark:bg-white/[0.03] rounded-xl p-2.5 text-center border border-gray-100 dark:border-white/[0.05]">
            <p className={`text-[14px] font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
