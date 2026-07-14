"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";

// ─── Category review tabs ─────────────────────────────────────────────────────
const REVIEW_TABS = {
  venues: ["All", "Wedding", "Corporate", "Birthday", "Reception", "Social"],
  farmstays: ["All", "Family", "Couples", "Pet Stays", "Pool", "Bonfire"],
  studios: ["All", "Photography", "Podcast", "Music", "YouTube", "Reels"],
  workspaces: ["All", "Startup", "Freelancer", "Team Meeting", "Workshop"],
  rentals: ["All", "Wedding", "Corporate", "Birthday", "Outdoor"],
  experiences: ["All", "Adventure", "Culture", "Food", "Nature", "Wellness"],
};

// ─── Mock reviews (category-tagged) ──────────────────────────────────────────
const ALL_REVIEWS = [
  {
    id: 1,
    name: "Priya M.",
    avatar: "https://i.pravatar.cc/48?img=47",
    date: "March 2026",
    rating: 5,
    tag: "Wedding",
    text: "The hall was absolutely stunning. Every detail was handled with care — the catering team was top-notch and the lighting setup for our reception was beyond expectations.",
    helpful: 24,
    category: ["venues"],
  },
  {
    id: 2,
    name: "Arjun K.",
    avatar: "https://i.pravatar.cc/48?img=12",
    date: "Feb 2026",
    rating: 5,
    tag: "Corporate",
    text: "Hosted a 200-person offsite here. AV setup was flawless, the breakout rooms were well-equipped, and the support staff was extremely professional.",
    helpful: 18,
    category: ["venues", "workspaces"],
  },
  {
    id: 3,
    name: "Sneha R.",
    avatar: "https://i.pravatar.cc/48?img=32",
    date: "Jan 2026",
    rating: 5,
    tag: "Family",
    text: "Came with 14 people including kids and grandparents. The farmstay had something for everyone — sunrise coffee trail in the morning and bonfire at night. Kids loved the animals.",
    helpful: 31,
    category: ["farmstays"],
  },
  {
    id: 4,
    name: "Rahul & Divya",
    avatar: "https://i.pravatar.cc/48?img=59",
    date: "Dec 2025",
    rating: 5,
    tag: "Couples",
    text: "Our anniversary getaway was perfect. Private pool, candlelit dinner under the stars, and the estate staff was invisible but incredibly attentive. Worth every rupee.",
    helpful: 47,
    category: ["farmstays"],
  },
  {
    id: 5,
    name: "Max P.",
    avatar: "https://i.pravatar.cc/48?img=65",
    date: "March 2026",
    rating: 4,
    tag: "Photography",
    text: "Shot a full e-commerce catalog here. The cyclorama wall is massive, strobes were well-maintained, and the prop room saved us hours of setup. Would book again.",
    helpful: 12,
    category: ["studios"],
  },
  {
    id: 6,
    name: "Vidya S.",
    avatar: "https://i.pravatar.cc/48?img=43",
    date: "Feb 2026",
    rating: 5,
    tag: "Podcast",
    text: "Recorded 6 podcast episodes in a single day. The acoustic treatment is excellent — zero external noise bleed. Monitoring headphones included and in great condition.",
    helpful: 9,
    category: ["studios"],
  },
  {
    id: 7,
    name: "Team Zeno",
    avatar: "https://i.pravatar.cc/48?img=28",
    date: "April 2026",
    rating: 5,
    tag: "Startup",
    text: "Our founding team spent 2 weeks here building V1. Fast internet, standing desks, and the phone booths are great for investor calls. The coffee is genuinely good.",
    helpful: 22,
    category: ["workspaces"],
  },
  {
    id: 8,
    name: "Kiran T.",
    avatar: "https://i.pravatar.cc/48?img=15",
    date: "Jan 2026",
    rating: 4,
    tag: "Pet Stays",
    text: "Brought our golden retriever and she had the time of her life. There's a fenced lawn and the hosts provided a dog bed and bowls. The pool was a bonus we didn't expect.",
    helpful: 35,
    category: ["farmstays"],
  },
  {
    id: 9,
    name: "Ananya G.",
    avatar: "https://i.pravatar.cc/48?img=53",
    date: "March 2026",
    rating: 5,
    tag: "Nature",
    text: "The guided jungle trail was the highlight. The guide knew every bird call, plant, and path by heart. Came back with 300 photos and a completely clear head.",
    helpful: 19,
    category: ["experiences"],
  },
  {
    id: 10,
    name: "Mohammed A.",
    avatar: "https://i.pravatar.cc/48?img=68",
    date: "Feb 2026",
    rating: 5,
    tag: "Birthday",
    text: "Threw a surprise birthday for 80 people. The decor team transformed the hall overnight. Guests were blown away. Every single detail was executed perfectly.",
    helpful: 41,
    category: ["venues"],
  },
];

// ─── Rating breakdown data ────────────────────────────────────────────────────
const RATING_BREAKDOWN = [
  { label: "Cleanliness", value: 4.9 },
  { label: "Accuracy", value: 4.8 },
  { label: "Communication", value: 4.9 },
  { label: "Location", value: 4.7 },
  { label: "Value", value: 4.8 },
  { label: "Check-in", value: 4.7 },
];

function normalize(type = "") {
  const t = type.toLowerCase();
  if (t.startsWith("farm")) return "farmstays";
  if (t.startsWith("studio")) return "studios";
  if (t.startsWith("work")) return "workspaces";
  if (t.startsWith("rental")) return "rentals";
  if (t.startsWith("exp")) return "experiences";
  return "venues";
}

function StarRow({ value, max = 5, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(value) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700"}
        />
      ))}
    </div>
  );
}

export default function SocialProofHub({ category }) {
  const catKey = normalize(category);
  const tabs = REVIEW_TABS[catKey] ?? REVIEW_TABS.venues;

  const [activeTab, setActiveTab] = useState("All");
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const filteredReviews = ALL_REVIEWS.filter(
    (r) =>
      r.category.includes(catKey) &&
      (activeTab === "All" || r.tag === activeTab)
  );

  const totalReviews = ALL_REVIEWS.filter((r) => r.category.includes(catKey)).length;

  const handleHelpful = (id) => {
    setHelpfulVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="reviews" className="border-t border-gray-100 dark:border-gray-800 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">4.8</span>
        </div>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{totalReviews} reviews</span>
      </div>

      {/* Rating breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-3 mb-7 pb-6 border-b border-gray-100 dark:border-gray-800">
        {RATING_BREAKDOWN.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 w-20 sm:w-24 flex-none">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-800 dark:bg-gray-200 rounded-full"
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-6 text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Experience tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              activeTab === tab
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Review cards grid */}
      {filteredReviews.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600 py-6">No reviews for this category yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => {
            const voted = helpfulVotes[review.id];
            return (
              <div
                key={review.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 hover:shadow-sm transition-shadow"
              >
                {/* Author */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{review.name}</p>
                      <span className="flex-none text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        {review.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow value={review.rating} size={11} />
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{review.text}</p>

                {/* Helpful */}
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                    voted
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                  }`}
                >
                  <ThumbsUp size={12} className={voted ? "fill-violet-600 dark:fill-violet-400" : ""} />
                  <span>Helpful ({review.helpful + (voted ? 1 : 0)})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
