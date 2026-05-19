"use client";

import { motion } from "framer-motion";

/* ── Inline ad types ─────────────────────────────────────────── */

/** Full-width horizontal premium banner */
export function PremiumBanner({ tint, badge, headline, subtext, cta, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden my-8"
      style={{ minHeight: 140 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Tint strip */}
      <div
        className="absolute inset-y-0 start-0 w-1 rounded-s-2xl"
        style={{ background: tint?.hex ?? "#7c3aed" }}
      />

      <div className="relative z-10 flex items-center justify-between gap-6 px-8 py-6">
        <div className="min-w-0">
          {badge && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ background: tint?.light ?? "rgba(124,58,237,0.2)", color: tint?.hex ?? "#7c3aed", border: `1px solid ${tint?.border ?? "rgba(124,58,237,0.3)"}` }}
            >
              {badge}
            </span>
          )}
          <h3 className="text-white font-bold text-lg md:text-xl leading-snug">{headline}</h3>
          {subtext && <p className="text-white/55 text-sm mt-1 max-w-lg">{subtext}</p>}
        </div>
        {cta && (
          <button
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
            style={{ background: tint?.hex ?? "#7c3aed" }}
          >
            {cta}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** Horizontal scrollable sponsored property row */
export function SponsoredRow({ tint, title, items }) {
  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
          style={{ background: tint?.light ?? "rgba(124,58,237,0.1)", color: tint?.hex ?? "#7c3aed" }}
        >
          Sponsored
        </span>
        <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-base">{title}</h3>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="shrink-0 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            style={{ width: 200 }}
          >
            <div className="relative h-28">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span
                className="absolute top-2 end-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: tint?.hex ?? "#7c3aed", color: "#fff" }}
              >
                AD
              </span>
            </div>
            <div className="p-2.5">
              <p className="text-gray-800 dark:text-white font-semibold text-xs truncate">{item.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] truncate mt-0.5">{item.location}</p>
              {item.price && (
                <p className="text-xs font-bold mt-1" style={{ color: tint?.hex ?? "#7c3aed" }}>
                  {item.price}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Featured host spotlight */
export function HostSpotlight({ tint, host }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden my-8 p-6 border"
      style={{
        background:  `linear-gradient(135deg, ${tint?.light ?? "rgba(124,58,237,0.06)"}, rgba(0,0,0,0.02))`,
        border:      `1px solid ${tint?.border ?? "rgba(124,58,237,0.15)"}`,
      }}
    >
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-4"
        style={{ background: tint?.light ?? "rgba(124,58,237,0.1)", color: tint?.hex ?? "#7c3aed" }}
      >
        Featured Host
      </span>

      <div className="flex items-start gap-4">
        <img
          src={host.avatar}
          alt={host.name}
          className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2"
          style={{ ringColor: tint?.border }}
        />
        <div className="min-w-0">
          <p className="font-bold text-gray-800 dark:text-white text-base">{host.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{host.tagline}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-yellow-500 text-xs">⭐ {host.rating}</span>
            <span className="text-gray-400 dark:text-gray-500 text-xs">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{host.listings} listings</span>
          </div>
        </div>
        <button
          className="ms-auto shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
          style={{ background: tint?.hex ?? "#7c3aed" }}
        >
          View Properties
        </button>
      </div>
    </motion.div>
  );
}

/** Luxury collection strip */
export function LuxuryStrip({ tint, title, items }) {
  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: tint?.hex ?? "#7c3aed" }}
          >
            Luxury Collection
          </p>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base">{title}</h3>
        </div>
        <button
          className="text-sm font-medium hover:opacity-80 transition"
          style={{ color: tint?.hex ?? "#7c3aed" }}
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-xl overflow-hidden cursor-pointer"
            style={{ height: i === 0 ? 200 : 150 }}
          >
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 start-3 end-3">
              <p className="text-white font-bold text-sm leading-snug">{item.name}</p>
              <p className="text-white/60 text-xs mt-0.5">{item.location}</p>
            </div>
            {item.badge && (
              <span
                className="absolute top-2 start-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: tint?.hex ?? "#7c3aed", color: "#fff" }}
              >
                {item.badge}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
