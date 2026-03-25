"use client";

import { useState, useMemo,useEffect } from "react";
import MapView from "./components/MapView";
import VenueCard from "./components/VenueCard";
import BannerCard from "./components/banner";
import FilterDrawer from "./components/FilterDrawer";
import SearchInput from "./components/search_input";
import WishlistPopup from "./components/WishlistPopup";
import VenueCategory from "./components/CategoryBar";

import { useDictionary } from "@/context/DictionaryContext";
import { useParams } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { Map, SlidersHorizontal, X ,Heart, Share2, Home, Building2} from "lucide-react";
import { HeartIcon, ShareIcon ,ScaleIcon ,BuildingOfficeIcon} from "@heroicons/react/24/outline";

  import { useUI } from "@/context/UIContext";

export default function SearchPage() {
  const dict = useDictionary();
  const { locale, country } = useParams();

  // const [showMap, setShowMap] = useState(false);
  // const [filterOpen, setFilterOpen] = useState(false);
  const [hoverVenue, setHoverVenue] = useState(null);
  const [wishlistVenue, setWishlistVenue] = useState(null);

  const [compareList, setCompareList] = useState([]);
  const [showComparePanel, setShowComparePanel] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);



const { showMap, setShowMap, filterOpen, setFilterOpen } = useUI();

  const [filters, setFilters] = useState({
    category_cards: [],
    shift: [],
    booking: [],
    budget: { min: 5000, max: 100000 },
  });

  const handleCompare = (venue) => {
    if (compareList.length >= 4) {
      alert("Only 4 venues allowed");
      return;
    }
    const exists = compareList.find((v) => v.id === venue.id);
    if (!exists) setCompareList([...compareList, venue]);
  };

  const removeCompare = (id) => {
    setCompareList(compareList.filter((v) => v.id !== id));
  };

  // 🌍 Country Config
  const countryConfig = {
    in: { name: "india", center: { lat: 20.5937, lng: 78.9629 } },
    ar: { name: "dubai", center: { lat: 25.2048, lng: 55.2708 } },
  };

  const selected_country =
    countryConfig[String(country || "in").toLowerCase()] || countryConfig["in"];

  // 📊 Pagination
  const [page, setPage] = useState(1);
  const perPage = 9;

  // 📦 Dummy Data (shortened for clarity)
  const venues = [
    // ---------------- INDIA ----------------
    {
      id: 1,
      name: "Bangalore Royal Convention",
      price: "₹6,500",
      lat: 12.9716,
      lng: 77.5946,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      ],
      rating: 4.7,
      suggested: true,
      featured: false,
      country: "india",
      Category: [1, 2, 5],
    },
    {
      Category: [1, 2, 5],
      id: 2,
      name: "Mysore Palace Lawn",
      price: "₹7,200",
      lat: 12.2958,
      lng: 76.6394,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      rating: 4.8,
      featured: true,
      country: "india",
    },
    {
      Category: [3, 2, 5],
      id: 3,
      name: "Udupi Beach Venue",
      price: "₹4,200",
      lat: 13.3409,
      lng: 74.7421,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      rating: 4.5,
      country: "india",
    },
    {
      Category: [1, 2, 5],
      id: 4,
      name: "Mangalore Grand Hall",
      price: "₹5,500",
      lat: 12.9141,
      lng: 74.856,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      rating: 4.6,
      country: "india",
    },
    {
      Category: [1, 2, 5],
      id: 5,
      name: "Hubli Celebration Hall",
      price: "₹4,800",
      lat: 15.3647,
      lng: 75.124,
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
      rating: 4.4,
      country: "india",
    },
    {
      Category: [1, 3, 5],
      id: 6,
      name: "Dharwad Garden Venue",
      price: "₹4,600",
      lat: 15.4589,
      lng: 75.0078,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.3,
      country: "india",
    },
    {
      Category: [2, 4, 5],
      id: 7,
      name: "Malpe Beach Resort",
      price: "₹4,200",
      lat: 13.35,
      lng: 74.69,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.6,
      country: "india",
    },
    {
      Category: [1, 2, 4],
      id: 8,
      name: "Udupi Royal Garden",
      price: "₹4,800",
      lat: 13.345,
      lng: 74.742,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      rating: 4.5,
      country: "india",
    },
    {
      Category: [2, 3, 5],
      id: 9,
      name: "Manipal Lake View Hall",
      price: "₹5,200",
      lat: 13.356,
      lng: 74.79,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      rating: 4.7,
      country: "india",
    },
    {
      Category: [1, 2, 5],
      id: 10,
      name: "Kaup Beach Lawn",
      price: "₹4,500",
      lat: 13.21,
      lng: 74.735,
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
      rating: 4.4,
      country: "india",
    },

    // ---------------- DUBAI ----------------
    {
      Category: 5,
      id: 11,
      name: "Belgaum Royal Lawn",
      price: "₹6,000",
      lat: 15.8497,
      lng: 74.4977,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      rating: 4.6,
      country: "dubai",
    },
    {
      Category: 5,
      id: 12,
      name: "Shimoga Green Resort",
      price: "₹5,300",
      lat: 13.9299,
      lng: 75.5681,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      rating: 4.5,
      country: "dubai",
    },
    {
      Category: 5,
      id: 13,
      name: "Chitradurga Fort Venue",
      price: "₹3,900",
      lat: 14.2306,
      lng: 76.3985,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      rating: 4.2,
      country: "dubai",
    },
    {
      Category: 2,
      id: 14,
      name: "Davangere Banquet Hall",
      price: "₹5,100",
      lat: 14.4644,
      lng: 75.9218,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      rating: 4.4,
      country: "dubai",
    },
    {
      Category: 2,
      id: 15,
      name: "Goa Sunset Resort",
      price: "₹7,800",
      lat: 15.2993,
      lng: 74.124,
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
      rating: 4.8,
      country: "dubai",
    },
    {
      Category: 2,
      id: 16,
      name: "Hyderabad Skyline Terrace",
      price: "₹6,900",
      lat: 17.385,
      lng: 78.4867,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.7,
      country: "dubai",
    },
    {
      Category: 3,
      id: 17,
      name: "Chennai Emerald Hall",
      price: "₹7,200",
      lat: 13.0827,
      lng: 80.2707,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      rating: 4.6,
      country: "dubai",
    },
    {
      Category: 3,
      id: 18,
      name: "Mumbai Palm Resort",
      price: "₹9,500",
      lat: 19.076,
      lng: 72.8777,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      rating: 4.9,
      country: "dubai",
    },
    {
      Category: 3,
      id: 19,
      name: "Dubai Marina Hall",
      price: "₹12,000",
      lat: 25.077,
      lng: 55.133,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.8,
      country: "dubai",
    },
    {
      Category: 4,
      id: 20,
      name: "Palm Jumeirah Resort",
      price: "₹15,000",
      lat: 25.112,
      lng: 55.138,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      rating: 4.9,
      country: "dubai",
    },

    // ---------------- USA ----------------
    {
      Category: 2,
      id: 21,
      name: "Delhi Grand Lotus Hall",
      price: "₹8,800",
      lat: 28.6139,
      lng: 77.209,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      rating: 4.8,
      country: "usa",
    },
    {
      Category: 2,
      id: 22,
      name: "Kolkata Golden Garden",
      price: "₹6,400",
      lat: 22.5726,
      lng: 88.3639,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      rating: 4.5,
      country: "usa",
    },
    {
      Category: 2,
      id: 23,
      name: "Jaipur Royal Palace Venue",
      price: "₹7,300",
      lat: 26.9124,
      lng: 75.7873,
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
      rating: 4.6,
      country: "usa",
    },
    {
      Category: 2,
      id: 24,
      name: "Kochi Ocean Breeze Hall",
      price: "₹6,100",
      lat: 9.9312,
      lng: 76.2673,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.4,
      country: "usa",
    },
    {
      Category: 3,
      id: 25,
      name: "Coimbatore Blue Lagoon Venue",
      price: "₹5,200",
      lat: 11.0168,
      lng: 76.9558,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      rating: 4.3,
      country: "usa",
    },
    {
      Category: 3,
      id: 26,
      name: "Pune Skyline Garden",
      price: "₹7,000",
      lat: 18.5204,
      lng: 73.8567,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      rating: 4.7,
      country: "usa",
    },
    {
      Category: 3,
      id: 27,
      name: "Orlando Sunset Ballroom",
      price: "₹8,500",
      lat: 28.5383,
      lng: -81.3792,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.8,
      country: "usa",
    },
    {
      Category: 4,
      id: 28,
      name: "New York Skyline Venue",
      price: "₹12,000",
      lat: 40.7128,
      lng: -74.006,
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      rating: 4.9,
      country: "usa",
    },
    {
      Category: 4,
      id: 29,
      name: "Los Angeles Grand Hall",
      price: "₹11,500",
      lat: 34.0522,
      lng: -118.2437,
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
      rating: 4.8,
      country: "usa",
    },
    {
      Category: 4,
      id: 30,
      name: "Chicago Royal Resort",
      price: "₹10,000",
      lat: 41.8781,
      lng: -87.6298,
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.7,
      country: "usa",
    },
  ];
  //only ads

  const ads = [
    {
      id: 1,
      name: "Deralakatte Convention Center",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      Category: [1, 2],
    },
    {
      id: 2,
      name: "Luxury Beach Resort",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      Category: [3, 8],
    },
    {
      id: 3,
      name: "City Conference Hall",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      Category: [2, 6],
    },
    {
      id: 4,
      name: "Royal Wedding Palace",
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      Category: [1, 4],
    },
  ];

  const venue_filter = useMemo(() => {
    return venues.filter(
      (item) =>
        item.country?.toLowerCase() === selected_country.name.toLowerCase(),
    );
  }, [venues, selected_country]);

  const paginatedVenues = venue_filter.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
  if (filterOpen) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  } else {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  }

  return () => {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  };
}, [filterOpen]);

