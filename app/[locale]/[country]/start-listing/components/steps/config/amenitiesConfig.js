// ─────────────────────────────────────────────────────────────────────────────
//  Amenities config — groups of amenity keys per category
//  Icons are resolved in AmenitiesStep via ICON_LOOKUP (lucide-react)
// ─────────────────────────────────────────────────────────────────────────────

export const AMENITY_CONFIG = {
  venue: [
    {
      group: "Essentials",
      keys: ["wifi", "parking", "ac", "power_backup", "washrooms", "security", "cctv", "elevator"],
    },
    {
      group: "Catering",
      keys: ["inhouse_catering", "outside_catering", "bar", "kitchen", "changing_rooms"],
    },
    {
      group: "Event Setup",
      keys: ["stage", "dj", "sound_system", "lighting_rig", "projector", "decor_services"],
    },
    {
      group: "Accessibility & Extras",
      keys: ["wheelchair_access", "valet_parking", "coat_check", "first_aid"],
    },
  ],

  farmstay: [
    {
      group: "Essentials",
      keys: ["wifi", "parking", "power_backup", "washrooms", "security", "ac"],
    },
    {
      group: "Outdoor",
      keys: ["swimming_pool", "bonfire", "trekking", "camping", "cycling", "bbq", "outdoor_dining"],
    },
    {
      group: "Activities",
      keys: ["farm_activities", "pet_friendly", "orchard", "yoga_space", "indoor_games"],
    },
    {
      group: "Comfort",
      keys: ["geyser", "housekeeping", "cook", "laundry"],
    },
  ],

  studio: [
    {
      group: "Essentials",
      keys: ["wifi", "parking", "ac", "washrooms", "power_backup"],
    },
    {
      group: "Equipment",
      keys: ["dslr_camera", "lighting_kit", "backdrop", "gimbal", "drone", "reflectors"],
    },
    {
      group: "Audio / Visual",
      keys: ["audio_mixer", "microphones", "softboxes", "streaming_setup"],
    },
    {
      group: "Support",
      keys: ["makeup_room", "changing_rooms", "green_room", "lounge"],
    },
  ],

  workspace: [
    {
      group: "Essentials",
      keys: ["high_speed_wifi", "parking", "ac", "washrooms", "power_backup", "security"],
    },
    {
      group: "Meeting Tools",
      keys: ["projector", "video_conferencing", "whiteboard", "tv_screen"],
    },
    {
      group: "Amenities",
      keys: ["lounge", "cafeteria", "printing", "elevator", "wheelchair_access"],
    },
    {
      group: "Services",
      keys: ["reception", "it_support", "housekeeping", "valet_parking"],
    },
  ],

  rental: [
    {
      group: "Essentials",
      keys: ["wifi", "parking", "ac", "washrooms", "power_backup", "security", "cctv"],
    },
    {
      group: "Outdoor",
      keys: ["pool", "garden", "balcony", "bbq"],
    },
    {
      group: "Indoor",
      keys: ["gym", "home_theatre", "indoor_games"],
    },
    {
      group: "Services",
      keys: ["housekeeping", "cook", "laundry", "gated_community", "wheelchair_access"],
    },
  ],

  experience: [
    {
      group: "Essentials",
      keys: ["wifi", "parking", "washrooms", "first_aid"],
    },
    {
      group: "Activity",
      keys: ["equipment_provided", "guide_included", "outdoor_space", "indoor_space"],
    },
    {
      group: "Comfort",
      keys: ["changing_rooms", "lounge", "pet_friendly"],
    },
  ],
};

// ─── Flat metadata: label + lucide icon name for each key ─────────────────

