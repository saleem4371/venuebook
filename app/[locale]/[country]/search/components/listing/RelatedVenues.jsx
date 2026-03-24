"use client";

import { useRef } from "react";

export default function RelatedVenues() {
  const scrollRef = useRef(null);

  const venues = [
    {
      id: 1,
      name: "Luxury Stay",
      price: "₹2,500",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    },
    {
      id: 2,
      name: "Modern Apartment",
      price: "₹1,800",
      image:
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    },
    {
      id: 3,
      name: "Cozy Room",
      price: "₹1,200",
      image:
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    },
    {
      id: 4,
      name: "Hill Villa",
      price: "₹3,500",
      image:
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
    },
  ];

  return (
    <div className="w-full mt-10">

      {/* HEADER */}
      <h2 className="text-lg sm:text-2xl font-semibold px-4 sm:px-0 mb-4">
        Related Venues
      </h2>

      {/* 🔥 IMPORTANT: FULL WIDTH ON MOBILE */}
      <div className="relative">

        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto
            px-4 sm:px-0
            snap-x snap-mandatory
            scroll-smooth
            no-scrollbar
          "
        >
          {venues.map((v) => (
            <div
              key={v.id}
              className="
                flex-shrink-0
                w-[80%]
                sm:w-[60%]
                md:w-[45%]
                lg:w-[23%]
                snap-start
              "
            >
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                
                {/* IMAGE */}
                <div className="h-40 w-full">
                  <img
                    src={v.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-3">
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-gray-500 text-xs">{v.price}</p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
