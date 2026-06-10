"use client";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ChevronRight } from "lucide-react";

const METRICS = [
  { label: "Security Held",      value: "₹2,45,000", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30"   },
  { label: "Pending Payments",   value: "₹78,500",   color: "text-red-500    dark:text-red-400",    bg: "bg-red-50    dark:bg-red-950/30"      },
  { label: "Upcoming Refunds",   value: "₹12,000",   color: "text-amber-600  dark:text-amber-400",  bg: "bg-amber-50  dark:bg-amber-950/30"    },
  { label: "Outstanding",        value: "₹35,200",   color: "text-sky-600    dark:text-sky-400",    bg: "bg-sky-50    dark:bg-sky-950/30"      },
  { label: "Available Balance",  value: "₹1,82,300", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Total Recognised",   value: "₹3,20,000", color: "text-gray-700   dark:text-gray-200",  bg: "bg-gray-50   dark:bg-white/[0.04]"    },
];

export default function WalletFinance() {
  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 p-4 sm:p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
            <Wallet size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Wallet & Finance</h3>
        </div>
        <button className="flex items-center gap-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">
          Finance Report <ChevronRight size={12} />
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-3 ${m.bg}`}
          >
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 leading-tight">
              {m.label}
            </p>
            <p className={`text-[15px] font-black leading-none ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
        >
          <Wallet size={13} /> Go to Transactions
        </button>
        <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
          <ArrowUpRight size={13} /> Finance
        </button>
      </div>

    </div>
  );
}
