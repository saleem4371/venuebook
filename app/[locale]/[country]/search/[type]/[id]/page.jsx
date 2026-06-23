"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Gallery from "../components/listing/Gallery";
import ImageModal from "../components/listing/ImageModal";
import BookingCard from "../components/listing/BookingCard";
import BookingCalendar from "../components/listing/BookingCalendar";
import EventTypes from "../components/listing/EventTypes";
import NearbyAttractions from "../components/listing/NearbyAttractions";
import RelatedVenues from "../components/listing/RelatedVenues";
import SearchBar from "../components/SearchBar";
import PhotoTourOverlay from "../components/listing/PhotoTourOverlay";

export default function ListingPage() {
  const params = useParams();
  // params.type is the route segment e.g. "venues", "farmstays", "rentals" etc.
  const category = params?.type ?? "venues";
  const [openTour, setOpenTour] = useState(false);
  const [active, setActive] = useState("photos");
  const [showTabs, setShowTabs] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const images = [
    // Spaces
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a",
    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea",
    // Bedroom
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457",
    // Kitchen
    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a",
    // Living
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    // Exterior
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  ];

  // ✅ Sections updated
  const sections = ["photos", "calendar", "amenities", "reviews", "location"];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      setShowTabs(scrollY > 200);

      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 150 && top >= -300) {
            setActive(id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col relative">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white">
        <SearchBar openFilter={() => setFilterOpen(true)} />
      </div>

      {/* 🔥 STICKY TABS */}
      <div
        className={`sticky top-0 z-40 bg-white border-b  border-b-gray-200  shadow-sm transition-all duration-300 ${
          showTabs
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 hidden"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:p-3">
          <div className="flex gap-6 overflow-x-auto text-sm py-3">
            {sections.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  document
                    .getElementById(tab)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className={`pb-1 capitalize whitespace-nowrap ${
                  active === tab
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Gallery */}
        <div id="photos">
          <Gallery images={images} openTour={() => setOpenTour(true)} />
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mt-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* INFO */}
            <div>
              <h1 className="text-2xl font-semibold">
                Room in Deenapani, India
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                2 beds · 2 shared bathrooms
              </p>
              <p className="text-sm mt-1">⭐ New · 1 review</p>
            </div>

            {/* HOST */}
            <div className="border-t  border-t-gray-200  pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
              <div>
                <p className="font-medium">Hosted by Gaurav</p>
                <p className="text-gray-500 text-sm">4 years hosting</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border-t  border-t-gray-200  pt-6 text-gray-700 text-sm leading-6">
              Wi-Fi, Kettle, Wall Fan, Cupboard, Sunrise View, Power Backup,
              Well Ventilated, Towels on chargeable basis.
            </div>

            {/* 🔥 CALENDAR */}
            <div id="calendar">
              <h2 className="text-lg font-semibold mb-2">
                Calendar (Select Your Date)
              </h2>
              <BookingCalendar />
            </div>

            {/* AMENITIES */}
            <div id="amenities">
              <h2 className="text-lg font-semibold mb-2">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>✔ Kitchen</p>
                <p>✔ Wifi</p>
                <p>✔ AC</p>
                <p>✔ Workspace</p>
              </div>
            </div>

            {/* EVENT TYPES */}
            <EventTypes />

            {/* NEARBY */}
            <NearbyAttractions />

            {/* REVIEWS */}
            {/* <div id="reviews">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <p className="text-gray-500 text-sm">No reviews yet</p>
            </div>

            <div id="location">
              <h2 className="text-lg font-semibold">Location</h2>
              <p className="text-gray-500 text-sm">Map coming soon</p>
            </div> */}
          </div>

          {/* RIGHT — desktop sticky card only, hidden on mobile */}
          <div className="hidden md:block lg:col-span-1">
            <div className="sticky top-28">
              <BookingCard category={category} />
            </div>
          </div>
        </div>
        {/* 🔥 FULL WIDTH SECTIONS */}
        {/* 🔥 FULL WIDTH SECTION */}
        <div className="max-w-7xl mx-auto ">
          {/* ================= REVIEWS ================= */}
          <div id="reviews">
            <h2 className="text-2xl font-semibold mb-6">★ 4.8 · 124 reviews</h2>

            {/* ⭐ Rating Breakdown */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {[
                { label: "Cleanliness", value: 4.9 },
                { label: "Accuracy", value: 4.8 },
                { label: "Check-in", value: 4.7 },
                { label: "Communication", value: 4.9 },
                { label: "Location", value: 4.8 },
                { label: "Value", value: 4.6 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-32 text-sm">{item.label}</span>

                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${(item.value / 5) * 100}%` }}
                    />
                  </div>

                  <span className="text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            {/* 📝 Review Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Abdul",
                  date: "March 2026",
                  rating: 5,
                  text: "Amazing place, very clean and peaceful. Highly recommended!",
                },
                {
                  name: "Rahul",
                  date: "Feb 2026",
                  rating: 4.5,
                  text: "Good stay, nice host and beautiful location.",
                },
                {
                  name: "Priya",
                  date: "Jan 2026",
                  rating: 5,
                  text: "Loved the ambiance. Perfect for weekend getaway.",
                },
                {
                  name: "Amit",
                  date: "Dec 2025",
                  rating: 4.7,
                  text: "Comfortable and budget-friendly. Will visit again.",
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <p className="text-gray-500 text-xs">
                        ⭐ {review.rating} · {review.date}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ================= MAP ================= */}
          <div id="location">
            <h2 className="text-2xl font-semibold mb-6">Location</h2>

            <div className="rounded-2xl overflow-hidden border  border-gray-200  shadow-sm">
              {/* Map */}
              <div className="w-full h-[400px]">
                <iframe
                  src="https://maps.google.com/maps?q=bangalore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>

              {/* Address Info */}
              <div className="p-5 bg-white">
                <p className="font-medium mb-1">Deenapani, India</p>
                <p className="text-sm text-gray-500">
                  Exact location will be shared after booking.
                </p>
              </div>
            </div>
          </div>
          {/* <RelatedVenues /> */}
        </div>
      </div>

      {/* Mobile bottom bar only — desktop card is rendered in the right column above */}
      <BookingCard category={category} mobileOnly />

      {/* TOUR OVERLAY — AnimatePresence here so exit animation plays on unmount */}
      <AnimatePresence>
        {openTour && (
          <PhotoTourOverlay key="photo-tour" images={images} onClose={() => setOpenTour(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
