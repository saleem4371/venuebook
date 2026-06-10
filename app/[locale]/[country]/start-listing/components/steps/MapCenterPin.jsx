"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  MapCenterPin — fixed-center animated map pin overlay for the listing wizard.
//
//  The pin stays anchored at the viewport center; the user moves the map under
//  it. When the map is being dragged the pin lifts smoothly upward; when the
//  map settles the pin springs back down with a soft bounce (same feel as
//  Google Maps / Airbnb native apps).
//
//  Usage:
//    <CenterPin category="venue" isDragging={isDragging} />
//
//  Parent must be `position: relative` — the pin uses `inset: 0` overlay.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Per-category color + icon configuration ─────────────────────────────────
//
//  Icons are the exact same paths used in CategoryNavigator (viewBox 0 0 24 24,
//  stroke-based, fill="none", strokeWidth="2"). They are rendered inside a <g>
//  that centers and scales them to fit the white circle at cx=21 cy=20 r=8
//  inside the pin's 42×58 viewBox.
//
//  Transform derivation:
//    target visual size ≈ 13px  (r=8 minus ~1.5px padding each side)
//    scale = 13/24 ≈ 0.54
//    offset = 24 × 0.54 / 2 = 6.48
//    translate = (21 − 6.48, 20 − 6.48) = (14.52, 13.52)
//
//  The <g> on the SVG sets stroke/fill for all children;
//  the experience star overrides to fill for legibility at small size.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_PIN = {

  // ── Venues — violet ──────────────────────────────────────────────────────
  venue: {
    color:       "#7c3aed",
    shadowColor: "rgba(124,58,237,0.38)",
    // House with door + interior detail — mirrors CategoryNavigator VenueIcon
    renderIcon: () => (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },

  // ── Farmstays — emerald ──────────────────────────────────────────────────
  farmstay: {
    color:       "#10b981",
    shadowColor: "rgba(16,185,129,0.38)",
    // Farmhouse with door panel — mirrors CategoryNavigator FarmstayIcon
    renderIcon: () => (
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    ),
  },

  // ── Studios — amber ──────────────────────────────────────────────────────
  studio: {
    color:       "#f59e0b",
    shadowColor: "rgba(245,158,11,0.38)",
    // Camera body + lens — mirrors CategoryNavigator StudioIcon
    renderIcon: () => (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
  },

  // ── Rentals — blue ───────────────────────────────────────────────────────
  rental: {
    color:       "#3b82f6",
    shadowColor: "rgba(59,130,246,0.38)",
    // Key with ring + shaft — mirrors CategoryNavigator RentalIcon
    renderIcon: () => (
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    ),
  },

  // ── Workspaces — cyan ────────────────────────────────────────────────────
  workspace: {
    color:       "#06b6d4",
    shadowColor: "rgba(6,182,212,0.38)",
    // Monitor + stand — mirrors CategoryNavigator WorkspaceIcon
    renderIcon: () => (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8"  y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </>
    ),
  },

  // ── Experiences — pink ───────────────────────────────────────────────────
  experience: {
    color:       "#f472b6",
    shadowColor: "rgba(244,114,182,0.38)",
    // 5-point star — mirrors CategoryNavigator ExperienceIcon.
    // Filled for legibility at the pin's small rendered size.
    renderIcon: (c) => (
      <polygon
        fill={c}
        stroke="none"
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      />
    ),
  },
};

const DEFAULT_PIN = CATEGORY_PIN.venue;

// ─────────────────────────────────────────────────────────────────────────────
//  CenterPin component
// ─────────────────────────────────────────────────────────────────────────────

export default function CenterPin({ category = "venue", isDragging = false }) {
  const cfg = CATEGORY_PIN[category] || DEFAULT_PIN;

  return (
    <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">

      {/*
        Idle breathing keyframe — a 2.5 px gentle float that makes the pin feel
        alive when the map is at rest. Disabled during drag so transitions take
        full control. The pin re-enters the animation after the spring lands.
      */}
      <style>{`
        @keyframes vbPinIdle {
          0%,  100% { transform: scale(1);     }
          50%        { transform: scale(1.014); }
        }
      `}</style>

      {/*
        Anchor: the pin TIP is placed exactly at the map center (50% / 50%).
        The SVG tip lands at y≈54.8px inside a 60px container.
        Without correction the tip sits 5.2px above the true coordinate.
        calc(-100% + 5px) shifts the container down so the tip aligns precisely.
      */}
      <div
        style={{
          position:  "absolute",
          top:       "50%",
          left:      "50%",
          transform: "translate(-50%, calc(-100% + 5px))",
        }}
      >

        {/* ── Ground shadow ─────────────────────────────────────────────────
            Elliptical shadow below the pin tip.
            • Grounded: small, darker, sharp — pin is close to the ground.
            • Floating: large, softer, lighter — pin is high above the ground.
            Uses a radial gradient to simulate penumbra on both light and
            dark map themes without needing a live dark-mode check.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            position:     "absolute",
            left:         "50%",
            bottom:       -5,

            width:  isDragging ? 46 : 34,
            height: isDragging ? 14 : 11,

            transform: `translateX(-50%) scale(${isDragging ? 1.1 : 1})`,

            borderRadius: "999px",

            background: `radial-gradient(
              ellipse at center,
              rgba(0,0,0,${isDragging ? 0.14 : 0.22}) 0%,
              rgba(0,0,0,${isDragging ? 0.06 : 0.10}) 50%,
              transparent 100%
            )`,

            filter:  `blur(${isDragging ? 8 : 6}px)`,
            opacity: isDragging ? 0.75 : 1,

            // All shadow properties transition together with the same ease
            transition: "width 680ms cubic-bezier(0.22, 1, 0.36, 1), " +
                        "height 680ms cubic-bezier(0.22, 1, 0.36, 1), " +
                        "filter 680ms cubic-bezier(0.22, 1, 0.36, 1), " +
                        "opacity 680ms cubic-bezier(0.22, 1, 0.36, 1), " +
                        "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",

            pointerEvents: "none",
          }}
        />

        {/* ── Pin body ──────────────────────────────────────────────────────
            Two-phase motion:
            LIFT   (dragstart): fast ease-out — snappy upward response.
            LAND   (idle):      slow spring with overshoot — soft, premium bounce.
            IDLE   (rest):      gentle 3.6 s breathing animation.

            transformOrigin "50% 100%" anchors scale from the pin TIP so the
            tip stays pixel-perfect on the map center during the scale pulse.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            // No translateY — keeping the tip pixel-locked on the map center at all
            // times. Scale-only feedback means the pin tip never moves vertically
            // during drag or on release, so the saved coordinate always matches
            // exactly where the user sees the pin tip land.
            transform: isDragging
              ? "scale(1.08)"
              : "scale(1)",

            transition: isDragging
              ? "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)"      // scale up — snappy
              : "transform 400ms cubic-bezier(0.34, 1.20, 0.64, 1)",  // scale back — gentle spring

            animation: isDragging
              ? "none"
              : "vbPinIdle 3.6s ease-in-out infinite",

            transformOrigin: "50% 100%",
            willChange:      "transform",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 42 58"
            width="44"
            height="60"
            aria-hidden="true"
            style={{
              overflow: "visible",
              filter: isDragging
                ? `drop-shadow(0 12px 22px ${cfg.shadowColor}) drop-shadow(0 4px 10px rgba(0,0,0,0.16))`
                : `drop-shadow(0 4px 10px ${cfg.shadowColor})`,
              transition: "filter 220ms ease",
            }}
          >
            <defs>
              {/* Subtle top→bottom gradient for depth */}
              <linearGradient id={`pinGrad-${category}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor={cfg.color} />
                <stop offset="100%" stopColor={cfg.color} stopOpacity="0.87" />
              </linearGradient>

              {/* Glass highlight: upper-left radial sheen */}
              <radialGradient id={`pinSheen-${category}`} cx="30%" cy="22%" r="68%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.32)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
              </radialGradient>
            </defs>

            {/* Main teardrop */}
            <path
              fill={`url(#pinGrad-${category})`}
              d="M21 3 C11 3 4 10 4 20 C4 34 21 53 21 53 C21 53 38 34 38 20 C38 10 31 3 21 3 Z"
            />

            {/* Glass sheen overlay */}
            <path
              fill={`url(#pinSheen-${category})`}
              opacity="0.9"
              d="M21 6 C13 6 8 11 8 18 C8 20 9 22 10 24 C11 16 15 10 24 8 C23 7 22 6 21 6 Z"
            />

            {/* White icon circle */}
            <circle fill="white" cx="21" cy="20" r="8" />

            {/*
              Icon wrapper — centers the 24×24 CategoryNavigator icon paths
              inside the white circle.

              Transform: translate(14.52 13.52) scale(0.54)
                • scale 0.54  → icon visual width ≈ 13 px (tight 1.5 px padding from circle edge)
                • translate   → (21 − 24×0.54/2, 20 − 24×0.54/2) = (14.52, 13.52)

              Stroke and fill inherited here; experience star overrides fill inline.
            */}
            <g
              transform="translate(14.52 13.52) scale(0.54)"
              stroke={cfg.color}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {cfg.renderIcon(cfg.color)}
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}