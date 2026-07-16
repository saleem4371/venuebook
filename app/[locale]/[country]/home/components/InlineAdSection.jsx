"use client";

import { motion } from "framer-motion";
import HorizontalRail from "./HorizontalRail";
import PropertyCard from "./PropertyCard";
import SponsoredPropertyCard from "./SponsoredPropertyCard";
import ViewAllCard from "./ViewAllCard";

/* ── Premium full-width banner ──────────────────────────────── */
export function PremiumBanner({ tint, badge, headline, subtext, cta, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden mb-8 flex items-center"
      style={{ minHeight: 250 }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div
        className="absolute inset-y-0 start-0 w-1 rounded-s-2xl"
        style={{ background: tint?.hex ?? "#7c3aed" }}
      />
      <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-6 px-8 py-7">
        <div className="min-w-0">
          {badge && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{
                background: tint?.light ?? "rgba(124,58,237,0.2)",
                color:      tint?.hex   ?? "#7c3aed",
                border:     `1px solid ${tint?.border ?? "rgba(124,58,237,0.3)"}`,
              }}
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

/* ── Popular {category} — landscape variant, wider/shorter cards ──── */
export function PopularCategoryRow({ tint, categoryLabel = "Venues", items }) {
  if (!items?.length) return null;
  const title = `Popular ${categoryLabel}`;

  return (
    <section className="mb-8">
      <HorizontalRail
        title={title}
        subtitle={`Trending picks in ${categoryLabel.toLowerCase()}`}
        eyebrow="Popular"
        count={items.length}
        accent={tint?.hex ?? "#7c3aed"}
        viewAllCard={<ViewAllCard images={items.slice(-3).map((it) => it.image)} accent={tint?.hex ?? "#7c3aed"} variant="landscape" />}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}
          >
            <PropertyCard
              venue={{
                name:     item.name,
                location: item.location,
                image:    item.image,
                rating:   item.rating ?? 4.7,
                reviews:  item.reviews ?? 0,
              }}
              badge={item.badge ?? "popular"}
              variant="landscape"
            />
          </motion.div>
        ))}
      </HorizontalRail>
    </section>
  );
}

/* ── Sponsored {category} — distinct compact gold-accent card ───────
 *  Deliberately NOT PropertyCard — sponsored placements must always
 *  read as visually different from organic discovery content.
 */
export function SponsoredCategoryRow({ tint, categoryLabel = "Venues", items }) {
  if (!items?.length) return null;
  const title = `Sponsored ${categoryLabel}`;

  return (
    <section className="mb-8">
      <HorizontalRail
        title={title}
        subtitle="Featured partner listings"
        eyebrow="Sponsored"
        count={items.length}
        accent={tint?.hex ?? "#7c3aed"}
        viewAllCard={<ViewAllCard images={items.slice(-3).map((it) => it.image)} accent={tint?.hex ?? "#7c3aed"} variant="compact" />}
      >
        {items.map((item, i) => (
          <SponsoredPropertyCard key={i} item={item} tint={tint} partnerLogo={item.partnerLogo} />
        ))}
      </HorizontalRail>
    </section>
  );
}

/* ── Top Destinations — the one section that stays a grid ────
 *  Every other homepage row is a horizontal rail; this one is
 *  intentionally a responsive CSS grid, per spec. These are places,
 *  not bookable listings, so they don't use PropertyCard either.
 */
export function TopDestinations({ tint, title = "Top Destinations", items }) {
  if (!items?.length) return null;
  const showViewAll = items.length > 5;
  const accent = tint?.hex ?? "#7c3aed";

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
            Explore More
          </p>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
            {title}
          </h2>
        </div>
        {showViewAll && (
          <button
            type="button"
            className="text-sm font-medium hover:opacity-70 transition whitespace-nowrap shrink-0"
            style={{ color: accent }}
          >
            View all &#8594;
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
          >
            <motion.img
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

            <div className="absolute bottom-3 start-3 end-3 min-w-0">
              <p className="text-white font-bold text-sm leading-snug truncate">{item.name}</p>
              <p className="text-white/65 text-xs mt-0.5 leading-snug truncate">{item.location}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Backward compat aliases ─────────────────────────────────── */
export const LuxuryStrip  = TopDestinations;
export const SponsoredRow = SponsoredCategoryRow;
export function PopularVenuesRow({ tint, title = "Popular Venues", items }) {
  return <SponsoredCategoryRow tint={tint} categoryLabel={title.replace("Popular ", "")} items={items} />;
}
