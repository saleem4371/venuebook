/**
 * estateData.js
 *
 * MOCK / PLACEHOLDER DATA — Phase 1.
 *
 * There is currently no backend endpoint that returns a parent estate's
 * public profile plus its children across every category in one call
 * (the only existing parent API, /parent-listing/parent in
 * services/parent.service.js, is scoped to the logged-in vendor's own
 * session for the admin editor, not a public "get estate by id"). Every
 * other public page in this app (search/[type]/[id]/page.jsx, home page
 * cards, RelatedVenues.jsx) is in the same state — hardcoded demo content,
 * no live wiring — so this file follows the same convention on purpose.
 *
 * Swap `getEstateData()` for a real fetch once the backend exposes:
 *   GET /parent-listing/:id/public
 * The shape below is what that response should approximate.
 */

import {
  Waves, Trees, ShieldCheck, ParkingCircle, UtensilsCrossed, Building2,
  Wifi, Car, Baby, Landmark, Sparkles as SparklesIcon,
} from "lucide-react";

const HOSTED_MEDIA = (seed) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;

export const MONAPPA_ESTATE = {
  id: "monappa-estates",
  name: "Monappa Estates",
  logoInitial: "M",
  tagline: "An entire destination, not just a venue.",
  verified: true,
  establishedYear: 2008,
  estateType: "Heritage Wedding & Leisure Estate",
  location: { city: "Mangaluru", state: "Karnataka", country: "India" },
  rating: 4.9,
  reviewCount: 812,

  heroImage: HOSTED_MEDIA("1519167758481-83f550bb49b3"),
  heroVideo: null, // drone / hero reel — none uploaded yet

  shortDescription:
    "A 35-acre riverside estate blending heritage architecture with modern hospitality — grand ballrooms, farmstay cottages, a working photography studio, and grounds built for celebrations of every size.",

  about: {
    story:
      "What began in 2008 as a single family-owned banquet hall has grown into a 35-acre estate spanning weddings, farmstays, and creative studios. Every building on the property was restored rather than replaced — the ballroom's teakwood columns are original to the 1920s plantation house that once stood here.",
    vision:
      "To be the one estate in coastal Karnataka where a family can host the wedding, the sangeet, the honeymoon, and the anniversary trip — all without leaving the property.",
    timeline: [
      { year: 2008, label: "Estate founded", detail: "Grand Ballroom opens on the original plantation grounds." },
      { year: 2014, label: "Farmstay wing added", detail: "Riverside cottages built along the estate's natural water frontage." },
      { year: 2019, label: "Studio launched", detail: "In-house photography studio opens for guest and commercial shoots." },
      { year: 2023, label: "Heritage award", detail: "Recognized for architectural restoration of the original ballroom facade." },
    ],
  },

  // ── Aggregated top-level stats (mix of computed + estate-level facts) ──
  // "computed: true" stats are derived from the categories/listings below
  // at render time rather than hardcoded, per "automatically aggregated".
  manualStats: [
    { key: "guestsHosted", label: "Guests Hosted", value: 12400, suffix: "+" },
    { key: "eventsHosted", label: "Events Hosted", value: 320, suffix: "+" },
    { key: "yearsOperating", label: "Years", value: new Date().getFullYear() - 2008 },
    { key: "acreage", label: "Acres", value: 35 },
    { key: "staff", label: "Staff", value: 150, suffix: "+" },
    { key: "awards", label: "Awards", value: 8 },
  ],

  social: {
    instagram: "https://instagram.com/monappaestates",
    facebook: "https://facebook.com/monappaestates",
    youtube: "https://youtube.com/@monappaestates",
    twitter: "https://x.com/monappaestates",
    website: "https://monappaestates.example.com",
    whatsapp: "+919900011122",
  },

  // Read-only on the public page — editable from the vendor's own
  // "Location & Hours" panel (see vendor/listing/parent_details).
  operatingHours: {
    Monday: { open: true, from: "09:00", to: "22:00" },
    Tuesday: { open: true, from: "09:00", to: "22:00" },
    Wednesday: { open: true, from: "09:00", to: "22:00" },
    Thursday: { open: true, from: "09:00", to: "22:00" },
    Friday: { open: true, from: "09:00", to: "23:00" },
    Saturday: { open: true, from: "08:00", to: "23:30" },
    Sunday: { open: false },
  },

  contact: {
    estateOffice: "+91 824 400 1122",
    salesOffice: "+91 824 400 1133",
    reservation: "+91 824 400 1144",
    weddingDesk: "+91 824 400 1155",
    farmstayDesk: "+91 824 400 1166",
    emergency: "+91 824 400 1199",
  },

  // ── Shared, estate-level (never per-listing) ──
  sharedFacilities: [
    { label: "Parking", Icon: ParkingCircle },
    { label: "Reception", Icon: Building2 },
    { label: "Temple", Icon: Landmark },
    { label: "Kids Area", Icon: Baby },
    { label: "Security", Icon: ShieldCheck },
    { label: "Golf Cart", Icon: Car },
    { label: "Restaurant", Icon: UtensilsCrossed },
    { label: "Lake", Icon: Waves },
    { label: "Gardens", Icon: Trees },
    { label: "Adventure Zone", Icon: SparklesIcon },
    { label: "Common Pool", Icon: Waves },
    { label: "Club House", Icon: Building2 },
    { label: "Spa", Icon: SparklesIcon },
    { label: "Conference Centre", Icon: Building2 },
    { label: "EV Charging", Icon: Wifi },
  ],

  sharedHighlights: [
    "35 Acre Estate",
    "Award Winning",
    "Pet Friendly",
    "Lake Access",
    "Wedding Destination",
    "Mountain Views",
    "Organic Farm",
    "Private Estate",
    "Luxury Collection",
    "Heritage Property",
  ],

  experiences: [
    "Horse Riding", "Bonfire", "Camping", "Kayaking", "Photography",
    "Wedding Planning", "Cooking Classes", "Organic Farming", "Wine Tasting",
    "Nature Walk", "Live Music", "BBQ", "Kids Activities",
  ],

  awards: [
    { title: "Best Wedding Venue", org: "South India Hospitality Awards", year: 2023 },
    { title: "Traveller's Choice", org: "TripAdvisor", year: 2023 },
    { title: "Luxury Hospitality Award", org: "Karnataka Tourism", year: 2022 },
    { title: "Green Property Certification", org: "IGBC", year: 2021 },
  ],

  certifications: ["IGBC Green Certified", "FSSAI Licensed", "Fire Safety NOC"],

  nearby: [
    { label: "Mangaluru International Airport", distance: "18 km" },
    { label: "Mangaluru Central Railway", distance: "9 km" },
    { label: "Panambur Beach", distance: "22 km" },
    { label: "Kadri Manjunath Temple", distance: "11 km" },
    { label: "KMC Hospital", distance: "10 km" },
    { label: "City Centre Mall", distance: "12 km" },
  ],

  mapPins: [
    "Main Gate", "Grand Ballroom", "Riverside Farmstay", "Restaurant",
    "Reception", "Parking", "Private Villa", "Temple",
  ],
  mapEmbedSrc: "https://maps.google.com/maps?q=mangalore&t=&z=13&ie=UTF8&iwloc=&output=embed",

  faqs: [
    { q: "Can I book the ballroom and farmstay together for a wedding weekend?", a: "Yes — most wedding packages combine the Grand Ballroom for the main event with farmstay cottages for guest stays. Ask the Wedding Desk for a combined quote." },
    { q: "Is outside catering allowed?", a: "The Grand Ballroom and Royal Heritage Hall include in-house catering. Farmstay and studio bookings allow outside catering with prior approval." },
    { q: "Is the estate pet friendly?", a: "Yes, across the farmstay and grounds. Please check with the specific listing before bringing pets to indoor venue spaces." },
    { q: "How far in advance should I book for wedding season (Nov–Feb)?", a: "6–9 months is typical for peak wedding season; farmstay and studio bookings can usually be made 4–6 weeks out." },
  ],

  reviews: [
    { id: "r1", name: "Ananya R.", category: "venues", rating: 5, text: "Our wedding at the Grand Ballroom felt like a fairytale — the restored teakwood columns are stunning in photos.", date: "2026-02-14" },
    { id: "r2", name: "Kiran S.", category: "farmstays", rating: 5, text: "Riverside Farmstay was the perfect quiet escape after the wedding chaos. Loved waking up to the water.", date: "2026-01-02" },
    { id: "r3", name: "Priya & Dev", category: "venues", rating: 4.8, text: "Royal Heritage Hall handled our 600-guest reception flawlessly. Staff were incredible.", date: "2025-12-20" },
    { id: "r4", name: "Meera T.", category: "studios", rating: 4.9, text: "Booked the studio for a commercial shoot — natural light setup is genuinely professional-grade.", date: "2025-11-11" },
    { id: "r5", name: "The Nair Family", category: "farmstays", rating: 4.7, text: "Private Villa gave us a whole estate to ourselves for a family reunion. Kids loved the kayaking.", date: "2025-10-05" },
  ],

  // ── Categories & their child listings ──
  categories: {
    venues: {
      key: "venues",
      heroTagline: "Grand ballrooms built for celebrations of every size.",
      overview:
        "Two heritage-restored event spaces on the estate grounds, from intimate 300-guest gatherings to 1,000-guest weddings. The Grand Ballroom's original 1920s teakwood columns anchor a space built for a full wedding weekend — sangeet, ceremony, and reception all under one roof — while the Royal Heritage Hall offers a more intimate setting for corporate galas and smaller celebrations. Both venues come with in-house catering, a dedicated event coordinator, and grounds access for pre-function photography.",
      // Pasted by the vendor in their own listing editor — the public page
      // just embeds whatever URL lands here. Null means no video has been
      // pasted yet, so the page falls back to the house-stock clip.
      youtubeUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      amenities: {
        Facilities: ["Parking", "Swimming Pool", "Garden", "Lawn", "Indoor Hall", "Rooftop", "Outdoor Terrace"],
        "Food & Catering": ["In-house Catering", "Bar & Beverages", "Veg Menu", "Non-veg Menu", "Custom Menu"],
        Services: ["Event Coordinator", "Decoration", "Photography", "Videography", "DJ", "Live Music", "Security", "Valet Parking"],
        Technology: ["High-speed WiFi", "AV Equipment", "Projector", "Sound System", "LED Screen"],
        Accessibility: ["Wheelchair Access", "Elevator", "Accessible Restrooms"],
      },
      gallery: [
        HOSTED_MEDIA("1519741497674-611481863552"),
        HOSTED_MEDIA("1464366400600-7168b8af9bc3"),
        HOSTED_MEDIA("1519167758481-83f550bb49b3"),
        HOSTED_MEDIA("1505236273191-1dce886b727d"),
      ],
      video: null,
      listings: [
        {
          id: "grand-ballroom",
          name: "Grand Ballroom",
          type: "venues",
          image: HOSTED_MEDIA("1519741497674-611481863552"),
          capacity: 1000,
          priceINR: 2000000,
          priceUnit: "per event",
          rating: 4.9,
          likes: 24,
          city: "Mangaluru",
          state: "Karnataka",
          address: "VVG5+976, Mallikatte, Mangaluru, KA 575002",
          lat: 12.9235,
          lng: 74.8631,
        },
        {
          id: "royal-heritage-hall",
          name: "Royal Heritage Hall",
          type: "venues",
          image: HOSTED_MEDIA("1464366400600-7168b8af9bc3"),
          capacity: 600,
          priceINR: 1200000,
          priceUnit: "per event",
          rating: 4.8,
          likes: 15,
          city: "Mangaluru",
          state: "Karnataka",
          address: "WWJ2+4F8, Kadri, Mangaluru, KA 575002",
          lat: 12.8996,
          lng: 74.8397,
        },
      ],
    },
    farmstays: {
      key: "farmstays",
      heroTagline: "Riverside cottages for slow mornings between events.",
      overview:
        "Riverside cottages and a private villa on the estate's water frontage — built for slow mornings between wedding events, or a standalone escape. Riverside Farmstay sits directly on the Netravati backwaters with its own kayaking dock, while the Private Villa is a fully self-contained retreat suited to family reunions or an extended stay once the celebrations wind down. Both properties share the estate's organic gardens, a common pool, and a BBQ setup for evenings under the stars.",
      // No YouTube link pasted for this category yet — Video section
      // falls back to the house-stock farmstay clip.
      youtubeUrl: null,
      amenities: {
        Facilities: ["Parking", "Garden", "Lawn", "Outdoor Terrace", "Common Pool"],
        "Food & Catering": ["In-house Catering", "Veg Menu", "Custom Menu", "Halal Options", "BBQ Setup"],
        Services: ["Event Coordinator", "Photography", "Kayaking Guide"],
        Technology: ["High-speed WiFi"],
        Accessibility: ["Wheelchair Access"],
      },
      gallery: [
        HOSTED_MEDIA("1499793983690-e29da59ef1c2"),
        HOSTED_MEDIA("1505692952047-1a78307da8f2"),
        HOSTED_MEDIA("1439130490301-25e322d88054"),
      ],
      video: null,
      listings: [
        {
          id: "riverside-farmstay",
          name: "Riverside Farmstay",
          type: "farmstays",
          image: HOSTED_MEDIA("1499793983690-e29da59ef1c2"),
          capacity: 12,
          priceINR: 19181,
          priceUnit: "per night",
          rating: 4.8,
          likes: 31,
          city: "Mangaluru",
          state: "Karnataka",
          address: "Netravati Riverside Estate, Bantwal Rd, Mangaluru, KA 574243",
          lat: 12.8878,
          lng: 75.0350,
        },
        {
          id: "private-villa",
          name: "Private Villa",
          type: "farmstays",
          image: HOSTED_MEDIA("1505692952047-1a78307da8f2"),
          capacity: 18,
          priceINR: 25999,
          priceUnit: "per night",
          rating: 4.9,
          likes: 19,
          city: "Mangaluru",
          state: "Karnataka",
          address: "Coastal Backwaters Estate, Someshwara, Mangaluru, KA 575011",
          lat: 12.8422,
          lng: 74.8394,
        },
      ],
    },
    studios: {
      key: "studios",
      heroTagline: "A working photography studio, open for shoots.",
      overview:
        "A full working photography studio on the estate — used for guest wedding shoots and independently bookable for commercial work.",
      videos: [],
      amenities: {
        Facilities: ["Parking", "Rooftop", "Indoor Hall"],
        "Food & Catering": ["Outside Catering Allowed"],
        Services: ["Photography", "Videography", "Styling Assistance"],
        Technology: ["High-speed WiFi", "AV Equipment", "LED Screen", "Sound System", "Lighting Rig", "Live Streaming"],
        Accessibility: ["Elevator"],
      },
      gallery: [
        HOSTED_MEDIA("1554080353-a576cf803bda"),
        HOSTED_MEDIA("1522008693229-b8ce0c9b8f37"),
      ],
      video: null,
      listings: [
        {
          id: "photography-studio",
          name: "Photography Studio",
          type: "studios",
          image: HOSTED_MEDIA("1554080353-a576cf803bda"),
          capacity: 20,
          priceINR: 8999,
          priceUnit: "per day",
          rating: 4.9,
          likes: 8,
          city: "Mangaluru",
          state: "Karnataka",
        },
      ],
    },
    workspaces: {
      key: "workspaces",
      heroTagline: "A dedicated co-working space on the estate — coming soon.",
      overview: "A dedicated co-working & meeting space on the estate — in development.",
      amenities: {},
      gallery: [],
      video: null,
      videos: [],
      comingSoon: true,
      listings: [],
    },
  },
};

