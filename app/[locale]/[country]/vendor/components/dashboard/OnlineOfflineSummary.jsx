"use client";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const SUMMARY = [
  { label: "Bookings",  online: 19,    offline: 21,    total: 40    },
  { label: "Revenue",   online: 68000, offline: 52000, total: 120000, currency: true },
  { label: "Events",    online: 40,    offline: 40,    total: 80    },
  { label: "Leads",     online: 0,     offline: 80,    total: 80    },
];

const LEAD_SOURCES = [
  { name: "VenueBook",    value: 45, color: "#7c3aed" },
  { name: "Direct Calls", value: 20, color: "#0ea5e9" },
  { name: "Walk-ins",     value: 10, color: "#10b981" },
  { name: "Referrals",    value: 15, color: "#f59e0b" },
  { name: "Google",       value: 10, color: "#ef4444" },
];

function fmt(v, currency) {
  if (!currency) return v;
  return `₹${(v / 1000).toFixed(0)}K`;
}

/* ─── Donut tooltip ─────────────────────────────────────────────────────────── */
function DonutTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/[0.10] rounded-xl px-2.5 py-2 text-xs shadow-xl">
      <p className="font-bold mb-0.5" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-gray-500 dark:text-gray-400">{d.value}%</p>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function OnlineOfflineSummary() {
  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 p-4 sm:p-5">

      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
          <BarChart2 size={14} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Online vs Offline</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Summary table */}
        <div>
          <div className="grid grid-cols-4 gap-2 mb-2 px-1">
            {["Metric","Online","Offline","Total"].map((h, i) => (
              <span key={h}
                className={`text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide ${i > 0 ? "text-center" : ""}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="space-y-1.5">
            {SUMMARY.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-4 gap-2 items-center px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]"
              >
                <span className="text-[11.5px] font-medium text-gray-600 dark:text-gray-400 truncate">{row.label}</span>
                <span className="text-[12px] font-bold text-center text-violet-600 dark:text-violet-400">{fmt(row.online, row.currency)}</span>
                <span className="text-[12px] font-bold text-center text-gray-700 dark:text-gray-300">{fmt(row.offline, row.currency)}</span>
                <span className="text-[12px] font-black text-center text-gray-900 dark:text-white">{fmt(row.total, row.currency)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lead sources donut */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Lead Sources</p>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0" style={{ width: 96, height: 96 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={LEAD_SOURCES} cx="50%" cy="50%"
                    innerRadius={26} outerRadius={44}
                    paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {LEAD_SOURCES.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              {LEAD_SOURCES.map(s => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{s.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
