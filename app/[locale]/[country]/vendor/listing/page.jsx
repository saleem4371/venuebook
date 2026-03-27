"use client";

import { useState ,useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import VenueCard from "./components/VenueCard";

export default function ListingPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
const { locale, country } = useParams();
  const venues = [
    {
      id: 1,
      name: "Royal Palace",
      location: "Bangalore",
      status: "ACTIVE",
      guests: 500,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    },
    {
      id: 2,
      name: "Sunset Garden",
      location: "Mysore",
      status: "INACTIVE",
      guests: 200,
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    },
  ];

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

    const basePath = `/${locale}/${country}/vendor/listing/parent_details`;
  
    // 🔥 PREFETCH (instant feel)
    useEffect(() => {
     router.prefetch(`${basePath}`);
    }, []);
  
    // 🔥 SMOOTH NAVIGATION
    const parent_open = () => {
      setLoading(true);
  
      setTimeout(() => {
        router.push(`${basePath}`);
      }, 180);
    };

  return (
    <div className="p-0 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* LEFT */}
        <h1 className="text-2xl font-semibold text-gray-800">Venue Listings</h1>

        {/* RIGHT: Button + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          {/* Parent Details Button */}
          <button
            onClick={() => parent_open() }
            className=" cursor-pointer
                px-4 py-2 rounded-xl text-sm font-medium
                bg-gradient-to-r from-indigo-500 to-purple-500
                text-white shadow-sm
                hover:shadow-md hover:scale-[1.03]
                active:scale-95
                transition-all duration-300
              "
          >
            Parent Details
          </button>

          {/* 🔥 LOADER OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-10 w-10 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500">
                Opening parent...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
          w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 backdrop-blur-xl
          border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none
        "
            />
          </div>
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