const ESTATES = {
  "monappa-estates": MONAPPA_ESTATE,
};

/**
 * Generic fallback so any parentId (e.g. the real pv-in-v-* ids used by
 * VenueCard/staticVenues.js today) resolves to *something* rather than a
 * broken page, without pretending to be a specific named brand.
 */
function buildFallbackEstate(parentId, parentName) {
  return {
    ...MONAPPA_ESTATE,
    id: parentId,
    name: parentName || "This Estate",
    tagline: "Full estate profile coming soon.",
    isFallback: true,
  };
}

export function getEstateData(parentId, fallbackName) {
  return ESTATES[parentId] ?? buildFallbackEstate(parentId, fallbackName);
}

/** All categories the estate has a profile for (including "coming soon"), in canonical order. */
export function getAvailableCategoryKeys(estate) {
  const keys = Object.keys(estate.categories);
  const order = ["venues", "farmstays", "studios", "workspaces"];
  return order.filter((k) => keys.includes(k)).concat(keys.filter((k) => !order.includes(k)));
}

/** Categories that actually have at least one bookable listing. */
export function getActiveCategoryKeys(estate) {
  return Object.keys(estate.categories).filter((k) => (estate.categories[k].listings || []).length > 0);
}

/**
 * Per-category stats for the Quick Stats strip — replaces the old
 * estate-wide numbers with ones scoped to whichever category is
 * currently selected, so the strip actually reacts to the switcher
 * above it instead of always showing the same estate-level totals.
 */
