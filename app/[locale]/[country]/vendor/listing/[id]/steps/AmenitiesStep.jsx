"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  /* ── Event / AV ── */
  Mic2, Volume2, Monitor, Lightbulb, DoorOpen,
  /* ── Food & Drink ── */
  ChefHat, Utensils, Wine, UtensilsCrossed, Coffee,
  /* ── Utilities ── */
  Wind, Car, Wifi, Zap, Accessibility, Droplets, Shield, ShieldCheck,
  /* ── Outdoors / Nature ── */
  Trees, Waves, Flame, Bike, Star, Leaf, Umbrella, Sun, Compass,
  /* ── Rooms / Furniture ── */
  BedDouble, Sofa, DoorClosed, Sparkles,
  /* ── Audio / Studio ── */
  VolumeX, SlidersHorizontal,
  /* ── Display / Image ── */
  Image, Package, Moon, Square,
  /* ── Office / Tech ── */
  Printer, Lock, Phone, Video, Network, Server, Layout,
  /* ── Fitness / Recreation ── */
  Dumbbell, Gamepad2, Heart, Activity,
  /* ── Safety ── */
  AlertCircle, Camera, Plus,
  /* ── Misc ── */
  RefreshCw, Tv, Music,
} from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-AWARE AMENITY GROUPS
   icon: lucide-react component reference
