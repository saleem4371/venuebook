"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/ReelsForYouSection.jsx
 *
 * Center-column feed — a horizontal rail of lightweight 9:16 thumbnail
 * cards, the same "BrowserCard" pattern search/[type]/components/
 * DesktopReelPanel.jsx already uses for its own reel browser (a plain
 * cover-image tile, not a playing video, in the grid itself).
 *
 * Sourced from MOCK_REELS (data/mockProfileData.js) — a fixed pool spread
 * evenly across ALL categories (venues/farmstays/studios/workspaces/
 * rentals/experiences), shuffled via getRandomReels() on every mount —
 * NOT the live `recommended` venues list SuggestionsSection.jsx uses.
 * That list comes from the real, location-scoped Api_recommeded call,
 * which can legitimately return venues from only one or two categories
 * (or very few results) for a given location — that read as this rail
 * being "category-wise" rather than the random, every-category mix this
 * section is meant to show regardless of category or location. Same mock
 * convention as MOCK_BOOKINGS/MOCK_OFFERS elsewhere in this feature.
 *
 * Clicking a thumbnail opens the REAL fullscreen reel viewer via
 * useMobileReels().openReels() — context/MobileReelsContext.jsx, mounted
 * globally in ClientLayout.jsx via <MobileReelsProvider>/<GlobalMobileReels>.
 * That viewer renders the real ReelCard component per reel, exactly like
 * every other reels entry point in the app (DesktopReelPanel's expanded
 * mode, the mobile Reels nav item) — NOT the dead ReelViewerContext/
 * useReelViewer() path, which has no mounted provider and would throw.
 *
 * No "View All" link here, deliberately — this rail intentionally spans
 * every category in one mixed list (the profile page isn't scoped to a
 * single category the way /search/[type] is), and every other reels
 * destination in the app (DesktopReelPanel, the mobile Reels nav item) is
 * inherently single-category. Sending "View All" to `/search/{one
 * category}?openReels=1` would silently drop every other category from
 * the same list it was just shown alongside, which is the opposite of
 * what this section is for.
 *
 * IMPORTANT CAVEAT: `getDemoVideoUrl` (search/[type]/data/demoReelVideos.js)
 * points at /demo-reels/*.mp4 files that download via `npm run
 * download-demo-reels` — but that script (scripts/download-demo-reels.mjs)
 * and the public/demo-reels folder itself are both missing from this
 * checkout. Real venue.videoUrl data or those generated files are needed
 * before playback actually shows video; the wiring to the real component
 * here is correct and will work once either exists.
 */

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Clapperboard, Play } from "lucide-react";

import { SectionCard, SectionHeading } from "../shared/ui";
import { useMobileReels } from "@/context/MobileReelsContext";
import { getDemoVideoUrl } from "@/app/[locale]/[country]/search/[type]/data/demoReelVideos";
import { getRandomReels } from "../../data/mockProfileData";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "";

function venueCategory(v) {
  return v.category || v.venueType || v.property_type || "venues";
}
function venueId(v) {
  return v.childVenueId ?? v.child_venue_id ?? v.id ?? v._id;
}
function venueCover(v) {
  const raw = v.images?.[0] ?? v.image;
  const src = typeof raw === "string" ? raw : raw?.image || raw?.url || "";
  if (!src) return null;
  return src.startsWith("http") ? src : `${BASE_URL}/${src}`;
}

export default function ReelsForYouSection({
  locale,
  country,
  wishlist = [],
  compares = [],
  onWishlist,
  onCompare,
  flat = false,
}) {
  const t = useTranslations("profile.reels");
  const { openReels } = useMobileReels();

  // Shuffled once per mount (empty dep array) — a fresh random,
  // every-category mix each time the page loads, not a fixed order and
  // not scoped to whatever a live API call happened to return.
  const reelVenues = useMemo(
    () =>
      getRandomReels(8).map((v, i) => ({
        ...v,
        videoUrl: v.videoUrl || v.video_url || v.coverVideo || getDemoVideoUrl(venueCategory(v), i),
      })),
    [],
  );

  if (reelVenues.length === 0) return null;

  const open = (idx) => {
    const venue = reelVenues[idx];
    openReels({
      venues: reelVenues,
      startIndex: idx,
      category: venueCategory(venue),
      locale,
      country,
      wishlist,
      compares,
      onWishlist,
      onCompare,
    });
  };

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Clapperboard size={14} className="text-violet-600" />
          </span>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {reelVenues.map((v, i) => {
          const cover = venueCover(v);
          const name = v.venueName || v.name || "";
          return (
            <button
              key={venueId(v) ?? i}
              type="button"
              onClick={() => open(i)}
              className="group relative shrink-0 w-[104px] aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 text-left"
            >
              {cover ? (
                <img
                  src={cover}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-800" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                <Play size={11} className="text-white fill-white" />
              </span>
              <p className="absolute bottom-2 left-2 right-2 text-white text-[10.5px] font-semibold leading-tight truncate">
                {name}
              </p>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
