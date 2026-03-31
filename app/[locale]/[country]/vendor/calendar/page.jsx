"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlobalModal from "../components/GlobalModal";
import { useUI } from "@/context/VendorUIContext";

export default function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState("A");
  const [isMultiple, setIsMultiple] = useState(false);
  const [venue, setVenue] = useState("Main Hall");


const { setIsModalOpen } = useUI();

useEffect(() => {
  setIsModalOpen(open);
}, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  // ✅ DEFAULT SHIFTS
  const defaultShifts = {
    M: { label: "Morning", price: 5000, status: "available" },
    A: { label: "Afternoon", price: 7000, status: "available" },
    E: { label: "Evening", price: 9000, status: "available" },
  };

  // ✅ MOCK DATA
  const bookingData = {
    "2026-03-28": {
      M: { label: "Morning", price: 5000, status: "available" },
      A: { label: "Afternoon", price: 7000, status: "partial" },
      E: { label: "Evening", price: 9000, status: "booked" },
    },
  };

  const formatKey = (date) => date?.toISOString().split("T")[0];

  // ⛔ DISABLE PAST
  const isPastDate = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // ⭐ TODAY
  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  };

  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const dates = [];
  for (let i = 0; i < start.getDay(); i++) dates.push(null);
  for (let i = 1; i <= end.getDate(); i++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const openModal = (date) => {
    if (!date || isPastDate(date)) return;
    setSelectedDate(date);
    setOpen(true);
  };

  const getStatusColor = (status) => {
    if (status === "available") return "bg-green-100 text-green-600";
    if (status === "partial") return "bg-yellow-100 text-yellow-600";
    if (status === "booked") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-500";
  };

  const getDotColor = (status) => {
    if (status === "available") return "bg-green-500";
    if (status === "partial") return "bg-yellow-400";
    if (status === "booked") return "bg-red-500";
    return "bg-gray-300";
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        {/* 🔥 HEADER (VENUE + MONTH + TOGGLE) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 border-b bg-white">

          {/* VENUE */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Venue</label>
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-indigo-400"
            >
              <option>Main Hall</option>
              <option>Banquet Hall</option>
              <option>Outdoor Lawn</option>
            </select>
          </div>

          {/* MONTH */}
          <div className="flex items-center justify-between md:justify-center gap-3 w-full md:w-auto">
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
              }
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft size={18} />
            </button>

            <h2 className="text-sm md:text-lg font-semibold">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
              }
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* TOGGLE */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Single</span>

            <button
              onClick={() => setIsMultiple((prev) => !prev)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                isMultiple ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <motion.div
                layout
                className="w-4 h-4 bg-white rounded-full shadow"
              />
            </button>

            <span className="text-xs text-gray-500">Multiple</span>
          </div>
        </div>

        {/* DAYS */}
        <div className="grid grid-cols-7 text-xs text-gray-500 px-3 pt-3">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center font-medium">{d}</div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-2 p-3 auto-rows-[100px] md:auto-rows-[130px]">
          {dates.map((date, i) => {
            const data = {
              ...defaultShifts,
              ...(bookingData[formatKey(date)] || {}),
            };

            return (
              <div
                key={i}
                onClick={() => openModal(date)}
                className={`
                  rounded-2xl border p-2 flex flex-col justify-between transition
                  ${isPastDate(date)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    : "bg-white hover:shadow-md cursor-pointer border-gray-200"}
                  ${isToday(date) ? "ring-2 ring-indigo-200 border-indigo-400" : ""}
                `}
              >
                <span className="text-xs md:text-sm font-medium">
                  {date?.getDate()}
                </span>

                {/* DESKTOP */}
               {date && (
  <div className="hidden md:flex flex-col gap-1">
    {Object.values(data).map((item, idx) => (
      <div
        key={idx}
        className={`text-xs px-2 py-1 rounded-lg flex justify-between ${getStatusColor(item.status)}`}
      >
        <span>{item.label}</span>
        <span>₹{item.price}</span>
      </div>
    ))}
  </div>
)}

                {/* MOBILE DOTS */}
               {date && (
  <div className="flex md:hidden justify-center gap-1 mt-2">
    {Object.values(data).map((item, idx) => (
      <span
        key={idx}
        className={`w-2.5 h-2.5 rounded-full ${getDotColor(item.status)}`}
      />
    ))}
  </div>
)}

                {isPastDate(date) && (
                  <span className="text-[10px] text-gray-400 text-center">
                    
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <GlobalModal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold text-center mb-5">
          {selectedDate?.toDateString()}
        </h2>

        <div className="space-y-3">
          {["M", "A", "E"].map((s) => (
            <button
              key={s}
              onClick={() => setShift(s)}
              className={`w-full flex justify-between px-4 py-3 rounded-xl ${
                shift === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              <span>{defaultShifts[s].label}</span>
              <span>₹{defaultShifts[s].price}</span>
            </button>
          ))}
        </div>

        <button className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl">
          Confirm Booking
        </button>
      </GlobalModal>
    </>
  );
}