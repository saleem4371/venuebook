"use client";

import { MapPin } from "lucide-react";

export default function EstateLocation({ estate }) {
  const locationLabel = [estate.location?.city, estate.location?.state, estate.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={14} className="text-violet-600 dark:text-violet-400 flex-none" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{locationLabel}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shadow-sm">
          <div className="w-full h-[220px] sm:h-[320px]">
            <iframe src={estate.mapEmbedSrc} className="w-full h-full border-0" loading="lazy" title="Estate location map" />
          </div>
        </div>

        {estate.mapPins?.length > 0 && (
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">On the grounds</p>
            <ul className="space-y-2">
              {estate.mapPins.map((pin) => (
                <li key={pin} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
                  {pin}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
