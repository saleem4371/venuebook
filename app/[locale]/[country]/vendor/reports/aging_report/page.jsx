"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ---------------- DATA ---------------- */
const data = [
  { name: "Over Due", value: 16976137 },
  { name: "11–20 Days", value: 219146 },
  { name: "21–30 Days", value: 2106246 },
  { name: "30+ Days", value: 2514034 },
];

const COLORS = [
  "url(#greenGradient)",
  "url(#grayGradient)",
  "url(#orangeGradient)",
  "url(#redGradient)",
];

const tableData = [
  { id: 2338, total: 135930, outstanding: 135930, overdue: 0, d30: 135930 },
  { id: 9446, total: 33747, outstanding: 33747, overdue: 33747, d30: 0 },
  { id: 4926, total: 86847, outstanding: 86847, overdue: 86847, d30: 0 },
  { id: 5421, total: 86847, outstanding: 86847, overdue: 86847, d30: 0 },
];

/* ---------------- COMPONENT ---------------- */
export default function PremiumDashboard() {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(tableData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setFiltered(
        tableData.filter((item) =>
          item.id.toString().includes(search)
        )
      );
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      {/* FILTER (UNCHANGED) */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <select className="px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-200 text-sm">
          <option>All Time</option>
        </select>
      </div>

      {/* 🔥 TOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Total Revenue" value="₹2,57,34,878" icon="💳" />
            <Card title="Total Bookings" value="117" icon="📅" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CardSmall title="Pending Payments" value="₹2,18,15,563" />
            <CardSmall title="Cancelled" value="2" />
            <CardSmall title="Online" value="77" />
            <CardSmall title="Offline" value="40" />
          </div>
        </div>

        {/* RIGHT CHART */}
        <div className="lg:col-span-4">
          <div className="h-full p-5 rounded-2xl bg-white shadow-md border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Payment Overview
            </h2>

            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>

                  <linearGradient id="grayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cbd5f5" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>

                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>

                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip />

                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      

      {/* 🚀 PREMIUM GRID (REPLACES TABLE) */}
     {/* 🚀 PREMIUM TABLE-LIKE GRID */}
{loading ? (
  <Skeleton />
) : (
  <div className="mt-6">

    {/* DESKTOP */}
    <div className="hidden md:block rounded-3xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl">

      {/* HEADER (LIKE TABLE) */}
      <div className="grid grid-cols-5 px-6 py-4 text-xs font-semibold text-gray-500 border-b bg-white/60">
        <span>BR NO</span>
        <span>Total</span>
        <span>Outstanding</span>
        <span>Overdue</span>
        <span>30+</span>
      </div>

      {/* ROWS */}
      <div>
        {filtered.map((row, i) => (
          <motion.div
            key={i}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.5)" }}
            className="grid grid-cols-5 px-6 py-4 border-b last:border-none items-center transition"
          >
            <span className="font-semibold text-indigo-600">
              #{row.id}
            </span>

            <span className="font-medium text-gray-800">
              ₹{row.total.toLocaleString()}
            </span>

            <span className="text-gray-700">
              ₹{row.outstanding.toLocaleString()}
            </span>

            <span className="text-orange-500">
              {row.overdue ? `₹${row.overdue.toLocaleString()}` : "-"}
            </span>

            <span className="text-red-500">
              {row.d30 ? `₹${row.d30.toLocaleString()}` : "-"}
            </span>
          </motion.div>
        ))}
      </div>

    </div>

    {/* 📱 MOBILE (UNCHANGED GOOD UI) */}
    <div className="md:hidden space-y-4">
      {filtered.map((row, i) => (
        <motion.div
          key={i}
          whileTap={{ scale: 0.97 }}
          className="p-4 rounded-2xl bg-white shadow-md"
        >
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">BR NO</span>
            <span className="font-semibold">{row.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Total" value={row.total} />
            <Row label="Outstanding" value={row.outstanding} />
            <Row label="Overdue" value={row.overdue} />
            <Row label="30+" value={row.d30} />
          </div>
        </motion.div>
      ))}
    </div>

  </div>
)}

    </div>
  );
}

/* ---------------- SMALL ROW ---------------- */
function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">
        {value ? `₹${value.toLocaleString()}` : "-"}
      </span>
    </div>
  );
}

/* ---------------- SKELETON ---------------- */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 rounded-2xl bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ---------------- CARD ---------------- */
function Card({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl bg-white shadow-md border border-gray-200 flex items-center gap-4"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h2 className="text-lg font-semibold text-gray-800 mt-1">
          {value}
        </h2>
      </div>
    </motion.div>
  );
}

/* ---------------- SMALL CARD ---------------- */
function CardSmall({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded-xl bg-white shadow-sm border border-gray-200"
    >
      <p className="text-xs text-gray-500">{title}</p>
      <h2 className="text-sm font-semibold text-gray-800 mt-1">
        {value}
      </h2>
    </motion.div>
  );
}