export function computeCategoryStats(estate, categoryKey) {
  const cat = estate.categories?.[categoryKey];
  const listings = cat?.listings ?? [];

  const prices = listings.map((l) => l.priceINR).filter(Boolean);
  const ratings = listings.map((l) => l.rating).filter(Boolean);
  const maxCapacity = listings.reduce((max, l) => Math.max(max, l.capacity || 0), 0);

  const stats = [{ label: "Listings", value: listings.length }];

  if (ratings.length > 0) {
    stats.push({
      label: "Avg Rating",
      value: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      isDecimal: true,
    });
  }

  if (maxCapacity > 0) {
    stats.push({ label: "Max Capacity", value: maxCapacity });
  }

  if (prices.length > 0) {
    stats.push({ label: "Starting Price", value: Math.min(...prices), isCurrency: true });
  }

  return stats;
}

export function computeEstateStats(estate) {
  const cats = estate.categories;
  const totalListings = Object.values(cats).reduce((sum, c) => sum + (c.listings?.length || 0), 0);
  const activeCategoryCount = Object.values(cats).filter((c) => (c.listings?.length || 0) > 0).length;

  const manual = Object.fromEntries(estate.manualStats.map((s) => [s.key, s]));

  return [
    { label: "Listings", value: totalListings },
    { label: "Categories", value: activeCategoryCount },
    { label: manual.guestsHosted.label, value: manual.guestsHosted.value, suffix: manual.guestsHosted.suffix },
    { label: manual.eventsHosted.label, value: manual.eventsHosted.value, suffix: manual.eventsHosted.suffix },
    { label: manual.yearsOperating.label, value: manual.yearsOperating.value },
  ];
}
