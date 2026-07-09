/**
 * fallbackMedia.js
 *
 * Two house-stock video clips used whenever a category has no real
 * video/reel footage of its own — the estate page must never show an
 * empty "no videos uploaded" state or leave dead whitespace where a
 * video section would go.
 */
export const FALLBACK_VIDEO_1 =
  "https://vb-venue-images.s3.eu-north-1.amazonaws.com/vb_video/HomePage+(1).mp4";
export const FALLBACK_VIDEO_2 =
  "https://vb-venue-images.s3.eu-north-1.amazonaws.com/vb_video/video.mp4";

/**
 * One clip per category, deterministic — Venues always land on clip 1,
 * Farmstays on clip 2, anything else alternates by index. Used both by
 * the single featured Video section and the single Reel card, so the
 * same fallback logic backs both.
 */
export function getFallbackVideo(categoryKey, index = 0) {
  if (categoryKey === "venues") return FALLBACK_VIDEO_1;
  if (categoryKey === "farmstays") return FALLBACK_VIDEO_2;
  return index % 2 === 0 ? FALLBACK_VIDEO_1 : FALLBACK_VIDEO_2;
}
