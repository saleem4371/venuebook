import {
  Hotel, Train, Plane, Church, Landmark, ParkingSquare,
  Waves, Mountain, Coffee, ShoppingBag,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   NEARBY_TYPES — preset place TYPES a vendor can pick from for the "Nearby
   Attractions" section on their public listing page (NearbyAttractions.jsx).
   Unlike HIGHLIGHTS, the actual place name/distance/travel time is real,
   location-specific data the vendor fills in themselves — this list only
   presets the category of place (Hotel, Airport, Temple, …) so the picker
   UI and icon stay consistent. `defaultImage` is a generic representative
   photo for the type, used so vendor-entered places still render as a
   proper photo card instead of falling back to a plain icon tile.
───────────────────────────────────────────────────────────────────────────── */
export const NEARBY_TYPES = {
  venues: [
    { type: "Hotel",           Icon: Hotel,         defaultImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
    { type: "Railway Station", Icon: Train,         defaultImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400" },
    { type: "Airport",         Icon: Plane,         defaultImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400" },
    { type: "Temple",          Icon: Church,        defaultImage: "https://images.unsplash.com/photo-1535082623926-b39352a03fb7?w=400" },
    { type: "Landmark",        Icon: Landmark,      defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { type: "Parking",         Icon: ParkingSquare, defaultImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400" },
  ],
  farmstays: [
    { type: "Nature Trail",  Icon: Mountain,     defaultImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
    { type: "Waterfall",     Icon: Waves,        defaultImage: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400" },
    { type: "Local Market",  Icon: ShoppingBag,  defaultImage: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400" },
    { type: "Café",          Icon: Coffee,       defaultImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400" },
    { type: "Viewpoint",     Icon: Landmark,     defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { type: "Wildlife",      Icon: Mountain,     defaultImage: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400" },
  ],
  studios: [
    { type: "Café",            Icon: Coffee,       defaultImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400" },
    { type: "Parking",         Icon: ParkingSquare,defaultImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400" },
    { type: "Railway Station", Icon: Train,        defaultImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400" },
    { type: "Landmark",        Icon: Landmark,     defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
  ],
  workspaces: [
    { type: "Café",            Icon: Coffee,       defaultImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400" },
    { type: "Parking",         Icon: ParkingSquare,defaultImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400" },
    { type: "Railway Station", Icon: Train,        defaultImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400" },
    { type: "Airport",         Icon: Plane,        defaultImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400" },
  ],
  rentals: [
    { type: "Hotel",           Icon: Hotel,        defaultImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
    { type: "Landmark",        Icon: Landmark,     defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { type: "Parking",         Icon: ParkingSquare,defaultImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400" },
    { type: "Railway Station", Icon: Train,        defaultImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400" },
  ],
  experiences: [
    { type: "Parking",   Icon: ParkingSquare, defaultImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400" },
    { type: "Landmark",  Icon: Landmark,      defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { type: "Viewpoint", Icon: Landmark,      defaultImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { type: "Café",      Icon: Coffee,        defaultImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400" },
  ],
};

// Max number of nearby places a vendor can feature on their listing.
export const MAX_NEARBY = 4;
