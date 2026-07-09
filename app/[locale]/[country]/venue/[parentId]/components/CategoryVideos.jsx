"use client";

import { getYoutubeId } from "../utils/youtube";
import { getFallbackVideo } from "../utils/fallbackMedia";

function VideoCard({ caption, children }) {
  return (
    <div>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {children}
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">{caption}</p>
    </div>
  );
}

/**
 * The estate's own video (its house/fallback clip) AND the vendor's
 * pasted YouTube video, shown together in one 50/50 grid row — not an
 * either/or choice. If a category has no YouTube link yet (e.g.
 * Farmstays today), the venue-video card stays the same compact size
 * it would've been in the two-video layout — it does NOT stretch to
 * fill the row just because it's alone.
 */
export default function CategoryVideos({ cat, categoryKey, label }) {
  const youtubeId = getYoutubeId(cat?.youtubeUrl);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">{label} Video</h2>
      <div className="grid grid-cols-2 gap-4">
        <VideoCard caption={`${label} Video`}>
          <video
            src={getFallbackVideo(categoryKey)}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </VideoCard>

        {youtubeId && (
          <VideoCard caption="YouTube Video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={`${label} YouTube video`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </VideoCard>
        )}
      </div>
    </div>
  );
}
