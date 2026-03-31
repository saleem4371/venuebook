"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Users,
  Building,
  IndianRupee,
} from "lucide-react";

export default function BookingDashboard() {
  const [openRow, setOpenRow] = useState(null);
  const [search, setSearch] = useState("");

  const data = [
    {
      id: 6706,
      name: "Sylvester",
      amount: 39616,
      date: "10-Apr-2026",
      venue: "Swarnagiri Mantap Indoors",
      status: "Booked",
      payments: [
        { type: "Security Deposit", amount: 117 },
        { type: "Base Price", amount: 29500 },
      ],
    },
    {
      id: 2484,
      name: "Rahul",
      amount: 35517,
      date: "31-Mar-2026",
      venue: "Main Hall",
      status: "Pending",
      payments: [],
    },
  ];

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-4 bg-gradient-to-br from-gray-100 to-white ">

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={<IndianRupee />} title="₹2.5Cr" subtitle="Revenue" />
        <StatCard icon={<Calendar />} title="117" subtitle="Bookings" />
        <StatCard icon={<Users />} title="20" subtitle="Customers" />
        <StatCard icon={<Building />} title="2" subtitle="Venues" />
      </div>

      {/* ---------- FILTER ---------- */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl px-3 py-2 w-full md:w-80 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search customer..."
            className="bg-transparent outline-none text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="px-4 py-2 rounded-2xl border bg-white/70 backdrop-blur-xl shadow-sm">
          <option>All Time</option>
        </select>

        <select className="px-4 py-2 rounded-2xl border bg-white/70 backdrop-blur-xl shadow-sm">
          <option>All Venues</option>
        </select>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-7 px-6 py-4 text-xs font-semibold text-gray-500 border-b bg-white/70 backdrop-blur sticky top-0">
          <span>Ref</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Venue</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {filtered.map((row) => {
            const isOpen = openRow === row.id;

            return (
              <div key={row.id} className="border-b last:border-none">

                <motion.div
                  layout
                  className="grid grid-cols-7 px-6 py-4 items-center hover:bg-white/50 transition cursor-pointer"
                  onClick={() => setOpenRow(isOpen ? null : row.id)}
                >
                  <span className="text-indigo-600 font-medium">{row.id}</span>
                  <span>{row.name}</span>
                  <span className="font-semibold">₹{row.amount}</span>
                  <span>{row.date}</span>
                  <span className="truncate">{row.venue}</span>
                  <StatusBadge status={row.status} />
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </motion.div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/40 px-8 pb-4"
                    >
                      {row.payments.map((p, i) => (
                        <div key={i} className="flex justify-between py-1 text-sm">
                          <span>{p.type}</span>
                          <span>₹{p.amount}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- MOBILE CARD LIST ---------- */}
      <div className="md:hidden space-y-3">
        {filtered.map((row) => {
          const isOpen = openRow === row.id;

          return (
            <motion.div
              key={row.id}
              layout
              className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow"
            >
              {/* TOP */}
              <div
                className="flex justify-between items-center"
                onClick={() => setOpenRow(isOpen ? null : row.id)}
              >
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.date}</p>
                </div>

                <StatusBadge status={row.status} />
              </div>

              {/* DETAILS */}
              <div className="mt-2 text-sm text-gray-600">
                ₹{row.amount} • {row.venue}
              </div>

              {/* COLLAPSE */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0 }}
                    className="mt-3 pt-3 border-t"
                  >
                    {row.payments.length === 0 ? (
                      <p className="text-xs text-gray-400">No payments</p>
                    ) : (
                      row.payments.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span>{p.type}</span>
                          <span>₹{p.amount}</span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

/* ---------- STATUS ---------- */
function StatusBadge({ status }) {
  const styles = {
    Booked: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

/* ---------- STAT CARD ---------- */
function StatCard({ icon, title, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="
        bg-white/70 backdrop-blur-2xl
        border border-white/40
        rounded-2xl p-4 shadow-sm
        flex items-center gap-3
      "
    >
      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-base md:text-lg font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}