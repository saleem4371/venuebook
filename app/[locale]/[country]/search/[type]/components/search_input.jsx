"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Search, X } from "lucide-react";

const suggestedDestinations = [
  { title: "Nearby", subtitle: "Find what’s around you" },
  { title: "Bengaluru, Puducherry", subtitle: "Because your wishlist has stays in Bengaluru" },
  { title: "Udupi, Karnataka", subtitle: "Near you" },
  { title: "North Goa, Goa", subtitle: "Because your wishlist has stays in North Goa" },
  { title: "Candolim, Goa", subtitle: "For its seaside allure" },
];

export default function AirbnbTopOverlay({ onSearch }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const incrementGuest = (type) =>
    setGuests({ ...guests, [type]: guests[type] + 1 });
  const decrementGuest = (type) =>
    setGuests({ ...guests, [type]: Math.max(0, guests[type]) });

  const handleSearch = () => {
    if (!location || !dates.checkIn || !dates.checkOut) return;
    onSearch({ location, dates, guests });
    setModalOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <div className="w-full max-w-2xl mx-auto ">
        <div
          onClick={() => setModalOpen(true)}
          className="cursor-pointer flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-all duration-200"
        >
          <span>{location || "Search destinations"}</span>
          <Search size={16} />
        </div>
      </div>

      {/* Top overlay modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="absolute top-0 left-0 w-full bg-white shadow-xl rounded-b-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-b-gray-200">
                <h2 className="text-lg font-semibold">Search</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="hover:bg-gray-100 p-1 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-6">

                {/* Location */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-pink-400 transition-all duration-200"
                  />
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        {suggestedDestinations
                          .filter((d) =>
                            d.title.toLowerCase().includes(location.toLowerCase())
                          )
                          .map((dest, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setLocation(dest.title);
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            >
                              <p className="font-medium text-sm">{dest.title}</p>
                              <p className="text-xs text-gray-500">{dest.subtitle}</p>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dates */}
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 p-3 rounded-xl hover:shadow-sm transition">
                    <Calendar size={16} className="text-gray-500" />
                    <input
                      type="date"
                      value={dates.checkIn}
                      onChange={(e) =>
                        setDates({ ...dates, checkIn: e.target.value })
                      }
                      className="outline-none text-sm w-full"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 p-3 rounded-xl hover:shadow-sm transition">
                    <Calendar size={16} className="text-gray-500" />
                    <input
                      type="date"
                      value={dates.checkOut}
                      onChange={(e) =>
                        setDates({ ...dates, checkOut: e.target.value })
                      }
                      className="outline-none text-sm w-full"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="border border-gray-200 p-3 rounded-xl relative">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowGuestPicker((prev) => !prev)}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{guests.adults + guests.children + guests.infants} guests</span>
                    </div>
                    <motion.span
                      animate={{ rotate: showGuestPicker ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-500"
                    >
                      ▼
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {showGuestPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-2"
                      >
                        {["adults", "children", "infants"].map((type) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="capitalize">{type}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decrementGuest(type)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100 transition"
                              >
                                -
                              </button>
                              <span>{guests[type]}</span>
                              <button
                                onClick={() => incrementGuest(type)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  className="bg-pink-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-all text-sm"
                >
                  <Search size={16} /> Search
                </motion.button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}