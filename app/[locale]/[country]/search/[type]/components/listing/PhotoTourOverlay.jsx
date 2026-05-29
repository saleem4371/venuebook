"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import ImageSlider from "./ImageSlider";

export default function PhotoTourOverlay({ images = [], onClose }) {
  const [active, setActive] = useState(0);

   const [index, setIndex] = useState(null);

  // ✅ Disable background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // demo grouping (replace with real API later)
  const sections = [
    {
      title: "Full kitchen",
      subtitle: "Kettle · Wine glasses",
      images: images.slice(0, 3),
    },
    {
      title: "Bedroom",
      subtitle: "King bed · Extra pillows",
      images: images.slice(2, 4),
    },
    {
      title: "Exterior",
      subtitle: "Garden · Outside view",
      images: images.slice(4, 6),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Photo tour</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* CATEGORY (RIGHT ALIGNED) */}
        <div className="px-4 md:px-8 py-3 flex justify-start">
          <div className="flex gap-3 overflow-x-auto">
            {sections.map((sec, i) => (
              <div
                key={i}
                onClick={() => {
                  setActive(i);
                  document
                    .getElementById(`section-${i}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="min-w-[90px] cursor-pointer"
              >
                <img
                  src={sec.images[0]}
                  className={`w-full h-16 object-cover rounded-lg transition ${
                    active === i ? "ring-2 ring-black" : ""
                  }`}
                />
                <p className="text-xs mt-1 text-center">{sec.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="px-4 md:px-8 py-6 space-y-12">
          {sections.map((section, idx) => (
            <div
              key={idx}
              id={`section-${idx}`}
              className="grid grid-cols-1 md:grid-cols-[500px_1fr] gap-6 items-start"
            >
              
              {/* LEFT TEXT (STICKY) */}
              <div className="md:sticky md:top-24">
                <h3 className="text-lg font-semibold">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {section.subtitle}
                </p>
              </div>

              {/* RIGHT IMAGES */}
              <div className="grid grid-cols-2 gap-3">
                {section.images.map((img, i) => (
                  <motion.div
                    key={i}
                    className="w-full h-[180px] md:h-[320px]"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover rounded-xl"
                       onClick={() => setIndex(i)}
                    />
                  </motion.div>
                ))}
              </div>

            </div>
          ))}

                {/* SLIDER */}
      {index !== null && (
        <ImageSlider
          images={images}
          index={index}
          setIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}