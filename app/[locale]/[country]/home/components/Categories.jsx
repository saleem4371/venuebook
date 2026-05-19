"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

/* ── Realistic Unsplash images per category chip ──────────────────
   Replace img URLs with DB images once available.
───────────────────────────────────────────────────────────────── */
const CATEGORY_CHIPS = {
  venues: [
    {
      title: "Banquet Halls",
      icon: "🏛️",
      img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=75&fit=crop",
    },
    {
      title: "Conference Rooms",
      icon: "🎤",
      img: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop",
    },
    {
      title: "Resorts & Hotels",
      icon: "🌴",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=75&fit=crop",
    },
    {
      title: "Community Halls",
      icon: "🏘️",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75&fit=crop",
    },
    {
      title: "Convention Centres",
      icon: "🏢",
      img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75&fit=crop",
    },
    {
      title: "Auditoriums",
      icon: "🎭",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75&fit=crop",
    },
    {
      title: "Outdoor Lawns",
      icon: "🌿",
      img: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=75&fit=crop",
    },
    {
      title: "Wedding Venues",
      icon: "💒",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75&fit=crop",
    },
  ],
  farmstays: [
    {
      title: "Nature Stays",
      icon: "🌿",
      img: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=75&fit=crop",
    },
    {
      title: "Weekend Escapes",
      icon: "🏕️",
      img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75&fit=crop",
    },
    {
      title: "Private Farms",
      icon: "🌾",
      img: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&q=75&fit=crop",
    },
    {
      title: "Heritage Estates",
      icon: "🏰",
      img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75&fit=crop",
    },
    {
      title: "Riverside Retreats",
      icon: "🏞️",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75&fit=crop",
    },
    {
      title: "Mountain Stays",
      icon: "⛰️",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75&fit=crop",
    },
    {
      title: "Lakeside Cabins",
      icon: "🏊",
      img: "https://images.unsplash.com/photo-1439066290691-3b6f5b6b9b1d?w=400&q=75&fit=crop",
    },
    {
      title: "Forest Camps",
      icon: "🌲",
      img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=75&fit=crop",
    },
  ],
  studios: [
    {
      title: "Photography",
      icon: "📸",
      img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=75&fit=crop",
    },
    {
      title: "Podcast Studios",
      icon: "🎙️",
      img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=75&fit=crop",
    },
    {
      title: "Video Production",
      icon: "🎬",
      img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75&fit=crop",
    },
    {
      title: "Music Recording",
      icon: "🎵",
      img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=75&fit=crop",
    },
    {
      title: "Content Creation",
      icon: "✨",
      img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=75&fit=crop",
    },
    {
      title: "Art Studios",
      icon: "🎨",
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=75&fit=crop",
    },
    {
      title: "Editing Suites",
      icon: "💻",
      img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=75&fit=crop",
    },
    {
      title: "Green Screen",
      icon: "🟩",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=75&fit=crop",
    },
  ],
  rentals: [
    {
      title: "Party Venues",
      icon: "🎉",
      img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75&fit=crop",
    },
    {
      title: "Pop-up Spaces",
      icon: "🛍️",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=75&fit=crop",
    },
    {
      title: "Event Halls",
      icon: "🏛️",
      img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=75&fit=crop",
    },
    {
      title: "Terraces",
      icon: "🌇",
      img: "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&q=75&fit=crop",
    },
    {
      title: "Private Grounds",
      icon: "🌳",
      img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75&fit=crop",
    },
    {
      title: "Banquet Rooms",
      icon: "🍽️",
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75&fit=crop",
    },
    {
      title: "Showrooms",
      icon: "🏪",
      img: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=400&q=75&fit=crop",
    },
    {
      title: "Rooftops",
      icon: "🌆",
      img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=75&fit=crop",
    },
  ],
  workspaces: [
    {
      title: "Hot Desks",
      icon: "💺",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75&fit=crop",
    },
    {
      title: "Private Offices",
      icon: "🏢",
      img: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&fit=crop",
    },
    {
      title: "Meeting Rooms",
      icon: "📋",
      img: "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400&q=75&fit=crop",
    },
    {
      title: "Conference Halls",
      icon: "🎤",
      img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=75&fit=crop",
    },
    {
      title: "Training Rooms",
      icon: "📚",
      img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop",
    },
    {
      title: "Virtual Offices",
      icon: "💻",
      img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=75&fit=crop",
    },
    {
      title: "Creative Hubs",
      icon: "💡",
      img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75&fit=crop",
    },
    {
      title: "Event Spaces",
      icon: "📅",
      img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=75&fit=crop",
    },
  ],
  experiences: [],
};

const CATEGORY_HEADINGS = {
  venues: {
    title: "India's First Innovative Venue Booking Platform",
    sub: "Discover the perfect venue for your next event with ease.",
  },
  farmstays: {
    title: "Escape to Nature's Best Farmstays",
    sub: "Weekend retreats, heritage estates & nature stays across India.",
  },
  studios: {
    title: "Book Creator & Production Spaces",
    sub: "Photography studios, podcast booths & creative spaces on-demand.",
  },
  rentals: {
    title: "Flexible Rental Spaces for Every Occasion",
    sub: "Short-term & long-term space rentals for events, pop-ups & more.",
  },
  workspaces: {
    title: "Find Your Perfect Workspace",
    sub: "Coworking desks, private offices & meeting rooms across India.",
  },
  experiences: { title: "", sub: "" },
};

export default function CategorySection() {
  const { activeCategory } = useCategory();

  const chips = CATEGORY_CHIPS[activeCategory] ?? CATEGORY_CHIPS.venues;
  const heading = CATEGORY_HEADINGS[activeCategory] ?? CATEGORY_HEADINGS.venues;
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;

  if (!chips.length) return null;

  return (
    <section className="relative px-4 md:px-10 py-7 bg-white dark:bg-gray-950/80">
      {/* Per-category tint overlay — works in both light & dark */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tint.bg }}
      />

      {/* Heading */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-h"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="relative z-[1] max-w-7xl mx-auto mb-5"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {heading.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {heading.sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Chips grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-chips"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative z-[1] max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5"
        >
          {chips.map((chip, i) => (
            <motion.button
              key={chip.title}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800/90 border border-gray-100/80 dark:border-white/[0.07] shadow-sm hover:shadow-md transition-all duration-200 text-start"
            >
              {/* Image */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={chip.img}
                  alt={chip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                {/* Icon */}
                <div
                  className="absolute top-2 start-2 p-1.5 rounded-lg backdrop-blur-sm"
                  style={{ background: tint.light }}
                >
                  <span className="text-sm leading-none">{chip.icon}</span>
                </div>
              </div>

              {/* Label */}
              <div className="px-2.5 py-2">
                <p className="text-gray-800 dark:text-gray-100 font-semibold text-[11px] md:text-xs leading-snug truncate">
                  {chip.title}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
