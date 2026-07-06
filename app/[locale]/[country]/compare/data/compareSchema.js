/**
 * compareSchema.js
 *
 * MOCK / PLACEHOLDER ENRICHMENT — Phase 1.
 *
 * staticVenues.js (the shared listing dataset used across search/map/reels)
 * only carries the ~10 fields needed for search cards: price, guests,
 * rating, city, images, etc. The Compare experience needs a much richer,
 * per-category shape (event suitability, food & alcohol policy, facility
 * groups, cancellation terms, farmstay activities, nearby distances...)
 * that no endpoint returns today — the same situation documented in
 * venue/[parentId]/data/estateData.js for the estate profile page.
 *
 * This file follows that exact convention: every extra field below is
 * deterministically derived from the real listing (same id → same values
 * on every render, across reloads) using a seeded RNG, so the UI never
 * flickers or looks random. Swap `enrichProperty()` for real fields once
 * the backend exposes them — the shape below is what that response
 * should approximate.
 */

// ─────────────────────────────────────────────────────────────────────────
// Seeded RNG — same id always produces the same "random" values
// ─────────────────────────────────────────────────────────────────────────
function seedFromString(str) {
  let h = 1779033703 ^ String(str || "x").length;
  for (let i = 0; i < String(str).length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const rBool = (rng, p = 0.5) => rng() < p;
const rInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const rFloat = (rng, min, max) => rng() * (max - min) + min;
const rPick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function rSample(rng, arr, n) {
  const pool = [...arr];
  const out = [];
  while (pool.length && out.length < n) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// ─────────────────────────────────────────────────────────────────────────
// Catalogs
// ─────────────────────────────────────────────────────────────────────────
export const VENUE_EVENT_TYPES = [
  "Wedding", "Reception", "Engagement", "Birthday",
  "Corporate", "Conference", "Cocktail", "Haldi", "Sangeet",
];

export const VENUE_FOOD_ITEMS = [
  "Outside Catering", "Veg", "Non Veg", "Kitchen Available",
  "Alcohol", "Bar", "Live Counters",
];

export const VENUE_FACILITY_GROUPS = {
  "Venue Features": ["Air Conditioning", "Power Backup", "Green Rooms", "Bridal Suite", "Security"],
  "Technology": ["High-Speed WiFi", "Sound System", "LED Screens", "Projector & AV", "Live Streaming"],
  "Accessibility": ["Wheelchair Access", "Elevator", "Accessible Restrooms"],
  "Parking": ["Self Parking", "Valet Parking", "EV Charging", "Bus Parking"],
  "Accommodation": ["Guest Rooms", "Family Suites", "Nearby Hotel Tie-up"],
  "Decoration": ["In-house Decor Team", "Floral Styling", "Mandap Setup", "Themed Decor"],
  "Entertainment": ["DJ Setup", "Live Band Stage", "Dance Floor", "Photo Booth"],
};

const VENUE_PROS = [
  "Stunning architecture", "Attentive on-site staff", "Spacious grounds",
  "Excellent food quality", "Hassle-free parking", "Flexible vendor policy",
  "Great sound & lighting", "Photogenic backdrops",
];
const VENUE_CONS = [
  "Limited parking on peak dates", "Pricey add-ons", "Heavy traffic during peak hours",
  "Needs early advance booking",
];

export const FARM_ACTIVITIES = [
  "Kayaking", "Bonfire", "Fishing", "Cycling", "Organic Farm",
  "Nature Walk", "Horse Riding", "Photography", "Kids Area",
];
export const FARM_COMFORT = ["AC", "WiFi", "Power Backup", "TV", "Workspace", "Washing Machine", "Hot Water"];
export const FARM_FOOD_ITEMS = ["Breakfast", "Lunch", "Dinner", "Kitchen Access", "Self Cooking", "Veg", "Non Veg", "BBQ"];
export const FARM_NEARBY_LABELS = ["Lake", "Beach", "Airport", "Hospital", "City", "Market"];

const FARM_PROS = [
  "Peaceful, quiet surroundings", "Delicious home-cooked meals", "Warm, welcoming hosts",
  "Great for kids", "Spotlessly clean rooms", "Beautiful views",
];
const FARM_CONS = ["Patchy network connectivity", "Basic in-room amenities", "A distance from the city centre"];

export const VENUE_SEATING_STYLES = ["Theatre", "Banquet Round Tables", "Classroom", "U-Shape", "Floating / Standing"];

export const STUDIO_LIGHTING_OPTIONS = ["Natural Light + Softboxes", "LED Panel Kit", "Ring Light Setup", "Full Grid Lighting Rig"];
export const STUDIO_EQUIPMENT = ["Tripods", "Backdrop Stands", "Reflectors", "Continuous Lighting Kit", "Strobe Lights", "Sound Equipment", "Teleprompter"];

export const WORKSPACE_AMENITIES = ["Whiteboard", "Video Conferencing", "Standing Desks", "Locker Storage", "Reception Desk"];

export const RENTAL_AMENITIES = ["WiFi", "Air Conditioning", "Washing Machine", "Kitchen", "TV / Streaming", "Balcony", "Housekeeping"];

const REVIEW_AUTHORS = ["Ananya R.", "Kiran S.", "Priya & Dev", "Meera T.", "Rohan K.", "The Nair Family", "Sara M.", "Aditya V."];

// ─────────────────────────────────────────────────────────────────────────
// Shared fields (verified badge, gallery, review shells)
// ─────────────────────────────────────────────────────────────────────────
function enrichCommon(base, rng) {
  const verified = (base.rating || 0) >= 4.8 || rBool(rng, 0.78);
  const images = base.images && base.images.length >= 3
    ? base.images.slice(0, 3)
    : [...(base.images || []), (base.images || [])[0]].filter(Boolean).slice(0, 3);

  const daysAgo = rInt(rng, 2, 65);
  const reviewDate = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

  return {
    verified,
    gallery: images,
    latestReview: {
      author: rPick(rng, REVIEW_AUTHORS),
      date: reviewDate,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Venue enrichment
// ─────────────────────────────────────────────────────────────────────────
function enrichVenue(base, rng) {
  const maxGuests = base.maxGuests || 300;
  const minPrice = base.minPrice || 100000;

  const eventTypes = {};
  VENUE_EVENT_TYPES.forEach((t) => {
    // Weddings/receptions/engagements skew true — the core use-case for a venue
    const bias = ["Wedding", "Reception", "Engagement"].includes(t) ? 0.85 : 0.55;
    eventTypes[t] = rBool(rng, bias);
  });
  // Guarantee at least 3 suitable event types so a venue never looks unusable
  if (Object.values(eventTypes).filter(Boolean).length < 3) {
    eventTypes.Wedding = true;
    eventTypes.Reception = true;
    eventTypes.Corporate = true;
  }

  const food = {};
  VENUE_FOOD_ITEMS.forEach((f) => {
    const bias = f === "Veg" ? 0.95 : f === "Non Veg" ? 0.7 : 0.55;
    food[f] = rBool(rng, bias);
  });

  const facilities = {};
  Object.entries(VENUE_FACILITY_GROUPS).forEach(([group, items]) => {
    facilities[group] = items.map((label) => ({ label, included: rBool(rng, 0.62) }));
  });

  return {
    experience: "venue",
    indoorOutdoor: rPick(rng, ["Indoor", "Outdoor", "Indoor & Outdoor"]),
    seatingStyle: rPick(rng, VENUE_SEATING_STYLES),
    hallAreaSqft: Math.round((maxGuests * rFloat(rng, 6, 9)) / 50) * 50,
    operatingHours: rPick(rng, ["9:00 AM – 11:00 PM", "10:00 AM – 12:00 AM", "24 Hours", "8:00 AM – 10:00 PM"]),
    eventTypes,
    highlightEventTypes: Object.keys(eventTypes).filter((k) => eventTypes[k]).slice(0, 3),

    pricing: {
      startingPrice: minPrice,
      peakPrice: Math.round(minPrice * rFloat(rng, 1.25, 1.6) / 500) * 500,
      offSeasonPrice: Math.round(minPrice * rFloat(rng, 0.62, 0.85) / 500) * 500,
      decorationIncluded: rBool(rng, 0.5),
      foodIncluded: rBool(rng, 0.45),
      taxesIncluded: rBool(rng, 0.4),
      cancellation: rPick(rng, ["Flexible", "Moderate", "Strict"]),
      advanceRequired: rPick(rng, [20, 25, 30, 40, 50]),
    },

    capacity: {
      minGuests: Math.max(20, Math.round((maxGuests * 0.2) / 10) * 10),
      maxGuests,
      floatingCapacity: rBool(rng, 0.6) ? maxGuests + rInt(rng, 50, 150) : null,
      dining: Math.round(maxGuests * rFloat(rng, 0.7, 0.9) / 10) * 10,
      parking: rInt(rng, 60, 320),
      stageSize: rPick(rng, ["Small (~200 sq ft)", "Medium (~400 sq ft)", "Large (600+ sq ft)"]),
      roomsAvailable: rBool(rng, 0.55) ? rInt(rng, 4, 24) : 0,
    },

    eventSuitability: eventTypes,
    food,
    facilities,

    policies: {
      musicTiming: rPick(rng, ["Until 10:00 PM", "Until 11:00 PM", "Until 12:00 AM", "Until 1:00 AM"]),
      noiseRestriction: rPick(rng, ["Strict", "Moderate", "Flexible"]),
      outsideVendors: rBool(rng, 0.55),
      smoking: rPick(rng, ["Designated Area", "Not Allowed", "Allowed Outdoors"]),
      pets: rBool(rng, 0.35),
      decorRules: rPick(rng, ["In-house Only", "Outside Allowed with Approval", "Fully Flexible"]),
      cleaning: rPick(rng, ["Included", "Extra Charge"]),
      liquorPolicy: rPick(rng, ["Licensed Bar", "BYOB Allowed", "Dry Property"]),
    },

    reviews: {
      rating: base.rating || 4.5,
      reviewCount: base.reviewCount || 0,
      topPros: rSample(rng, VENUE_PROS, 3),
      topCons: rSample(rng, VENUE_CONS, 2),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Farmstay enrichment
// ─────────────────────────────────────────────────────────────────────────
function enrichFarmstay(base, rng) {
  const bedrooms = base.bedrooms || 2;
  const rating = base.rating || 4.5;

  const activityBias = {
    Kayaking: 0.35, Bonfire: 0.75, Fishing: 0.3, Cycling: 0.6, "Organic Farm": 0.55,
    "Nature Walk": 0.8, "Horse Riding": 0.25, Photography: 0.7, "Kids Area": 0.5,
  };
  const activities = {};
  FARM_ACTIVITIES.forEach((a) => { activities[a] = rBool(rng, activityBias[a] ?? 0.5); });

  const comfortBias = { AC: 0.6, WiFi: 0.85, "Power Backup": 0.8, TV: 0.55, Workspace: 0.4, "Washing Machine": 0.45, "Hot Water": 0.9 };
  const comfort = {};
  FARM_COMFORT.forEach((c) => { comfort[c] = rBool(rng, comfortBias[c] ?? 0.6); });

  const foodBias = { Breakfast: 0.85, Lunch: 0.6, Dinner: 0.75, "Kitchen Access": 0.6, "Self Cooking": 0.4, Veg: 0.95, "Non Veg": 0.55, BBQ: 0.5 };
  const food = {};
  FARM_FOOD_ITEMS.forEach((f) => { food[f] = rBool(rng, foodBias[f] ?? 0.6); });

  const petFriendly = rBool(rng, 0.5);
  const bathrooms = Math.max(1, Math.round(bedrooms * rFloat(rng, 0.5, 0.8)));
  const pool = rBool(rng, 0.35);

  return {
    experience: "farmstay",
    bathrooms,
    acres: Math.round(rFloat(rng, 0.5, 12) * 10) / 10,
    entireOrPrivateRoom: rBool(rng, 0.75) ? "Entire Property" : "Private Room",

    stayDetails: {
      checkIn: rPick(rng, ["12:00 PM", "1:00 PM", "2:00 PM"]),
      checkOut: rPick(rng, ["10:00 AM", "11:00 AM", "12:00 PM"]),
      mealsIncluded: rPick(rng, ["All Meals Included", "Breakfast Only", "Not Included"]),
      caretaker: rBool(rng, 0.8),
      petFriendly,
      smoking: rPick(rng, ["Not Allowed", "Designated Area", "Allowed Outdoors"]),
      familyFriendly: rBool(rng, 0.85),
      coupleFriendly: rBool(rng, 0.9),
    },

    accommodation: {
      bedrooms,
      beds: bedrooms + rInt(rng, 0, 2),
      bathrooms,
      kitchen: rBool(rng, 0.9),
      balcony: rBool(rng, 0.6),
      pool,
      privatePool: pool && rBool(rng, 0.5),
      riverAccess: rBool(rng, 0.25),
      lakeView: rBool(rng, 0.3),
      garden: rBool(rng, 0.7),
      privateLawn: rBool(rng, 0.6),
      firePit: rBool(rng, 0.55),
      bbq: rBool(rng, 0.6),
      parking: rBool(rng, 0.85),
    },

    activities,
    comfort,
    food,

    nearby: {
      Lake: rBool(rng, 0.5) ? rInt(rng, 1, 15) : null,
      Beach: rBool(rng, 0.3) ? rInt(rng, 2, 40) : null,
      Airport: rInt(rng, 10, 90),
      Hospital: rInt(rng, 3, 25),
      City: rInt(rng, 5, 60),
      Market: rInt(rng, 1, 15),
    },

    policies: {
      pets: petFriendly,
      events: rBool(rng, 0.4),
      visitors: rPick(rng, ["Guests Only", "Day Visitors Allowed", "No Outside Visitors"]),
      cancellation: rPick(rng, ["Flexible", "Moderate", "Strict"]),
      refund: rPick(rng, ["Full Refund 7 Days Prior", "50% Refund 3 Days Prior", "Non-Refundable"]),
      securityDeposit: rBool(rng, 0.6) ? rInt(rng, 2, 10) * 1000 : null,
    },

    reviews: {
      rating,
      reviewCount: base.reviewCount || 0,
      cleanliness: clamp(rating + rFloat(rng, -0.2, 0.3), 3.5, 5),
      location: clamp(rating + rFloat(rng, -0.3, 0.2), 3.5, 5),
      host: clamp(rating + rFloat(rng, -0.1, 0.3), 3.5, 5),
      value: clamp(rating + rFloat(rng, -0.4, 0.1), 3.5, 5),
      topPros: rSample(rng, FARM_PROS, 3),
      topCons: rSample(rng, FARM_CONS, 2),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Studio enrichment
// ─────────────────────────────────────────────────────────────────────────
function enrichStudio(base, rng) {
  const rating = base.rating || 4.5;
  const studioArea = base.sizeSqft || rInt(rng, 400, 3500);

  const equipment = {};
  STUDIO_EQUIPMENT.forEach((e) => { equipment[e] = rBool(rng, 0.6); });

  return {
    experience: "studio",
    studioArea,
    hourlyPrice: base.minPrice || rInt(rng, 800, 4000),
    lighting: rPick(rng, STUDIO_LIGHTING_OPTIONS),
    cyclorama: rBool(rng, 0.55) ? rPick(rng, ["White Cyclorama", "Green Cyclorama", "Black Cyclorama"]) : null,
    equipment,
    parking: rBool(rng, 0.7),
    powerBackup: rBool(rng, 0.8),
    makeupRoom: rBool(rng, 0.55),
    changingRoom: rBool(rng, 0.7),
    ac: rBool(rng, 0.85),
    reviews: {
      rating,
      reviewCount: base.reviewCount || 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Workspace enrichment
// ─────────────────────────────────────────────────────────────────────────
function enrichWorkspace(base, rng) {
  const rating = base.rating || 4.5;
  const seats = base.seatingCapacity || rInt(rng, 2, 40);

  const amenities = {};
  WORKSPACE_AMENITIES.forEach((a) => { amenities[a] = rBool(rng, 0.6); });

  return {
    experience: "workspace",
    seats,
    meetingRooms: rInt(rng, 0, 4),
    internet: rPick(rng, ["100 Mbps Fiber", "300 Mbps Fiber", "1 Gbps Leased Line"]),
    parking: rBool(rng, 0.65),
    printer: rBool(rng, 0.75),
    pantry: rBool(rng, 0.8),
    cabin: (base.workspaceType || "").toLowerCase().includes("cabin") || rBool(rng, 0.4),
    operatingHours: rPick(rng, ["9:00 AM – 8:00 PM", "24 Hours Access", "8:00 AM – 10:00 PM"]),
    pricing: {
      rate: base.minPrice || rInt(rng, 500, 3000),
      pricingType: rPick(rng, ["Per Hour", "Per Day", "Per Seat / Month"]),
    },
    amenities,
    reviews: {
      rating,
      reviewCount: base.reviewCount || 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Rental enrichment
// ─────────────────────────────────────────────────────────────────────────
function enrichRental(base, rng) {
  const rating = base.rating || 4.5;
  const bedrooms = base.bedrooms || 1;
  const bathrooms = Math.max(1, Math.round(bedrooms * rFloat(rng, 0.7, 1)));

  const amenities = {};
  RENTAL_AMENITIES.forEach((a) => { amenities[a] = rBool(rng, 0.65); });

  return {
    experience: "rental",
    rentalType: base.rentalType || "Entire Property",
    pricingType: base.pricingType || "Per Night",
    maxGuests: base.maxGuests || rInt(rng, 2, 10),
    bedrooms,
    bathrooms,
    checkIn: rPick(rng, ["12:00 PM", "1:00 PM", "2:00 PM"]),
    checkOut: rPick(rng, ["10:00 AM", "11:00 AM", "12:00 PM"]),
    petFriendly: rBool(rng, 0.45),
    cancellation: rPick(rng, ["Flexible", "Moderate", "Strict"]),
    amenities,
    reviews: {
      rating,
      reviewCount: base.reviewCount || 0,
    },
  };
}

/**
 * Detects which comparison experience a listing belongs to. Each live
 * category (venues, farmstays, studios, workspaces, rentals) gets its own
 * experience with its own comparison attributes — categories are never
 * mixed and never forced into a shape that doesn't fit them. Anything
 * without a dedicated experience yet (e.g. "experiences", coming soon)
 * falls back to the venue shape rather than crashing.
 */
export function detectExperience(category) {
  switch (category) {
    case "farmstays": return "farmstay";
    case "studios": return "studio";
    case "workspaces": return "workspace";
    case "rentals": return "rental";
    default: return "venue";
  }
}

const ENRICHERS = {
  farmstay: enrichFarmstay,
  studio: enrichStudio,
  workspace: enrichWorkspace,
  rental: enrichRental,
  venue: enrichVenue,
};

/**
 * Enrich a raw static-venue record with every field the Compare experience
 * needs. Deterministic — same id always yields the same derived data.
 *
 * @param {object} base  A record from STATIC_VENUES (or any object shaped like one)
 * @returns {object} base + verified/gallery + experience-specific fields
 */
export function enrichProperty(base) {
  const rng = seedFromString(base.childVenueId || base.id || base.venueName || "seed");
  const common = enrichCommon(base, rng);
  const experience = detectExperience(base.category);
  const enrich = ENRICHERS[experience] || enrichVenue;
  const specific = enrich(base, rng);
  return { ...base, ...common, ...specific };
}

/**
 * Deterministic mock availability for a given property + date + shift.
 * No availability endpoint exists yet — swap for a real calendar lookup
 * once one does. Weighted so "Available" is the common case.
 */
export function getAvailabilityStatus(propertyId, dateStr, shift) {
  const rng = seedFromString(`${propertyId}__${dateStr}__${shift}`);
  const roll = rng();
  if (roll < 0.55) return "available";
  if (roll < 0.85) return "limited";
  return "booked";
}
