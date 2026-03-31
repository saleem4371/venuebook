"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Settings, Calendar, CreditCard, FileText } from "lucide-react";

/* ---------------- MAIN ---------------- */

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    paxPricing: true,
    bookingDefaultView: false,
    venuePricing: true,
    calendarPricing: true,
    quoteCalendar: false,
    membership: false,
    multiVenue: true,
  });

  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    // 💾 simulate autosave
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings size={20} /> Settings
        </h1>

        {/* SAVE STATUS */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full"
            >
              Saved ✓
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        <GlassCard title="Pricing" icon={<CreditCard size={16} />}>
          <ToggleRow label="Pax Pricing" value={settings.paxPricing} onChange={() => toggle("paxPricing")} />
          <ToggleRow label="Default Booking View" value={settings.bookingDefaultView} onChange={() => toggle("bookingDefaultView")} />
          <ToggleRow label="Venue Pricing" value={settings.venuePricing} onChange={() => toggle("venuePricing")} />
        </GlassCard>

        <GlassCard title="Calendar" icon={<Calendar size={16} />}>
          <ToggleRow label="Display Pricing" value={settings.calendarPricing} onChange={() => toggle("calendarPricing")} />
          <ToggleRow label="Quote on Calendar" value={settings.quoteCalendar} onChange={() => toggle("quoteCalendar")} />
        </GlassCard>

        <GlassCard title="Bookings" icon={<Settings size={16} />}>
          <ToggleRow label="Membership Required" value={settings.membership} onChange={() => toggle("membership")} />
          <ToggleRow label="Multiple Venue Booking" value={settings.multiVenue} onChange={() => toggle("multiVenue")} />
        </GlassCard>

        <GlassCard title="Quotation" icon={<FileText size={16} />}>
          <InputRow label="Reminder Days" placeholder="5" />
          <InputRow label="Quote Name" placeholder="Quotation" />
        </GlassCard>

      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function GlassCard({ title, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="
        relative p-5 rounded-2xl
        bg-white/40 backdrop-blur-xl
        border border-white/30
        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
        transition
      "
    >
      {/* glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 bg-white/60 rounded-lg shadow-sm">
          {icon}
        </div>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="space-y-4 relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

/* ---------------- TOGGLE ---------------- */

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
        {label}
      </span>

      <button
        onClick={onChange}
        className={`
          relative w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300
          ${value
            ? "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-lg shadow-indigo-300/40"
            : "bg-gray-300"}
        `}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-4 h-4 bg-white rounded-full shadow-md"
        />

        {value && (
          <span className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md"></span>
        )}
      </button>
    </div>
  );
}

/* ---------------- INPUT ---------------- */

function InputRow({ label, placeholder }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700">{label}</span>

      <input
        type="text"
        placeholder={placeholder}
        className="
          w-28 text-right px-3 py-1.5 text-sm
          rounded-xl border border-white/30
          bg-white/60 backdrop-blur-md
          focus:outline-none focus:ring-2 focus:ring-indigo-400
          transition
        "
      />
    </div>
  );
}