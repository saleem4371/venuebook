"use client";
import { useState } from 'react'
import { Search, Mail, Phone, MapPin, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const leads = [
  {
    name: "Sylvester Miranda",
    date: "11 Mar 2026",
    status: "CONFIRMED",
    email: "example@gmail.com",
    phone: "7760384559",
    venue: "Swarnagiri Mantap Indoors",
    guests: 2999,
    amount: "1,65,26,850",
    tag: "Afternoon",
  },
  {
    name: "Sylvester Miranda",
    date: "11 Mar 2026",
    status: "IN PROGRESS",
    email: "example@gmail.com",
    phone: "7760384559",
    venue: "Swarnagiri Mantap Indoors",
    guests: 2999,
    amount: "62,97,900",
    tag: "Afternoon",
  },
  {
    name: "Sylvester Miranda",
    date: "12 Mar 2026",
    status: "NEW",
    email: "example@gmail.com",
    phone: "7760384559",
    venue: "Swarnagiri Mantap Indoors",
    guests: 2999,
    amount: "62,97,900",
    tag: "Evening",
  },
];

const statusColor = {
  CONFIRMED: "bg-green-100 text-green-600",
  "IN PROGRESS": "bg-yellow-100 text-yellow-600",
  NEW: "bg-blue-100 text-blue-600",
};

export default function LeadsPage() {

    const [selectedLead, setSelectedLead] = useState(null);
    const [addLead, setAddLead] = useState(null);

  return (
   <div className="">
      <Toaster position="top-right" />

      {/* Stats */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-2 mb-6">
        {[
          { label: "Total Leads", value: 9 },
          { label: "New Leads", value: 7 },
          { label: "In Progress", value: 1 },
          { label: "Converted", value: 0 },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow hover:shadow-xl transition"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <h2 className="text-xl font-bold text-gray-800 mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow w-full">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            placeholder="Search leads by name, email, or venue..."
            className="w-full outline-none"
          />
        </div>

        <select className="bg-white rounded-xl px-4 py-2 shadow">
          <option>All Status</option>
          <option>Confirmed</option>
          <option>In Progress</option>
          <option>New</option>
        </select>
        <div>
            <button 
            className="rounded-xl px-4 py-2 shadow bg-indigo-600 text-white text-sm hover:bg-indigo-700" 
             onClick={() => setAddLead(true)}  >Add</button>
        </div>
      </div>

      {/* Lead Cards */}
      <div className="grid md:grid-cols-3 gap-2">
        {leads.map((lead, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition p-5 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {lead.name}
                </h3>
                <p className="text-sm text-gray-500">{lead.date}</p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[lead.status]}`}
              >
                {lead.status}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail size={14} /> {lead.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} /> {lead.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} /> {lead.venue}
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-between mt-4 border-t pt-3">
              <div>
                <p className="font-semibold">{lead.guests}</p>
                <p className="text-xs text-gray-500">Guests</p>
              </div>
              <div>
                <p className="font-semibold">{lead.amount}</p>
                <p className="text-xs text-gray-500">Amount</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
                {lead.tag}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="px-3 py-1 rounded-lg border text-sm flex items-center gap-1 hover:bg-gray-100"
                >
                  <Eye size={14} /> View
                </button>

                <button
                  onClick={() => toast.success("Managing Booking 🚀")}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    {addLead && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* BACKGROUND BLUR */}
    <div
      className="absolute inset-0 backdrop-blur-2xl bg-black/40"
      onClick={() => setAddLead(false)}
    ></div>

    {/* MODAL */}
    <div className="relative z-10 w-[95%] md:w-[500px]">

      {/* Glow Border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-6 animate-modal">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Lead
          </h2>

          <button
            onClick={() => setAddLead(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* Name */}
          <input
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Email */}
          <input
            placeholder="Email Address"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Phone */}
          <input
            placeholder="Phone Number"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Venue */}
          <input
            placeholder="Venue Name"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Guests */}
          <input
            type="number"
            placeholder="Number of Guests"
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Status */}
          <select className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none">
            <option>NEW</option>
            <option>IN PROGRESS</option>
            <option>CONFIRMED</option>
          </select>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => setAddLead(false)}
            className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.success("Lead Added 🚀");
              setAddLead(false);
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:scale-105 transition"
          >
            Save Lead
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    
    {selectedLead && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* FULL BACKGROUND BLUR */}
    <div
      className="absolute inset-0 backdrop-blur-xl bg-black/30"
      onClick={() => setSelectedLead(null)}
    ></div>

    {/* MODAL (NO BLUR HERE) */}
    <div className="relative z-10 w-[95%] md:w-[500px]">

      {/* Glow Border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-6 animate-modal">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Lead Details
          </h2>

          <button
            onClick={() => setSelectedLead(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Name</span>
            <span>{selectedLead.name}</span>
          </div>

          <div className="flex justify-between">
            <span>Date</span>
            <span>{selectedLead.date}</span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>
            <span>{selectedLead.status}</span>
          </div>

          <div className="border-t"></div>

          <p className="flex gap-2">
            <Mail size={14} /> {selectedLead.email}
          </p>

          <p className="flex gap-2">
            <Phone size={14} /> {selectedLead.phone}
          </p>

          <p className="flex gap-2">
            <MapPin size={14} /> {selectedLead.venue}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setSelectedLead(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>

    
  );
}