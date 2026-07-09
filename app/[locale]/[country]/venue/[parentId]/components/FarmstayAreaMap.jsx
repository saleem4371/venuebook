"use client";

import { MapPin } from "lucide-react";
import { buildAreaMapSrc } from "../utils/estateMap";

/**
 * Airbnb-style "approximate area" map for farmstay listings — a REAL map
 * (rounded ~1km coordinates, no exact pin) with a translucent green circle
 * standing in for "somewhere in this neighborhood" instead of an exact
 * address. The iframe is rendered oversized and shifted up (negative top +
 * matching extra height, clipped by the parent's overflow-hidden) so
 * Google's own "Open in Maps" chrome — which sits in a fixed spot at the
 * top of every classic maps.google.com embed and can't be styled away
 * since it's cross-origin — is cropped out of view. The map itself is
 * non-interactive (pointer-events-none) so it can't be panned/zoomed to
 * hunt for the exact spot.
 */
export default function FarmstayAreaMap({ lat, lng }) {
  const src = buildAreaMapSrc(lat, lng);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
      {src && (
        <iframe
          key={src}
          src={src}
          loading="lazy"
          title="Approximate area map"
          className="absolute left-0 w-full border-0 pointer-events-none select-none"
          style={{ top: -56, height: "calc(100% + 56px)" }}
          tabIndex={-1}
        />
      )}

      {/* Approximate-area circle, drawn on top of the real map. The fill
          uses an inline rgba() background rather than a Tailwind opacity
          modifier class (e.g. bg-emerald-500 with a slash-opacity suffix)
          — that class pattern has been unreliable in this build (it
          rendered as fully transparent, leaving only the border visible).
          An explicit rgba() has no such ambiguity and reads as a solid
          green tint over any tile color, water included. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border-[3px] border-emerald-600 flex items-center justify-center"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.45)" }}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center shadow-lg">
            <MapPin size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
