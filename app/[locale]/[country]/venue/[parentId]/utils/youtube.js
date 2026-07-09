/**
 * Pulls the 11-char video ID out of whatever YouTube URL shape the vendor
 * pasted in (watch?v=, youtu.be/, embed/, or a bare shorts link) so the
 * public page can build its own embed URL from it.
 */
export function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}
