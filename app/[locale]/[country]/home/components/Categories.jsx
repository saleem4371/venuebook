"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import ScrollCarousel from "./ScrollCarousel";

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

export default function CategorySection(loadData) {
  const { activeCategory } = useCategory();

  const chips = CATEGORY_CHIPS[activeCategory] ?? CATEGORY_CHIPS.venues;
  const heading = CATEGORY_HEADINGS[activeCategory] ?? CATEGORY_HEADINGS.venues;
  const tint = CATEGORY_TINTS[activeCategory] ?? CATEGORY_TINTS.venues;

  if (!loadData.loadData.length) return null;

  return (
    <section className="relative py-7 bg-white dark:bg-gray-950/80">
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
          className="relative z-[1] mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8 mb-5"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {heading.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {heading.sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Chips — horizontal carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-chips"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          /* Below md (no arrows — touch swipe only) the end-padding is
             dropped so the row bleeds to the viewport edge: it maximises
             the exposed track width, which is what actually guarantees the
             next chip peeks into view instead of ending flush with nothing
             hinting there's more to scroll. From md up, arrows take over
             as the "there's more" cue, so padding goes back to symmetric. */
          className="relative z-[1] mx-auto lg:max-w-[1400px] ps-4 pe-0 md:px-6 lg:px-8"
        >
          <ScrollCarousel
            gap="gap-3"
            scrollBy={320}
            fadeSize={0}
            arrowClass="hidden md:flex"
          >
            {loadData.loadData.map((chip, i) => (
              <motion.button
                key={chip.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.22 }}
                whileTap={{ scale: 0.96 }}
                /* Fixed w-36 only holds from md up (where arrows exist, so a
                   flush fit is fine). Below md it's a % of the track width
                   instead — with a fixed 144px card, whether the next one
                   peeks at all depends entirely on whether the viewport
                   happens to divide evenly into 144px steps, which is pure
                   coincidence and was landing on "flush, no peek" often
                   enough to be the actual bug. A percentage width can never
                   land flush: it guarantees a fractional card is always
                   sitting right at the edge. */
                className="group flex flex-col items-center shrink-0 w-[38%] sm:w-[28%] md:w-36 cursor-pointer text-center"
              >
                {/* Icon — same field the search page's CategoryBar uses (chip.icon) — a soft
                    tinted tile behind it keeps every icon reading at the same visual scale
                    (source illustrations have wildly different internal padding) */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full h-28 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-200"
                  style={{ background: tint.light }}
                >
                  {chip.icon && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${chip.icon}`}
                      alt=""
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </motion.div>
                <p className="mt-2.5 text-gray-800 dark:text-gray-100 font-semibold text-[13px] leading-snug truncate w-full">
                  {chip.name}
                </p>
              </motion.button>
            ))}
            {/* Trailing gutter so the last chip clears the viewport edge once scrolled fully */}
            <div className="shrink-0 w-4" />
          </ScrollCarousel>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
