"use client";

import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // 🔥 Dynamic Slots (simulate API)
  const generateSlots = (date) => {
    const seed = dayjs(date).date();

    return {
      morning: { price: 800, available: seed % 2 !== 0 },
      afternoon: { price: 1000, available: seed % 3 !== 0 },
      evening: { price: 1200, available: seed % 5 !== 0 },
    };
  };

  // 🔥 Status Logic
  const getDateStatus = (date) => {
    const slots = generateSlots(date);

    const total = Object.keys(slots).length;
    const booked = Object.values(slots).filter((s) => !s.available).length;

    if (booked === total) return "full";
    if (booked > 0) return "partial";
    return "available";
  };

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const days = [];

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isPast = (day) =>
    currentMonth.date(day).isBefore(dayjs(), "day");

  const handleDateClick = (day) => {
    const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
    const status = getDateStatus(dateStr);

    if (isPast(day)) {
      return toast.error("Past date not allowed");
    }

    setSelectedDate(dateStr);
    setSelectedSlot(null);

    if (status === "full") {
      toast.error("Fully booked");
    } else if (status === "partial") {
      toast("Some slots booked", { icon: "⚠️" });
    } else {
      toast.success("All slots available");
    }
  };

  const slots = selectedDate ? generateSlots(selectedDate) : null;

  const years = Array.from({ length: 10 }, (_, i) =>
    dayjs().year() + i
  );

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* 🔥 CALENDAR */}
        <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() =>
                setCurrentMonth(currentMonth.subtract(1, "month"))
              }
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              ←
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">
                {currentMonth.format("MMMM")}
              </span>

              <select
                value={currentMonth.year()}
                onChange={(e) =>
                  setCurrentMonth(
                    currentMonth.year(parseInt(e.target.value))
                  )
                }
                className="border rounded-md px-2 py-1 text-sm"
              >
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() =>
                setCurrentMonth(currentMonth.add(1, "month"))
              }
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              →
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
            {weekDays.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              if (!day) return <div key={i} />;

              const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
              const status = getDateStatus(dateStr);

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-full text-sm transition cursor-pointer

                  ${isPast(day) ? "text-gray-300" : ""}

                  ${
                    status === "full"
                      ? "bg-red-100 text-red-500"
                      : status === "partial"
                      ? "bg-yellow-100 text-yellow-600"
                      : ""
                  }

                  ${
                    selectedDate === dateStr
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }
                  `}
                >
                  {day}

                  {/* Dot */}
                  {!isPast(day) && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                        ${
                          status === "full"
                            ? "bg-red-500"
                            : status === "partial"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }
                      `}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-black rounded-full"></span> Selected
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Available
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Partial
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> Full
            </div>
          </div>
        </div>

        {/* 🔥 SLOT PANEL */}
        <div className="p-5 lg:p-6">

          <h3 className="text-lg font-semibold mb-4">
            {selectedDate
              ? dayjs(selectedDate).format("dddd, MMM D")
              : "Select a date"}
          </h3>

          <div className="space-y-3">
            {slots &&
              ["morning", "afternoon", "evening"].map((slot) => (
                <div
                  key={slot}
                  className={`flex justify-between items-center p-4 rounded-xl border border-gray-200 transition
                  ${
                    selectedSlot === slot
                      ? "border-black bg-gray-50"
                      : "hover:shadow-sm"
                  }
                  `}
                >
                  <div>
                    <p className="font-medium capitalize">{slot}</p>
                    <p className="text-sm text-gray-500">
                      ₹{slots[slot].price}
                    </p>
                  </div>

                  {slots[slot].available ? (
                    <button
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 text-sm rounded-lg cursor-pointer
                        ${
                          selectedSlot === slot
                            ? "bg-black text-white"
                            : "bg-gray-100"
                        }`}
                    >
                      {selectedSlot === slot ? "Selected" : "Select"}
                    </button>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">
                      Booked
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
