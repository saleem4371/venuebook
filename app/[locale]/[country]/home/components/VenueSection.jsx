"use client";

import { motion } from "framer-motion";
import PropertyCard from "./PropertyCard";
import HorizontalRail from "./HorizontalRail";
import ViewAllCard from "./ViewAllCard";
import SkeletonRail from "./SkeletonRail";
import { useCategory } from "@/context/CategoryContext";

import { useRouter, useParams } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

/* Same image-resolution rule PropertyCard uses, just for the "See all" collage thumbs */
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
 * Same rail mechanics everywhere on the homepage (arrows beside
 * the title, swipe on mobile, "View all" as the trailing card),
 * and now the same card WIDTH everywhere too — every section shows
 * 5-up at desktop (HorizontalRail's own default basis). Sections
 * still get their own personality via the card `variant` (image
 * aspect ratio + type scale on PropertyCard), just not via width.
 *   editorial → Recommended: taller hero image
 *   medium    → Recently Viewed: a step down from editorial
 *
 * `loading` — true while the real API-backed venues (Recommended /
 * Recently Viewed are the only two sections actually fetched async;
 * everything else on the homepage is static config) are still in
 * flight. Renders a skeleton rail with the same header + card
 * proportions instead of returning null, so the section doesn't
 * just silently pop into existence once data lands.
 */
export default function VenueSection({ title, subtitle, venues, dataSource, tint, variant = "medium", loading = false }) {
  const { activeCategory } = useCategory();

  const router = useRouter();
    const params = useParams();
    const locale  = params?.locale  || "en";
    const country = params?.country || countryCode || "in";

  if (loading) {
    return <SkeletonRail title={title} subtitle={subtitle} accent={tint?.hex ?? "#7c3aed"} variant={variant} />;
  }

  const proprty_click = ( id) => {
  router.replace(
    `/${locale}/${country}/search/${activeCategory}/${id}`,
    { scroll: false }
  );
};

  if (!venues?.length) return null;

  const collageThumbs = venues.slice(-3).map((v) => resolveThumb(v, dataSource));

  return (
    <section className="w-full mb-8">
      <HorizontalRail
        title={title}
        subtitle={subtitle}
        count={venues.length}
        accent={tint?.hex ?? "#7c3aed"}
        viewAllCard={<ViewAllCard images={collageThumbs} accent={tint?.hex ?? "#7c3aed"} variant={variant} />}
      >
        {venues.map((venue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}

            onClick={() => proprty_click(venue.child_venue_id || venue.childVenueId)}

          >
            <PropertyCard
              venue={venue}
              dataSource={dataSource}
              category={activeCategory}
              badge={venue.badge}
              variant={variant}
            />
          </motion.div>
        ))}
      </HorizontalRail>
    </section>
  );
}
