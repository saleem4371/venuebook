"use client";

/**
 * SearchSelectField
 * ──────────────────
 * Single-select chip field for search-bar facets that aren't a location,
 * date, or guest count (e.g. farmstay "Occasion" / "Vibe"). Mirrors
 * GuestPicker's trigger+popup chrome on desktop so it sits visually
 * consistent inside ListingsSearchBar / HeroSection, and renders as a
 * flat chip row (like MobileSearchSheet's other inline fields) when
 * `inline` is set.
 */

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

/* ── One option CARD — a real photo-card, not a pill/chip. The pill
   version (icon + tiny avatar + text on a flat bg) kept getting flagged
   as generic/mismatched no matter how it was recolored — the actual fix
   was to stop asking a text pill to also carry a 36px photo and instead
   let the photo be the card: full-bleed image, dark gradient scrim, label
   sitting on top in white. That also sidesteps the light/dark popup
   mismatch entirely (white-on-photo-gradient reads fine on either panel
   theme), and gives farmstays a picker that actually looks like it
   belongs to a farmstay-photos product instead of a generic filter list.
   Split out from the inline .map() below because the photo needs its OWN
   `imgError` state: `opt.image` is hotlinked from a third party (see
   OCCASION_OPTIONS/VIBE_OPTIONS in searchFieldsConfig.js) and can fail
   independently per card — onError falls back to a tinted icon tile
   instead of leaving a broken-image glyph. */
function OptionCard({ opt, active, tint, onClick }) {
  const [imgError, setImgError] = useState(false);
  const Icon = opt.icon;
  const showImage = opt.image && !imgError;
  const tintHex = tint?.hex ?? "#7c3aed";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full aspect-[4/3] rounded-2xl overflow-hidden text-start select-none",
        "transition-all duration-200 ring-1",
        active ? "ring-2" : "ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/25",
      ].join(" ")}
      style={active ? { boxShadow: `0 0 0 2px ${tintHex}, 0 8px 20px ${tintHex}40` } : undefined}
    >
      {showImage ? (
        <img
          src={opt.image}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        // No photo (missing or failed to load) — a solid tinted tile, not
        // just a low-alpha wash. `${tintHex}22` (13% opacity) over nothing
        // let whatever sat behind the card (the near-black popup panel)
        // bleed through almost entirely, so a failed photo looked like a
        // near-black void instead of an intentional fallback tile.
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "#1c1c22", backgroundImage: `linear-gradient(135deg, ${tintHex}40, ${tintHex}12)` }}
        >
          {Icon && <Icon className="w-7 h-7" style={{ color: tintHex }} aria-hidden="true" />}
        </div>
      )}

      {/* Scrim, bottom-only — was a full-card gradient (black/85 at the
         bottom fading to black/15 at the TOP, i.e. still 15% dark even at
         the top), which was heavy enough that a naturally darker photo
         (night shot, shadowed scene — LoremFlickr's pick is out of our
         control) read as almost entirely black/hidden. This version is
         fully transparent above the halfway mark — the top half of every
         photo is never darkened at all — and only ramps to black in the
         bottom half, exactly where the label needs the contrast. Written
         as a raw CSS gradient (not Tailwind's from-/via-/to- stop-position
         utilities) so exact stop positions don't depend on the installed
         Tailwind version supporting them. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0) 100%)" }}
      />

      {/* Icon badge, top start — kept even with a photo present, same
         reasoning as before: the icon is a quick-scan category cue that
         shouldn't disappear just because a photo loaded. */}
      {Icon && showImage && (
        <span
          className="absolute top-2 start-2 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ background: `${tintHex}cc` }}
        >
          <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </span>
      )}

      {/* Selected checkmark, top end */}
      {active && (
        <span
          className="absolute top-2 end-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ background: tintHex }}
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      )}

      <span className="absolute bottom-2 start-2.5 end-2.5 text-white text-[13px] font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {opt.label}
      </span>
    </button>
  );
}

