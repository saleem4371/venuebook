/**
 * demoReelVideos.js
 * ─────────────────────────────────────────────────────────────────────
 * Demo video dataset for VenueBook Reels.
 *
 * LOCAL files (zero CORS, instant load after running):
 *   npm run download-demo-reels
 *
 * When the backend is ready, populate venue.videoUrl and this file becomes
 * irrelevant — the fallback in page.jsx only kicks in when videoUrl is absent.
 * ─────────────────────────────────────────────────────────────────────
 */

const LOCAL = (file) => `/demo-reels/${file}`;

/** @type {Record<string, string[]>} */
export const DEMO_VIDEO_POOL = {
  venues:      [LOCAL("venue-1.mp4"), LOCAL("venue-2.mp4"), LOCAL("venue-3.mp4"), LOCAL("venue-4.mp4")],
  farmstays:   [LOCAL("farm-1.mp4"),  LOCAL("farm-2.mp4"),  LOCAL("farm-3.mp4")],
  studios:     [LOCAL("studio-1.mp4"), LOCAL("studio-2.mp4")],
  workspaces:  [LOCAL("workspace-1.mp4"), LOCAL("workspace-2.mp4")],
  rentals:     [LOCAL("rental-1.mp4"), LOCAL("rental-2.mp4")],
  experiences: [LOCAL("exp-1.mp4"),   LOCAL("exp-2.mp4"),   LOCAL("exp-3.mp4")],
};

/** All URLs flattened — used as the error-fallback rotation pool */
export const ALL_DEMO_VIDEOS = Object.values(DEMO_VIDEO_POOL).flat();

/**
 * Returns a deterministic demo video URL for a venue slot.
 * Category-matched first; falls back to global pool.
 *
 * @param {string} category   active category key
 * @param {number} slotIndex  venue's position in displayCards
 */
export function getDemoVideoUrl(category, slotIndex) {
  const pool = DEMO_VIDEO_POOL[category] ?? ALL_DEMO_VIDEOS;
  return pool[Math.abs(slotIndex) % pool.length];
}

/**
 * Returns the next fallback URL in the global pool after a video error.
 * Cycles through all videos so there's always something to show.
 *
 * @param {string} failedUrl  the URL that just errored
 */
export function getFallbackVideoUrl(failedUrl) {
  const idx = ALL_DEMO_VIDEOS.indexOf(failedUrl);
  return ALL_DEMO_VIDEOS[(idx + 1) % ALL_DEMO_VIDEOS.length];
}