useEffect(() => {
  if (filterOpen) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  } else {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  }

  return () => {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  };
}, [filterOpen]);

  return (
    <div className="pt-[70px] flex flex-col min-h-screen">
      {/* 🔥 MAIN */}
     <div className="flex flex-col lg:flex-row flex-1">
        {/* LEFT LIST */}
        <div className="flex-1 lg:w-[60%] flex flex-col">
          {/* HEADER */}
          <div className="px-6 pb-3 mt-3 flex justify-between items-center">
            <p className="text-md font-semibold">
              {venue_filter.length} {dict?.venues_in_this_area}
            </p>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-3">
              <SearchInput open={searchOpen} setOpen={setSearchOpen} />

              {compareList.length > 0 && (
                <button
                  onClick={() => setShowComparePanel(!showComparePanel)}
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Compare ({compareList.length})
                </button>
              )}

              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm"
              >
                <SlidersHorizontal size={16} /> Filter
              </button>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="w-full overflow-x-auto px-4">
            <VenueCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto px-4 pb-40">
            {/* ADS */}
            {!selectedCategory && (
              <div className="mb-4">
                <BannerCard ads={ads.map((a) => a.image)} />
              </div>
            )}

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onHover={setHoverVenue}
                  onLeave={() => setHoverVenue(null)}
                  onWishlist={setWishlistVenue}
                  onCompare={handleCompare}
                  locale={locale}
                  country={country}
                />
              ))}
            </div>

            {/* WISHLIST */}
            <WishlistPopup
              venue={wishlistVenue}
              open={!!wishlistVenue}
              onClose={() => setWishlistVenue(null)}
            />
          </div>
        </div>

        {/* 🗺️ DESKTOP MAP */}
        <div className="hidden lg:block w-[40%]">
          <div className="sticky top-[80px] h-[calc(100vh-80px)] pr-3">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
              <MapView
                venues={venue_filter}
                hoverVenue={hoverVenue}
                country={selected_country.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📱 MOBILE MAP FULLSCREEN */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-50 bg-white lg:hidden"
          >
            <MapView
              venues={venue_filter}
              hoverVenue={hoverVenue}
              country={selected_country.name}
            />

            <button
              onClick={() => setShowMap(false)}
              className="absolute top-6 right-6 bg-white p-3 rounded-full shadow"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 MOBILE BOTTOM BAR */}
      {/* <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t p-3 flex justify-between items-center z-50 shadow-lg">
        <button
          onClick={() => setShowMap(true)}
          className="flex-1 flex justify-center items-center gap-1 text-sm"
        >
          <Map size={16} /> Map
        </button>

        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 mx-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm flex justify-center items-center gap-1"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>

        <button className="flex-1 text-sm">Sort</button>
      </div> */}


      {/* 📱 MOBILE FLOATING ACTIONS (Instagram Style) */}
