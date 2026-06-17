/**
 * staticVenues.js
 *
 * 36 static listings — 3 per category per country (India + UAE).
 * All prices stored in INR (project rule). UAE prices converted at 1 AED ≈ 22.5 INR.
 * childVenueId format: sv-{country}-{category}-{n}
 * parentVenueId format: pv-{country}-{category}-{n}
 */

// ─── Shared Unsplash images per category ───────────────────────────────────
const IMGS = {
  venues: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
  ],
  farmstays: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=800&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80",
  ],
  studios: [
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    "https://images.unsplash.com/photo-1574120818-7c573f38e2e3?w=800&q=80",
    "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&q=80",
    "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80",
    "https://images.unsplash.com/photo-1581281863883-2469417a1668?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  ],
  rentals: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  ],
  workspaces: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a7bbe?w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80",
  ],
  experiences: [
    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    "https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800&q=80",
    "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80",
  ],
};

// ─── Helper to pick 2 images per entry ─────────────────────────────────────
const img = (cat, idx) => [IMGS[cat][idx * 2], IMGS[cat][idx * 2 + 1]];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — VENUES
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_VENUES = [
  {
    childVenueId: "sv-in-v-1",
    parentVenueId: "pv-in-v-1",
    venueName: "Grand Ballroom",
    parentVenueName: "The Leela Palace Bengaluru",
    category: "venues",
    country: "india",
    lat: 12.9716, lng: 77.5946,
    city: "Bengaluru", state: "Karnataka",
    minPrice: 75000,
    maxGuests: 500,
    venueType: "Banquet Hall",
    rating: 4.8, reviewCount: 124,
    featured: true,
    images: img("venues", 0),
  },
  {
    childVenueId: "sv-in-v-2",
    parentVenueId: "pv-in-v-2",
    venueName: "Terrace Garden Hall",
    parentVenueName: "ITC Maratha Mumbai",
    category: "venues",
    country: "india",
    lat: 19.0990, lng: 72.8668,
    city: "Mumbai", state: "Maharashtra",
    minPrice: 95000,
    maxGuests: 800,
    venueType: "Rooftop Venue",
    rating: 4.9, reviewCount: 211,
    featured: true,
    images: img("venues", 1),
  },
  {
    childVenueId: "sv-in-v-3",
    parentVenueId: "pv-in-v-3",
    venueName: "Amber Durbar Hall",
    parentVenueName: "Rambagh Palace Jaipur",
    category: "venues",
    country: "india",
    lat: 26.8935, lng: 75.8120,
    city: "Jaipur", state: "Rajasthan",
    minPrice: 1200000,
    maxGuests: 1000,
    venueType: "Heritage Palace",
    rating: 5.0, reviewCount: 89,
    suggested: true,
    images: img("venues", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — FARMSTAYS
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_FARMSTAYS = [
  {
    childVenueId: "sv-in-f-1",
    parentVenueId: "pv-in-f-1",
    venueName: "Misty Coffee Cottage",
    parentVenueName: "Coorg Wilderness Estate",
    category: "farmstays",
    country: "india",
    lat: 12.3375, lng: 75.8069,
    city: "Coorg", state: "Karnataka",
    minPrice: 8500,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.7, reviewCount: 56,
    featured: true,
    images: img("farmstays", 0),
  },
  {
    childVenueId: "sv-in-f-2",
    parentVenueId: "pv-in-f-2",
    venueName: "Spice Valley Bungalow",
    parentVenueName: "Wayanad Retreat Farm",
    category: "farmstays",
    country: "india",
    lat: 11.6854, lng: 76.1320,
    city: "Wayanad", state: "Kerala",
    minPrice: 7200,
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.6, reviewCount: 72,
    images: img("farmstays", 1),
  },
  {
    childVenueId: "sv-in-f-3",
    parentVenueId: "pv-in-f-3",
    venueName: "Tea Garden Villa",
    parentVenueName: "Munnar Hills Farmhouse",
    category: "farmstays",
    country: "india",
    lat: 10.0889, lng: 77.0595,
    city: "Munnar", state: "Kerala",
    minPrice: 9800,
    maxGuests: 10,
    bedrooms: 5,
    rating: 4.9, reviewCount: 43,
    suggested: true,
    images: img("farmstays", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — STUDIOS
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_STUDIOS = [
  {
    childVenueId: "sv-in-s-1",
    parentVenueId: "pv-in-s-1",
    venueName: "Studio Alpha",
    parentVenueName: "Lightbox Creative Hub",
    category: "studios",
    country: "india",
    lat: 12.9352, lng: 77.6245,
    city: "Bengaluru", state: "Karnataka",
    minPrice: 1800,
    studioType: "Photography Studio",
    sizeSqft: 1200,
    rating: 4.6, reviewCount: 38,
    images: img("studios", 0),
  },
  {
    childVenueId: "sv-in-s-2",
    parentVenueId: "pv-in-s-2",
    venueName: "Film Studio B",
    parentVenueName: "Dharavi Film Studios",
    category: "studios",
    country: "india",
    lat: 19.0422, lng: 72.8561,
    city: "Mumbai", state: "Maharashtra",
    minPrice: 3500,
    studioType: "Film & Video Studio",
    sizeSqft: 3500,
    rating: 4.8, reviewCount: 91,
    featured: true,
    images: img("studios", 1),
  },
  {
    childVenueId: "sv-in-s-3",
    parentVenueId: "pv-in-s-3",
    venueName: "Podcast Suite 1",
    parentVenueName: "SoundBox Hyderabad",
    category: "studios",
    country: "india",
    lat: 17.4324, lng: 78.4072,
    city: "Hyderabad", state: "Telangana",
    minPrice: 950,
    studioType: "Podcast / Recording",
    sizeSqft: 450,
    rating: 4.5, reviewCount: 29,
    images: img("studios", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — RENTALS
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_RENTALS = [
  {
    childVenueId: "sv-in-r-1",
    parentVenueId: "pv-in-r-1",
    venueName: "Sea-View Penthouse",
    parentVenueName: "Goa Luxury Stays",
    category: "rentals",
    country: "india",
    lat: 15.2993, lng: 73.9169,
    city: "Panaji", state: "Goa",
    minPrice: 18000,
    rentalType: "Entire Apartment",
    pricingType: "Per Night",
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.7, reviewCount: 63,
    featured: true,
    images: img("rentals", 0),
  },
  {
    childVenueId: "sv-in-r-2",
    parentVenueId: "pv-in-r-2",
    venueName: "Heritage Haveli Suite",
    parentVenueName: "Pink City Home Stays",
    category: "rentals",
    country: "india",
    lat: 26.9124, lng: 75.7873,
    city: "Jaipur", state: "Rajasthan",
    minPrice: 12500,
    rentalType: "Heritage Suite",
    pricingType: "Per Night",
    maxGuests: 4,
    bedrooms: 2,
    rating: 4.9, reviewCount: 112,
    suggested: true,
    images: img("rentals", 1),
  },
  {
    childVenueId: "sv-in-r-3",
    parentVenueId: "pv-in-r-3",
    venueName: "Studio Loft",
    parentVenueName: "Delhi Urban Rentals",
    category: "rentals",
    country: "india",
    lat: 28.6352, lng: 77.2245,
    city: "New Delhi", state: "Delhi",
    minPrice: 7500,
    rentalType: "Studio Loft",
    pricingType: "Per Night",
    maxGuests: 2,
    bedrooms: 1,
    rating: 4.4, reviewCount: 48,
    images: img("rentals", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — WORKSPACES
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_WORKSPACES = [
  {
    childVenueId: "sv-in-w-1",
    parentVenueId: "pv-in-w-1",
    venueName: "Focus Pod A",
    parentVenueName: "WeWork Bengaluru Embassy",
    category: "workspaces",
    country: "india",
    lat: 12.9698, lng: 77.7499,
    city: "Bengaluru", state: "Karnataka",
    minPrice: 800,
    workspaceType: "Private Cabin",
    seatingCapacity: 4,
    rating: 4.5, reviewCount: 87,
    images: img("workspaces", 0),
  },
  {
    childVenueId: "sv-in-w-2",
    parentVenueId: "pv-in-w-2",
    venueName: "Conference Suite",
    parentVenueName: "91Springboard Hyderabad",
    category: "workspaces",
    country: "india",
    lat: 17.4481, lng: 78.3915,
    city: "Hyderabad", state: "Telangana",
    minPrice: 2200,
    workspaceType: "Conference Room",
    seatingCapacity: 20,
    rating: 4.7, reviewCount: 54,
    featured: true,
    images: img("workspaces", 1),
  },
  {
    childVenueId: "sv-in-w-3",
    parentVenueId: "pv-in-w-3",
    venueName: "Innovation Hub",
    parentVenueName: "CoWrks Pune",
    category: "workspaces",
    country: "india",
    lat: 18.5532, lng: 73.9143,
    city: "Pune", state: "Maharashtra",
    minPrice: 1200,
    workspaceType: "Open Coworking",
    seatingCapacity: 50,
    rating: 4.6, reviewCount: 101,
    images: img("workspaces", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INDIA — EXPERIENCES
// ═══════════════════════════════════════════════════════════════════════════
const INDIA_EXPERIENCES = [
  {
    childVenueId: "sv-in-e-1",
    parentVenueId: "pv-in-e-1",
    venueName: "Desert Camping Night",
    parentVenueName: "Rajasthan Desert Adventures",
    category: "experiences",
    country: "india",
    lat: 27.0238, lng: 74.2179,
    city: "Jaisalmer", state: "Rajasthan",
    minPrice: 3500,
    duration: "1 Night",
    maxParticipants: 20,
    rating: 4.9, reviewCount: 176,
    featured: true,
    images: img("experiences", 0),
  },
  {
    childVenueId: "sv-in-e-2",
    parentVenueId: "pv-in-e-2",
    venueName: "Backwater Houseboat Cruise",
    parentVenueName: "Kerala Waterways Tours",
    category: "experiences",
    country: "india",
    lat: 9.4981, lng: 76.3388,
    city: "Alleppey", state: "Kerala",
    minPrice: 4800,
    duration: "Full Day",
    maxParticipants: 12,
    rating: 4.8, reviewCount: 203,
    suggested: true,
    images: img("experiences", 1),
  },
  {
    childVenueId: "sv-in-e-3",
    parentVenueId: "pv-in-e-3",
    venueName: "Hampi Ruins Cycling",
    parentVenueName: "Deccan Explorers",
    category: "experiences",
    country: "india",
    lat: 15.3350, lng: 76.4600,
    city: "Hampi", state: "Karnataka",
    minPrice: 1800,
    duration: "Half Day",
    maxParticipants: 15,
    rating: 4.7, reviewCount: 88,
    images: img("experiences", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — VENUES
// ═══════════════════════════════════════════════════════════════════════════
const UAE_VENUES = [
  {
    childVenueId: "sv-ae-v-1",
    parentVenueId: "pv-ae-v-1",
    venueName: "Marina Ballroom",
    parentVenueName: "Address Dubai Marina",
    category: "venues",
    country: "dubai",
    lat: 25.0778, lng: 55.1336,
    city: "Dubai Marina", state: "Dubai",
    minPrice: 337500,   // AED 15,000 × 22.5
    maxGuests: 600,
    venueType: "Luxury Ballroom",
    rating: 4.9, reviewCount: 94,
    featured: true,
    images: img("venues", 0),
  },
  {
    childVenueId: "sv-ae-v-2",
    parentVenueId: "pv-ae-v-2",
    venueName: "Falcon Hall",
    parentVenueName: "Emirates Palace Abu Dhabi",
    category: "venues",
    country: "dubai",
    lat: 24.4613, lng: 54.3179,
    city: "Abu Dhabi", state: "Abu Dhabi",
    minPrice: 562500,   // AED 25,000 × 22.5
    maxGuests: 1200,
    venueType: "Grand Ballroom",
    rating: 5.0, reviewCount: 67,
    suggested: true,
    images: img("venues", 1),
  },
  {
    childVenueId: "sv-ae-v-3",
    parentVenueId: "pv-ae-v-3",
    venueName: "Skyline Terrace",
    parentVenueName: "Sheraton Sharjah Beach",
    category: "venues",
    country: "dubai",
    lat: 25.3508, lng: 55.3896,
    city: "Sharjah", state: "Sharjah",
    minPrice: 135000,   // AED 6,000 × 22.5
    maxGuests: 300,
    venueType: "Beachfront Terrace",
    rating: 4.7, reviewCount: 51,
    images: img("venues", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — FARMSTAYS
// ═══════════════════════════════════════════════════════════════════════════
const UAE_FARMSTAYS = [
  {
    childVenueId: "sv-ae-f-1",
    parentVenueId: "pv-ae-f-1",
    venueName: "Desert Rose Villa",
    parentVenueName: "Anantara Qasr Al Sarab",
    category: "farmstays",
    country: "dubai",
    lat: 25.7895, lng: 55.9432,
    city: "Ras Al Khaimah", state: "Ras Al Khaimah",
    minPrice: 27000,    // AED 1,200 × 22.5
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.8, reviewCount: 45,
    featured: true,
    images: img("farmstays", 0),
  },
  {
    childVenueId: "sv-ae-f-2",
    parentVenueId: "pv-ae-f-2",
    venueName: "Oasis Garden Chalet",
    parentVenueName: "Al Ain Green Farm Retreats",
    category: "farmstays",
    country: "dubai",
    lat: 24.2075, lng: 55.7447,
    city: "Al Ain", state: "Abu Dhabi",
    minPrice: 18000,    // AED 800 × 22.5
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.6, reviewCount: 32,
    images: img("farmstays", 1),
  },
  {
    childVenueId: "sv-ae-f-3",
    parentVenueId: "pv-ae-f-3",
    venueName: "Mountain Spring Cabin",
    parentVenueName: "Hatta Hill Farm",
    category: "farmstays",
    country: "dubai",
    lat: 24.7984, lng: 56.1078,
    city: "Hatta", state: "Dubai",
    minPrice: 22500,    // AED 1,000 × 22.5
    maxGuests: 5,
    bedrooms: 2,
    rating: 4.9, reviewCount: 58,
    suggested: true,
    images: img("farmstays", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — STUDIOS
// ═══════════════════════════════════════════════════════════════════════════
const UAE_STUDIOS = [
  {
    childVenueId: "sv-ae-s-1",
    parentVenueId: "pv-ae-s-1",
    venueName: "Studio One",
    parentVenueName: "Dubai Media Hub",
    category: "studios",
    country: "dubai",
    lat: 25.0804, lng: 55.1403,
    city: "Dubai Marina", state: "Dubai",
    minPrice: 6750,     // AED 300/hr × 22.5
    studioType: "Photography Studio",
    sizeSqft: 1800,
    rating: 4.7, reviewCount: 62,
    images: img("studios", 0),
  },
  {
    childVenueId: "sv-ae-s-2",
    parentVenueId: "pv-ae-s-2",
    venueName: "Content Creator Suite",
    parentVenueName: "JLT Creative Studios",
    category: "studios",
    country: "dubai",
    lat: 25.0705, lng: 55.1489,
    city: "Jumeirah Lake Towers", state: "Dubai",
    minPrice: 4500,     // AED 200/hr × 22.5
    studioType: "Content & Video",
    sizeSqft: 1100,
    rating: 4.5, reviewCount: 38,
    images: img("studios", 1),
  },
  {
    childVenueId: "sv-ae-s-3",
    parentVenueId: "pv-ae-s-3",
    venueName: "Podcast Room A",
    parentVenueName: "Business Bay Studio Complex",
    category: "studios",
    country: "dubai",
    lat: 25.1868, lng: 55.2742,
    city: "Business Bay", state: "Dubai",
    minPrice: 3375,     // AED 150/hr × 22.5
    studioType: "Podcast / Recording",
    sizeSqft: 600,
    rating: 4.6, reviewCount: 27,
    featured: true,
    images: img("studios", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — RENTALS
// ═══════════════════════════════════════════════════════════════════════════
const UAE_RENTALS = [
  {
    childVenueId: "sv-ae-r-1",
    parentVenueId: "pv-ae-r-1",
    venueName: "Palm View Apartment",
    parentVenueName: "Palm Jumeirah Residences",
    category: "rentals",
    country: "dubai",
    lat: 25.1124, lng: 55.1390,
    city: "Palm Jumeirah", state: "Dubai",
    minPrice: 45000,    // AED 2,000/night × 22.5
    rentalType: "Luxury Apartment",
    pricingType: "Per Night",
    maxGuests: 4,
    bedrooms: 2,
    rating: 4.9, reviewCount: 134,
    featured: true,
    images: img("rentals", 0),
  },
  {
    childVenueId: "sv-ae-r-2",
    parentVenueId: "pv-ae-r-2",
    venueName: "Burj View Studio",
    parentVenueName: "Downtown Dubai Stays",
    category: "rentals",
    country: "dubai",
    lat: 25.1972, lng: 55.2744,
    city: "Downtown Dubai", state: "Dubai",
    minPrice: 27000,    // AED 1,200/night × 22.5
    rentalType: "Studio Apartment",
    pricingType: "Per Night",
    maxGuests: 2,
    bedrooms: 1,
    rating: 4.7, reviewCount: 89,
    suggested: true,
    images: img("rentals", 1),
  },
  {
    childVenueId: "sv-ae-r-3",
    parentVenueId: "pv-ae-r-3",
    venueName: "Beach Walk Penthouse",
    parentVenueName: "JBR Premium Rentals",
    category: "rentals",
    country: "dubai",
    lat: 25.0761, lng: 55.1296,
    city: "JBR", state: "Dubai",
    minPrice: 56250,    // AED 2,500/night × 22.5
    rentalType: "Penthouse",
    pricingType: "Per Night",
    maxGuests: 6,
    bedrooms: 3,
    rating: 5.0, reviewCount: 72,
    images: img("rentals", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — WORKSPACES
// ═══════════════════════════════════════════════════════════════════════════
const UAE_WORKSPACES = [
  {
    childVenueId: "sv-ae-w-1",
    parentVenueId: "pv-ae-w-1",
    venueName: "Executive Boardroom",
    parentVenueName: "DIFC Innovation Hub",
    category: "workspaces",
    country: "dubai",
    lat: 25.2131, lng: 55.2796,
    city: "DIFC", state: "Dubai",
    minPrice: 6750,     // AED 300/day × 22.5
    workspaceType: "Boardroom",
    seatingCapacity: 12,
    rating: 4.8, reviewCount: 74,
    featured: true,
    images: img("workspaces", 0),
  },
  {
    childVenueId: "sv-ae-w-2",
    parentVenueId: "pv-ae-w-2",
    venueName: "Co-Work Open Floor",
    parentVenueName: "Regus Abu Dhabi HQ",
    category: "workspaces",
    country: "dubai",
    lat: 24.4539, lng: 54.3773,
    city: "Abu Dhabi", state: "Abu Dhabi",
    minPrice: 2250,     // AED 100/day × 22.5
    workspaceType: "Open Coworking",
    seatingCapacity: 80,
    rating: 4.5, reviewCount: 112,
    images: img("workspaces", 1),
  },
  {
    childVenueId: "sv-ae-w-3",
    parentVenueId: "pv-ae-w-3",
    venueName: "Private Office Suite",
    parentVenueName: "WeWork Dubai Marina",
    category: "workspaces",
    country: "dubai",
    lat: 25.0820, lng: 55.1380,
    city: "Dubai Marina", state: "Dubai",
    minPrice: 4500,     // AED 200/day × 22.5
    workspaceType: "Private Office",
    seatingCapacity: 6,
    rating: 4.6, reviewCount: 59,
    suggested: true,
    images: img("workspaces", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UAE — EXPERIENCES
// ═══════════════════════════════════════════════════════════════════════════
const UAE_EXPERIENCES = [
  {
    childVenueId: "sv-ae-e-1",
    parentVenueId: "pv-ae-e-1",
    venueName: "Desert Safari & Dune Bash",
    parentVenueName: "Arabian Adventures Dubai",
    category: "experiences",
    country: "dubai",
    lat: 25.0659, lng: 55.4209,
    city: "Dubai Desert", state: "Dubai",
    minPrice: 3375,     // AED 150/person × 22.5
    duration: "Half Day",
    maxParticipants: 20,
    rating: 4.9, reviewCount: 318,
    featured: true,
    images: img("experiences", 0),
  },
  {
    childVenueId: "sv-ae-e-2",
    parentVenueId: "pv-ae-e-2",
    venueName: "Hatta Mountain Kayaking",
    parentVenueName: "Hatta Wadi Hub",
    category: "experiences",
    country: "dubai",
    lat: 24.8020, lng: 56.1060,
    city: "Hatta", state: "Dubai",
    minPrice: 2250,     // AED 100/person × 22.5
    duration: "3 Hours",
    maxParticipants: 12,
    rating: 4.8, reviewCount: 145,
    suggested: true,
    images: img("experiences", 1),
  },
  {
    childVenueId: "sv-ae-e-3",
    parentVenueId: "pv-ae-e-3",
    venueName: "Fujairah Snorkeling Tour",
    parentVenueName: "East Coast Divers UAE",
    category: "experiences",
    country: "dubai",
    lat: 25.1288, lng: 56.3265,
    city: "Fujairah", state: "Fujairah",
    minPrice: 2925,     // AED 130/person × 22.5
    duration: "Full Day",
    maxParticipants: 10,
    rating: 4.7, reviewCount: 93,
    images: img("experiences", 2),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export const STATIC_VENUES = [
  ...INDIA_VENUES,
  ...INDIA_FARMSTAYS,
  ...INDIA_STUDIOS,
  ...INDIA_RENTALS,
  ...INDIA_WORKSPACES,
  ...INDIA_EXPERIENCES,
  ...UAE_VENUES,
  ...UAE_FARMSTAYS,
  ...UAE_STUDIOS,
  ...UAE_RENTALS,
  ...UAE_WORKSPACES,
  ...UAE_EXPERIENCES,
];

/**
 * Filter static venues by country + category (and optionally by map bounds).
 *
 * @param {string} country   - "india" | "dubai"
 * @param {string} category  - "venues" | "farmstays" | "studios" | "rentals" | "workspaces" | "experiences"
 * @param {object|null} bounds  - { north, south, east, west } or null to skip
 */
export function getStaticVenues(country, category, bounds = null) {
  return STATIC_VENUES.filter((v) => {
    if (v.country !== country) return false;
    if (category && v.category !== category) return false;
    if (bounds) {
      return (
        v.lat <= bounds.north &&
        v.lat >= bounds.south &&
        v.lng <= bounds.east &&
        v.lng >= bounds.west
      );
    }
    return true;
  });
}
