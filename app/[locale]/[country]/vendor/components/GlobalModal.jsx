"use client";
import {useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useUI } from "@/context/VendorUIContext";

export default function GlobalModal({ open, onClose, children }) {
  if (typeof window === "undefined") return null;

const { setIsModalOpen } = useUI();

  useEffect(() => {
    setIsModalOpen(open);
    return () => setIsModalOpen(false);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999]">

          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MOBILE → BOTTOM SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
              absolute bottom-0 w-full bg-white rounded-t-3xl p-6 shadow-2xl
              md:hidden
            "
          >
            {/* DRAG HANDLE */}
            <div className="w-25 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            {children}
          </motion.div>

          {/* DESKTOP → CENTER MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              hidden md:block
              absolute top-1/2 left-1/2 w-[420px]
              -translate-x-1/2 -translate-y-1/2
            "
          >
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6">
              
              {/* OPTIONAL CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="cursor-pointer absolute top-3 right-3  hover:bg-gray-100  w-8 h-8 rounded-full "
              >
                ✕
              </button>

              {children}
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}