<div className="fixed right-3 bottom-28 z-50 flex flex-col gap-3 md:hidden">

  {/* ❤️ Wishlist */}
  <button className="bg-white/70 backdrop-blur-xl shadow-lg rounded-full p-3 active:scale-90 transition ">
    <ScaleIcon className="w-5" />
    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] px-1.5 py-[1px] rounded-full font-semibold shadow">
        2
      </span>
  </button>

  {/* 🔗 Share */}
  <button
    onClick={() => {
      if (navigator.share) {
        navigator.share({
          title: "Check this venue",
          url: window.location.href,
        });
      }
    }}
    className="bg-white/70 backdrop-blur-xl shadow-lg rounded-full p-3 active:scale-90 transition"
  >
    <ShareIcon className="w-5" />
  </button>

  {/* 🏡 Farmstay */}
  <button className="bg-white/70 backdrop-blur-xl shadow-lg rounded-full px-3 py-2 text-xs font-semibold">
    <BuildingOfficeIcon className="w-5" />
  </button>

  {/* 🏛️ Venue */}
  <button className="bg-white/70 backdrop-blur-xl shadow-lg rounded-full px-3 py-2 text-xs font-semibold">
   <Home className="w-5" />
  </button>

</div>






      {/* FILTER DRAWER */}
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        venueCount={venue_filter.length}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
