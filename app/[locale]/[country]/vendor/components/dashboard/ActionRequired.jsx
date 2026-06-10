"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, CreditCard, CheckCircle, FileText, DollarSign, ChevronRight } from "lucide-react";

const ALERTS = [
  { id: 1, level: "critical", Icon: Clock,        text: "3 enquiries expiring in less than 4 hours",       action: "View Enquiries"  },
  { id: 2, level: "critical", Icon: CreditCard,   text: "2 pending payments past due date",                action: "View Payments"   },
  { id: 3, level: "medium",   Icon: CheckCircle,  text: "1 booking awaiting confirmation",                 action: "Confirm Now"     },
  { id: 4, level: "medium",   Icon: FileText,     text: "5 quotations awaiting customer response",         action: "View Quotes"     },
  { id: 5, level: "low",      Icon: DollarSign,   text: "Security deposit refund pending for #2484",       action: "Process Refund"  },
];

const LEVEL = {
  critical: {
    wrap:   "bg-red-50   dark:bg-red-950/20   border border-red-100   dark:border-red-900/30",
    icon:   "bg-red-100  dark:bg-red-900/40   text-red-600   dark:text-red-400",
    action: "text-red-600   dark:text-red-400",
  },
  medium: {
    wrap:   "bg-amber-50  dark:bg-amber-950/20  border border-amber-100  dark:border-amber-900/30",
    icon:   "bg-amber-100 dark:bg-amber-900/40  text-amber-600 dark:text-amber-400",
    action: "text-amber-600 dark:text-amber-400",
  },
  low: {
    wrap:   "bg-blue-50   dark:bg-blue-950/20   border border-blue-100   dark:border-blue-900/30",
    icon:   "bg-blue-100  dark:bg-blue-900/40   text-blue-600  dark:text-blue-400",
    action: "text-blue-600  dark:text-blue-400",
  },
};

export default function ActionRequired() {
  const criticalCount = ALERTS.filter(a => a.level === "critical").length;

  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 p-4 sm:p-5 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 dark:bg-red-950/40 rounded-lg">
            <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Action Required</h3>
        </div>
        {criticalCount > 0 && (
          <span className="text-[10.5px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
            {criticalCount} critical
          </span>
        )}
      </div>

      {/* Alerts */}
      <div className="space-y-2 flex-1">
        {ALERTS.map((alert, i) => {
          const sty = LEVEL[alert.level];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${sty.wrap}`}
            >
              <div className={`flex-shrink-0 p-1.5 rounded-lg ${sty.icon}`}>
                <alert.Icon size={13} />
              </div>
              <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 flex-1 leading-snug min-w-0">
                {alert.text}
              </p>
              <button className={`flex-shrink-0 flex items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap ${sty.action}`}>
                {alert.action} <ChevronRight size={11} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
