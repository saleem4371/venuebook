"use client";

import { useState } from "react";
import {
  Heart, Briefcase, PartyPopper, Flower2,
  Sunrise, Waves, Leaf, Sprout,
  Camera, Mic, Film, Music,
  Laptop, Users, Rocket, BarChart2,
  Home, Tent, Utensils, Bus,
  ChevronRight,
} from "lucide-react";
import { normalizeCategory } from "../../utils/categoryConfig";
import ScrollCarousel from "./ScrollCarousel";

// ─── Static active-pill classes per category for Tailwind JIT ────────────────
const ACTIVE_PILL = {
  venues:      "bg-violet-600  text-white border-transparent",
  farmstays:   "bg-emerald-600 text-white border-transparent",
  studios:     "bg-blue-600    text-white border-transparent",
  workspaces:  "bg-amber-600   text-white border-transparent",
  rentals:     "bg-rose-600    text-white border-transparent",
  experiences: "bg-cyan-600    text-white border-transparent",
};

const ICON_ACCENT = {
  venues:      "text-violet-600  dark:text-violet-400",
  farmstays:   "text-emerald-600 dark:text-emerald-400",
  studios:     "text-blue-600    dark:text-blue-400",
  workspaces:  "text-amber-600   dark:text-amber-400",
  rentals:     "text-rose-600    dark:text-rose-400",
  experiences: "text-cyan-600    dark:text-cyan-400",
};

const TAG_BG = {
  venues:      "bg-violet-100/70  text-violet-800  dark:bg-violet-900/30  dark:text-violet-300",
  farmstays:   "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  studios:     "bg-blue-100/70    text-blue-800    dark:bg-blue-900/30    dark:text-blue-300",
  workspaces:  "bg-amber-100/70   text-amber-800   dark:bg-amber-900/30   dark:text-amber-300",
  rentals:     "bg-rose-100/70    text-rose-800    dark:bg-rose-900/30    dark:text-rose-300",
  experiences: "bg-cyan-100/70    text-cyan-800    dark:bg-cyan-900/30    dark:text-cyan-300",
};

