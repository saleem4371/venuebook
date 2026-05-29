/**
 * ChatBubbleIcon — MessageSquareText variant
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the Lucide `message-square-text` icon exactly.
 * Speech-bubble rectangle with a tail + two text lines inside.
 * Used in MessageFAB (mobile) and BottomDock More sheet.
 */
export default function ChatBubbleIcon({ size = 20, className = "", strokeWidth = 1.65 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Bubble body with bottom-left tail */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      {/* Short text line */}
      <path d="M13 8H7" />
      {/* Long text line */}
      <path d="M17 12H7" />
    </svg>
  );
}
