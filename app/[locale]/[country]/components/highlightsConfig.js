import {
  TreePine, Waves, Flame, Leaf, PawPrint, Sunrise,
  Users, Building2, Car, Heart, Coffee, Droplets,
  Mountain, Home, Star, Sparkles, UtensilsCrossed,
  Camera, Music, Laptop, Zap, MapPin, Wind,
  Mic, Film, Package,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   HIGHLIGHTS — single source of truth for the "Why Guests Love This Place"
   selling points shown on the public listing page (HeroHighlights.jsx) AND
   the picker vendors use in the listing editor (BasicStep.jsx) to choose
   which ones apply to their specific property. Matched by `title` string —
   keep titles here and only here, both consumers import this list rather
   than keeping their own copy so they can't drift out of sync.
───────────────────────────────────────────────────────────────────────────── */
export const HIGHLIGHTS = {
  venues: [
    { Icon: Users,           title: "1,000 Guest Capacity",  desc: "Grand scale for any celebration" },
    { Icon: Building2,       title: "Luxury Ballroom",        desc: "Premium air-conditioned main hall" },
    { Icon: Home,            title: "Indoor + Outdoor",       desc: "Versatile setup for all weather" },
    { Icon: Heart,           title: "Bridal Suite",           desc: "Dedicated bridal preparation room" },
    { Icon: Car,             title: "Valet Parking",          desc: "Hassle-free parking for all guests" },
    { Icon: UtensilsCrossed, title: "Multi-Cuisine Catering", desc: "In-house culinary team, curated menus" },
    { Icon: Star,            title: "Heritage Property",      desc: "Colonial-era landmark architecture" },
    { Icon: Sparkles,        title: "Premium Décor",          desc: "Award-winning décor partnerships" },
    { Icon: Wind,            title: "AC Throughout",          desc: "Central air conditioning in all zones" },
    { Icon: MapPin,          title: "Prime City Location",    desc: "Minutes from major transit hubs" },
  ],
  farmstays: [
    { Icon: TreePine,        title: "Entire Estate",             desc: "Exclusive private property for your group" },
    { Icon: Waves,           title: "Private Pool",              desc: "Infinity pool with valley views" },
    { Icon: PawPrint,        title: "Pet Friendly",              desc: "Welcome your furry companions" },
    { Icon: Flame,           title: "Bonfire Area",              desc: "Nightly bonfire under the stars" },
    { Icon: Leaf,            title: "Organic Plantation",        desc: "Fresh-from-the-farm produce daily" },
    { Icon: Sunrise,         title: "Sunrise View",              desc: "Panoramic sunrise vistas from the estate" },
    { Icon: MapPin,          title: "Plantation Walks",          desc: "Guided coffee & spice trails" },
    { Icon: Coffee,          title: "Home Cooked Food",          desc: "Traditional estate meals, local flavours" },
    { Icon: Droplets,        title: "Riverside Access",          desc: "Private access to the river" },
    { Icon: Mountain,        title: "Nature Trails",             desc: "Explore the estate on foot" },
    { Icon: TreePine,        title: "Private Coffee Plantation", desc: "Walk through acres of Arabica and Robusta at your own pace, any time of day." },
    { Icon: Sunrise,         title: "Sunrise Deck",              desc: "A dedicated deck with 180° valley views. Magical — especially at 6 AM." },
    { Icon: Leaf,            title: "Guided Plantation Walk",    desc: "Host-guided trails through coffee, black pepper and areca nut." },
    { Icon: Coffee,          title: "Farm Breakfast",            desc: "Wake up to a breakfast made from freshly harvested estate produce." },
    { Icon: Flame,           title: "Bonfire Under the Stars",   desc: "Nightly bonfire with storytelling, music and hot chai around the fire." },
    { Icon: Sparkles,        title: "Organic Produce",           desc: "Seasonal fruits, herbs and vegetables from the estate kitchen garden." },
    { Icon: PawPrint,        title: "Pet Friendly Estate",       desc: "One of the few farmstays that genuinely welcomes dogs and cats with open arms." },
    { Icon: Waves,           title: "Infinity Pool",             desc: "A calm pool overlooking paddy fields and forested hills. No crowds, ever." },
    { Icon: Droplets,        title: "Private Lake",              desc: "Fishing and kayaking available at your own exclusive lakeside." },
    { Icon: Mountain,        title: "River Access",              desc: "A 10-minute plantation walk leads to a secluded private river bend." },
  ],
  studios: [
    { Icon: Camera,          title: "Cyclorama Wall",         desc: "Professional seamless backdrop" },
    { Icon: Zap,             title: "2400W Strobes",          desc: "Studio-grade lighting rig included" },
    { Icon: Mic,             title: "Soundproofed",           desc: "Zero external noise bleed" },
    { Icon: Film,            title: "Green Screen",           desc: "Full chroma key setup" },
    { Icon: Music,           title: "Recording Booth",        desc: "Isolation booth for audio sessions" },
    { Icon: Laptop,          title: "Editing Suite",          desc: "Full DAW workstation included" },
    { Icon: Package,         title: "Prop Room",              desc: "Curated creative prop library" },
    { Icon: Building2,       title: "Private Studio",         desc: "Exclusive access, no shared spaces" },
  ],
  workspaces: [
    { Icon: Zap,             title: "1 Gbps Internet",        desc: "Fibre-fast, always-on connection" },
    { Icon: Building2,       title: "Meeting Rooms",          desc: "Bookable boardrooms & private pods" },
    { Icon: Users,           title: "Up to 40 People",        desc: "Scales from solo to full team" },
    { Icon: Laptop,          title: "Ergonomic Desks",        desc: "Sit-stand desks in quiet zones" },
    { Icon: Coffee,          title: "Free Coffee",            desc: "Unlimited barista-quality coffee" },
    { Icon: MapPin,          title: "Phone Booths",           desc: "Quiet booths for private calls" },
    { Icon: Star,            title: "24/7 Access",            desc: "Work fully on your own schedule" },
    { Icon: Mic,             title: "Podcast Setup",          desc: "AV-ready recording corner" },
  ],
  rentals: [
    { Icon: Zap,             title: "Instant Booking",        desc: "Confirm and receive same day" },
    { Icon: Car,             title: "Delivery Available",     desc: "Delivered straight to your venue" },
    { Icon: Star,            title: "Fully Insured",          desc: "All items covered end-to-end" },
    { Icon: Building2,       title: "Vast Inventory",         desc: "3,000+ items across categories" },
    { Icon: Heart,           title: "Wedding Specialists",    desc: "Curated décor packages" },
    { Icon: Users,           title: "Setup Crew",             desc: "On-site assembly team included" },
    { Icon: Sparkles,        title: "Premium Brands",         desc: "Top-tier equipment only" },
    { Icon: Flame,           title: "Outdoor Gear",           desc: "Tents, stages & PA systems" },
  ],
  experiences: [
    { Icon: MapPin,          title: "Expert Guide",           desc: "Certified local naturalist" },
    { Icon: Mountain,        title: "Off the Beaten Track",   desc: "Routes not on any tourist map" },
    { Icon: Package,         title: "Gear Included",          desc: "All safety equipment provided" },
    { Icon: UtensilsCrossed, title: "Meals Included",         desc: "Regional cuisine throughout the day" },
    { Icon: Car,             title: "Transport Provided",     desc: "Door-to-door group transfers" },
    { Icon: Zap,             title: "Instant Confirmation",   desc: "No waiting, book and go" },
    { Icon: Heart,           title: "Small Groups Only",      desc: "Intimate, never overcrowded" },
    { Icon: Star,            title: "Safety Certified",       desc: "Fully audited for your safety" },
  ],
};

// Max number of highlights a vendor can select to feature on their listing.
export const MAX_HIGHLIGHTS = 4;
