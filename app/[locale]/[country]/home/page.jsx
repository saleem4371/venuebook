"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroSection from "./components/HeroSection";
import MobileSearchSheet from "./components/MobileSearchSheet";
import CategorySection from "./components/Categories";
import VenueSection from "./components/VenueSection";
import AdCarousel from "./components/AdCarousel";
import SkeletonRail from "./components/SkeletonRail";
import SkeletonBanner from "./components/SkeletonBanner";
import SkeletonAdCarousel from "./components/SkeletonAdCarousel";
import SkeletonTopDestinations from "./components/SkeletonTopDestinations";
// import AdvertiseBanner    from "./components/AdvertiseBanner";
// import DestinationSection from "./components/DestinationSection";
import {
  PremiumBanner,
  SponsoredCategoryRow,
  PopularCategoryRow,
  TopDestinations,
} from "./components/InlineAdSection";

import { useCategory } from "@/context/CategoryContext";
import { CATEGORIES, CATEGORY_TINTS } from "@/config/categoryConfig";

import { useAuth } from "@/context/AuthContext";

import { findPropertyname } from "@/services/global.service";
import { recent_views , Api_recommeded , topDestination} from "@/services/home.service";

/* ── Category page content ──────────────────────────────────── */
const CATEGORY_CONTENT = {
  venues: {
    categoryLabel: "Venues",
    adHeading: "Advertise your venue to visitors",
    adSubtext:
      "Reach social, wedding and corporate clients on India's #1 venue hire marketplace.",
    sections: [
      {
        key: "recommended",
        title: "Recommended Venues",
        subtitle: "Top-rated halls, banquets & event spaces near you",
      },
      {
        key: "recent",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off",
      },
    ],
    premiumBanner: {
      badge: "Premium Partner",
      headline: "Exclusive Five-Star Event Spaces Now on venuebook.in",
      subtext:
        "Curated luxury venues for weddings, corporate galas & private celebrations.",
      cta: "Explore Luxury",
      image:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      {
        name: "The Grand Ballroom",
        location: "Bengaluru",
        price: "From ₹80,000",
        image:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75&fit=crop",
      },
      {
        name: "Sky Terrace Mumbai",
        location: "Mumbai",
        price: "From ₹1,20,000",
        image:
          "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop",
      },
      {
        name: "Royal Convention",
        location: "Delhi",
        price: "From ₹60,000",
        image:
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75&fit=crop",
      },
      {
        name: "Lakeside Pavilion",
        location: "Pune",
        price: "From ₹45,000",
        image:
          "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop",
      },
    ],
    host: {
      name: "Priya Mehta",
      tagline: "Luxury venue curator · Bengaluru",
      rating: "4.97",
      listings: 12,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      {
        name: "Crystal Ballroom",
        location: "Mumbai",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75&fit=crop",
      },
      {
        name: "Heritage Palace",
        location: "Jaipur",
        badge: "5★",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&fit=crop",
      },
      {
        name: "Skyline Terrace",
        location: "Delhi",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop",
      },
      {
        name: "Grand Heritage Manor",
        location: "Chennai",
        badge: "Featured",
        image:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75&fit=crop",
      },
      {
        name: "Oceanfront Pavilion",
        location: "Goa",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop",
      },
    ],
    popularItems: [
      {
        name: "Emerald Gardens",
        location: "Bengaluru",
        price: "From ₹35,000",
        image:
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75&fit=crop",
      },
      {
        name: "The Ivory Suite",
        location: "Chennai",
        price: "From ₹50,000",
        image:
          "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop",
      },
      {
        name: "Willow Creek Hall",
        location: "Pune",
        price: "From ₹28,000",
        image:
          "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop",
      },
      {
        name: "Sunset Pavilion",
        location: "Hyderabad",
        price: "From ₹42,000",
        image:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75&fit=crop",
      },
    ],
  },
  farmstays: {
    categoryLabel: "Farmstays",
    adHeading: "List your farmstay or nature retreat",
    adSubtext:
      "Connect with thousands of travellers looking for authentic escapes across India.",
    sections: [
      {
        key: "recommended",
        title: "Weekend Retreats",
        subtitle: "Nature stays & farm escapes near you",
      },
      {
        key: "recent",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off",
      },
    ],
    premiumBanner: {
      badge: "Curated Escapes",
      headline: "Handpicked Farms, Estates & Forest Retreats",
      subtext:
        "Authentic, off-grid stays connected directly from the hosts who tend them.",
      cta: "Browse Retreats",
      image:
        "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      {
        name: "Coorg Coffee Estate",
        location: "Coorg",
        price: "From ₹8,000/night",
        image:
          "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&fit=crop",
      },
      {
        name: "Goa Beachside Farm",
        location: "Goa",
        price: "From ₹12,000/night",
        image:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75&fit=crop",
      },
      {
        name: "Manali Pine Cabin",
        location: "Manali",
        price: "From ₹6,500/night",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop",
      },
      {
        name: "Ooty Tea Garden",
        location: "Ooty",
        price: "From ₹5,000/night",
        image:
          "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=75&fit=crop",
      },
    ],
    host: {
      name: "Rajan Nair",
      tagline: "Nature host · Coorg & Wayanad",
      rating: "4.95",
      listings: 7,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      {
        name: "Misty Forest Estate",
        location: "Coorg",
        badge: "Top Pick",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75&fit=crop",
      },
      {
        name: "Riverside Bungalow",
        location: "Kerala",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75&fit=crop",
      },
      {
        name: "Heritage Haveli",
        location: "Jaipur",
        badge: "Heritage",
        image:
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop",
      },
      {
        name: "Backwater Houseboat",
        location: "Alleppey",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75&fit=crop",
      },
      {
        name: "Cardamom Hill Retreat",
        location: "Munnar",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&fit=crop",
      },
    ],
    popularItems: [
      {
        name: "Bamboo Forest Hut",
        location: "Wayanad",
        price: "From ₹4,200/night",
        image:
          "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&fit=crop",
      },
      {
        name: "Pondicherry Villa",
        location: "Pondicherry",
        price: "From ₹7,500/night",
        image:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75&fit=crop",
      },
      {
        name: "Spice Garden Stay",
        location: "Coorg",
        price: "From ₹5,000/night",
        image:
          "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=75&fit=crop",
      },
      {
        name: "Himalayan Homestay",
        location: "Manali",
        price: "From ₹3,800/night",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop",
      },
    ],
  },
  studios: {
    categoryLabel: "Studios",
    adHeading: "List your studio or creative space",
    adSubtext:
      "Reach photographers, podcasters and content creators looking for their next shoot space.",
    sections: [
      {
        key: "recommended",
        title: "Creator Spaces",
        subtitle: "Photography, podcast & production studios near you",
      },
      {
        key: "recent",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off",
      },
    ],
    premiumBanner: {
      badge: "Creator Network",
      headline: "Professional Studios Available by the Hour",
      subtext:
        "From podcast booths to full film sets — book any creative space in minutes.",
      cta: "Find Studios",
      image:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      {
        name: "Studio One BLR",
        location: "Bengaluru",
        price: "₹800/hr",
        image:
          "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=75&fit=crop",
      },
      {
        name: "FilmHaus Mumbai",
        location: "Mumbai",
        price: "₹2,500/hr",
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75&fit=crop",
      },
      {
        name: "SoundBox Delhi",
        location: "Delhi",
        price: "₹1,200/hr",
        image:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=75&fit=crop",
      },
      {
        name: "Lens & Light Hyd",
        location: "Hyderabad",
        price: "₹900/hr",
        image:
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=75&fit=crop",
      },
    ],
    host: {
      name: "Arjun Sharma",
      tagline: "Studio host · Mumbai & Bengaluru",
      rating: "4.93",
      listings: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      {
        name: "Cinema-Grade Stage",
        location: "Mumbai",
        badge: "Pro",
        image:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=75&fit=crop",
      },
      {
        name: "Glass Rooftop Studio",
        location: "Bengaluru",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=75&fit=crop",
      },
      {
        name: "Heritage Art Space",
        location: "Delhi",
        badge: "Art",
        image:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=75&fit=crop",
      },
      {
        name: "Rooftop Photo Loft",
        location: "Chennai",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=75&fit=crop",
      },
      {
        name: "Analog Vinyl Studio",
        location: "Pune",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75&fit=crop",
      },
    ],
    popularItems: [
      {
        name: "Podcast Booth Pro",
        location: "Bengaluru",
        price: "₹600/hr",
        image:
          "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=75&fit=crop",
      },
      {
        name: "Content Cave Pune",
        location: "Pune",
        price: "₹750/hr",
        image:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=75&fit=crop",
      },
      {
        name: "The Green Room",
        location: "Mumbai",
        price: "₹1,800/hr",
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75&fit=crop",
      },
      {
        name: "AudioBox Chennai",
        location: "Chennai",
        price: "₹500/hr",
        image:
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=75&fit=crop",
      },
    ],
  },
  rentals: {
    categoryLabel: "Rentals",
    adHeading: "List your rental space",
    adSubtext:
      "Reach event organizers and pop-up hosts across India looking for flexible spaces.",
    sections: [
      {
        key: "recommended",
        title: "Popular Rentals",
        subtitle: "Flexible short-term spaces near you",
      },
      {
        key: "recent",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off",
      },
    ],
    premiumBanner: {
      badge: "Flexible Rentals",
      headline: "Book Spaces by the Hour, Day or Week",
      subtext:
        "Pop-ups, exhibitions, private parties — find the right space for every occasion.",
      cta: "Browse Rentals",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      {
        name: "The Loft Space",
        location: "Bengaluru",
        price: "₹5,000/day",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=75&fit=crop",
      },
      {
        name: "Bandra Terrace",
        location: "Mumbai",
        price: "₹12,000/day",
        image:
          "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop",
      },
      {
        name: "Heritage Haveli",
        location: "Jaipur",
        price: "₹18,000/day",
        image:
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop",
      },
      {
        name: "Garden Pavilion",
        location: "Pune",
        price: "₹7,500/day",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75&fit=crop",
      },
    ],
    host: {
      name: "Sneha Kapoor",
      tagline: "Rental space curator · Mumbai",
      rating: "4.91",
      listings: 9,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      {
        name: "Penthouse Lounge",
        location: "Mumbai",
        badge: "Luxury",
        image:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=75&fit=crop",
      },
      {
        name: "Rooftop Garden",
        location: "Delhi",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop",
      },
      {
        name: "Poolside Venue",
        location: "Goa",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75&fit=crop",
      },
      {
        name: "Seaside Marquee",
        location: "Goa",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75&fit=crop",
      },
      {
        name: "Courtyard Haveli",
        location: "Udaipur",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop",
      },
    ],
    popularItems: [
      {
        name: "The Loft Collective",
        location: "Bengaluru",
        price: "₹3,500/day",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=75&fit=crop",
      },
      {
        name: "Khar Social Space",
        location: "Mumbai",
        price: "₹9,000/day",
        image:
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75&fit=crop",
      },
      {
        name: "Fort Courtyard",
        location: "Jaipur",
        price: "₹14,000/day",
        image:
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop",
      },
      {
        name: "Whitefield Studio",
        location: "Bengaluru",
        price: "₹4,500/day",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75&fit=crop",
      },
    ],
  },
  workspaces: {
    categoryLabel: "Workspaces",
    adHeading: "List your workspace or office",
    adSubtext:
      "Connect with teams and freelancers looking for coworking desks and meeting rooms.",
    sections: [
      {
        key: "recommended",
        title: "Coworking Spaces",
        subtitle: "Offices, meeting rooms & shared desks near you",
      },
      {
        key: "recent",
        title: "Recently Viewed",
        subtitle: "Pick up where you left off",
      },
    ],
    premiumBanner: {
      badge: "Enterprise Ready",
      headline: "Flexible Offices & Meeting Rooms Across India",
      subtext:
        "Hot desks to full-floor offices — book by the hour, day or month.",
      cta: "Find Workspace",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      {
        name: "WeWork BLR One",
        location: "Bengaluru",
        price: "₹500/day",
        image:
          "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop",
      },
      {
        name: "The Hive Mumbai",
        location: "Mumbai",
        price: "₹800/day",
        image:
          "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75&fit=crop",
      },
      {
        name: "Smartworks Delhi",
        location: "Delhi",
        price: "₹600/day",
        image:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop",
      },
      {
        name: "91springboard",
        location: "Hyderabad",
        price: "₹450/day",
        image:
          "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop",
      },
    ],
    host: {
      name: "Vikram Iyer",
      tagline: "Office space operator · Bengaluru",
      rating: "4.89",
      listings: 14,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      {
        name: "Glass Tower Suite",
        location: "Mumbai",
        badge: "Premium",
        image:
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=75&fit=crop",
      },
      {
        name: "Innovation Hub",
        location: "Bengaluru",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75&fit=crop",
      },
      {
        name: "Executive Boardroom",
        location: "Delhi",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop",
      },
      {
        name: "Sky Lounge Offices",
        location: "Hyderabad",
        badge: "New",
        image:
          "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop",
      },
      {
        name: "Founders' Boardroom",
        location: "Pune",
        badge: null,
        image:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop",
      },
    ],
    popularItems: [
      {
        name: "Regus BLR South",
        location: "Bengaluru",
        price: "₹350/day",
        image:
          "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop",
      },
      {
        name: "Awfis Andheri",
        location: "Mumbai",
        price: "₹550/day",
        image:
          "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75&fit=crop",
      },
      {
        name: "CoWrks CP",
        location: "Delhi",
        price: "₹400/day",
        image:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop",
      },
      {
        name: "Innov8 Hyderabad",
        location: "Hyderabad",
        price: "₹300/day",
        image:
          "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop",
      },
    ],
  },
  experiences: {
    categoryLabel: "Experiences",
    adHeading: "Offer an experience on venuebook.in",
    adSubtext:
      "Join thousands of hosts offering curated activities, tours & events.",
    sections: [],
    premiumBanner: null,
    sponsoredItems: [],
    host: null,
    luxuryItems: [],
    popularItems: [],
  },
};