// ─── Experience data (icon = Lucide component, no emojis) ─────────────────────
const EXPERIENCES = {
  venues: {
    heading: "Event Possibilities",
    subheading: "This space adapts to your vision",
    items: [
      {
        Icon: Heart, title: "Wedding & Reception",
        desc: "Full-day bridal setups, floral arrangements, banquet & cocktail zones.",
        tags: ["500–1000 Pax", "Banquet Layout", "Floral Decor"],
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
        capacity: "Up to 1,000 guests", layout: "Banquet / Theatre",
      },
      {
        Icon: Briefcase, title: "Corporate & MICE",
        desc: "Conference halls, breakout rooms, AV equipment, and catering desks.",
        tags: ["Theatre Layout", "AV Setup", "Catering Desk"],
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        capacity: "Up to 500 guests", layout: "Theatre / Classroom",
      },
      {
        Icon: PartyPopper, title: "Birthday & Celebrations",
        desc: "Private dining, stage spotlights, cake tables, and photo backdrops.",
        tags: ["Intimate Dining", "Photo Backdrop", "Stage Lighting"],
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
        capacity: "50–300 guests", layout: "Round Tables",
      },
      {
        Icon: Flower2, title: "Baby Shower & Naamkaran",
        desc: "Floral mandap setups, pastel décor zones, and curated menus.",
        tags: ["Floral Mandap", "Pastel Theme", "Catered Menu"],
        image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400",
        capacity: "30–150 guests", layout: "Banquet",
      },
    ],
  },
  farmstays: {
    heading: "Estate Experiences",
    subheading: "Curated trails and activities on the grounds",
    items: [
      {
        Icon: Sunrise, title: "Sunrise Coffee Trail",
        desc: "Walk through aromatic coffee rows at dawn with a freshly brewed cup.",
        tags: ["2 hrs", "0.5 km trail", "Morning Only"],
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
        capacity: "All ages", layout: "Guided",
      },
      {
        Icon: Waves, title: "Pool & Bonfire Evening",
        desc: "Private pool access through the day, bonfire lit at 7 PM.",
        tags: ["Unlimited Pool", "Bonfire Pit", "BBQ Optional"],
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
        capacity: "Up to 20", layout: "Self-guided",
      },
      {
        Icon: Leaf, title: "Plantation Walk & Harvest",
        desc: "Guided walk through spice and plantation rows. Pick your own coffee.",
        tags: ["90 min", "Expert Guide", "Harvest Souvenir"],
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
        capacity: "All ages", layout: "Guided",
      },
      {
        Icon: Sprout, title: "Farm Life Morning",
        desc: "Feed the animals, collect eggs, and cook a farm-fresh breakfast.",
        tags: ["Kids Favourite", "8–10 AM", "Meals Included"],
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400",
        capacity: "All ages", layout: "Hosted",
      },
    ],
  },
  studios: {
    heading: "Creative Production Use Cases",
    subheading: "What creators book this studio for",
    items: [
      {
        Icon: Camera, title: "Fashion & Product Shoots",
        desc: "Cyclorama wall, strobes, beauty dish setup. Ideal for e-commerce and editorials.",
        tags: ["Cyclorama Wall", "2400W Strobes", "Prop Room"],
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400",
        capacity: "Up to 10 crew", layout: "Studio Setup",
      },
      {
        Icon: Mic, title: "Podcast & Voiceover",
        desc: "Treated acoustic room, condenser mics, and quiet-room ambience.",
        tags: ["Soundproofed", "Condenser Mic", "Monitoring"],
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
        capacity: "1–4 people", layout: "Acoustic Room",
      },
      {
        Icon: Film, title: "YouTube & Reels",
        desc: "LED panels, green screen, teleprompter mount, and 4K monitors.",
        tags: ["Green Screen", "LED Panels", "Teleprompter"],
        image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
        capacity: "1–6 crew", layout: "Video Setup",
      },
      {
        Icon: Music, title: "Music Recording",
        desc: "Isolation booth, DI boxes, and full DAW workstation included.",
        tags: ["Isolation Booth", "DI Box", "DAW"],
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
        capacity: "1–8 musicians", layout: "Recording",
      },
    ],
  },
  workspaces: {
    heading: "Work Scenarios",
    subheading: "How teams use this space",
    items: [
      {
        Icon: Laptop, title: "Deep Work Sessions",
        desc: "Quiet zones with ergonomic chairs, natural light, and focus-first atmosphere.",
        tags: ["Quiet Zone", "Ergonomic", "Natural Light"],
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
        capacity: "1–10 people", layout: "Hot Desks",
      },
      {
        Icon: Users, title: "Team Offsites",
        desc: "Strategy rooms, projector wall, breakout areas, and catered lunch.",
        tags: ["Projector Wall", "Breakout Areas", "Lunch"],
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
        capacity: "10–40 people", layout: "Workshop",
      },
      {
        Icon: Rocket, title: "Startup Sprint",
        desc: "24/7 access, standing desks, whiteboard walls, and phone booths.",
        tags: ["24/7 Access", "Whiteboard Walls", "Phone Booths"],
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400",
        capacity: "2–20 people", layout: "Open / Private",
      },
      {
        Icon: BarChart2, title: "Client Presentation",
        desc: "AV-ready boardroom, HDMI wall, and concierge-level service.",
        tags: ["AV Ready", "HDMI Wall", "Concierge"],
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
        capacity: "4–20 people", layout: "Boardroom",
      },
    ],
  },
  rentals: {
    heading: "Popular Use Cases",
    subheading: "What guests typically rent these items for",
    items: [
      {
        Icon: Heart, title: "Wedding Décor",
        desc: "Arches, drapes, centerpieces, and fairy light canopies.",
        tags: ["Arches", "Fairy Lights", "Centerpieces"],
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
        capacity: "Any size", layout: "Banquet",
      },
      {
        Icon: Tent, title: "Outdoor Events",
        desc: "Marquee tents, folding chairs, portable stages, and PA systems.",
        tags: ["Marquee Tent", "PA System", "Stage"],
        image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
        capacity: "100–500 pax", layout: "Outdoor",
      },
      {
        Icon: Briefcase, title: "Corporate Events",
        desc: "Conference tables, podiums, projectors, and LED screens.",
        tags: ["Projectors", "LED Screens", "Podium"],
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        capacity: "50–300 pax", layout: "Theatre",
      },
      {
        Icon: PartyPopper, title: "Birthday Parties",
        desc: "Balloon arches, cake stands, photo booths, and neon signs.",
        tags: ["Balloon Arch", "Photo Booth", "Neon Sign"],
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
        capacity: "20–150 pax", layout: "Casual",
      },
    ],
  },
  experiences: {
    heading: "Your Journey",
    subheading: "How the experience unfolds",
    items: [
      {
        Icon: Bus, title: "Arrival & Welcome",
        desc: "Pickup from city center, drive through scenic routes, warm welcome at basecamp.",
        tags: ["Transport", "Scenic Drive", "Welcome Drink"],
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
        capacity: "All group sizes", layout: "Guided",
      },
      {
        Icon: Tent, title: "Core Experience",
        desc: "Expert-guided 4-hour immersive activity with all safety gear provided.",
        tags: ["Expert Guide", "Safety Gear", "4 Hours"],
        image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=400",
        capacity: "All group sizes", layout: "Guided",
      },
      {
        Icon: Utensils, title: "Meals & Refreshments",
        desc: "Regional cuisine lunch, evening snacks, and hydration throughout.",
        tags: ["Regional Cuisine", "Snacks", "Hydration"],
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        capacity: "All group sizes", layout: "Hosted",
      },
      {
        Icon: Camera, title: "Memories & Debrief",
        desc: "Group photo session, certificate, and a host-curated recap of the day.",
        tags: ["Photo Session", "Certificate", "Recap"],
        image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400",
        capacity: "All group sizes", layout: "Hosted",
      },
    ],
  },
};

