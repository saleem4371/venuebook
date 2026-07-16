"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

// ─── Category accent colours (mirrors WizardShell) ────────────────────────
const CAT_ACCENT = {
  venue:      { from: "#a44bf3", to: "#499ce8" },
  farmstay:   { from: "#10b981", to: "#34d399" },
  studio:     { from: "#f59e0b", to: "#fbbf24" },
  workspace:  { from: "#06b6d4", to: "#67e8f9" },
  rental:     { from: "#3b82f6", to: "#60a5fa" },
  experience: { from: "#ec4899", to: "#f472b6" },
};

const CAT_LABELS = {
  venue:      "Venues",
  farmstay:   "Farmstays",
  studio:     "Studios",
  workspace:  "Workspaces",
  rental:     "Rentals",
  experience: "Experiences",
};

// ─── Card data ────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "single",
    icon: Building2,
    title: "Single Property",
    description:
      "Perfect if you are listing one venue, farmstay, studio, workspace, rental item, or experience.",
    examples: [
      "One Banquet Hall",
      "One Farmstay",
      "One Workspace",
      "One Studio",
      "One Rental Inventory",
    ],
    badge: "Most common",
  },
  {
    id: "multi",
    icon: LayoutGrid,
    title: "Property With Multiple Units",
    description:
      "Ideal when one property contains multiple bookable spaces or inventories.",
    examples: [
      "Convention Center with multiple halls",
      "Farmstay with multiple cottages",
      "Coworking space with meeting rooms",
      "Resort with multiple room types",
    ],
    badge: null,
  },
];

// ─── Illustration: Single Building ────────────────────────────────────────
function SinglePropertyIllustration({ accentFrom, accentTo }) {
  return (
    <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="spGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accentFrom} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentTo} stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="spAccent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentFrom} />
          <stop offset="100%" stopColor={accentTo} />
        </linearGradient>
      </defs>
      {/* Ground */}
      <rect x="10" y="80" width="100" height="3" rx="1.5" fill={accentFrom} opacity="0.2" />
      {/* Main building */}
      <rect x="30" y="30" width="60" height="50" rx="3" fill="url(#spGrad)" stroke={accentFrom} strokeWidth="1.2" strokeOpacity="0.4" />
      {/* Roof triangle */}
      <polygon points="25,32 60,10 95,32" fill={accentFrom} opacity="0.18" />
      <polygon points="25,32 60,10 95,32" fill="none" stroke={accentFrom} strokeWidth="1.2" strokeOpacity="0.5" strokeLinejoin="round" />
      {/* Windows row 1 */}
      <rect x="38" y="42" width="12" height="10" rx="2" fill="url(#spAccent)" opacity="0.5" />
      <rect x="54" y="42" width="12" height="10" rx="2" fill="url(#spAccent)" opacity="0.5" />
      <rect x="70" y="42" width="12" height="10" rx="2" fill="url(#spAccent)" opacity="0.5" />
      {/* Windows row 2 */}
      <rect x="38" y="58" width="12" height="10" rx="2" fill="url(#spAccent)" opacity="0.35" />
      <rect x="70" y="58" width="12" height="10" rx="2" fill="url(#spAccent)" opacity="0.35" />
      {/* Door */}
      <rect x="52" y="62" width="16" height="18" rx="2" fill={accentFrom} opacity="0.3" />
      <rect x="52" y="62" width="16" height="18" rx="2" stroke={accentFrom} strokeWidth="1" strokeOpacity="0.5" fill="none" />
      {/* Star / sparkle */}
      <circle cx="60" cy="10" r="2.5" fill={accentFrom} opacity="0.7" />
    </svg>
  );
}

// ─── Illustration: Multi-Unit Buildings ───────────────────────────────────
function MultiUnitIllustration({ accentFrom, accentTo }) {
  return (
    <svg viewBox="0 0 140 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="muGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accentFrom} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accentTo} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="muAccent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentFrom} />
          <stop offset="100%" stopColor={accentTo} />
        </linearGradient>
      </defs>
      {/* Ground */}
      <rect x="8" y="82" width="124" height="3" rx="1.5" fill={accentFrom} opacity="0.18" />
      {/* Left small building */}
      <rect x="10" y="46" width="36" height="36" rx="2" fill="url(#muGrad)" stroke={accentFrom} strokeWidth="1" strokeOpacity="0.35" />
      <rect x="17" y="54" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.45" />
      <rect x="30" y="54" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.45" />
      <rect x="17" y="66" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      <rect x="30" y="66" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      {/* Centre tall building */}
      <rect x="52" y="20" width="36" height="62" rx="2.5" fill="url(#muGrad)" stroke={accentFrom} strokeWidth="1.2" strokeOpacity="0.45" />
      <rect x="59" y="30" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.5" />
      <rect x="72" y="30" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.5" />
      <rect x="59" y="44" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.4" />
      <rect x="72" y="44" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.4" />
      <rect x="59" y="58" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      <rect x="72" y="58" width="9" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      {/* Door centre */}
      <rect x="63" y="68" width="14" height="14" rx="1.5" fill={accentFrom} opacity="0.28" stroke={accentFrom} strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Right small building */}
      <rect x="94" y="38" width="38" height="44" rx="2" fill="url(#muGrad)" stroke={accentFrom} strokeWidth="1" strokeOpacity="0.35" />
      <rect x="101" y="48" width="10" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.45" />
      <rect x="115" y="48" width="10" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.45" />
      <rect x="101" y="61" width="10" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      <rect x="115" y="61" width="10" height="8" rx="1.5" fill="url(#muAccent)" opacity="0.3" />
      {/* Connector line on ground */}
      <line x1="46" y1="83" x2="52" y2="83" stroke={accentFrom} strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.4" />
      <line x1="88" y1="83" x2="94" y2="83" stroke={accentFrom} strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.4" />
    </svg>
  );
}

