"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MapPin, Building2, ChevronRight, Users, UtensilsCrossed, BedDouble, Bath, Star } from "lucide-react";

import Gallery from "../components/listing/Gallery";
import BookingCard from "../components/listing/BookingCard";
import HeroHighlights from "../components/listing/HeroHighlights";
import ExperienceBlock from "../components/listing/ExperienceBlock";
import PremiumCalendar from "../components/listing/PremiumCalendar";
import SocialProofHub from "../components/listing/SocialProofHub";
import NearbyAttractions from "../components/listing/NearbyAttractions";
import AmenitiesGrid from "../components/listing/AmenitiesGrid";
import PhotoTourOverlay from "../components/listing/PhotoTourOverlay";
import { getCategoryColors, normalizeCategory } from "../utils/categoryConfig";

// ─── Category-specific property meta ─────────────────────────────────────────
function PropertyMeta({ category }) {
  const key = normalizeCategory(category);

  const dot = <span className="text-gray-300 dark:text-gray-700 select-none">·</span>;

  if (key === "venues") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
        <span className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
          1,000 Guests
        </span>
        {dot}
        <span className="flex items-center gap-1.5">
          <UtensilsCrossed size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
          In-house Catering
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
      <span className="flex items-center gap-1.5">
        <BedDouble size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
        4 bedrooms
      </span>
      {dot}
      <span>8 beds</span>
      {dot}
      <span className="flex items-center gap-1.5">
        <Bath size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
        3 bathrooms
      </span>
      {dot}
      <span>Up to 12 guests</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingPage() {
  const params = useParams();
  const category = params?.type ?? "venues";
  const catKey = normalizeCategory(category);
  const colors = getCategoryColors(category);

  const [openTour, setOpenTour] = useState(false);
  const [active, setActive] = useState("photos");
  const [showTabs, setShowTabs] = useState(false);
  const [calendarRange, setCalendarRange] = useState({ start: null, end: null });
  const [venueSelection, setVenueSelection] = useState({ date: null, shift: null, shiftLabel: null, shiftTime: null });

  const images = [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a",
    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  ];

  // Section tab IDs — in render order
  const sections = ["photos", "highlights", "calendar", "amenities", "reviews", "location"];

  const TAB_LABELS = {
    photos: "Photos",
    highlights: catKey === "venues" ? "Facilities" : "Highlights",
    calendar: catKey === "venues" ? "Availability" : "Dates",
    amenities: "Amenities",
    reviews: "Reviews",
    location: "Location",
  };

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setShowTabs(scrollY > 220);
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 140 && top >= -500) setActive(id);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col relative bg-white dark:bg-gray-950 min-h-screen">

      {/* ── STICKY SECTION TABS — top must match fixed header height exactly ── */}
      <div style={{ top: "56px" }} className={`sticky z-[60] bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 ${showTabs ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-6 overflow-x-auto text-sm py-3" style={{ scrollbarWidth: "none" }}>
            {sections.map((tab) => (
              <button
                key={tab}
                onClick={() => document.getElementById(tab)?.scrollIntoView({ behavior: "smooth" })}
                className={`pb-1 whitespace-nowrap transition-colors duration-150 ${
                  active === tab
                    ? `font-semibold ${colors.tabTextActive} border-b-2 ${colors.tabBorderColor}`
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full md:pt-6 lg:pt-6 xl:pt-6">

        {/* ── GALLERY ── */}
        <div id="photos" className="md:pt-4 pb-2">
          <Gallery images={images} openTour={() => setOpenTour(true)} />
        </div>

        {/* ── 65 / 35 SPLIT LAYOUT ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 mt-4 md:mt-6">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="min-w-0 space-y-0">

            {/* Title block — two-column from md: left=info, right=parent identity */}
            <div className="pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              {/* ── LEFT: core property info ── */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[22px] md:text-2xl lg:text-[26px] font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
                  {catKey === "venues" ? "Monappa Heritage Convention Hall" : "Riverside Farmstay — Deenapani Estate"}
                </h1>

                {/* Category-specific attribute row */}
                <PropertyMeta category={category} />

                {/* Location */}
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin size={14} className={`${colors.accent} flex-none`} strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {catKey === "venues" ? "Kadri, Mangalore, Karnataka, India" : "Kaikamba, Mangalore, Karnataka, India"}
                  </span>
                </div>

                {/* Starting price — below location, both categories */}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {catKey === "venues" ? (
                    <>Starting from{" "}<span className="font-semibold text-gray-900 dark:text-white">₹20,00,000</span></>
                  ) : (
                    <>Starting from{" "}<span className="font-semibold text-gray-900 dark:text-white">₹19,181</span>
                    <span className="text-gray-400 dark:text-gray-500"> / night</span></>
                  )}
                </p>

                {/* Rating + reviews */}
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    4.8
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <button
                    onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-500 dark:text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    124 reviews
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Parent Property Identity Block ── */}
              <a
                href="#"
                className="flex-none flex items-center md:flex-col md:items-center gap-3 md:gap-3 px-5 py-4 md:px-4 md:py-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 w-full md:w-52 lg:w-48 xl:w-52 group"
              >
                {/* Logo */}
                <div className={`w-12 h-12 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl ${colors.iconBg} flex items-center justify-center text-white text-xl font-bold flex-none shadow-sm`}>
                  M
                </div>
                <div className="min-w-0 md:text-center md:w-full">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 font-medium">
                    Part of
                  </p>
                  <p className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white leading-snug">
                    {catKey === "venues" ? "Monappa Estates Group" : "Deenapani Estate Collection"}
                  </p>
                  <p className={`text-xs mt-2 flex items-center md:justify-center gap-0.5 font-medium ${colors.accent} group-hover:gap-1.5 transition-all`}>
                    View Parent Property <ChevronRight size={11} />
                  </p>
                </div>
              </a>

            </div>

            {/* Hero Highlights bar */}
            <div id="highlights">
              <HeroHighlights category={category} />
            </div>

            {/* Calendar — moved directly after highlights */}
            <div id="calendar" className="border-t border-gray-100 dark:border-gray-800 py-4">
              <PremiumCalendar
                category={category}
                isMember={true}
                onSelectionChange={setVenueSelection}
                onRangeChange={setCalendarRange}
              />
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-7">
              {catKey === "venues"
                ? "A heritage convention hall nestled in the heart of Mangalore. With colonial-era architecture, modern AV infrastructure, and an experienced catering team, this venue has hosted over 2,000 events ranging from intimate corporate dinners to grand weddings of 1,000+ guests."
                : "A beautifully maintained estate nestled in the hills of Deenapani. Wake up to sunrise views, sip fresh coffee from the plantation, and unwind by the pool. Perfect for families, friends, and couples looking for a quiet, nature-immersive escape just hours from the city."
              }
            </div>

            {/* Host — moved below description */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center text-white font-bold text-lg flex-none`}>
                G
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Hosted by Gaurav</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Superhost · 4 years · 98% response rate</p>
              </div>
            </div>

            {/* Experience / Event block */}
            <ExperienceBlock category={category} />

            {/* Amenities — premium icon grid */}
            <AmenitiesGrid
              category={category}
              amenities={catKey === "venues"
                ? ["Central AC", "High-speed Wi-Fi", "Stage & PA System", "AV Equipment", "In-house Catering", "Valet Parking", "Power Backup", "Bridal Suite"]
                : catKey === "farmstays"
                ? ["Private Pool", "High-speed Wi-Fi", "Central AC", "Fully Equipped Kitchen", "Bonfire Pit", "Free Parking", "Power Backup", "Plantation Trail", "Pet Friendly", "Organic Plantation"]
                : catKey === "studios"
                ? ["Photography Setup", "Lighting Included", "Green Screen", "Soundproofed", "Editing Suite", "Props Available", "High-speed Wi-Fi", "Free Parking"]
                : catKey === "workspaces"
                ? ["1 Gbps Internet", "Free Coffee", "Printing Included", "Meeting Rooms", "24/7 Access", "Free Parking", "Whiteboard Walls", "Phone Booths"]
                : catKey === "rentals"
                ? ["Delivery Available", "Setup Included", "Fully Insured", "24/7 Support", "Free Parking", "Power Backup"]
                : ["Expert Guide", "Gear Included", "Meals Included", "Transport Provided", "24/7 Support", "Free Cancellation"]
              }
            />

          </div>

          {/* ════════════ RIGHT COLUMN ════════════ */}
          <div className="hidden lg:block">
            {/* top-[112px] = 56px header + 44px section tabs + 12px breathing room */}
            <div className="sticky top-[112px]">
              <BookingCard
                category={category}
                propertyName={catKey === "venues" ? "Monappa Heritage Convention Hall" : undefined}
                calendarRange={calendarRange}
                venueSelection={venueSelection}
              />
            </div>
          </div>

        </div>

        {/* ════════════ FULL-WIDTH SECTIONS (below 65/35 grid) ════════════ */}

        {/* Reviews — full width, above map */}
        <div id="reviews" className="mt-8">
          <SocialProofHub category={category} />
        </div>

        {/* Nearby */}
        <NearbyAttractions category={category} />

        {/* Map */}
        <div id="location" className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-2 mb-12">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location</h2>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={15} className={`${colors.accent} flex-none`} strokeWidth={2} />
              <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {catKey === "venues" ? "Kadri, Mangalore, Karnataka, India" : "Kaikamba, Mangalore, Karnataka, India"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 ml-[23px]">
              Exact address shared after booking confirmation.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-full h-[380px]">
              <iframe
                src="https://maps.google.com/maps?q=mangalore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Mobile bottom bar */}
      <BookingCard
        category={category}
        mobileOnly
        propertyName={catKey === "venues" ? "Monappa Heritage Convention Hall" : undefined}
      />

      {/* Photo tour overlay */}
      <AnimatePresence>
        {openTour && (
          <PhotoTourOverlay key="photo-tour" images={images} onClose={() => setOpenTour(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
