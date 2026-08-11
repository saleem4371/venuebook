"use client";

import { useEffect, useState, useRef, useMemo, useCallback, cloneElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Map } from "lucide-react";
import { useUI }       from "@/context/UIContext";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_COLORS } from "@/config/categoryConfig";

const CAT_LABEL = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  rentals:     "Rental",
  workspaces:  "Workspace",
  experiences: "Experience",
};

const SCROLL_THRESHOLD = 80;

/*
 * Map FAB sits at this bottom value on ALL sizes where it is visible:
 *   Mobile  (<768px)  : above the footer bar (68px) + 12px gap
 *   Tablet (768–1023px): footer is hidden, so 80px from bottom = comfortable thumb zone
 *   Desktop (1024px+) : lg:hidden — not rendered
 *
 * The Compare button (in FloatingMenu) uses the exact same value so they align.
 */
const FAB_BOTTOM = "calc(68px + env(safe-area-inset-bottom, 0px) + 12px)";

/* ── Bottom nav design tokens ────────────────────────────────────────
 * One unified, full-width bar — five equal-width flex columns (Home,
 * Search, Reels, My Collections, Farmstay/category) so Reels' center
 * is always the bar's mathematical center, no positioning math needed.
 *
 * Light and dark are two DELIBERATELY DIFFERENT glass surfaces, not
 * one value with dark: swapping just the hue. Light is bright/airy
 * (white glass, soft light shadow, a white inset highlight along the
 * top edge). Dark is deep/cinematic (a genuinely dark surface, subtle
 * luminous white-alpha edge instead of a highlight, heavier shadow).
 * Both stay near-opaque (~0.8) rather than "very see-through" — at
 * lower opacity the backdrop dominates instead of the bar's own
 * color, which both wrecks text contrast over busy photos AND makes
 * light/dark mode look like the same bar with a tint, which is
 * exactly the "too similar" problem being fixed here. Dark mode's
 * surface uses `gray`, matching this codebase's actual dark-elevation
 * convention (`dark:bg-gray-950` on the page body, `gray-900`/`800`
 * everywhere else) — the project's real tokens, not the slate/neutral
 * values that would come from copying a generic glass recipe.
 */
// Reverted back to /80 (was briefly /65) — that was applied globally
// when only the landing page needed more transparency, and /80 is the
// level that actually keeps text/icons legible over busy photos in
// general use. Blur stays at 24px.
const BAR_SURFACE =
  "bg-white/80 dark:bg-gray-900/80 backdrop-blur-[24px] backdrop-saturate-[160%] dark:backdrop-saturate-[140%]";

// Landing page only, and only while still over the hero photo (see
// onLandingHero below) — a much more transparent glass than the
// general-purpose BAR_SURFACE above. This is safe to push further
// than the general case because it's only ever over ONE known,
// curated background image (the hero), not arbitrary scrolled
// content, and it's paired with the white icon/label treatment
// that's already active in that same window for contrast. Pushed
// down again from /25 to /12 — still genuinely transparent, not just
// "slightly less opaque."
const LANDING_BAR_SURFACE =
  "bg-white/12 dark:bg-black/15 backdrop-blur-[32px] backdrop-saturate-[180%]";
const BAR_SHADOW =
  // Light: soft light-elevation shadow + a subtle white top highlight
  // (the "glass catching light" cue).
  "shadow-[0_-10px_32px_-8px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] " +
  // Dark: heavier, tighter dark elevation shadow + a faint luminous
  // edge instead of a highlight (a highlight would look like a light-
  // mode bar with dark paint over it; an edge glow reads as "dark
  // glass" instead).
  "dark:shadow-[0_-10px_34px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]";
// Landing-hero variant of the above — no white inset highlight line
// at all (that highlight is what was showing up as an unwanted "top
// white border" over the hero photo). Just a soft shadow for
// separation from the content below the bar.
const LANDING_BAR_SHADOW =
  "shadow-[0_-10px_28px_-8px_rgba(0,0,0,0.25)] dark:shadow-[0_-10px_28px_-8px_rgba(0,0,0,0.45)]";