export default function SearchSelectField({
  options = [],           // [{ id, label }]
  value,                  // selected option id, or "" / null
  onChange,
  tint,
  label,                  // popup header text
  placeholder,
  textClass,
  placeholderClass,
  chevronClass,
  lightMode = false,
  /** When true, renders the chip list directly (no trigger/popup). Used in MobileSearchSheet. */
  inline = false,
  /** Fires once, only on a real open→close transition (not on mount, not
   *  on opening) — lets the search-bar field wrapper collapse itself back
   *  to its display pill the moment this popup closes, however it closes
   *  (pick a value, click outside, Escape). */
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const wasOpenRef = useRef(open);
  useEffect(() => {
    if (wasOpenRef.current && !open) onOpenChange?.(false);
    wasOpenRef.current = open;
  }, [open, onOpenChange]);

  // "click", not "mousedown" — this closes on the SAME click that might
  // also be aimed at another field's pill. With "mousedown", this fired
  // (and closed this popup) before the browser's "click" was dispatched;
  // closing collapses this field and — since that can flip the whole bar
  // between the active-grows and equal-width layouts — reflows every
  // column's position between mousedown and mouseup, so the click could
  // land somewhere other than the pill the user actually aimed at (hence
  // "clicking another section only closes this one, need to click again").
  // "click" fires later in the same bubble sequence than the target pill's
  // own onClick (React's synthetic dispatch happens before a native
  // document listener sees it), so the target field activates FIRST, in
  // the same gesture, and this effect's cur===field.id guard (see
  // onDeactivate in ListingsSearchBar/HeroSection) makes closing afterward
  // a safe no-op instead of clobbering the newly-active field.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  /* Escape closes the popup, same as clicking outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* Keep the popup on-screen — same fix as DatePicker.jsx's popupDropdown
     (see the comment there for the full rationale). This popup also
     always renders anchored to insetInlineStart: 0 with no awareness of
     where its field sits in the viewport, and the photo-card grid is wide
     enough (360-440px) to run off the right edge once the field isn't
     near the left of the bar — which Occasion/Vibe/Dates/Who all aren't,
     by definition, since they sit to the right of Where. Measures the
     rendered popup and nudges it back on-screen with a horizontal shift
     applied as Framer's `x`, composed with the existing y/scale animation. */
  const popupRef = useRef(null);
  const [shiftX, setShiftX] = useState(0);
  useLayoutEffect(() => {
    if (!open) { setShiftX(0); return; }
    const margin = 16;
    const measure = () => {
      const el = popupRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const overflowRight = rect.right - (window.innerWidth - margin);
      const overflowLeft = margin - rect.left;
      if (overflowRight > 0) setShiftX((prev) => prev - overflowRight);
      else if (overflowLeft > 0) setShiftX((prev) => prev + overflowLeft);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  const selected = options.find((o) => o.id === value) || null;

  const pick = (id) => {
    const next = value === id ? "" : id; // click again to clear
    onChange?.(next);
    if (!inline) setOpen(false);
  };

  const grid = (
    // Fixed 2-column grid, not flex-wrap — flex-wrap let each card size to
    // its own label, so a long one (e.g. "Special Occasion") would bump
    // itself to a new row alone, leaving a ragged, uneven-looking list.
    // Every card is w-full now and just fills its grid cell instead.
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <OptionCard
          key={opt.id}
          opt={opt}
          active={value === opt.id}
          tint={tint}
          onClick={() => pick(opt.id)}
        />
      ))}
    </div>
  );

  const optionGrid = (scrollable) =>
    // Photo cards are much taller than the old text pills, so with 6
    // Occasion options the popup was growing past the viewport. Capped to
    // a scrollable pane here (popup mode only — `scrollable` is false for
    // `inline`, since that's already inside MobileSearchSheet's own
    // scrolling sheet, and a scroll-inside-a-scroll there would just trap
    // the gesture).
    //
    // `overflow-y-auto` on a container clips ANY box-shadow/ring that
    // bleeds past ITS edges, not just the grid's own content — the
    // selected card's ring/glow (rendered as an outer box-shadow, so it
    // extends past the card's own box) was getting cut off wherever a
    // card sat flush against the scroll container's edge, which for the
    // first row/column was immediately, since the grid had no padding to
    // give the glow room to render before hitting the clip boundary.
    // z-index wouldn't fix this — it only reorders siblings within a
    // stacking context, it doesn't affect clipping — so the real fix is
    // padding: `p-2` inside the clipped scroll area gives every ring/glow
    // breathing room, and `-m-2` on the OUTER wrapper pulls the whole
    // thing back so the added padding doesn't visually shift the grid or
    // eat into the popup's own edge spacing.
    scrollable ? (
      // Fully explicit per-side values (not `-m-2` + a second class
      // overriding just one side) — mixing a shorthand utility with a
      // single-side override for the SAME property depends on which one
      // Tailwind happens to generate later in its stylesheet, which isn't
      // something to rely on. End side gets an extra 4px beyond the other
      // three (12px vs 8px) to also reserve the scrollbar's own gutter, so
      // it doesn't sit flush against — or overlap — the last column's ring.
      <div className="max-h-[280px] overflow-y-auto -mt-2 -mb-2 -ms-2 -me-3">
        <div className="pt-2 pb-2 ps-2 pe-3">{grid}</div>
      </div>
    ) : (
      grid
    );

  if (inline) {
    return <div className="pt-1">{optionGrid(false)}</div>;
  }

  return (
    // No `relative` here — same convention DatePicker/GuestPicker already
    // follow (see the comment in DatePicker.jsx's splitLabels branch): the
    // absolute dropdown below anchors to the FIELD's own positioned
    // wrapper, not a second nested positioning context here. Adding
    // `relative` on this div was what made the "Feel"/Vibe dropdown drift
    // to the wrong spot once it wasn't the first field in the bar.
    <div ref={ref} className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-transparent text-sm outline-none text-start"
      >
        <span className={`truncate flex-1 ${selected ? (textClass ?? "text-white") : (placeholderClass ?? "text-white/40")}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${chevronClass ?? "text-white/50"}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 8, scale: 0.97, x: shiftX }}
            animate={{ opacity: 1, y: 0, scale: 1, x: shiftX }}
            exit={{ opacity: 0, y: 6, scale: 0.97, x: shiftX }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={lightMode ? { insetInlineStart: 0 } : {
              background: "rgba(10,10,16,0.97)",
              border: `1px solid ${tint?.activeBorder ?? tint?.border ?? "rgba(255,255,255,0.15)"}`,
              boxShadow: `0 24px 48px rgba(0,0,0,0.5), ${tint?.activeGlow ?? tint?.glow ?? "0 0 20px rgba(0,0,0,0.2)"}`,
              insetInlineStart: 0,
            }}
            className={[
              // Widened again (was 280/360, then 300/380, then 320/400) —
              // real photo cards at aspect-[4/3] need real width to read
              // as photos rather than thumbnails; 360/440 gives each of
              // the 2 columns roughly 165-200px, wide enough that a label
              // like "Heritage & Traditional" sits comfortably over the
              // photo instead of crowding it.
              "absolute top-full mt-1.5 min-w-[360px] max-w-[440px] z-[9999] rounded-2xl px-4 pt-3 pb-4",
              lightMode
                ? "bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)] backdrop-blur-md"
                : "backdrop-blur-2xl",
            ].join(" ")}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest pb-2 mb-2 border-b ${
              lightMode ? "text-gray-400 dark:text-white/35 border-gray-100 dark:border-white/[0.07]" : "text-white/35 border-white/[0.07]"
            }`}>
              {label}
            </p>
            {optionGrid(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
