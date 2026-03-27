"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import VenueCard from './components/VenueCard'

export default function ListingPage() {
  const [search, setSearch] = useState("");

  const venues = [
    {
      id:1,
      name: "Royal Palace",
      location: "Bangalore",
      status: "ACTIVE",
      guests: 500,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    },
    {
      id:2,
      name: "Sunset Garden",
      location: "Mysore",
      status: "INACTIVE",
      guests: 200,
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    },
  ];

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-0 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Venue Listings
        </h1>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 backdrop-blur-xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm shadow">
          All
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white border text-sm">
          Active
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white border text-sm">
          Inactive
        </button>
      </div>

      {/* GRID */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue, i) => (
            <VenueCard key={i} venue={venue} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg">No venues found</p>
      <p className="text-sm">Try adjusting your search</p>
    </div>
  );
}