// ─── Card component ────────────────────────────────────────────────────────
function PropertyTypeCard({ card, selected, onSelect, accent, index }) {
  const Illustration = card.id === "single" ? SinglePropertyIllustration : MultiUnitIllustration;
  const isSelected = selected === card.id;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(card.id)}
      className={[
        "relative w-full text-left rounded-2xl border-2 p-6 sm:p-8 cursor-pointer",
        "transition-all duration-200 group focus:outline-none",
        "bg-white dark:bg-gray-900",
        isSelected
          ? "border-transparent shadow-xl ring-2"
          : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md",
      ].join(" ")}
      style={
        isSelected
          ? {
              borderColor: "transparent",
              boxShadow: `0 0 0 2px ${accent.from}, 0 12px 40px ${accent.from}22`,
            }
          : {}
      }
      aria-pressed={isSelected}
    >
      {/* Selected check */}
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute top-4 right-4"
        >
          <CheckCircle2
            className="w-6 h-6"
            style={{ color: accent.from }}
          />
        </motion.span>
      )}

      {/* Badge */}
      {card.badge && (
        <span
          className="inline-block mb-4 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            background: `${accent.from}18`,
            color: accent.from,
          }}
        >
          {card.badge}
        </span>
      )}

      {/* Illustration */}
      <div className="w-full h-28 sm:h-32 mb-6 rounded-xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent.from}0d, ${accent.to}0a)` }}
      >
        <div className="w-full h-full p-4">
          <Illustration accentFrom={accent.from} accentTo={accent.to} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <card.icon
          className="w-5 h-5 shrink-0"
          style={{ color: accent.from }}
        />
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
        {card.description}
      </p>

      {/* Examples */}
      <ul className="space-y-1.5">
        {card.examples.map((ex) => (
          <li key={ex} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: accent.from, opacity: 0.6 }}
            />
            {ex}
          </li>
        ))}
      </ul>

      {/* Continue button */}
      <div className="mt-6">
        <motion.div
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            opacity: isSelected ? 1 : 0.75,
          }}
          whileHover={{ opacity: 1 }}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function PropertyTypePage() {
  const router = useRouter();
  const { locale, country, category } = useParams();
  const [selected, setSelected] = useState(null);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const accent = CAT_ACCENT[category] ?? CAT_ACCENT.venue;
  const catLabel = CAT_LABELS[category] ?? "Property";

  function handleSelect(id) {
    setSelected(id);
    // Small delay so user sees the selection before navigating
    setTimeout(() => {
      if (id === "single") {
        router.push(`/${locale}/${country}/start-listing/${category}/basic-details`);
      } else {
        router.push(`/${locale}/${country}/start-listing/${category}/parent-setup`);
      }
    }, 320);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-40 h-14 flex items-center px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <Link href={`/${locale}/${country}/vendor/listing`} className="flex items-center">
          <Image
            src={isDark ? darkLogo : lightLogo}
            alt="venuebook.in"
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        <div className="ml-auto text-sm text-gray-400 dark:text-gray-500 hidden sm:block">
          New {catLabel} Listing
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: `${accent.from}15`, color: accent.from }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent.from }}
            />
            Step 1 of 2 — Property Structure
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mb-10 sm:mb-12 px-2"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Tell us about your property
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            This helps us set up the right listing structure for your business.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {CARDS.map((card, i) => (
            <PropertyTypeCard
              key={card.id}
              card={card}
              selected={selected}
              onSelect={handleSelect}
              accent={accent}
              index={i}
            />
          ))}
        </div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-gray-400 dark:text-gray-600 text-center"
        >
          You can always add more units to a property later.
        </motion.p>
      </main>
    </div>
  );
}