// Active color: the venuebook.in brand gradient (violet -> blue, the
// same one used on primary CTAs app-wide), used by Home/Search/My
// Collections/Reels — same gradient in both themes, on purpose, so it
// reads as ONE consistent brand identity rather than something that
// changes with theme. The Farmstay/category item is the deliberate
// exception — it always shows its own CATEGORY_COLORS token instead
// (see catColor below), since it represents "which category you're
// browsing," not a fixed destination.
const BRAND_GRADIENT    = "linear-gradient(242deg, #a44bf3, #499ce8)";
const BRAND_GRADIENT_ID = "venuebook-nav-gradient";

// Inactive neutrals are genuinely different values per theme (not the
// same gray reused with an opacity change) — gray-500 reads as a
// clear muted neutral on white; the same gray-500 goes muddy on a
// dark surface, so dark mode steps up to a lighter gray-400.
const INACTIVE_TEXT = "text-gray-500 dark:text-gray-400";
const HOVER_TEXT    = "group-hover:text-gray-700 dark:group-hover:text-gray-200";

// Landing page only (see isHome below): the hero photo behind the bar
// makes the normal gray inactive tokens wash out (same problem as the
// label-legibility issue, same root cause — gray on a variable photo
// backdrop has no reliable contrast). White reads clearly over any
// photo there, same logic as how the FAB/most photo-overlay chrome in
// this app already uses white icons rather than gray ones.
const LANDING_INACTIVE_TEXT = "text-white/80";
const LANDING_HOVER_TEXT    = "group-hover:text-white";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900";

const BAR_HEIGHT = 68; // px — within the 64–70px target range

