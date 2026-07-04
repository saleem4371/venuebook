"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Users } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { getCategoryTheme } from "../utils/estateTheme";

export default function ListingCard({ listing, estateId }) {
  const { locale, country } = useParams();
  const { format } = useCurrency();
  const theme = getCategoryTheme(listing.type);

  return (
    <Link
      href={`/${locale || "en"}/${country || "in"}/search/${listing.type}/${listing.id}?estate=${estateId}`}
      className="group flex-none w-[240px] sm:w-[260px] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-200 snap-start"
    >
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${theme.solid}`}>
          {listing.type === "venues" ? "Venue" : listing.type === "farmstays" ? "Farmstay" : "Studio"}
        </span>
      </div>
      <div className="p-3.5">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{listing.name}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Users size={11} /> {listing.capacity}
          </span>
          {listing.rating && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <Star size={11} className="fill-amber-400 text-amber-400" /> {listing.rating}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          <span className="font-semibold text-gray-900 dark:text-white">{format(listing.priceINR)}</span>
          {" "}{listing.priceUnit}
        </p>
      </div>
    </Link>
  );
}