export default function ExperienceBlock({ category , venueEvents }) {
  console.log(venueEvents)
  const key = normalizeCategory(category);
  const data = EXPERIENCES[key] ?? EXPERIENCES.venues;
  const activePill = ACTIVE_PILL[key] ?? ACTIVE_PILL.venues;
  const iconAccent = ICON_ACCENT[key] ?? ICON_ACCENT.venues;
  const tagBg = TAG_BG[key] ?? TAG_BG.venues;

  const [active, setActive] = useState(0);
  // const item = data.items[active];
  // const ItemIcon = item.Icon;

  const item = venueEvents?.[active];

if (!item) return null;

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{data.heading}</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{data.subheading}</p>
      </div>

      {/* Tab pills — horizontal scroll with fade + arrows */}
      {/* <ScrollCarousel className="pb-1 mb-5">
        <div className="flex gap-2 w-max px-1">
          {data.items.map((it, i) => {
            const TabIcon = it.Icon;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                  active === i
                    ? activePill
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <TabIcon size={13} strokeWidth={2} className={active === i ? "text-white" : "text-gray-400"} />
                <span>{it.title}</span>
              </button>
            );
          })}
        </div>
      </ScrollCarousel> */}
      <ScrollCarousel className="pb-1 mb-5">
  <div className="flex gap-2 w-max px-1">
    {venueEvents.map((event, i) => (
      <button
        key={event.id}
        onClick={() => setActive(i)}
        className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
          active === i
            ? activePill
            : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }`}
      >
        <span className="text-base">{event.icon}</span>
        <span>{event.event_name}</span>
      </button>
    ))}
  </div>
</ScrollCarousel>

      {/* Active card */}
      {/* <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
       
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
       
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag, t) => (
              <span key={t} className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/30">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ItemIcon size={16} className={iconAccent} strokeWidth={1.75} />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{item.desc}</p>
           
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-medium ${tagBg}`}>{item.capacity}</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${tagBg}`}>{item.layout}</span>
            </div>
          </div>
          <button className="flex-none mt-1 w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div> */}

      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
  <div className="relative h-56 overflow-hidden">
    <img
      src='https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400'
      alt={item.event_name}
      className="w-full h-full object-cover"
    />
  </div>

  <div className="p-5">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">{item.icon}</span>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {item.event_name}
      </h3>
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-400">
      Celebrate your <strong>{item.event_name}</strong> in this venue with
      premium facilities and customizable event arrangements.
    </p>
  </div>
</div>
    </div>
  );
}
