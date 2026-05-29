"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

export default function BookingCard() {
  const [guests, setGuests] = useState(1);
  const [openSheet, setOpenSheet] = useState(false);

  const handleReserve = () => {
    if (guests < 1) {
      toast.error("Please select valid guests");
      return;
    }
    toast.success("Booking successful 🎉");
  };

  return (

      <>
        {/* DESKTOP RIGHT CARD */}
        <div className="hidden md:block sticky top-24 h-fit transition-all">
          <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4">

            <div className="bg-gray-100 text-sm px-3 py-2 rounded-lg">
              🏷️ This host is offering a discount
            </div>
            

            <div>
              <span className="line-through text-gray-400 mr-2">₹23,976</span>
              <span className="font-semibold text-lg">₹19,181</span>
              <span className="text-gray-500 text-sm"> for 24 nights</span>
            </div>

            <div className="border rounded-xl overflow-hidden text-sm">
              <div className="grid grid-cols-2 border-b">
                <div className="p-3 border-r">
                  <p className="text-xs text-gray-500">CHECK-IN</p>
                  <p>4/9/2026</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">CHECKOUT</p>
                  <p>5/3/2026</p>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">GUESTS</p>
                  <p>{guests} guest</p>
                </div>
                <ChevronDown />
              </div>
            </div>

            <button
              onClick={handleReserve}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-full"
            >
              Reserve
            </button>
          </div>
        </div>

      {/* MOBILE FIXED BUTTON */}
      <div className="md:hidden fixed bottom-4 left-4 right-4">
        <button
          onClick={() => setOpenSheet(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-full shadow-lg"
        >
          Reserve
        </button>
      </div>

      {/* MOBILE BOTTOM SHEET */}
      <AnimatePresence>
        {openSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenSheet(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-50"
            >
              <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Book your stay</h2>
                <X onClick={() => setOpenSheet(false)} />
              </div>

              <div className="mb-4">
                <span className="line-through text-gray-400 mr-2">₹23,976</span>
                <span className="font-semibold">₹19,181</span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span>Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 border rounded-full"
                  >
                    -
                  </button>
                  <span>{guests}</span>
                  <button
                    onClick={() => setGuests(guests + 1)}
                    className="w-8 h-8 border rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleReserve}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-full"
              >
                Confirm
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
  );
}
