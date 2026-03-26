"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MobileSearchSheet from "./components/MobileSearchSheet";
import BottomMenu from "./components/BottomMenu";

import RecentViews from "./components/RecentViews";
import PopularVenues from "./components/PopularVenues";
import Categories from "./components/Categories";
import SponsoredVenues from "./components/SponsoredVenues";
import TopDesignation from "./components/TopDesignation";
import AdvertiseBanner from "./components/AdvertiseBanner";
import DestinationSection from "./components/DestinationSection";
import SubscribeSection from "./components/SubscribeSection";
import PremiumFooter from "./components/PremiumFooter";

import VenueSection from "./components/VenueSection";

export default function Home() {
  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    document.body.style.overflow = openSearch ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [openSearch]);

  const venues = [
    { name: "Royal Palace", image: "/images/venue1.jpg", location: "Delhi" },
    { name: "Ocean View", image: "/images/venue2.jpg", location: "Mumbai" },
    {
      name: "Mountain Retreat",
      image: "/images/venue3.jpg",
      location: "Manali",
    },
  ];

  const categories = [
    { name: "Wedding" },
    { name: "Birthday" },
    { name: "Corporate" },
    { name: "Conference" },
    { name: "Party" },
    { name: "Exhibition" },
    { name: "Music" },
    { name: "Sports" },
    { name: "Art" },
    { name: "Others" },
  ];

  const users = [
    { name: "Rahul Sharma", image: "/images/user1.jpg", designation: "CEO" },
    {
      name: "Anita Kapoor",
      image: "/images/user2.jpg",
      designation: "Manager",
    },
  ];

  const venuess = [
    {
      name: "Zypher",
      location: "Indiana Hall",
      rating: 5,
      reviews: 1,
      image: "https://apitest.venuebook.in//event/banquet_front.jpg",
    },
    {
      name: "Dream Palace",
      location: "Dream Palace",
      rating: 4.7,
      reviews: 3,
      image: "https://apitest.venuebook.in//event/banquet_front.jpg",
    },
    {
      name: "Kirk Hotel",
      location: "Shoolin Palace",
      rating: 4.6,
      reviews: 632,
      image: "https://apitest.venuebook.in//event/banquet_front.jpg",
    },
    {
      name: "TMA International",
      location: "Convention Center",
      rating: 4.5,
      reviews: 3940,
      image: "https://apitest.venuebook.in//event/banquet_front.jpg",
    },
    {
      name: "TMA International",
      location: "Convention Center",
      rating: 4.5,
      reviews: 3940,
      image: "https://apitest.venuebook.in//event/banquet_front.jpg",
    },
  ];

  return (
    <>
      <Navbar />
      <HeroSection setOpenSearch={setOpenSearch} />
      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Categories categories={categories} />
        <VenueSection title="Popular Venues" venues={venuess} />
        <VenueSection title="Sponsored Venues" venues={venuess} />
        <VenueSection title="Recently viewd" venues={venuess} />
      </div>
      <AdvertiseBanner />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DestinationSection/>
      </div>
      <SubscribeSection/>
      {/* <PremiumFooter/> */}


      <BottomMenu />
    </>
  );
}
