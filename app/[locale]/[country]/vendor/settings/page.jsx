"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Settings, Calendar, CreditCard, FileText, CheckCircle2 } from "lucide-react";

const BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";

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
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712]">
      <div className="space-y-6">

        {/* ── HEADER ─── matches Add-ons / Teams / Reservations ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                General Settings
              </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Configure your workspace preferences and business rules
            </p>
          </div>

          {/* Autosave indicator */}
          <AnimatePresence>
            {saving && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 px-3 py-1.5 rounded-full self-start shrink-0"
              >
                <CheckCircle2 size={12} />
                Changes saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SETTINGS GRID ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          <SettingsCard
            title="Pricing"
            description="Manage how pricing is displayed"
            icon={<CreditCard size={15} />}
          >
            <ToggleRow label="Pax Pricing"           value={settings.paxPricing}          onChange={() => toggle("paxPricing")} />
            <ToggleRow label="Venue Pricing"          value={settings.venuePricing}         onChange={() => toggle("venuePricing")} />
            <ToggleRow label="Default Booking View"   value={settings.bookingDefaultView}   onChange={() => toggle("bookingDefaultView")} />
          </SettingsCard>

          <SettingsCard
            title="Calendar"
            description="Calendar display and quoting"
            icon={<Calendar size={15} />}
          >
            <ToggleRow label="Display Pricing"   value={settings.calendarPricing}  onChange={() => toggle("calendarPricing")} />
            <ToggleRow label="Quote on Calendar" value={settings.quoteCalendar}    onChange={() => toggle("quoteCalendar")} />
          </SettingsCard>

          <SettingsCard
            title="Booking Rules"
            description="Access and venue control"
            icon={<Settings size={15} />}
          >
            <ToggleRow label="Membership Required"     value={settings.membership}  onChange={() => toggle("membership")} />
            <ToggleRow label="Multiple Venue Booking"  value={settings.multiVenue}  onChange={() => toggle("multiVenue")} />
          </SettingsCard>

          <SettingsCard
            title="Quotation"
            description="Quote naming and reminders"
            icon={<FileText size={15} />}
          >
            <InputRow label="Reminder Days" placeholder="5" />
            <InputRow label="Quote Name"    placeholder="Quotation" />
          </SettingsCard>

        </div>
      </div>
    </div>
  );
}

/* ─── CARD ─────────────────────────────────────────────────────── */

function SettingsCard({ title, description, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-white dark:bg-gray-900/70 border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-white/[0.10] transition-all duration-200 overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.025]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/[0.07] shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5 divide-y divide-gray-50 dark:divide-white/[0.04]">
        {children}
      </div>
    </motion.div>
  );
}

/* ─── TOGGLE ────────────────────────────────────────────────────── */

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 group">
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-150">
        {label}
      </span>

      <button
        onClick={onChange}
        aria-label={`Toggle ${label}`}
        style={{ background: value ? BRAND : undefined }}
        className={`relative w-10 h-[22px] rounded-full flex-shrink-0 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
          value
            ? "shadow-[0_0_12px_rgba(164,75,243,0.30)]"
            : "bg-gray-200 dark:bg-white/[0.12]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 550, damping: 32 }}
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
          style={{ left: value ? "21px" : "3px" }}
        />
      </button>
    </div>
  );
}

/* ─── INPUT ─────────────────────────────────────────────────────── */

function InputRow({ label, placeholder }) {
  return (
    <div className="flex items-center justify-between py-3.5 gap-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-24 text-right text-sm px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition duration-150"
      />
    </div>
  );
}