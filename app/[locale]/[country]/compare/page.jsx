"use client";

import { useState } from "react";
import { X, Plus, Star, MapPin, CheckCircle2 } from "lucide-react";

export default function ComparePage() {
  const [venues, setVenues] = useState([
    {
      id: 1,
      name: "Royal Palace",
      price: 250000,
      rating: 4.9,
      location: "Bijapur",
      capacity: 500,
      image:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
    },
    {
      id: 2,
      name: "Grand Hall",
      price: 180000,
      rating: 4.7,
      location: "Hubli",
      capacity: 350,
      image:
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
    },
    {
      id: 3,
      name: "Luxury Garden",
      price: 320000,
      rating: 4.8,
      location: "Bangalore",
      capacity: 700,
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
    },
  ]);

  const bestPrice = Math.min(...venues.map((v) => v.price));
  const bestRating = Math.max(...venues.map((v) => v.rating));

  return (
    <div className="min-h-screen bg-[#f6f7fb] pt-24">

      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-[34px] font-semibold tracking-tight text-zinc-900">
            Compare Venues
          </h1>

          <p className="text-[13px] text-zinc-500 mt-2">
            Compare up to 4 venues and choose the best option
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {venues.map((v) => (
            <div
              key={v.id}
              className="
              bg-white
              border border-zinc-200
              rounded-3xl
              overflow-hidden
              shadow-sm
              hover:shadow-xl
              transition-all
              group
            "
            >

              {/* IMAGE */}
              <div className="relative h-44 overflow-hidden">

                <img
                  src={v.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
                  <X size={16} />
                </button>

                {/* BEST BADGE */}
                {v.price === bestPrice && (
                  <div className="absolute bottom-3 left-3 bg-green-600 text-white text-[11px] px-3 py-1 rounded-full">
                    Best Price
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-5">

                <h2 className="text-[16px] font-semibold text-zinc-900">
                  {v.name}
                </h2>

                <div className="flex items-center gap-2 text-[12px] text-zinc-500 mt-1">
                  <MapPin size={12} />
                  {v.location}
                </div>

                <div className="flex items-center justify-between mt-4">

                  <div>
                    <p className="text-[11px] text-zinc-400">Price</p>
                    <p className="text-[15px] font-semibold">
                      ₹{v.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-zinc-400">Rating</p>
                    <div className="flex items-center gap-1 text-amber-600 font-medium text-[13px]">
                      <Star size={14} className="fill-amber-500" />
                      {v.rating}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {/* EMPTY SLOT */}
          {Array.from({ length: 4 - venues.length }).map((_, i) => (
            <div
              key={i}
              className="
              border-2 border-dashed border-zinc-300
              rounded-3xl
              h-[260px]
              flex flex-col items-center justify-center
              bg-white
              hover:bg-zinc-50
              transition
            "
            >
              <Plus className="text-zinc-400" />
              <p className="text-[13px] text-zinc-500 mt-2">
                Add Venue
              </p>
            </div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        <div className="mt-10 bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">

          {/* HEADER */}
          <div className="p-6 border-b bg-zinc-50">
            <h2 className="text-[18px] font-semibold text-zinc-900">
              Detailed Comparison
            </h2>
            <p className="text-[12px] text-zinc-500 mt-1">
              Compare features side by side
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="sticky top-0 bg-white border-b">

                <tr>
                  <th className="p-4 text-left text-zinc-500">
                    Features
                  </th>

                  {venues.map((v) => (
                    <th key={v.id} className="p-4 text-left">
                      <div className="text-[14px] font-semibold text-zinc-900">
                        {v.name}
                      </div>
                    </th>
                  ))}
                </tr>

              </thead>

              <tbody className="text-[13px]">

                {/* PRICE */}
                <tr className="border-t">
                  <td className="p-4 text-zinc-500">Price</td>

                  {venues.map((v) => (
                    <td key={v.id} className="p-4 font-medium">
                      <span
                        className={
                          v.price === bestPrice
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ₹{v.price.toLocaleString()}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* RATING */}
                <tr className="border-t">
                  <td className="p-4 text-zinc-500">Rating</td>

                  {venues.map((v) => (
                    <td key={v.id} className="p-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span
                          className={
                            v.rating === bestRating
                              ? "text-green-600 font-semibold"
                              : ""
                          }
                        >
                          {v.rating}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* LOCATION */}
                <tr className="border-t">
                  <td className="p-4 text-zinc-500">Location</td>
                  {venues.map((v) => (
                    <td key={v.id} className="p-4">
                      {v.location}
                    </td>
                  ))}
                </tr>

                {/* CAPACITY */}
                <tr className="border-t">
                  <td className="p-4 text-zinc-500">Capacity</td>
                  {venues.map((v) => (
                    <td key={v.id} className="p-4">
                      {v.capacity} Guests
                    </td>
                  ))}
                </tr>

                {/* RECOMMENDED */}
                <tr className="border-t">
                  <td className="p-4 text-zinc-500">Recommendation</td>

                  {venues.map((v) => (
                    <td key={v.id} className="p-4">
                      {v.price === bestPrice && v.rating === bestRating ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle2 size={14} />
                          Best Choice
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>

          </div>
        </div>

      </div>
    </div>
  );
}