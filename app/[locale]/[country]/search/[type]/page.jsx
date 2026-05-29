"use client";

import { useState, useMemo, useEffect,useRef } from "react";
import MapView from "./components/MapView";
import VenueCard from "./components/VenueCard";
import BannerCard from "./components/banner";
import FilterDrawer from "./components/FilterDrawer";
import SearchInput from "./components/search_input";
import WishlistPopup from "./components/WishlistPopup";
import VenueCategory from "./components/CategoryBar";
import FloatingMenu from "./components/FloatingMenu";

import { useCategory } from "@/context/CategoryContext";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  SlidersHorizontal,
  X,
  Heart,
  Share2,
  Home,
  Building2,
  Scale,
} from "lucide-react";
import {
  HeartIcon,
  ShareIcon,
  ScaleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useUI } from "@/context/UIContext";
import {
  LoadProperty,
  UserWishlistCategory,
  UserWishlist,
  remove_wishlist,
  removeCompareAPI,
  addCompareAPI,
  UserCompare,
  userRecentViews,
} from "@/services/venues.service";
import { findPropertyname } from '@/services/global.service'

  import { useAuth }     from "@/context/AuthContext";

export default function SearchPage() {
    const mapRef = useRef(null); // ✅ ADD THIS
      const { user }     = useAuth();
  const t = useTranslations();
  const { locale, country } = useParams();
  const [hoverVenue, setHoverVenue] = useState(null);
  const [wishlistVenue, setWishlistVenue] = useState(null);

  const [compareList, setCompareList] = useState([]);
  const [loadData, setLoadData] = useState([]);
  const [loadProperty, setLoadProperty] = useState([]);
  const [wishlistCategory, SetWishlistCategory] = useState([]);
  const [wishlist, SetWishlist] = useState([]);
  const [compares, SetCompares] = useState([]);

  const [showComparePanel, setShowComparePanel] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredVenueId, setHoveredVenueId] = useState(null);

  const [mapBounds, setMapBounds] = useState(null);
const [visibleVenues, setVisibleVenues] = useState([]);

  const { activeCategory } = useCategory();

  const { showMap, setShowMap, filterOpen, setFilterOpen , setLoginOpen } = useUI();

  const [filters, setFilters] = useState({
    category_cards: [],
    shift: [],
    booking: [],
    budget: { min: 200, max: 100000 },
  });
  

/* ---------------- ADD COMPARE ---------------- */
const handleCompare = async (venue, action) => {
  if(!user)    setLoginOpen(true);

  const payload = {
      venue_id: venue.childVenueId,
    }
  if (action) {
    await addCompareAPI(payload);
  } else {
    await removeCompareAPI(payload);

  }
   load();
};

/* ---------------- ADD RECENT VIEWS ---------------- */
const userRecentView = async (venue) => {
   if(!user)   return true
  const payload = {
      venue_id: venue.childVenueId,
    }
   await userRecentViews(payload);
};
// const handleCompare = async (venue) => {
//   try {

//     const exists = compareList.find(
//       (v) => v.childVenueId === venue.childVenueId
//     );

//     /* REMOVE */
//     if (exists) {

//       await removeCompareAPI(venue.childVenueId);

//       setCompareList((prev) =>
//         prev.filter(
//           (v) => v.childVenueId !== venue.childVenueId
//         )
//       );

//       return;
//     }

//     /* LIMIT */
//     if (compareList.length >= 4) {
//       alert("Only 4 venues allowed");
//       return;
//     }
//     const payload = {
//         venue_id: venue.childVenueId
//       };

//     /* ADD */
//     await addCompareAPI(payload);

//     setCompareList((prev) => [...prev, venue]);

//   } catch (error) {
//     console.error("Compare error:", error);
//   }
// };

/* ---------------- REMOVE ---------------- */

