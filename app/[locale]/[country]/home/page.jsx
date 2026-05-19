"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroSection        from "./components/HeroSection";
import MobileSearchSheet  from "./components/MobileSearchSheet";
import CategorySection    from "./components/Categories";
import VenueSection       from "./components/VenueSection";
// import AdvertiseBanner    from "./components/AdvertiseBanner";
// import DestinationSection from "./components/DestinationSection";
import {
  PremiumBanner,
  SponsoredRow,
  HostSpotlight,
  LuxuryStrip,
} from "./components/InlineAdSection";

import { useCategory }      from "@/context/CategoryContext";
import { CATEGORIES, CATEGORY_TINTS } from "@/config/categoryConfig";

/* ── Category page content ──────────────────────────────────── */
const CATEGORY_CONTENT = {
  venues: {
    adHeading: "Advertise your venue to visitors",
    adSubtext: "Reach social, wedding and corporate clients on India's #1 venue hire marketplace.",
    sections: [
      { key: "recommended", title: "Recommended Venues",  subtitle: "Top-rated halls, banquets & event spaces near you" },
      { key: "sponsored",   title: "Sponsored Venues",    subtitle: "Featured properties handpicked for your next event" },
      { key: "recent",      title: "Recently Viewed",     subtitle: "Pick up where you left off" },
    ],
    premiumBanner: {
      badge: "Premium Partner",
      headline: "Exclusive Five-Star Event Spaces Now on VenueBook",
      subtext: "Curated luxury venues for weddings, corporate galas & private celebrations.",
      cta: "Explore Luxury",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      { name: "The Grand Ballroom",  location: "Bengaluru", price: "From ₹80,000",  image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75&fit=crop" },
      { name: "Sky Terrace Mumbai",  location: "Mumbai",    price: "From ₹1,20,000", image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop" },
      { name: "Royal Convention",    location: "Delhi",     price: "From ₹60,000",  image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75&fit=crop" },
      { name: "Lakeside Pavilion",   location: "Pune",      price: "From ₹45,000",  image: "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop" },
    ],
    host: {
      name: "Priya Mehta", tagline: "Luxury venue curator · Bengaluru", rating: "4.97", listings: 12,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      { name: "Crystal Ballroom",   location: "Mumbai",    badge: "New",   image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75&fit=crop" },
      { name: "Heritage Palace",    location: "Jaipur",    badge: "5★",    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&fit=crop" },
      { name: "Skyline Terrace",    location: "Delhi",     badge: null,    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop" },
    ],
  },
  farmstays: {
    adHeading: "List your farmstay or nature retreat",
    adSubtext: "Connect with thousands of travellers looking for authentic escapes across India.",
    sections: [
      { key: "recommended", title: "Weekend Retreats",   subtitle: "Nature stays & farm escapes near you" },
      { key: "sponsored",   title: "Featured Farmstays", subtitle: "Handpicked heritage estates & nature properties" },
      { key: "recent",      title: "Recently Viewed",    subtitle: "Pick up where you left off" },
    ],
    premiumBanner: {
      badge: "Curated Escapes",
      headline: "Handpicked Farms, Estates & Forest Retreats",
      subtext: "Authentic, off-grid stays connected directly from the hosts who tend them.",
      cta: "Browse Retreats",
      image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      { name: "Coorg Coffee Estate", location: "Coorg",   price: "From ₹8,000/night",  image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&fit=crop" },
      { name: "Goa Beachside Farm",  location: "Goa",     price: "From ₹12,000/night", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75&fit=crop" },
      { name: "Manali Pine Cabin",   location: "Manali",  price: "From ₹6,500/night",  image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop" },
      { name: "Ooty Tea Garden",     location: "Ooty",    price: "From ₹5,000/night",  image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=75&fit=crop" },
    ],
    host: {
      name: "Rajan Nair", tagline: "Nature host · Coorg & Wayanad", rating: "4.95", listings: 7,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      { name: "Misty Forest Estate",  location: "Coorg",  badge: "Top Pick", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75&fit=crop" },
      { name: "Riverside Bungalow",   location: "Kerala", badge: null,       image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75&fit=crop" },
      { name: "Heritage Haveli",      location: "Jaipur", badge: "Heritage", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop" },
    ],
  },
  studios: {
    adHeading: "List your studio or creative space",
    adSubtext: "Reach photographers, podcasters and content creators looking for their next shoot space.",
    sections: [
      { key: "recommended", title: "Creator Spaces",   subtitle: "Photography, podcast & production studios near you" },
      { key: "sponsored",   title: "Featured Studios", subtitle: "Top-rated recording & creative spaces" },
      { key: "recent",      title: "Recently Viewed",  subtitle: "Pick up where you left off" },
    ],
    premiumBanner: {
      badge: "Creator Network",
      headline: "Professional Studios Available by the Hour",
      subtext: "From podcast booths to full film sets — book any creative space in minutes.",
      cta: "Find Studios",
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      { name: "Studio One BLR",   location: "Bengaluru", price: "₹800/hr",   image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=75&fit=crop" },
      { name: "FilmHaus Mumbai",  location: "Mumbai",    price: "₹2,500/hr", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75&fit=crop" },
      { name: "SoundBox Delhi",   location: "Delhi",     price: "₹1,200/hr", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=75&fit=crop" },
      { name: "Lens & Light Hyd", location: "Hyderabad", price: "₹900/hr",   image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=75&fit=crop" },
    ],
    host: {
      name: "Arjun Sharma", tagline: "Studio host · Mumbai & Bengaluru", rating: "4.93", listings: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      { name: "Cinema-Grade Stage",  location: "Mumbai",    badge: "Pro",  image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=75&fit=crop" },
      { name: "Glass Rooftop Studio",location: "Bengaluru", badge: null,   image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=75&fit=crop" },
      { name: "Heritage Art Space",  location: "Delhi",     badge: "Art",  image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=75&fit=crop" },
    ],
  },
  rentals: {
    adHeading: "List your rental space",
    adSubtext: "Reach event organizers and pop-up hosts across India looking for flexible spaces.",
    sections: [
      { key: "recommended", title: "Popular Rentals",  subtitle: "Flexible short-term spaces near you" },
      { key: "sponsored",   title: "Featured Rentals", subtitle: "Premium spaces for every occasion" },
      { key: "recent",      title: "Recently Viewed",  subtitle: "Pick up where you left off" },
    ],
    premiumBanner: {
      badge: "Flexible Rentals",
      headline: "Book Spaces by the Hour, Day or Week",
      subtext: "Pop-ups, exhibitions, private parties — find the right space for every occasion.",
      cta: "Browse Rentals",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      { name: "The Loft Space",    location: "Bengaluru", price: "₹5,000/day",  image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=75&fit=crop" },
      { name: "Bandra Terrace",    location: "Mumbai",    price: "₹12,000/day", image: "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop" },
      { name: "Heritage Haveli",   location: "Jaipur",    price: "₹18,000/day", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop" },
      { name: "Garden Pavilion",   location: "Pune",      price: "₹7,500/day",  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75&fit=crop" },
    ],
    host: {
      name: "Sneha Kapoor", tagline: "Rental space curator · Mumbai", rating: "4.91", listings: 9,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      { name: "Penthouse Lounge",  location: "Mumbai",    badge: "Luxury", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=75&fit=crop" },
      { name: "Rooftop Garden",    location: "Delhi",     badge: null,     image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop" },
      { name: "Poolside Venue",    location: "Goa",       badge: "New",    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75&fit=crop" },
    ],
  },
  workspaces: {
    adHeading: "List your workspace or office",
    adSubtext: "Connect with teams and freelancers looking for coworking desks and meeting rooms.",
    sections: [
      { key: "recommended", title: "Coworking Spaces",  subtitle: "Offices, meeting rooms & shared desks near you" },
      { key: "sponsored",   title: "Featured Offices",  subtitle: "Premium workspaces for teams of every size" },
      { key: "recent",      title: "Recently Viewed",   subtitle: "Pick up where you left off" },
    ],
    premiumBanner: {
      badge: "Enterprise Ready",
      headline: "Flexible Offices & Meeting Rooms Across India",
      subtext: "Hot desks to full-floor offices — book by the hour, day or month.",
      cta: "Find Workspace",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fit=crop",
    },
    sponsoredItems: [
      { name: "WeWork BLR One",   location: "Bengaluru", price: "₹500/day",   image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop" },
      { name: "The Hive Mumbai",  location: "Mumbai",    price: "₹800/day",   image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75&fit=crop" },
      { name: "Smartworks Delhi", location: "Delhi",     price: "₹600/day",   image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop" },
      { name: "91springboard",    location: "Hyderabad", price: "₹450/day",   image: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop" },
    ],
    host: {
      name: "Vikram Iyer", tagline: "Office space operator · Bengaluru", rating: "4.89", listings: 14,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=75&fit=crop",
    },
    luxuryItems: [
      { name: "Glass Tower Suite",  location: "Mumbai",    badge: "Premium", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=75&fit=crop" },
      { name: "Innovation Hub",     location: "Bengaluru", badge: null,      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75&fit=crop" },
      { name: "Executive Boardroom",location: "Delhi",     badge: "New",     image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop" },
    ],
  },
  experiences: {
    adHeading: "Offer an experience on VenueBook",
    adSubtext: "Join thousands of hosts offering curated activities, tours & events.",
    sections: [],
    premiumBanner: null,
    sponsoredItems: [],
    host: null,
    luxuryItems: [],
  },
};

/* Sample venue cards (replace with API) */
const SAMPLE_VENUES = [
  { name: "Royal Palace",      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=75&fit=crop", location: "Delhi",     rating: 4.8, reviews: 312  },
  { name: "Ocean View Hall",   image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&fit=crop", location: "Mumbai",    rating: 4.7, reviews: 201  },
  { name: "Mountain Retreat",  image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop", location: "Manali",    rating: 4.9, reviews: 87   },
  { name: "Green Lawn Estate", image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop", location: "Bengaluru", rating: 4.6, reviews: 450  },
  { name: "Skyline Terrace",   image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop", location: "Hyderabad", rating: 4.5, reviews: 132  },
];

const FADE = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.22, ease: "easeInOut" },
};

export default function Home() {
  const [openSearch, setOpenSearch]  = useState(false);
  const { activeCategory }           = useCategory();

  const isComingSoon = CATEGORIES[activeCategory]?.comingSoon ?? false;
  const content      = CATEGORY_CONTENT[activeCategory] ?? CATEGORY_CONTENT.venues;
  const tint         = CATEGORY_TINTS[activeCategory]   ?? CATEGORY_TINTS.venues;

  useEffect(() => {
    document.body.style.overflow = openSearch ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [openSearch]);

  return (
    <>
      <HeroSection setOpenSearch={setOpenSearch} />
      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} />

      <AnimatePresence mode="wait">
        <motion.div key={activeCategory} {...FADE}>

          {/* Sub-category chips */}
          {!isComingSoon && <CategorySection />}

          {!isComingSoon && content.sections.length > 0 && (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Section 1 — Recommended */}
              {content.sections[0] && (
                <VenueSection
                  title={content.sections[0].title}
                  subtitle={content.sections[0].subtitle}
                  venues={SAMPLE_VENUES}
                />
              )}

              {/* Inline ad — Premium banner */}
              {content.premiumBanner && (
                <PremiumBanner tint={tint} {...content.premiumBanner} />
              )}

              {/* Section 2 — Sponsored */}
              {content.sections[1] && (
                <VenueSection
                  title={content.sections[1].title}
                  subtitle={content.sections[1].subtitle}
                  venues={SAMPLE_VENUES}
                />
              )}

              {/* Inline ad — Sponsored row */}
              {content.sponsoredItems.length > 0 && (
                <SponsoredRow
                  tint={tint}
                  title="Promoted Properties"
                  items={content.sponsoredItems}
                />
              )}

              {/* Inline ad — Host spotlight */}
              {content.host && (
                <HostSpotlight tint={tint} host={content.host} />
              )}

              {/* Section 3 — Recently Viewed */}
              {content.sections[2] && (
                <VenueSection
                  title={content.sections[2].title}
                  subtitle={content.sections[2].subtitle}
                  venues={SAMPLE_VENUES.slice(0, 3)}
                />
              )}

              {/* Inline ad — Luxury strip */}
              {content.luxuryItems.length > 0 && (
                <LuxuryStrip
                  tint={tint}
                  title="Luxury Collection"
                  items={content.luxuryItems}
                />
              )}

            </div>
          )}

          {/* Coming soon */}
          {isComingSoon && (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
              <p className="text-4xl mb-4">🚀</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Coming Soon</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
                We&apos;re building something exciting. Be the first to know when {activeCategory} launches.
              </p>
            </div>
          )}

          {/* Ad banner — category-aware copy */}
          {/* <AdvertiseBanner heading={content.adHeading} subtext={content.adSubtext} /> */}

          {/* Destinations */}
          {/* <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DestinationSection />
          </div> */}

        </motion.div>
      </AnimatePresence>
    </>
  );
}