───────────────────────────────────────────────────────────────────────────── */
const AMENITY_CONFIG = {
  venues: {
    heading:  "Amenities",
    subtitle: "Select all the facilities and features available at your venue.",
    groups: [
      {
        label: "Event Infrastructure",
        items: [
          { id: "stage",        icon: Mic2,      label: "Stage / Podium"        },
          { id: "pa_system",    icon: Volume2,   label: "PA System"             },
          { id: "led_wall",     icon: Monitor,   label: "LED Wall / Screen"     },
          { id: "projector",    icon: Monitor,   label: "Projector"             },
          { id: "lighting_rig", icon: Lightbulb, label: "Lighting Rig"          },
          { id: "green_room",   icon: DoorOpen,  label: "Green Room"            },
        ],
      },
      {
        label: "Dining & Catering",
        items: [
          { id: "catering_kitchen", icon: ChefHat,        label: "Catering Kitchen"      },
          { id: "outdoor_catering", icon: Utensils,       label: "Outdoor Catering Area" },
          { id: "bar",              icon: Wine,           label: "Bar / Drinks Counter"  },
          { id: "buffet_setup",     icon: UtensilsCrossed,label: "Buffet Setup"          },
        ],
      },
      {
        label: "Comfort & Utilities",
        items: [
          { id: "ac",          icon: Wind,        label: "Air Conditioning"  },
          { id: "parking",     icon: Car,         label: "Parking"           },
          { id: "wifi",        icon: Wifi,        label: "High-Speed Wi-Fi"  },
          { id: "generator",   icon: Zap,         label: "Power Backup"      },
          { id: "wheelchair",  icon: Accessibility,label: "Wheelchair Access" },
          { id: "restrooms",   icon: Droplets,    label: "Premium Restrooms" },
        ],
      },
      {
        label: "Décor & Setup",
        items: [
          { id: "dance_floor",  icon: Music,  label: "Dance Floor"    },
          { id: "lounge_area",  icon: Sofa,   label: "Lounge Area"    },
          { id: "outdoor_lawn", icon: Trees,  label: "Outdoor Lawn"   },
          { id: "pool",         icon: Waves,  label: "Swimming Pool"  },
          { id: "valet",        icon: Car,    label: "Valet Parking"  },
        ],
      },
    ],
  },

  farmstays: {
    heading:  "Amenities & Activities",
    subtitle: "Let guests know what they can enjoy at your farmstay.",
    groups: [
      {
        label: "Outdoor Activities",
        items: [
          { id: "bonfire",      icon: Flame,    label: "Bonfire Area"      },
          { id: "trekking",     icon: Compass,  label: "Trekking Trails"   },
          { id: "cycling",      icon: Bike,     label: "Cycling Tracks"    },
          { id: "bird_watching",icon: Star,     label: "Bird Watching"     },
          { id: "fishing",      icon: Waves,    label: "Fishing Spot"      },
          { id: "stargazing",   icon: Star,     label: "Stargazing Deck"   },
        ],
      },
      {
        label: "Farm Experiences",
        items: [
          { id: "bbq",          icon: Flame,    label: "BBQ Grill Area"  },
          { id: "farm_tour",    icon: Leaf,     label: "Farm Tour"        },
          { id: "organic_food", icon: Utensils, label: "Organic Meals"    },
          { id: "cooking",      icon: ChefHat,  label: "Cooking Classes"  },
        ],
      },
      {
        label: "Accommodation",
        items: [
          { id: "ac",           icon: Wind,     label: "Air Conditioning" },
          { id: "hot_water",    icon: Droplets, label: "Hot Water"        },
          { id: "linen",        icon: BedDouble,label: "Fresh Linen"      },
          { id: "mosquito_net", icon: Shield,   label: "Mosquito Nets"    },
          { id: "wifi",         icon: Wifi,     label: "Wi-Fi"            },
          { id: "parking",      icon: Car,      label: "Parking"          },
        ],
      },
      {
        label: "Recreation",
        items: [
          { id: "pool",         icon: Waves,    label: "Swimming Pool" },
          { id: "hammock",      icon: Trees,    label: "Hammock Area"   },
          { id: "board_games",  icon: Gamepad2, label: "Board Games"    },
          { id: "yoga_space",   icon: Heart,    label: "Yoga Space"     },
        ],
      },
    ],
  },

  studios: {
    heading:  "Studio Equipment & Facilities",
    subtitle: "List all gear, equipment, and features available in your studio.",
    groups: [
      {
        label: "Shooting & Capture",
        items: [
          { id: "green_screen",  icon: Monitor,   label: "Green Screen"        },
          { id: "cyclorama",     icon: Square,    label: "Cyclorama Wall"       },
          { id: "ring_lights",   icon: Lightbulb, label: "Ring Lights"          },
          { id: "studio_flash",  icon: Zap,       label: "Studio Flash / Strobe"},
          { id: "natural_light", icon: Sun,       label: "Natural Light"        },
          { id: "blackout",      icon: Moon,      label: "Full Blackout"         },
        ],
      },
      {
        label: "Audio",
        items: [
          { id: "soundproofing",   icon: VolumeX,        label: "Soundproofing"   },
          { id: "mic_stand",       icon: Mic2,           label: "Mic & Stand"     },
          { id: "acoustic_panels", icon: SlidersHorizontal, label: "Acoustic Panels" },
          { id: "mixer",           icon: SlidersHorizontal, label: "Audio Mixer"  },
        ],
      },
      {
        label: "Backdrops & Props",
        items: [
          { id: "paper_rolls",   icon: Image,   label: "Backdrop Paper Rolls" },
          { id: "prop_wardrobe", icon: Package, label: "Prop Wardrobe"        },
          { id: "furniture",     icon: Sofa,    label: "Studio Furniture"     },
          { id: "reflectors",    icon: Square,  label: "Reflectors & Flags"   },
        ],
      },
      {
        label: "Facilities",
        items: [
          { id: "makeup_room",   icon: Sparkles,    label: "Makeup Room"       },
          { id: "changing_room", icon: DoorClosed,  label: "Changing Room"     },
          { id: "wifi",          icon: Wifi,        label: "High-Speed Wi-Fi"  },
          { id: "ac",            icon: Wind,        label: "Air Conditioning"  },
          { id: "parking",       icon: Car,         label: "Parking"           },
          { id: "lounge",        icon: Coffee,      label: "Client Lounge"     },
        ],
      },
    ],
  },

  workspaces: {
    heading:  "Workspace Amenities",
    subtitle: "What facilities and perks does your workspace offer professionals?",
    groups: [
      {
        label: "Connectivity",
        items: [
          { id: "wifi",      icon: Wifi,    label: "High-Speed Wi-Fi"  },
          { id: "fiber",     icon: Network, label: "Fibre Broadband"   },
          { id: "lan_ports", icon: Server,  label: "LAN Ports"         },
          { id: "video_conf",icon: Video,   label: "Video Conferencing"},
        ],
      },
      {
        label: "Office Essentials",
        items: [
          { id: "printing",      icon: Printer,  label: "Printing / Scanning" },
          { id: "lockers",       icon: Lock,     label: "Personal Lockers"    },
          { id: "standing_desk", icon: Monitor,  label: "Standing Desks"      },
          { id: "whiteboard",    icon: Layout,   label: "Whiteboards"         },
          { id: "phone_booths",  icon: Phone,    label: "Phone Booths"        },
          { id: "storage",       icon: Package,  label: "Storage Shelves"     },
        ],
      },
      {
        label: "Comfort",
        items: [
          { id: "ac",           icon: Wind,    label: "Air Conditioning"  },
          { id: "cafe",         icon: Coffee,  label: "In-house Café"     },
          { id: "pantry",       icon: UtensilsCrossed, label: "Pantry / Kitchenette"},
          { id: "lounge",       icon: Sofa,    label: "Lounge Area"       },
          { id: "natural_light",icon: Sun,     label: "Natural Light"     },
          { id: "rooftop",      icon: Umbrella,label: "Rooftop Access"    },
        ],
      },
      {
        label: "Building",
        items: [
          { id: "parking",   icon: Car,         label: "Parking"           },
          { id: "security",  icon: ShieldCheck, label: "24/7 Security"     },
          { id: "elevator",  icon: Activity,    label: "Elevator Access"   },
          { id: "wheelchair",icon: Accessibility,label: "Wheelchair Access"},
          { id: "reception", icon: Utensils,    label: "Reception / Concierge"},
        ],
      },
    ],
  },

  rentals: {
    heading:  "Property Amenities",
    subtitle: "Let guests know what's available in and around your rental.",
    groups: [
      {
        label: "Essentials",
        items: [
          { id: "wifi",    icon: Wifi,     label: "Wi-Fi"                  },
          { id: "ac",      icon: Wind,     label: "Air Conditioning"       },
          { id: "washer",  icon: RefreshCw,label: "Washing Machine"        },
          { id: "dryer",   icon: Wind,     label: "Dryer"                  },
          { id: "kitchen", icon: ChefHat,  label: "Fully Equipped Kitchen" },
          { id: "hot_water",icon: Droplets,label: "Hot Water"              },
        ],
      },
      {
        label: "Comfort",
        items: [
          { id: "tv",       icon: Tv,      label: "Smart TV"          },
          { id: "netflix",  icon: Monitor, label: "Netflix / OTT"     },
          { id: "workdesk", icon: Monitor, label: "Work Desk"         },
          { id: "wardrobe", icon: Package, label: "Wardrobe / Storage"},
          { id: "iron",     icon: Zap,     label: "Iron & Board"      },
          { id: "hair_dryer",icon: Wind,   label: "Hair Dryer"        },
        ],
      },
      {
        label: "Building & Outdoors",
        items: [
          { id: "elevator", icon: Activity,  label: "Elevator"          },
          { id: "parking",  icon: Car,       label: "Parking"           },
          { id: "gym",      icon: Dumbbell,  label: "Gym Access"        },
          { id: "pool",     icon: Waves,     label: "Swimming Pool"     },
          { id: "balcony",  icon: Sun,       label: "Balcony / Terrace" },
          { id: "garden",   icon: Trees,     label: "Garden / Lawn"     },
        ],
      },
      {
        label: "Safety",
        items: [
          { id: "smoke_detector",icon: AlertCircle, label: "Smoke Detector"     },
          { id: "first_aid",     icon: Plus,        label: "First Aid Kit"      },
          { id: "cctv",          icon: Camera,      label: "CCTV / Security Cam"},
          { id: "fire_ext",      icon: Flame,       label: "Fire Extinguisher"  },
        ],
      },
    ],
  },

  experiences: {
    heading:  "What's Included",
    subtitle: "Tell guests what you provide as part of this experience.",
    groups: [
      {
        label: "Equipment & Gear",
        items: [
          { id: "safety_gear", icon: ShieldCheck, label: "Safety Gear"      },
          { id: "equipment",   icon: Package,     label: "All Equipment"    },
          { id: "guide",       icon: Compass,     label: "Expert Guide"     },
          { id: "transport",   icon: Car,         label: "Transportation"   },
        ],
      },
      {
        label: "Food & Refreshments",
        items: [
          { id: "meals",        icon: Utensils, label: "Meals Included" },
          { id: "snacks",       icon: Package,  label: "Snacks"          },
          { id: "water",        icon: Droplets, label: "Drinking Water"  },
          { id: "welcome_drink",icon: Coffee,   label: "Welcome Drink"   },
        ],
      },
      {
        label: "Photography & Memories",
        items: [
          { id: "photographer", icon: Camera, label: "Photographer"      },
          { id: "gopro",        icon: Video,  label: "GoPro / Action Cam"},
          { id: "digital_copy", icon: Image,  label: "Digital Photo Copy"},
        ],
      },
      {
        label: "Accessibility",
        items: [
          { id: "beginner_ok", icon: Check,  label: "Beginner Friendly"  },
          { id: "kids_ok",     icon: Heart,  label: "Kid Friendly"        },
          { id: "senior_ok",   icon: Utensils,label: "Senior Friendly"    },
          { id: "first_aid",   icon: Plus,   label: "First Aid Kit"       },
          { id: "insurance",   icon: Shield, label: "Insurance Included"  },
        ],
      },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    cardAlt: isDark ? "#0d1526"                 : "#f8fafc",
    border:  isDark ? "rgba(255,255,255,0.09)"  : "rgba(0,0,0,0.08)",
    text:    isDark ? "#ffffff"                 : "#0f172a",
    muted:   isDark ? "#94a3b8"                 : "#64748b",
    dimmed:  isDark ? "rgba(255,255,255,0.22)"  : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.05)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AmenitiesStep({ form, setForm, category = "venues" , amenities}) {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk     = tokens(isDark);
  const theme = getCategoryTheme(category);
  const config = AMENITY_CONFIG[category] ?? AMENITY_CONFIG.venues;
   const selected = new Set(form.amenities || []);
 

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setForm({ ...form, amenities: Array.from(next) });
  };

  console.log(form)

  const apiAmenities = amenities || [];

  console.log(apiAmenities)

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-[22px] font-bold leading-tight" style={{ color: tk.text }}>
          {config.heading}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: tk.muted }}>
          {config.subtitle}
        </p>
      </div>

      {/* Selected count badge */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold"
            style={{ background: `${theme.ring}0.10)`, border: `1px solid ${theme.ring}0.25)`, color: theme.accent }}
          >
            <Check size={12} strokeWidth={3} />
            {selected.size} amenit{selected.size === 1 ? "y" : "ies"} selected
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amenity Groups */}
      <div className="space-y-8">
        {apiAmenities.map((group) => (
          <div key={group.id}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: tk.dimmed }}>
              {group.category}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(group.children || []).map((item) => {
                const isOn    = selected.has(item.id);
                const ItemIcon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggle(item.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer"
                    style={{
                      background: isOn ? `${theme.ring}0.08)` : tk.cardAlt,
                      border:     `1px solid ${isOn ? `${theme.ring}0.40)` : tk.border}`,
                      boxShadow:  isOn ? `0 0 0 2px ${theme.ring}0.08)` : "none",
                    }}
                  >
                    {/* SVG icon pill */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isOn ? `${theme.ring}0.15)` : tk.trackBg }}
                    >
                      <ItemIcon size={14} strokeWidth={1.75} style={{ color: isOn ? theme.accent : tk.muted }} />
                    </div>

                    <span className="text-[12px] font-medium leading-tight flex-1" style={{ color: isOn ? theme.accent : tk.text }}>
                      {item.name}
                    </span>

                    {/* Check mark */}
                    <AnimatePresence>
                      {isOn && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: theme.accent }}
                        >
                          <Check size={8} strokeWidth={3} style={{ color: "#fff" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 text-[11px]" style={{ color: tk.dimmed }}>
        <Check size={11} style={{ color: theme.accent }} />
        Listings with more amenities receive significantly higher booking rates.
      </div>
    </div>
  );
}
