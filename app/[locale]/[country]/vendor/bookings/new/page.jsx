"use client";

import { useState } from "react";
import {
  Calendar, Users, ChevronDown,
  CalendarCheck, Building2, Package, FileText, Layers,
} from "lucide-react";

/* ── Shared input class ───────────────────────────────────── */
const INPUT_CLS = `
  w-full border border-gray-200 dark:border-gray-700
  rounded-xl px-3 py-2.5 text-sm
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  outline-none
  focus:border-violet-400 dark:focus:border-violet-500
  focus:ring-2 focus:ring-violet-500/20
  transition
`.replace(/\s+/g, " ").trim();

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ icon: Icon, title, iconColor = "text-violet-500", children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-950/40`}>
          <Icon size={15} className={iconColor} aria-hidden="true" />
        </div>
        <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Summary row ──────────────────────────────────────────── */
function Row({ label, value, highlight = false }) {
  return (
    <div className={`flex justify-between text-sm ${highlight ? "font-bold text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function CreateBooking() {
  const [shift,      setShift]      = useState("evening");
  const [selfBook,   setSelfBook]   = useState(false);
  const [booking,   setBooking]   = useState('');

  const orderDate = booking?.created_at
  ? new Date(booking.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-5">

      {/* ── Page title ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          Create Booking
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
          Fill event details and confirm booking
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* ── LEFT — Form sections ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* 1 · EVENT DETAILS */}
          <Section icon={CalendarCheck} title="Event Details">

            {/* Order info strip */}
           <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl px-4 py-3 flex flex-wrap justify-between gap-2 text-sm font-medium">
  <span>📅 Order Date e: {orderDate}</span>
  <span>Form ID: {booking?.invoice_no ?? booking?.id ?? "-"}</span>
</div>

            {/* Input grid */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Event Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Date</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <Calendar size={15} className="text-gray-400 dark:text-gray-500 me-2 shrink-0" aria-hidden="true" />
                  <input
                    type="date"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Event Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Shift</label>
                <div className="flex gap-2">
                  {["afternoon", "evening"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setShift(item)}
                      className={`flex-1 py-2.5 rounded-xl text-sm capitalize font-medium transition-all ${
                        shift === item
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Type</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <input
                    placeholder="Select Event Type"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <ChevronDown size={15} className="text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
                </div>
              </div>

              {/* Guest Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guest Capacity</label>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
                  <Users size={15} className="text-gray-400 dark:text-gray-500 me-2 shrink-0" aria-hidden="true" />
                  <input
                    placeholder="e.g. 200"
                    type="number"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Child venues picker */}
            <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/40">
              Pick a date and shift to see available venues
            </div>
          </Section>


          {/* 2 · SERVICE PROVIDER DETAILS */}
          <Section icon={Building2} title="Service Provider Details">
            <div className="grid md:grid-cols-2 gap-4">
              <input className={INPUT_CLS} placeholder="Name of the Caterer" />
              <input className={INPUT_CLS} placeholder="Name of the Decorator" />
              <input className={INPUT_CLS} placeholder="Name of Sound system person" />
              <input className={INPUT_CLS} placeholder="Name of Music/Dance troupe" />
            </div>
          </Section>


          {/* 3 · ADD-ONS */}
          <Section icon={Package} title="Add-Ons">
            <div className="grid md:grid-cols-2 gap-4">

              {/* Addon card */}
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


          {/* 4 · SPECIAL REQUEST */}
          <Section icon={FileText} title="Special Request">
            <textarea
              rows={5}
              placeholder="Write any special requirements..."
              className={`${INPUT_CLS} resize-none`}
            />
          </Section>


          {/* 5 · CUSTOMER DETAILS */}
          <Section icon={Users} title="Customer Details">

            {/* Self-booking toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Are you booking for yourself?
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={selfBook}
                onClick={() => setSelfBook((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                  selfBook ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    selfBook ? "start-5" : "start-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input className={INPUT_CLS} placeholder="Phone Number"  type="tel"   />
              <input className={INPUT_CLS} placeholder="Name"          type="text"  />
              <input className={INPUT_CLS} placeholder="Email"         type="email" />
            </div>
          </Section>

        </div>


        {/* ── RIGHT — Summary sidebar ──────────────────────── */}
        <div className="sticky top-6 h-fit">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 space-y-4">

            <h2 className="font-bold text-gray-800 dark:text-gray-100">Summary</h2>

            <div className="space-y-2.5">
              <Row label="Base Price"      value="₹0" />
              <Row label="Subtotal"        value="₹0" />
              <Row label="GST (18%)"       value="₹0" />

              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <Row label="Grand Total" value="₹0" highlight />
              </div>

              <Row label="Security Deposit" value="₹0" />
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-1">
              <button className="
                w-full py-2.5 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-violet-600 to-indigo-600
                text-white shadow-sm hover:opacity-90 transition-opacity
              ">
                Proceed
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="
                  py-2.5 rounded-xl text-sm font-medium
                  bg-gray-100 dark:bg-gray-800
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                ">
                  Quotation
                </button>
                <button className="
                  py-2.5 rounded-xl text-sm font-medium
                  bg-gray-100 dark:bg-gray-800
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                ">
                  Save Draft
                </button>
              </div>

              <button className="
                w-full py-2.5 rounded-xl text-sm font-semibold
                bg-red-500 hover:bg-red-600 transition-colors
                text-white
              ">
                Close
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