/* Sample venue cards (replace with API) */
const SAMPLE_VENUES = [
  {
    name: "Royal Palace",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=75&fit=crop",
    location: "Delhi",
    rating: 4.8,
    reviews: 312,
  },
  {
    name: "Ocean View Hall",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&fit=crop",
    location: "Mumbai",
    rating: 4.7,
    reviews: 201,
  },
  {
    name: "Mountain Retreat",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop",
    location: "Manali",
    rating: 4.9,
    reviews: 87,
  },
  {
    name: "Green Lawn Estate",
    image:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop",
    location: "Bengaluru",
    rating: 4.6,
    reviews: 450,
  },
  {
    name: "Skyline Terrace",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop",
    location: "Hyderabad",
    rating: 4.5,
    reviews: 132,
  },
];

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: "easeInOut" },
};

export default function Home() {
  const [openSearch, setOpenSearch] = useState(false);
  const { activeCategory } = useCategory();

  const [loadData, setLoadData]  = useState([]);
  const [recent, setRecent]  = useState([]);
  const [recommeded, setRecommeded]  = useState([]);
  const [destination, setDestination]  = useState([]);
  // The two real API-backed fetches on this page: Recommended/Recently
  // Viewed venues, and the category chip row (findPropertyname). Popular/
  // Sponsored/Banner/TopDestinations are static config and technically
  // available synchronously, but they're gated on loadingVenues too (below)
  // so the whole page arrives as one coherent frame.
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { user } = useAuth();

  const isComingSoon = CATEGORIES[activeCategory]?.comingSoon ?? false;
  const content = CATEGORY_CONTENT[activeCategory] ?? CATEGORY_CONTENT.venues;
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;

  useEffect(() => {
    document.body.style.overflow = openSearch ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openSearch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!activeCategory) return; // 🔒 prevent undefined call
      setLoadingCategories(true);
      try {
        const res = await findPropertyname(activeCategory);

        if (!cancelled) setLoadData(res?.data?.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);


  const getRecommendedVenues = async () => {
  const res = await Api_recommeded();
  setRecommeded(res?.data ?? []);
  
  const resp = await topDestination();
  setDestination(resp?.data ?? []);


};

const getRecentViews = async () => {
  if (!user) {
    setRecent([]);
    return;
  }

  const res = await recent_views();
  setRecent(res?.data ?? []);
};

useEffect(() => {
  let cancelled = false;
  const loadData = async () => {
    setLoadingVenues(true);
    try {
      await Promise.all([
        getRecommendedVenues(),
        getRecentViews(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      // Guards against setting state after the effect's own cleanup ran
      // (e.g. `user` flips again before the first fetch settles).
      if (!cancelled) setLoadingVenues(false);
    }
  };

  loadData();
  return () => {
    cancelled = true;
  };
}, [user]);

  return (
    <>
      <HeroSection setOpenSearch={setOpenSearch}   itemDest={destination}/>
      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} itemDest={destination} />

      <AnimatePresence mode="wait">
        <motion.div key={activeCategory} {...FADE}>
          {/* Sub-category chips */}
          {!isComingSoon && <CategorySection loadData={loadData} loading={loadingCategories} />}

          {!isComingSoon && content.sections.length > 0 && (
            // pt-16: guarantees the gap from the category strip to whichever
            // section renders first (Recently Viewed, or Recommended when
            // there's no recent-view data) — independent of which one that
            // is, instead of relying on Categories' own bottom padding.
            <div className="w-full mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8">
              {/* Section 2 — Recently Viewed (moved above Recommended) — medium cards */}
              {content.sections[1] && (
                <VenueSection
                  title={content.sections[1].title}
                  subtitle={content.sections[1].subtitle}
                   venues={recent}
                  dataSource="api"
                  tint={tint}
                  variant="medium"
                  loading={loadingVenues}
                />
              )}

              {/* Section 1 — Recommended — large editorial cards */}
              {content.sections[0] && (
                <VenueSection
                  title={content.sections[0].title}
                  subtitle={content.sections[0].subtitle}
                  venues={recommeded}
                  tint={tint}
                    dataSource="api"
                  variant="editorial"
                  loading={loadingVenues}
                />
              )}

              {/* Inline ad — Premium banner. Popular/Sponsored/TopDestinations
                  are static config (always available instantly), but they're
                  gated on the same loadingVenues flag as Recommended/Recently
                  Viewed so the whole homepage arrives as one coherent frame
                  instead of some sections popping in before others. */}
              {content.premiumBanner && (
                loadingVenues ? <SkeletonBanner /> : <PremiumBanner tint={tint} {...content.premiumBanner} />
              )}

              {/* Popular {category} — landscape PropertyCard variant, above sponsored */}
              {content.popularItems?.length > 0 && (
                loadingVenues ? (
                  <SkeletonRail
                    title={`Popular ${content.categoryLabel ?? "Venues"}`}
                    subtitle={`Trending picks in ${(content.categoryLabel ?? "Venues").toLowerCase()}`}
                    eyebrow="Popular"
                    accent={tint?.hex ?? "#7c3aed"}
                    variant="landscape"
                  />
                ) : (
                  <PopularCategoryRow
                    tint={tint}
                    categoryLabel={content.categoryLabel ?? "Venues"}
                    items={content.popularItems}
                  />
                )
              )}

              {/* Sponsored {category} — scrollable carousel with arrows */}
              {content.sponsoredItems?.length > 0 && (
                loadingVenues ? (
                  <SkeletonRail
                    title={`Sponsored ${content.categoryLabel ?? "Venues"}`}
                    subtitle="Featured partner listings"
                    eyebrow="Sponsored"
                    accent={tint?.hex ?? "#7c3aed"}
                    variant="compact"
                  />
                ) : (
                  <SponsoredCategoryRow
                    tint={tint}
                    categoryLabel={content.categoryLabel ?? "Venues"}
                    items={content.sponsoredItems}
                  />
                )
              )}

              {/* Ad carousel — replaces the old Featured Host card */}
              {loadingVenues ? <SkeletonAdCarousel /> : <AdCarousel />}

              {/* Top Destinations */}
              {content.luxuryItems?.length > 0 && (
  loadingVenues ? (
    <SkeletonTopDestinations />
  ) : destination?.length > 0 ? (
    <TopDestinations
      tint={tint}
      title="Top Destinations"
      items={content.luxuryItems}
      itemDest={destination}
    />
  ) : (
    <div className="py-8 text-center text-gray-500">
       <SkeletonTopDestinations />
      {/* No destinations found. */}
    </div>
  )
)}
            </div>
          )}

          {/* Coming soon */}
          {isComingSoon && (
            <div className="w-full mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16 text-center">
              <p className="text-4xl mb-4">🚀</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
                We&apos;re building something exciting. Be the first to know
                when {activeCategory} launches.
              </p>
            </div>
          )}

          {/* Advertise banner */}
          {/* <AdvertiseBanner heading={content.adHeading} subtext={content.adSubtext} /> */}

          {/* Destination section */}
          {/* <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DestinationSection />
          </div> */}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
