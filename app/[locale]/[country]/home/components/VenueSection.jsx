"use client";

import { motion } from "framer-motion";
import VenueCard from "./VenueCard";
import HorizontalRail from "./HorizontalRail";
import ViewAllCard from "./ViewAllCard";
import { useCategory } from "@/context/CategoryContext";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

/* Same image-resolution rule VenueCard uses, just for the "See all" collage thumbs */
function resolveThumb(venue, dataSource) {
  const raw = venue.images?.[0] ?? venue.image;
  const src = typeof raw === "string" ? raw : raw?.image || raw?.url || "";
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return dataSource === "api" ? `${BASE_URL}/${src}` : src;
}

/*
 * VenueSection
 * ─────────────────────────────────────────────────────────────
 * Same rail behaviour everywhere on the homepage:
 *   Mobile        → swipe, ~1.3 cards visible
 *   Tablet        → 3 cards
 *   Desktop       → 5 cards
 *
 * "View all" is the trailing card in the row itself; hidden when
 * the row isn't scrollable / has 5 or fewer venues.
 */
export default function VenueSection({ title, subtitle, venues, dataSource, tint }) {
  const { activeCategory } = useCategory();

  if (!venues?.length) return null;

  const collageThumbs = venues.slice(-3).map((v) => resolveThumb(v, dataSource));

  return (
    <section className="w-full mb-8">
      <HorizontalRail
        title={title}
        subtitle={subtitle}
        count={venues.length}
        accent={tint?.hex ?? "#7c3aed"}
        viewAllCard={<ViewAllCard images={collageThumbs} />}
      >
        {venues.map((venue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}
          >
            <VenueCard venue={venue} dataSource={dataSource} category={activeCategory} />
          </motion.div>
        ))}
      </HorizontalRail>
    </section>
  );
}
