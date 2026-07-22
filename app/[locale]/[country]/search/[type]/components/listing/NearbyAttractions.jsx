import { MapPin, Clock, Hotel, Train, Plane, Church, Landmark, ParkingSquare, Waves, Mountain, Coffee, ShoppingBag } from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";

// ─── Venue: city-centric nearby points ───────────────────────────────────────
const VENUE_PLACES = [
  {
    name: "Hotel Le Meridien",
    type: "Hotel",
    TypeIcon: Hotel,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
    distance: "0.8 km",
    travel: "3 min",
    note: "Preferred accommodation partner. Room blocks available.",
    rating: 4.7,
  },
  {
    name: "Mangalore Central Railway",
    type: "Railway Station",
    TypeIcon: Train,
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400",
    distance: "2.1 km",
    travel: "7 min",
    note: "Direct trains from Bangalore, Goa, Mumbai, and Chennai.",
    rating: 4.3,
  },
  {
    name: "Mangalore International Airport",
    type: "Airport",
    TypeIcon: Plane,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400",
    distance: "14 km",
    travel: "28 min",
    note: "Connects to all major domestic and select international cities.",
    rating: 4.5,
  },
  {
    name: "Kudroli Gokarnath Temple",
    type: "Temple",
    TypeIcon: Church,
    image: "https://images.unsplash.com/photo-1535082623926-b39352a03fb7?w=400",
    distance: "3.4 km",
    travel: "10 min",
    note: "Famous Dasara celebrations. A must-visit cultural landmark.",
    rating: 4.8,
  },
  {
    name: "Kadri Park",
    type: "Landmark",
    TypeIcon: Landmark,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400",
    distance: "1.9 km",
    travel: "6 min",
    note: "Scenic park ideal for morning walks and photography.",
    rating: 4.2,
  },
  {
    name: "City Multi-level Parking",
    type: "Parking",
    TypeIcon: ParkingSquare,
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400",
    distance: "0.4 km",
    travel: "2 min",
    note: "500+ bays. Pre-book for event day convenience.",
    rating: 4.0,
  },
];

// ─── Farmstay: nature-centric nearby places ───────────────────────────────────
const FARMSTAY_PLACES = [
  {
    name: "Phalguni River Trail",
    type: "Nature Trail",
    TypeIcon: Mountain,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    distance: "4 km",
    travel: "12 min",
    note: "Early morning is best — the mist over the trail is stunning.",
    rating: 4.7,
  },
  {
    name: "Abbey Falls",
    type: "Waterfall",
    TypeIcon: Waves,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
    distance: "8 km",
    travel: "20 min",
    note: "Best after monsoon. Carry a change of clothes.",
    rating: 4.5,
  },
  {
    name: "Sangottu Spice Market",
    type: "Local Market",
    TypeIcon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400",
    distance: "5 km",
    travel: "14 min",
    note: "Try the local pepper and cardamom — freshest in the region.",
    rating: 4.4,
  },
  {
    name: "Estate Coffee Shop",
    type: "Café",
    TypeIcon: Coffee,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    distance: "1.2 km",
    travel: "5 min",
    note: "Brewed from beans grown right here on the estate grounds.",
    rating: 4.8,
  },
  {
    name: "Sunset Viewpoint",
    type: "Viewpoint",
    TypeIcon: Landmark,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400",
    distance: "3 km",
    travel: "10 min",
    note: "Reach by 6 PM. The golden hour view is worth every step.",
    rating: 4.6,
  },
  {
    name: "Dubare Elephant Camp",
    type: "Wildlife",
    TypeIcon: Mountain,
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400",
    distance: "18 km",
    travel: "35 min",
    note: "Morning elephant bathing sessions are the highlight. Book ahead.",
    rating: 4.9,
  },
];

// ─── Generic for other categories ─────────────────────────────────────────────
const DEFAULT_PLACES = FARMSTAY_PLACES.slice(0, 3);

function PlaceCard({ place }) {
  const { TypeIcon } = place;
  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Image */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Type badge */}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[10px] font-medium bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
          <TypeIcon size={9} />
          {place.type}
        </span>
        {/* Rating badge */}
        <span className="absolute top-3 right-3 flex items-center gap-0.5 text-white text-[11px] font-semibold bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
          ★ {place.rating}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight mb-1.5 sm:mb-2">
          {place.name}
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {place.distance}
          </span>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span className="flex items-center gap-1">
            <Clock size={10} /> {place.travel} drive
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NearbyAttractions({ category }) {
  const key = normalizeCategory(category);
  const isVenue = key === "venues";
  const isFarmstay = key === "farmstays";

  const title = isVenue ? "Nearby Attractions" : isFarmstay ? "Explore Nearby" : "Nearby Highlights";
  const subtitle = isVenue
    ? "Key landmarks, transport hubs, and facilities for your guests"
    : isFarmstay
    ? "Curated escapes and discoveries just beyond the estate"
    : "Notable spots within easy reach";

  const places = (isVenue ? VENUE_PLACES : isFarmstay ? FARMSTAY_PLACES : DEFAULT_PLACES).slice(0, 4);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6">
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {places.map((place) => <PlaceCard key={place.name} place={place} />)}
      </div>
    </div>
  );
}