export default function BottomMenu() {
  const {
    showMap, setShowMap,
    showReels, setShowReels,
    filterOpen, compareOpen,
    hideBottomMenu,
    setCategorySheetOpen,
  } = useUI();
  const { activeCategory, categoryConfig } = useCategory();
  // Farmstay/category item's own color — always shown, not gated by
  // an "active" boolean, since this item represents category identity
  // rather than a single matchable route.
  const catColor = CATEGORY_COLORS[categoryConfig?.color ?? "violet"] ?? CATEGORY_COLORS.violet;

  const [visible,      setVisible]      = useState(true);
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  // Only meaningful on the landing page: whether we've scrolled past
  // the hero photo section, so the white-icon/transparent-bar
  // treatment (needed for contrast over that photo) can switch back
  // to the normal theme-aware look once the hero is off-screen.
  // Measured directly against HeroSection.jsx's root (id="hero-section")
  // via IntersectionObserver below — an earlier version approximated
  // this with `window.innerHeight`, assuming the hero was always
  // exactly one viewport tall, but the hero can render shorter than
  // that in practice, which left the white treatment on well past the
  // point the hero photo had actually scrolled away.
  const [pastHero, setPastHero] = useState(false);
  const lastScroll = useRef(0);
  const pathname   = usePathname();
  const router     = useRouter();

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const locale   = segments[0];
  const country  = segments[1];

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  // 5+ segments = detail page (/locale/country/search/type/id)
  // 4  segments = list page  (/locale/country/search/type) — show nav
  const isDetailPage = segments.length >= 5 && segments[2] === "search";

  const isHome =
    pathname === `/${locale}/${country}` ||
    pathname === `/${locale}/${country}/home`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y <= lastScroll.current || y <= SCROLL_THRESHOLD);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Landing page only: the bar should read "white" only right at the top,
  // while it's genuinely sitting over the hero photo — and flip to the
  // normal dark treatment as soon as the page starts scrolling away from
  // it. An IntersectionObserver keyed to the hero <section>'s real DOM
  // height was tried here first, but that section's height is only a
  // `min-h`, not fixed — on mobile its content (headline + category tabs
  // + search fields) can push its actual rendered height well past one
  // viewport, so the section was still "intersecting" long after the
  // user had scrolled the photo itself out of view, keeping the bar
  // white for most of the page. A small fixed scroll distance is a much
  // more direct match for "only on the hero, then dark on slight scroll."
  const HERO_SCROLL_THRESHOLD = 60;
  useEffect(() => {
    if (!isHome) {
      setPastHero(false);
      return;
    }
    const onHeroScroll = () => setPastHero(window.scrollY > HERO_SCROLL_THRESHOLD);
    onHeroScroll();
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    return () => window.removeEventListener("scroll", onHeroScroll);
  }, [isHome]);

  /* Track mobile breakpoint — scroll-hide only applies below 768px */
  useEffect(() => {
    const check = () => setIsMobileWidth(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const go = useCallback(
    (path) => router.push(`/${locale}/${country}${path}`),
    [router, locale, country]
  );

  if (!locale || !country) return null;

  /*
   * Footer nav: hide when map/filter/compare overlays are open, detail pages, or scroll-down
   * Map FAB   : hide only on filter/compare overlays (NOT on showMap — it's the toggle!)
   *             Always visible on scroll-up; hidden on scroll-down
   */
  /* Footer nav: mobile-only — scroll-hide applies only on mobile (<768px) */
  const showNav = (isMobileWidth ? visible : true) && !hideBottomMenu && !isDetailPage;
  /* Map FAB: scroll-hide applies only on mobile (<768px); tablet always stays visible */
  const showFab = (isMobileWidth ? visible : true) && isSearchPage && !isDetailPage && !filterOpen && !compareOpen;

  const searchRoute = `/search/${categoryConfig?.route ?? "venues"}`;
  const isSearchActive = isSearchPage && !isDetailPage;
  const isCollectionsActive = pathname.includes("/collections");
  // White-icon treatment: only while still over the landing page's
  // hero photo, not for the rest of that page once scrolled past it.
  const onLandingHero = isHome && !pastHero;

  const FADE = {
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0  },
    exit:       { opacity: 0, y: 10 },
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  };

  return (
    <>
      {/*
        Map FAB
        ────────
        Breakpoints  : lg:hidden (hidden at 1024px+, visible on mobile + tablet)
        Visibility   : scroll-aware via showFab; shown even when map view is active
        Position     : bottom-right, mirrors Compare button on bottom-left
        The same FAB_BOTTOM constant is exported-by-convention to FloatingMenu
        so both buttons sit on the exact same horizontal plane.
      */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="map-fab"
            type="button"
            onClick={() => setShowMap((v) => !v)}
            aria-label={showMap ? "Show list view" : "Show map view"}
            aria-pressed={showMap}
            {...FADE}
            whileTap={{ scale: 0.88 }}
            style={{
              position:             "fixed",
              right:                25,
              bottom:               FAB_BOTTOM,
              width:                46,
              height:               46,
              borderRadius:         "50%",
              background:           "rgba(255,255,255,0.97)",
              backdropFilter:       "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border:               "1px solid rgba(0,0,0,0.08)",
              boxShadow:            "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              /* NOTE: no display here — let lg:hidden CSS control display */
              alignItems:           "center",
              justifyContent:       "center",
              cursor:               "pointer",
              zIndex:               42,
            }}
            className="flex lg:hidden dark:!bg-gray-900/97 dark:!border-white/[0.08]"
          >
            <Map className="h-[17px] w-[17px] text-gray-700 dark:text-gray-300" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/*
        Footer navigation bar
        ──────────────────────
        Breakpoints : md:hidden (hidden at 768px+)
        Mobile only — tablet and desktop never render this.

        One unified, glass-surfaced, full-width bar. Reels is a normal
        flex column like the other four (not an absolutely-positioned
        floating circle) — its distinctiveness comes from a slightly
        larger, raised icon tile, not from breaking out of the row.
        That also means it's *always* exactly centered (5 equal
        columns), with no bar-width measurement or custom curve math
        required.
      */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            aria-label="Primary mobile navigation"
            {...FADE}
            className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          >
            {/* Shared gradient def — referenced by active icon strokes via
                stroke="url(#...)" below, since a plain `currentColor` can't
                render a multi-stop gradient on an SVG stroke. Zero-size,
                purely a paint-server, doesn't render anything itself. */}
            <svg width="0" height="0" className="absolute" aria-hidden="true">
              <defs>
                <linearGradient id={BRAND_GRADIENT_ID} x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a44bf3" />
                  <stop offset="100%" stopColor="#499ce8" />
                </linearGradient>
              </defs>
            </svg>

            <div
              className={[
                onLandingHero ? LANDING_BAR_SURFACE : BAR_SURFACE,
                onLandingHero ? LANDING_BAR_SHADOW : BAR_SHADOW,
                "transition-colors duration-300",
              ].join(" ")}
              style={{
                // Small guaranteed minimum (devices with no safe-area
                // inset, e.g. most Android) plus the full inset on
                // devices that have one (iPhone home-indicator area).
                paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)",
              }}
            >
              <ul role="list" className="flex w-full items-stretch px-1" style={{ height: BAR_HEIGHT }}>
                <NavItem icon={<HomeIcon />}   label="Home"           active={isHome}         onLanding={onLandingHero} onClick={() => go("/home")} />
                <NavItem icon={<SearchIcon />} label="Search"         active={isSearchActive} onLanding={onLandingHero} onClick={() => go(searchRoute)} />
                <ReelsNavItem active={showReels} onLanding={onLandingHero} onClick={() => setShowReels(true)} />
                <NavItem icon={<FolderIcon />} label="My Collections" active={isCollectionsActive} onLanding={onLandingHero} onClick={() => go("/collections")} />
                <NavItem
                  icon={<CategoryTabIcon id={activeCategory} />}
                  label={CAT_LABEL[activeCategory] ?? "Categories"}
                  flatColor={catColor}
                  onLanding={onLandingHero}
                  onClick={() => setCategorySheetOpen(true)}
                />
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Shared active-state bits ────────────────────────────────────── */
// A small top-edge indicator bar, independent of color, so the active
// state isn't communicated by color alone (accessibility requirement).
// `colorStyle` lets callers paint it with the brand gradient or a flat
// category color instead of one hardcoded shade.
function ActiveDot({ active, colorStyle }) {
  return (
    <span
      aria-hidden="true"
      style={colorStyle}
      className={[
        "absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-4 rounded-full",
        "transition-all duration-200 ease-out",
        active ? "opacity-100 scale-100" : "opacity-0 scale-50",
      ].join(" ")}
    />
  );
}

/* ── NavItem ─────────────────────────────────────────────────────── */
/*
 * Home, Search, and My Collections: gradient icon stroke + gradient
 * label (bg-clip-text) when active — a plain `currentColor`/text-color
 * class can't paint a multi-stop gradient onto an SVG stroke, so the
 * icon is cloned with `stroke="url(#gradient)"` referencing the
 * shared <linearGradient> def (see BRAND_GRADIENT_ID above), while the
 * label uses the standard bg-clip-text trick. Neutral gray when
 * inactive, plus a top indicator dot (never color alone) and a
 * keyboard focus ring.
 *
 * The Farmstay/category chip passes `flatColor` instead — one of the
 * CATEGORY_COLORS tokens (already theme-aware — each token's `.text`
 * carries its own light/dark Tailwind variants) — and is always shown
 * in that flat color instead of the gradient, regardless of `active`
 * OR `onLanding`, since it's already a vivid, legible color on any
 * backdrop (confirmed live — Venue reads fine violet over the hero
 * photo already). `active` still independently drives aria-current/
 * the dot (both stay off for this item, since it never matches one
 * specific page).
 *
 * `onLanding` (true only on the home/landing page — see isHome in
 * BottomMenu) swaps the inactive gray for white: gray washes out over
 * the landing page's photo hero, same root cause as the earlier
 * label-legibility issue.
 */
function NavItem({ icon, label, onClick, active = false, flatColor, onLanding = false }) {
  const useGradient = active && !flatColor;
  const iconEl = useGradient ? cloneElement(icon, { color: `url(#${BRAND_GRADIENT_ID})` }) : icon;

  const isOn = active || !!flatColor;
  const inactiveClass = onLanding
    ? `${LANDING_INACTIVE_TEXT} ${LANDING_HOVER_TEXT}`
    : `${INACTIVE_TEXT} ${HOVER_TEXT}`;
  const iconColorClass = flatColor ? flatColor.text : isOn ? "" : inactiveClass;
  const labelColorClass = flatColor ? flatColor.text : isOn ? "" : (onLanding ? LANDING_INACTIVE_TEXT : INACTIVE_TEXT);
  const labelStyle = useGradient
    ? { backgroundImage: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : undefined;
  const dotStyle = flatColor ? { backgroundColor: flatColor.accent } : { backgroundImage: BRAND_GRADIENT };

  return (
    <li className="flex-1 min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={[
          "group relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl",
          FOCUS_RING,
        ].join(" ")}
      >
        <ActiveDot active={active} colorStyle={dotStyle} />
        <span
          className={[
            "flex transition-all duration-200 ease-out",
            active ? "-translate-y-0.5" : "",
            iconColorClass,
          ].join(" ")}
        >
          {iconEl}
        </span>
        <span
          style={labelStyle}
          className={[
            "text-[10px] leading-none tracking-tight whitespace-nowrap transition-colors duration-200",
            isOn ? "font-semibold" : "font-medium",
            labelColorClass,
          ].join(" ")}
        >
          {label}
        </span>
      </button>
    </li>
  );
}

/* ── ReelsNavItem ────────────────────────────────────────────────── */
/*
 * Reels is the hero destination, but it stays a normal column in the
 * same 5-item row as everything else — no absolute positioning, no
 * floating circle, no bar-width measurement, no cutout. Its
 * distinctiveness is a slightly larger icon on a raised tile that is
 * itself a small theme-aware glass surface — its own backdrop-blur +
 * border + shadow, "emerging" from the bar's own glass rather than
 * being a flat color pasted on top of it.
 *
 * Because it's the 3rd of 5 equal-width flex children, it is always
 * exactly bar-center — mathematically, not by tuned pixel offsets.
 *
 * Tile is ALWAYS the brand gradient with a white icon — same gradient
 * in both light and dark mode and regardless of active state. It's
 * the one permanently "hero" element in the row, not a state that
 * toggles color on/off; `active` (the Reels overlay being open) only
 * bumps scale/shadow intensity.
 */
function ReelsNavItem({ active, onClick, onLanding = false }) {
  return (
    <li className="flex-1 min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-label="Reels"
        aria-pressed={active}
        className={["group relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl", FOCUS_RING].join(" ")}
      >
        <span
          style={{ background: BRAND_GRADIENT }}
          className={[
            "flex h-11 w-11 -translate-y-2 items-center justify-center rounded-2xl text-white",
            "transition-all duration-[220ms] ease-out",
            active
              ? "scale-[1.04] shadow-[0_8px_20px_-4px_rgba(120,60,220,0.55)]"
              : "shadow-[0_6px_16px_-4px_rgba(120,60,220,0.4)] group-hover:shadow-[0_8px_18px_-4px_rgba(120,60,220,0.48)]",
          ].join(" ")}
        >
          <ReelsIcon size={22} />
        </span>
        <span
          style={
            active
              ? { backgroundImage: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
              : undefined
          }
          className={[
            "text-[10px] leading-none tracking-tight whitespace-nowrap transition-colors duration-200",
            active ? "font-semibold" : `font-medium ${onLanding ? LANDING_INACTIVE_TEXT : INACTIVE_TEXT}`,
          ].join(" ")}
        >
          Reels
        </span>
      </button>
    </li>
  );
}

/* ── CategoryTabIcon ─────────────────────────────────────────────── */
/* Farmstay's icon/path is untouched — same glyph as before. Other
   categories are unchanged too; only the shared `size` default (see
   iconProps below) moved from 21 -> 22 for a marginally larger,
   more confident optical size across the whole row. */
function CategoryTabIcon({ id, size = 22, color }) {
  const norm = id?.toLowerCase().replace(/s$/, "");
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color ?? "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  switch (norm) {
    case "venue":      return <svg {...p}><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>;
    case "farmstay":   return <svg {...p}><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/></svg>;
    case "studio":     return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "rental":     return <svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
    case "workspace":  return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case "experience": return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:           return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
}

/* ── Inline SVG icons ─────────────────────────────────────────────── */
const iconProps = (size = 22, color = "currentColor") => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

function HomeIcon({ size, color }) {
  return <svg {...iconProps(size, color)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function SearchIcon({ size, color }) {
  return <svg {...iconProps(size, color)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
// Matches lucide-react's "Folder" glyph — same icon the /collections page
// itself uses for Collections, replacing the leftover heart from when this
// nav item was "Wishlist".
function FolderIcon({ size, color }) {
  return <svg {...iconProps(size, color)}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>;
}
// Reels' custom glyph — the Instagram-Reels-style mark (rounded square
// + grid lines/corner notches). Kept as-is; only its rendered size
// changes with context (24 default, 22 inside the nav tile).
function ReelsIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="2" y1="17" x2="7" y2="17" />
    </svg>
  );
}
