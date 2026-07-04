"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Film, ImageIcon } from "lucide-react";
import ListingCard from "./ListingCard";
import { CATEGORY_LABELS, getCategoryTheme } from "../utils/estateTheme";

function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };
  return (
    <div className="relative group/row">
      <div
        ref={ref}
        className="flex gap-3.5 overflow-x-auto pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        className="hidden sm:flex absolute -left-3 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="hidden sm:flex absolute -right-3 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function CategoryBlock({ estate, categoryKey, id, filteredListings }) {
  const { locale, country } = useParams();
  const cat = estate.categories[categoryKey];
  const theme = getCategoryTheme(categoryKey);
  const label = CATEGORY_LABELS[categoryKey] ?? categoryKey;

  if (!cat) return null;

  // filteredListings (from the unified search bar's guests/price filters)
  // takes precedence when provided; falls back to the full category list.
  const listings = filteredListings ?? cat.listings ?? [];

  if (cat.comingSoon && (cat.listings?.length ?? 0) === 0) {
    return (
      <div id={id} className="scroll-mt-24 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label} — Coming Soon</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{cat.overview}</p>
      </div>
    );
  }

  return (
    <div id={id} className="scroll-mt-24 space-y-6">
      {/* Section label */}
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{label}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent" />
      </div>

      {/* Overview */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed -mt-2">{cat.overview}</p>

      {/* Listings */}
      {cat.listings?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label} at this estate</h3>
            <Link
              href={`/${locale || "en"}/${country || "in"}/search/${categoryKey}`}
              className={`text-xs font-semibold ${theme.text} hover:underline`}
            >
              View All →
            </Link>
          </div>
          {listings.length > 0 ? (
            <ScrollRow>
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} estateId={estate.id} />
              ))}
            </ScrollRow>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-4">No {label.toLowerCase()} match your current filters.</p>
          )}
        </div>
      )}

      {/* Amenities */}
      {Object.keys(cat.amenities || {}).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{label} Amenities</h3>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(cat.amenities).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {cat.gallery?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
            <ImageIcon size={14} /> {label} Gallery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {cat.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
          <Film size={14} /> {label} Videos
        </h3>
        {cat.video ? (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <video src={cat.video} controls className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[21/9] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
            No {label.toLowerCase()} video uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}
