"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Star,
  Heart,
} from "lucide-react";

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

export default function WishlistPage() {
  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const categories = [
    {
      id: 1,
      name: "Wedding Halls",
      image:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
      count: 12,
    },
    {
      id: 2,
      name: "Resorts",
      image:
        "https://images.unsplash.com/photo-1501117716987-c8e1ecb2102d",
      count: 8,
    },
    {
      id: 3,
      name: "Banquet Halls",
      image:
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
      count: 15,
    },
  ];

  const venues = useMemo(
    () => [
      {
        id: 1,
        name: "Royal Palace",
        price: "₹2.5L",
        rating: 4.9,
        lat: 15.36,
        lng: 75.12,
        image:
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
      },
      {
        id: 2,
        name: "Grand Hall",
        price: "₹1.8L",
        rating: 4.7,
        lat: 15.31,
        lng: 75.71,
        image:
          "https://images.unsplash.com/photo-1469371670807-013ccf25f16a",
      },
      {
        id: 3,
        name: "Luxury Garden",
        price: "₹3.2L",
        rating: 4.8,
        lat: 12.97,
        lng: 77.59,
        image:
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
      },
    ],
    []
  );

  

  return (
    <div className="min-h-screen bg-[#f6f7fb] pt-24">

      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-zinc-900">
            My Wishlist
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Saved venues by category
          </p>
        </div>

        {/* CATEGORY GRID */}
        {!selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="
                  cursor-pointer
                  bg-white
                  border border-zinc-200
                  rounded-3xl
                  overflow-hidden
                  hover:shadow-xl
                  transition
                "
              >
                <div className="h-44 relative">

                  <img
                    src={cat.image}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-[18px] font-semibold">
                      {cat.name}
                    </h2>

                    <p className="text-[12px] opacity-80">
                      {cat.count} saved venues
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAIL VIEW */}
        {selectedCategory && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* LEFT: VENUES */}
            <div className="xl:col-span-5">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-semibold">
                  {selectedCategory.name}
                </h2>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[12px] text-zinc-500"
                >
                  Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {venues.map((v) => (
                  <div
                    key={v.id}
                    className="
                      bg-white
                      border border-zinc-200
                      rounded-2xl
                      overflow-hidden
                      hover:shadow-lg
                      transition
                    "
                  >
                    <img
                      src={v.image}
                      className="h-32 w-full object-cover"
                    />

                    <div className="p-4">

                      <h3 className="text-[14px] font-semibold">
                        {v.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-[12px] text-zinc-500">
                        <MapPin size={12} />
                        Bijapur
                      </div>

                      <div className="flex items-center justify-between mt-3">

                        <span className="text-[13px] font-medium">
                          {v.price}
                        </span>

                        <div className="flex items-center gap-1 text-[12px] text-amber-600">
                          <Star size={12} />
                          {v.rating}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* RIGHT: MAP */}
            <div className="xl:col-span-7">

              <div className="sticky top-10 h-[85vh] rounded-3xl overflow-hidden border border-zinc-200 bg-white">

                  <GoogleMap
                    center={{ lat: 15.36, lng: 75.12 }}
                    zoom={6}
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {venues.map((v) => (
                      <Marker
                        key={v.id}
                        position={{ lat: v.lat, lng: v.lng }}
                      />
                    ))}
                  </GoogleMap>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}