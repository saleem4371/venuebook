"use client";

/* ══════════════════════════════════════════════════════════════════
   CREATE BOOKING WORKSPACE
   Full 5-section booking creation form + pricing summary sidebar.
   Refactored from bookings/new/page.jsx into an internal workspace.
   All sections, fields, and action buttons preserved.
══════════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Users, ChevronDown,
  CalendarCheck, Building2, Package, FileText,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── Shared input style ────────────────────────────────────── */
const INPUT_CLS =
  "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "outline-none focus:border-violet-400 dark:focus:border-violet-500 " +
  "focus:ring-2 focus:ring-violet-500/20 transition";

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-5"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-950/40">
          <Icon size={15} className="text-violet-500" aria-hidden="true" />
        </div>
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Summary row ───────────────────────────────────────────── */
function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className={`flex justify-between text-sm ${highlight ? "font-bold text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export default function CreateBookingWorkspace() {
  const [shift,    setShift]    = useState("evening");
  const [selfBook, setSelfBook] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      {/* Workspace header */}
      <div className="pb-1 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Create Booking</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Fill event details, add service providers and confirm booking</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* ── LEFT — Form sections ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* § 1 · EVENT DETAILS */}
          <Section icon={CalendarCheck} title="Event Details">

            {/* Order info strip */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl px-4 py-3 flex flex-wrap justify-between gap-2 text-sm font-medium">
              <span>📅 Order Date: 28-March-2026</span>
              <span>Form ID: INV0006</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              {/* Event Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Date</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <Calendar size={15} className="text-gray-400 dark:text-gray-500 me-2 shrink-0" />
                  <input type="date" className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              {/* Event Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Shift</label>
                <div className="flex gap-2">
                  {["afternoon", "evening"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShift(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm capitalize font-medium transition-all ${
                        shift === s
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Type</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <input placeholder="Select Event Type" className="flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  <ChevronDown size={15} className="text-gray-400 shrink-0" />
                </div>
              </div>

              {/* Guest Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guest Capacity</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <Users size={15} className="text-gray-400 me-2 shrink-0" />
                  <input type="number" placeholder="e.g. 200" className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
              </div>
            </div>

            {/* Child venues picker */}
            <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/40">
              Pick a date and shift to see available venues
            </div>
          </Section>

          {/* § 2 · SERVICE PROVIDER DETAILS */}
          <Section icon={Building2} title="Service Provider Details">
            <div className="grid md:grid-cols-2 gap-4">
              <input className={INPUT_CLS} placeholder="Name of the Caterer" />
              <input className={INPUT_CLS} placeholder="Name of the Decorator" />
              <input className={INPUT_CLS} placeholder="Name of Sound system person" />
              <input className={INPUT_CLS} placeholder="Name of Music/Dance troupe" />
            </div>
          </Section>

          {/* § 3 · ADD-ONS */}
          <Section icon={Package} title="Add-Ons">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-800/40">
                <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  Image
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Catering</p>
                  <p className="text-gray-500 dark:text-gray-400">₹6,000 / total</p>
                </div>
                <button className="w-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 py-2 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </Section>

          {/* § 4 · SPECIAL REQUEST */}
          <Section icon={FileText} title="Special Request">
            <textarea
              rows={5}
              placeholder="Write any special requirements..."
              className={`${INPUT_CLS} resize-none`}
            />
          </Section>

          {/* § 5 · CUSTOMER DETAILS */}
          <Section icon={Users} title="Customer Details">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Are you booking for yourself?</span>
              <button
                type="button"
                role="switch"
                aria-checked={selfBook}
                onClick={() => setSelfBook((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${selfBook ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${selfBook ? "start-5" : "start-0.5"}`} />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <input className={INPUT_CLS} placeholder="Phone Number" type="tel"   />
              <input className={INPUT_CLS} placeholder="Name"         type="text"  />
              <input className={INPUT_CLS} placeholder="Email"        type="email" />
            </div>
          </Section>
        </div>

        {/* ── RIGHT — Pricing summary sidebar ──────────────── */}
        <div className="sticky top-[140px] h-fit">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 space-y-4"
          >
            <h2 className="font-bold text-gray-800 dark:text-gray-100">Summary</h2>

            <div className="space-y-2.5">
              <SummaryRow label="Base Price"      value="₹0" />
              <SummaryRow label="Subtotal"        value="₹0" />
              <SummaryRow label="GST (18%)"       value="₹0" />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <SummaryRow label="Grand Total" value="₹0" highlight />
              </div>
              <SummaryRow label="Security Deposit" value="₹0" />
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => toast.success("Proceeding with booking…")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Proceed
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toast("Opening quotation…")}
                  className="py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Quotation
                </button>
                <button
                  onClick={() => toast.success("Draft saved!")}
                  className="py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Save Draft
                </button>
              </div>

              <button
                onClick={() => toast.error("Booking closed")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 transition-colors text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
