"use client";

import { useState } from "react";
import { Calendar, Users, ChevronDown } from "lucide-react";

export default function CreateBooking() {
  const [shift, setShift] = useState("evening");

  return (
    <div className="space-y-6">
      
      {/* PAGE TITLE */}
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create Booking
        </h1>
        <p className="text-sm text-gray-500">
          Fill event details and confirm booking
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-2">
        
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-6">

          {/* EVENT CARD */}
          <div className="mb-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">

            {/* TOP STRIP */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl px-4 py-3 flex justify-between text-sm">
              <span>📅 Order Date: 28-March-2026</span>
              <span>Form ID: INV0006</span>
            </div>

            {/* INPUT GRID */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* DATE */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Event Date</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>

              {/* SHIFT */}
              <div>
                <label className="text-xs text-gray-500">Event Shift</label>
                <div className="flex gap-2 mt-1">
                  {["afternoon", "evening"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setShift(item)}
                      className={`flex-1 py-2 rounded-xl text-sm capitalize transition ${
                        shift === item
                          ? "bg-purple-600 text-white shadow"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* EVENT TYPE */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Event Type</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2">
                  <input
                    placeholder="Select Event Type"
                    className="w-full outline-none text-sm"
                  />
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              {/* GUEST */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Guest Capacity</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2">
                  <Users size={16} className="text-gray-400 mr-2" />
                  <input
                    placeholder="e.g. 200"
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* CHILD VENUES */}
            <div className="border border-dashed rounded-xl p-6 text-center text-sm text-gray-500">
              Pick a date and shift to see available venues
            </div>
          </div>


          {/* SERVICE PROVIDER DETAILS */}
          <div className="mb-2  bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-medium text-gray-700">Service Provider Details</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input className="input" placeholder="Name of the Caterer" />
              <input className="input" placeholder="Name of the Decorator" />
              <input className="input" placeholder="Name of Sound system person" />
              <input className="input" placeholder="Name of Music/Dance troupe" />
            </div>
          </div>


          {/* ADDONS */}
          <div className="mb-2  bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-medium text-gray-700">Add-Ons</h2>

            <div className="grid md:grid-cols-2 gap-4">

              {/* ADDON CARD */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  Image
                </div>

                <div className="text-sm">
                  <p className="font-medium">Catering</p>
                  <p className="text-gray-500">₹6,000 / total</p>
                </div>

                <button className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg text-sm">
                  Add
                </button>
              </div>

            </div>
          </div>


          {/* SPECIAL REQUEST */}
          <div className="mb-2  bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-medium text-gray-700">Special Request</h2>

            <textarea
              rows={5}
              placeholder="Write any special requirements..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>


          {/* CUSTOMER CARD */}
          <div className="mb-2  bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-medium text-gray-700">Customer Details</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Are you booking for yourself?
              </span>
              <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input className="input" placeholder="Phone Number" />
              <input className="input" placeholder="Name" />
              <input className="input" placeholder="Email" />
            </div>
          </div>
        </div>


        {/* RIGHT SUMMARY */}
        <div className="sticky top-6 h-fit">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">

            <h2 className="font-semibold text-gray-800">Summary</h2>

            <div className="space-y-2 text-sm">
              <Row label="Base Price" value="₹0" />
              <Row label="Subtotal" value="₹0" />
              <Row label="GST (18%)" value="₹0" />

              <div className="border-t border-t-gray-200 pt-2 flex justify-between font-semibold text-purple-600">
                <span>Grand Total</span>
                <span>₹0</span>
              </div>

              <Row label="Security Deposit" value="₹0" />
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-3">
              <button className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition">
                Proceed
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-100 py-2 rounded-xl text-sm">
                  Quotation
                </button>
                <button className="bg-gray-100 py-2 rounded-xl text-sm">
                  Save Draft
                </button>
              </div>

              <button className="w-full bg-red-500 text-white py-2 rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT STYLE */}
      <style jsx>{`
        .input {
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
        }
        .input:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