const removeCompare = async (venue_id) => {
  try {

    await removeCompareAPI(venue_id);

    // setCompareList((prev) =>
    //   prev.filter(
    //     (v) => v.childVenueId !== venue_id
    //   )
    // );

  } catch (error) {
    console.error("Remove compare error:", error);
  }
};

  // 🌍 Country Config
  const countryConfig = {
    in: { name: "india", center: { lat: 20.5937, lng: 78.9629 } },
    ae: { name: "dubai", center: { lat: 25.2048, lng: 55.2708 } },
    us: { name: "usa", center: { lat: 25.2048, lng: 55.2708 } },
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
      type: "venue",
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
      type: "venue",
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
      type: "venue",
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
      type: "venue",
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
      type: "farmstay",
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
      type: "farmstay",
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
      type: "farmstay",
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
      type: "farmstay",
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
      type: "farmstay",
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
      type: "farmstay",
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
      type: "venue",
    },
    {
      id: 2,
      name: "Luxury Beach Resort",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      Category: [3, 8],
      type: "venue",
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
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

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
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

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

//   useEffect(() => {
//   const load = async () => {
//     try {
//       if (!activeCategory) return;

//       const payload = {
//         type: activeCategory,
//         category: selectedCategory,
//         filters,
//         mapBounds, // ✅ now coming from parent
//       };

//       const res = await findPropertyname(activeCategory);
//       const resProperty = await LoadProperty(payload);
//     const UsWishlistCategory = await UserWishlistCategory();// after login
//     const UserWishlists = await UserWishlist(); // after login
//     const UserCompares = await UserCompare(); // after login

//       setLoadData(res?.data?.data ?? []);
//       setLoadProperty(resProperty?.data?.data ?? []);

        
//       SetWishlistCategory(UsWishlistCategory?.data ?? []);
//       SetWishlist(UserWishlists?.data ?? []);
//       SetCompares(UserCompares?.data ?? []);

      
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   load();
// }, [activeCategory, selectedCategory, filters, mapBounds]);

useEffect(() => {
  const loadPublicData = async () => {
    try {
      if (!activeCategory) return;

      const payload = {
        type: activeCategory,
        category: selectedCategory,
        filters,
        mapBounds,
      };

      const res = await findPropertyname(activeCategory);
      const resProperty = await LoadProperty(payload);

      setLoadData(res?.data?.data ?? []);
      setLoadProperty(resProperty?.data?.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  loadPublicData();
}, [activeCategory, selectedCategory, filters, mapBounds]);

useEffect(() => {
  const loadUserData = async () => {
    try {
      const UsWishlistCategory = await UserWishlistCategory();
      const UserWishlists = await UserWishlist();
      const UserCompares = await UserCompare();

      SetWishlistCategory(UsWishlistCategory?.data ?? []);
      SetWishlist(UserWishlists?.data ?? []);
      SetCompares(UserCompares?.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  if (user) {
    loadUserData();
  }
}, [user]);

const loadLoginData = async () => {
  const [wishlistCat, wishlist, compare] = await Promise.all([
    UserWishlistCategory(),
    UserWishlist(),
    UserCompare(),
  ]);

  SetWishlistCategory(wishlistCat?.data ?? []);
  SetWishlist(wishlist?.data ?? []);
  SetCompares(compare?.data ?? []);
};

useEffect(() => {
  if (user) loadLoginData();
}, [user]);


useEffect(() => {
  if (!hoverVenue) return;

  setHoveredVenueId(hoverVenue.childVenueId);

  if (mapRef.current) {
    mapRef.current.panTo({
      lat: Number(hoverVenue.lat),
      lng: Number(hoverVenue.lng),
    });
  }
}, [hoverVenue]);

const removeWishlistAPI = async (venue) => {
  try {
    await remove_wishlist({
      venue_id: venue.childVenueId,
    });

    setWishlist((prev) =>
      prev.filter(
        (item) =>
          item.venue_id !== venue.childVenueId
      )
    );
  } catch (error) {
    console.error(error);
  }
};


  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="pt-[70px] flex flex-col min-h-screen">
      {/* 🔥 MAIN */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* LEFT LIST */}
        <div className="flex-1 lg:w-[60%] flex flex-col">
          {/* HEADER */}
          <div className="px-6 pb-3 mt-3 flex justify-between items-center">
            <p className="text-md font-semibold">
              {loadProperty.length} {t("venues_in_this_area")}
            </p>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-3">
              <SearchInput open={searchOpen} setOpen={setSearchOpen} />

              {compares.length > 0 && (
                // <div className="relative">
                //   <button
                //     onClick={() => setShowComparePanel(!showComparePanel)}
                //     className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm transition"
                //   >
                //     <Scale size={18} />
                //   </button>

                //   {compares.length > 0 && (
                //     <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                //       {compares.length}
                //     </span>
                //   )}
                // </div>
                <div className="relative">
  <button
    onClick={() => setShowComparePanel((prev) => !prev)}
    className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm transition bg-white hover:bg-gray-50"
  >
    <Scale size={18} />
  </button>

  {/* Badge */}
  {compares.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
      {compares.length}
    </span>
  )}

  {/* 👇 DROPDOWN PANEL */}
  {showComparePanel && (
    <>
      {/* Backdrop (click outside to close) */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowComparePanel(false)}
      />

      {/* Panel */}
      <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border rounded-xl z-50 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">
            Compare ({compares.length})
          </h3>

          <button
            onClick={() => setShowComparePanel(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-72 overflow-y-auto">
          {compares.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">
              No items added
            </div>
          ) : (
            compares.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 hover:bg-gray-50 border-b last:border-none"
              >
                <img
                 src={`${BASE_URL}/${item.image}`}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.title}
                  </p>

                  <div className="flex justify-between items-center mt-1">
                    {/* <span className="text-xs text-purple-600 font-semibold">
                      ₹{item.price}
                    </span> */}

                    <button
                     onClick={() => handleCompare(item, true)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {compares.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg">
              Compare Now
            </button>
          </div>
        )}
      </div>
    </>
  )}
</div>
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
              loadData={loadData}
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
              {loadProperty.map((venue) => (
                <VenueCard
                  key={venue.childVenueId}
                  venue={venue}
                  wishlist={wishlist}
                  compares={compares}
                  onHover={setHoverVenue}
                  onLeave={() => setHoverVenue(null)}
                  onWishlist={setWishlistVenue}
                  onCompare={handleCompare}
                  onRecentViews={userRecentView}
                  locale={locale}
                  country={country}
                  compareList={compareList}
                  setCompareList={setCompareList}
                   onRemoveWishlist={removeWishlistAPI}
                />
              ))}
            </div>

            {/* WISHLIST */}
            <WishlistPopup
              wishvenue={wishlistCategory}
              venue={wishlistVenue}
              open={!!wishlistVenue}
              user={user}
              onClose={() => setWishlistVenue(null)}
            />
          </div>
        </div>

        {/* 🗺️ DESKTOP MAP */}
        <div className="hidden lg:block w-[40%]">
          <div className="sticky top-[80px] h-[calc(100vh-80px)] pr-3">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
              <MapView
                venues={loadProperty}
                hoverVenue={hoverVenue}
                country={selected_country.name}
                 onBoundsChange={setMapBounds}
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
               venues={loadProperty}
              hoverVenue={hoverVenue}
              country={selected_country.name}
               onBoundsChange={setMapBounds}
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

      {/* 📱 MOBILE FLOATING ACTIONS (Instagram Style) */}
      {!showMap && (
        <FloatingMenu
          compareList={compareList}
          setCompareList={setCompareList}
        />
      )}

      {/* FILTER DRAWER */}
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        venueCount={loadProperty.length}
        filters={filters}
        setFilters={setFilters}
      />
    </div>

    

    
  );
}
