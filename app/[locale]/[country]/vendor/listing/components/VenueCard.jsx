"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Users, CalendarDays, MapPin, ImageOff,
} from "lucide-react";

import { useVendorCategory } from "@/context/VendorCategoryContext";
import { CATEGORY_COLORS } from "@/config/categoryConfig";
import EditorLoadingOverlay from "@/app/[locale]/[country]/vendor/components/EditorLoadingOverlay";

/* ─────────────────────────────────────────────────────────────────────────────
   VENUE CARD
   - Category-tinted accent (violet for venues, emerald for farmstays, etc.)
     instead of a hardcoded violet, matching the rest of the vendor shell.
   - Stats live as glass pills over the image, inline with the name — one
     glance, no separate boxed stat row underneath competing for attention.
   - Cover image resolves defensively: some API responses hand back a full
     URL, others a bare S3 key — handle both, and if the request still
     404s (or venue.image is missing), fall back to a branded placeholder
     instead of the browser's broken-image icon.
   - Whole card is the click target (see VenueCard's tabIndex/role) — no
     separate "Edit Listing" button; a small pencil badge fades in on
     hover as the affordance instead.
───────────────────────────────────────────────────────────────────────────── */
export default function VenueCard({ venue }) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const { activeCategory, categoryConfig } = useVendorCategory();
  const accent = CATEGORY_COLORS[categoryConfig?.color ?? "violet"];

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;
  const basePath = `/${params?.locale}/${params?.country}/vendor/listing`;

  /* Some listings come back with a full URL already, others a bare S3
     key that still needs the bucket prefix — handle both instead of
     always concatenating (that produced broken double-prefixed URLs). */
  const imgSrc = useMemo(() => {
    if (!venue?.image) return null;
    return venue.image.startsWith("http") ? venue.image : `${BASE_URL}/${venue.image}`;
  }, [venue?.image, BASE_URL]);

  const showPlaceholder = !imgSrc || imgFailed;

  useEffect(() => {
    if (venue?.id) router.prefetch(`${basePath}/${venue.id}`);
  }, [venue?.id]);

  const openEditor = (id) => {
    setLoading(true);
    const query = `category=${activeCategory}&name=${encodeURIComponent(venue.name ?? "")}`;
    setTimeout(() => router.push(`${basePath}/${id}?${query}`), 160);
  };

  const isActive = venue.status === 1;

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.005 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={() => openEditor(venue.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEditor(venue.id);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Edit ${venue.name}`}
        className="
          group relative isolate w-full flex flex-col
          rounded-[20px] overflow-hidden cursor-pointer
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-white/[0.06]
          shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]
          hover:shadow-[0_20px_56px_-8px_var(--accent-shadow,rgba(99,102,241,0.28)),0_8px_24px_rgba(0,0,0,0.10)]
          dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          transition-all duration-500
        "
        style={{ "--accent-shadow": `${accent.accent}40`, "--tw-ring-color": accent.accent }}
      >
        {/* ── IMAGE AREA ── taller than before (4:3 vs the old 16:10) so
            the card reads as more substantial, not just a thin strip. */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
          {showPlaceholder ? (
            /* Branded placeholder — never the browser's broken-image icon */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${accent.accent}1a, ${accent.accent}05)` }}
            >
              <ImageOff size={22} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                No cover image
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              {/* Shimmer skeleton while loading */}
              <AnimatePresence>
                {!imgLoaded && (
                  <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
                  />
                )}
              </AnimatePresence>

              <img
                src={imgSrc}
                alt={venue.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgFailed(true)}
                className="
                  absolute inset-0 block
                  w-full h-full object-cover
                  will-change-transform
                  scale-[1.01]
                  transition-transform duration-700 ease-out
                  group-hover:scale-[1.06]
                "
                style={{
                  transformOrigin: "center center",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "translate3d(0,0,0)",
                }}
              />
            </div>
          )}

          {/* Tint only the bottom region where the name/address/stats
              actually sit — the old inset-0 gradient darkened the whole
              photo (including the plain top ⅓ that has nothing on it),
              which muddied the image for no reason. The status badge no
              longer depends on this for contrast (it's opaque on its
              own now), so this can shrink safely. */}
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

          {/* Status badge — glass pill top-right. Background is nearly
              opaque (not just a low-opacity tint) so it stays legible on
              its own — the image's dark gradient overlay is strongest at
              the bottom and barely reaches this top corner, and the
              no-image placeholder can be light in light mode, so the
              badge can't rely on whatever's behind it for contrast. */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5
              rounded-full backdrop-blur-md
              text-[10px] font-bold tracking-wider text-white
              border
              shadow-[0_1px_4px_rgba(0,0,0,0.25)]
              ${isActive
                ? "bg-emerald-500/95 border-emerald-400/40"
                : "bg-red-500/95 border-red-400/40"
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse`} />
              {isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          {/* Title + address + stat pills over image */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10">
            <h3 className="
              text-[17px] font-bold text-white leading-snug line-clamp-2
              drop-shadow-sm
              group-hover:text-white/90 transition-colors duration-300
            ">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <MapPin size={11} className="text-white/60 shrink-0" />
              <p className="text-[11px] text-white/60 line-clamp-1 leading-tight">
                {venue.address}
              </p>
            </div>

            {/* Glass stat pills */}
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/12 backdrop-blur-md border border-white/15 text-[11.5px] font-bold text-white tabular-nums">
                <Users size={12} className="text-white/70" />
                {(venue.guests ?? 0).toLocaleString()}
                <span className="font-medium text-white/60 normal-case">guests</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/12 backdrop-blur-md border border-white/15 text-[11.5px] font-bold text-white tabular-nums">
                <CalendarDays size={12} className="text-white/70" />
                {(venue.leads ?? 0).toLocaleString()}
                <span className="font-medium text-white/60 normal-case">leads</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── GLOBAL PAGE TRANSITION LOADER ──
          Shared EditorLoadingOverlay (portaled to document.body) so this
          phase reads as the SAME overlay that listing/[id]/page.jsx shows
          right after — no black-then-white flash on navigation. */}
      <EditorLoadingOverlay show={loading} title="Opening Editor" subtitle={venue.name} />
    </>
  );
}
