"use client";

import { useState, useMemo } from "react";
import MapView from "./components/MapView";
import VenueCard from "./components/VenueCard";
import BannerCard from "./components/banner";
import SearchBar from "./components/SearchBar";
import FilterDrawer from "./components/FilterDrawer";
import SearchInput from "./components/search_input";

import WishlistPopup from "./components/WishlistPopup";
import VenueCategory from "./components/CategoryBar";

import { useDictionary } from "@/context/DictionaryContext";

import { useParams } from "next/navigation";

// import CompareBar from "./components/CompareBar";

import { motion, AnimatePresence } from "framer-motion";
import { Map, SlidersHorizontal, X, Search } from "lucide-react";
import CategoryBar from "./components/CategoryBar";

export default function SearchPage() {
  const dict = useDictionary();
  const { locale, country } = useParams();

  const [showMap, setShowMap] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoverVenue, setHoverVenue] = useState(null);

  const [wishlistVenue, setWishlistVenue] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const [showComparePanel, setShowComparePanel] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // const selected_country = country == 'ar' ? "dubai":'india'

  const countryConfig = {
    in: {
      name: "india",
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      bounds: { north: 35.5, south: 6.5, west: 68, east: 97.5 },
    },
    ar: {
      name: "dubai",
      center: { lat: 25.2048, lng: 55.2708 },
      zoom: 11,
      bounds: { north: 25.5, south: 24.8, west: 54.8, east: 55.6 },
    },
    sa: {
      name: "Saudi Arabia",
      center: { lat: 23.8859, lng: 45.0792 },
      zoom: 5,
      bounds: { north: 32.0, south: 16.0, west: 34.0, east: 56.0 },
    },
    ln: {
      name: "London",
      center: { lat: 51.5074, lng: -0.1278 },
      zoom: 10,
      bounds: { north: 51.7, south: 51.3, west: -0.5, east: 0.3 },
    },
    us: {
      name: "USA",
      center: { lat: 37.0902, lng: -95.7129 },
      zoom: 4,
      bounds: { north: 49, south: 24, west: -125, east: -66 },
    },
    fr: {
      name: "France",
      center: { lat: 46.2276, lng: 2.2137 },
      zoom: 5,
      bounds: { north: 51, south: 41, west: -5, east: 9 },
    },
  };

  const selectedCountryKey = String(country || "in").toLowerCase();

  // Get the config for the selected country or fallback to India
  const selected_country =
    countryConfig[selectedCountryKey] || countryConfig["in"];

  const [page, setPage] = useState(1);
  const perPage = 9;

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

  const filteredAds = useMemo(() => {
    if (!selectedCategory) return ads;

    return ads.filter(
      (ad) =>
        Array.isArray(ad.Category) && ad.Category.includes(selectedCategory),
    );
  }, [ads, selectedCategory]);

  const adsImages = useMemo(() => {
    if (!selectedCategory) {
      return ads.map((ad) => ad.image);
    }
    return []; // hide ads when category selected
  }, [ads, selectedCategory]);

  //only adds ends

  const venue_filter = useMemo(() => {
    return venues.filter((item) => {
      // COUNTRY
      const matchCountry =
        item.country?.toLowerCase() === selected_country.name.toLowerCase();

      if (!selectedCategory) return matchCountry;

      // CATEGORY
      const matchCategory =
        filters.category_cards.length === 0 ||
        item.Category?.some((cat) => filters.category_cards.includes(cat));

      // PRICE (extract number from ₹ string)
      const priceValue = Number(item.price.replace(/[₹,]/g, ""));

      const matchBudget =
        priceValue >= filters.budget.min && priceValue <= filters.budget.max;

      return (
        matchCountry &&
        Array.isArray(item.Category) &&
        item.Category.includes(selectedCategory) &&
        matchCategory &&
        matchBudget
      );
    });
  }, [venues, selected_country, selectedCategory, filters]);

  const totalPages = Math.ceil(venue_filter.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedVenues = venue_filter.slice(startIndex, startIndex + perPage);

  //filter

  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = (data) => {
    console.log("Search Data:", data);
    // Use data to filter venues
  };

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white">
        <SearchBar openFilter={() => setFilterOpen(true)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT LIST */}
        <div className="flex-1 lg:w-[60%] flex flex-col">
          <div>
            <div className="flex justify-between items-center px-6 pb-3 mt-3">
              <p className="text-md font-semibold">
                {venue_filter.length} {dict.venues_in_this_area}
              </p>

              {/* HEADER BUTTONS */}
              <div className="hidden md:flex items-center gap-3">
                <div className="">
                    <SearchInput
                      open={searchOpen}
                      setOpen={setSearchOpen}
                      onSearch={handleSearch}
                    />
                </div>
                {/* Compare Button */}
                {compareList.length > 0 && (
                  <div className="relative">
                    <button
                      className="relative cursor-pointer flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100"
                      onClick={() => setShowComparePanel(!showComparePanel)}
                    >
                      ⚖️ Compare
                      {/* Count Badge */}
                      <span className="absolute -top-2 -right-2 bg-[#8368EF] text-white text-[10px] px-1.5 py-[1px] rounded-full font-semibold">
                        {compareList.length}
                      </span>
                    </button>

                    {/* Compare Panel */}
                    <AnimatePresence>
                      {showComparePanel && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50"
                        >
                          <h3 className="font-semibold mb-3 text-center">
                            Compare Venues
                          </h3>

                          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                            {compareList.map((venue) => (
                              <div
                                key={venue.id}
                                className="flex justify-between items-center border-b pb-1"
                              >
                                <p className="text-sm">{venue.name}</p>

                                <button
                                  className="text-red-500 text-xs hover:underline"
                                  onClick={() => removeCompare(venue.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            className="cursor-pointer mt-3 w-full bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-lg text-sm"
                            onClick={() => setShowComparePanel(false)}
                          >
                            Close
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Wishlist */}
                {/* <button
                className="cursor-pointer flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100"
                onClick={() => setWishlistVenue(null)}
              >
                ❤️ Wishlist 
              </button> */}

                {/* Filter */}
                <button
                  className="cursor-pointer flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100"
                  onClick={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal size={16} /> Filter
                </button>
              </div>
            </div>
            <div className="w-[460px] md:w-full hide-scrollbar">
              <VenueCategory
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-32 hide-scrollbar">
            <div className="mb-4">
              {/* <BannerCard ads={adsImages} /> */}
              {!selectedCategory && <BannerCard ads={adsImages} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
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

              <WishlistPopup
                venue={wishlistVenue}
                open={!!wishlistVenue}
                onClose={() => setWishlistVenue(null)}
              />

              {/* <CompareBar
        compareList={compareList}
        removeCompare={removeCompare}
      /> */}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                  ${
                    page === index + 1
                      ? "bg-[#8368EF] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="hidden lg:block w-[40%] h-full p-3">
          <div className="sticky top-20 h-[calc(100vh-90px)] rounded-2xl overflow-hidden">
            <MapView
              venues={venue_filter}
              hoverVenue={hoverVenue}
              country={selected_country.name}
            />
          </div>
        </div>
      </div>

      {/* MOBILE MAP */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 bg-white lg:hidden rounded-2xl"
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

      {/* MOBILE BUTTONS */}
      <div className="lg:hidden sticky bottom-16 left-0 right-0 flex justify-center gap-4 z-40">
        <button
          onClick={() => setShowMap(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full shadow-lg"
        >
          <Map size={18} />
          Map
        </button>
      </div>

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
