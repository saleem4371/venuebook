"use client";

/**
 * ListingsTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Row-based alternative to the VenueCard grid, toggled from listing/page.jsx.
 * Plain table, not a card — no outer border/shadow/rounded box, just a
 * header row and hairline-separated rows sitting flush on the page.
 *
 * Columns: Listing (thumbnail + name), Type, Location, Status.
 * Same interaction model as the grid: no dedicated "Edit" button — the row
 * itself is the click target. Self-contained navigation/loading, mirroring
 * VenueCard, rather than lifting that logic into the page.
 */

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight, ImageOff } from "lucide-react";

import { useVendorCategory } from "@/context/VendorCategoryContext";
import EditorLoadingOverlay from "@/app/[locale]/[country]/vendor/components/EditorLoadingOverlay";

/* "venues" -> "Venue", "farmstays" -> "Farmstay" — singular display label
   for the Type column since venues don't carry their own sub-type field. */
function categoryLabel(category) {
  if (!category) return "—";
  const singular = category.endsWith("s") ? category.slice(0, -1) : category;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

export default function ListingsTable({ listings }) {
  const params = useParams();
  const router = useRouter();
  const { activeCategory } = useVendorCategory();

  const [loadingId, setLoadingId] = useState(null);

  const basePath = `/${params?.locale}/${params?.country}/vendor/listing`;
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  /* Same fix as VenueCard: some listings come back with a full URL
     already, others a bare S3 key that still needs the bucket prefix. */
  const resolveImage = (image) => {
    if (!image) return null;
    return image.startsWith("http") ? image : `${BASE_URL}/${image}`;
  };

  useEffect(() => {
    listings.forEach((v) => v?.id && router.prefetch(`${basePath}/${v.id}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  const openEditor = (venue) => {
    setLoadingId(venue.id);
    const query = `category=${activeCategory}&name=${encodeURIComponent(venue.name ?? "")}`;
    setTimeout(() => router.push(`${basePath}/${venue.id}?${query}`), 160);
  };

  const activeVenue = listings.find((v) => v.id === loadingId);
  const typeLabel = categoryLabel(activeCategory);

  return (
    <>
      <div>
        {/* Header row */}
        <div
          className="
            hidden sm:grid grid-cols-[1fr_140px_1fr_150px_20px] items-center gap-4
            px-2 py-3
            border-b border-gray-200 dark:border-white/[0.08]
            text-[13px] font-bold text-gray-900 dark:text-gray-100
          "
        >
          <span>Listing</span>
          <span>Type</span>
          <span>Location</span>
          <span>Status</span>
          <span />
        </div>

        {listings.map((venue, i) => {
          const isActive = venue.status === 1;
          const imgSrc = resolveImage(venue.image);

          return (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              onClick={() => openEditor(venue)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openEditor(venue);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${venue.name}`}
              className="
                group grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_150px_20px] items-center gap-3 sm:gap-4
                px-2 py-4 cursor-pointer
                border-b border-gray-100 dark:border-white/[0.06] last:border-b-0
                hover:bg-gray-50/70 dark:hover:bg-white/[0.03]
                transition-colors duration-150
              "
            >
              {/* Listing — thumbnail + name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={venue.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <ImageOff
                    size={14}
                    className="text-gray-300 dark:text-gray-600"
                    style={{ display: imgSrc ? "none" : "flex" }}
                  />
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white leading-snug truncate">
                  {venue.name}
                </p>
              </div>

              {/* Type */}
              <div className="text-[13px] text-gray-500 dark:text-gray-400">
                {typeLabel}
              </div>

              {/* Location */}
              <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                {venue.address}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-gray-300">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {isActive ? "Active" : "Inactive"}
              </div>

              {/* Chevron affordance */}
              <ChevronRight
                size={16}
                className="hidden sm:block text-gray-300 dark:text-gray-600 rtl:rotate-180 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors"
              />
            </motion.div>
          );
        })}
      </div>

      <EditorLoadingOverlay
        show={loadingId != null}
        title="Opening Editor"
        subtitle={activeVenue?.name}
      />
    </>
  );
}