export const AMENITY_META = {
  wifi:               { label: "Wi-Fi",                icon: "Wifi" },
  parking:            { label: "Parking",              icon: "Car" },
  ac:                 { label: "Air Conditioning",     icon: "Wind" },
  power_backup:       { label: "Power Backup",         icon: "Zap" },
  washrooms:          { label: "Washrooms",            icon: "Droplets" },
  security:           { label: "Security",             icon: "Shield" },
  cctv:               { label: "CCTV",                 icon: "Camera" },
  elevator:           { label: "Elevator",             icon: "ArrowUpDown" },
  inhouse_catering:   { label: "In-house Catering",    icon: "ChefHat" },
  outside_catering:   { label: "Outside Catering OK",  icon: "Utensils" },
  bar:                { label: "Bar / Alcohol",        icon: "Wine" },
  kitchen:            { label: "Kitchen",              icon: "Utensils" },
  changing_rooms:     { label: "Changing Rooms",       icon: "Shirt" },
  stage:              { label: "Stage",                icon: "Layers" },
  dj:                 { label: "DJ System",            icon: "Music" },
  sound_system:       { label: "Sound System",         icon: "Volume2" },
  lighting_rig:       { label: "Lighting Rig",         icon: "Lightbulb" },
  projector:          { label: "Projector / Screen",   icon: "Monitor" },
  decor_services:     { label: "Décor Services",       icon: "Star" },
  wheelchair_access:  { label: "Wheelchair Access",    icon: "Heart" },
  valet_parking:      { label: "Valet Parking",        icon: "Car" },
  coat_check:         { label: "Coat Check",           icon: "Tag" },
  first_aid:          { label: "First Aid",            icon: "HeartPulse" },
  swimming_pool:      { label: "Swimming Pool",        icon: "Waves" },
  pool:               { label: "Swimming Pool",        icon: "Waves" },
  bonfire:            { label: "Bonfire Area",         icon: "Flame" },
  trekking:           { label: "Trekking Trail",       icon: "Mountain" },
  camping:            { label: "Camping Area",         icon: "Tent" },
  cycling:            { label: "Cycling",              icon: "Bike" },
  bbq:                { label: "BBQ / Grill",          icon: "Flame" },
  outdoor_dining:     { label: "Outdoor Dining",       icon: "Utensils" },
  farm_activities:    { label: "Farm Activities",      icon: "Leaf" },
  pet_friendly:       { label: "Pet Friendly",         icon: "PawPrint" },
  orchard:            { label: "Orchard Access",       icon: "Leaf" },
  yoga_space:         { label: "Yoga Space",           icon: "Flower2" },
  indoor_games:       { label: "Indoor Games",         icon: "Gamepad2" },
  geyser:             { label: "Hot Water / Geyser",   icon: "Droplets" },
  housekeeping:       { label: "Housekeeping",         icon: "Sparkles" },
  cook:               { label: "Personal Cook",        icon: "ChefHat" },
  laundry:            { label: "Laundry",              icon: "Shirt" },
  dslr_camera:        { label: "DSLR / Camera",        icon: "Camera" },
  lighting_kit:       { label: "Lighting Kit",         icon: "Lightbulb" },
  backdrop:           { label: "Backdrop / Green Screen", icon: "Image" },
  gimbal:             { label: "Gimbal / Stabiliser",  icon: "Move" },
  drone:              { label: "Drone",                icon: "Wind" },
  reflectors:         { label: "Reflectors",           icon: "Sun" },
  audio_mixer:        { label: "Audio Mixer",          icon: "SlidersHorizontal" },
  microphones:        { label: "Microphones",          icon: "Mic" },
  softboxes:          { label: "Softboxes",            icon: "Sun" },
  streaming_setup:    { label: "Live Streaming",       icon: "Radio" },
  makeup_room:        { label: "Makeup Room",          icon: "Sparkles" },
  green_room:         { label: "Green Room",           icon: "DoorOpen" },
  lounge:             { label: "Lounge Area",          icon: "Coffee" },
  high_speed_wifi:    { label: "High-Speed Wi-Fi",     icon: "Wifi" },
  video_conferencing: { label: "Video Conferencing",   icon: "Video" },
  whiteboard:         { label: "Whiteboard",           icon: "PenLine" },
  tv_screen:          { label: "TV / Screen",          icon: "Tv" },
  cafeteria:          { label: "Cafeteria",            icon: "Coffee" },
  printing:           { label: "Printing / Scanning",  icon: "Printer" },
  reception:          { label: "Reception",            icon: "Bell" },
  it_support:         { label: "IT Support",           icon: "Monitor" },
  garden:             { label: "Garden",               icon: "Leaf" },
  balcony:            { label: "Balcony / Terrace",    icon: "Building" },
  gym:                { label: "Gym",                  icon: "Dumbbell" },
  home_theatre:       { label: "Home Theatre",         icon: "Tv" },
  gated_community:    { label: "Gated Community",      icon: "Shield" },
  equipment_provided: { label: "Equipment Provided",   icon: "Package" },
  guide_included:     { label: "Guide Included",       icon: "UserCheck" },
  outdoor_space:      { label: "Outdoor Space",        icon: "Trees" },
  indoor_space:       { label: "Indoor Space",         icon: "Building" },
};
