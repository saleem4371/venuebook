"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * AdCarousel
 * ─────────────────────────────────────────────────────────────
 * Replaces the old "Featured Host" card. A full-width promo
 * carousel — Luxury Collections, Featured Estates, seasonal offers.
 *
 * Motion: a real `transform: translateX()` track (hardware
 * accelerated, no opacity fade). Infinite loop via cloned slides at
 * both edges — when the track lands on a clone, the transition is
 * switched off for one frame and the index snaps to the matching
 * real slide, which is visually identical, so the loop reads as
 * seamless instead of blinking.
 *
 * Autoplay progress is driven by requestAnimationFrame rather than
 * setInterval, so pausing on hover/touch genuinely freezes progress
 * instead of losing/restarting it, and the same clock feeds the
 * animated progress dots.
 */

const DEFAULT_SLIDES = [
  {
    badgeLabel: "Premium Collection",
    baseColor: "#1e1033",
    accentColor: "#a855f7",
    headline: "Handpicked Luxury Venues, Curated for You",
    description: "Five-star ballrooms, heritage palaces & rooftop estates — reserved for the occasions that matter most.",
    cta: "View Collection",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "Limited Offer",
    baseColor: "#33121d",
    accentColor: "#fb7185",
    offerTag: "20% OFF",
    headline: "Wedding Season Offers Are Live",
    description: "Lock in your date this season and save on venue hire, catering add-ons and decor packages.",
    cta: "Explore Now",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "Featured Estates",
    baseColor: "#2a1c05",
    accentColor: "#f59e0b",
    headline: "Featured Estates Now Open for Booking",
    description: "Sprawling lawns, private pools and heritage architecture — our most-loved estates this month.",
    cta: "Book Today",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "Limited Offer",
    baseColor: "#0d2318",
    accentColor: "#34d399",
    offerTag: "Weekend Deal",
    headline: "Farmstay Weekend Deals",
    description: "Escape the city — nature stays and farm retreats at special weekend-only rates.",
    cta: "Explore Now",
    image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "For Business",
    baseColor: "#0c1a2e",
    accentColor: "#60a5fa",
    headline: "Corporate Booking Offers",
    description: "Flexible packages for offsites, conferences and team events — billed the way your finance team likes it.",
    cta: "View Collection",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "Early Bird",
    baseColor: "#131f10",
    accentColor: "#84cc16",
    offerTag: "Book Early & Save",
    headline: "Early Bird Discounts on 2027 Dates",
    description: "Plan ahead and save — the earlier you book, the more you keep.",
    cta: "Explore Now",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80&fit=crop",
  },
  {
    badgeLabel: "Festival Offer",
    baseColor: "#2e1607",
    accentColor: "#fb923c",
    headline: "Festival Season Offers Are Live",
    description: "Celebrate in style — special festival-week pricing across our top-rated venues.",
    cta: "Book Today",
    image: "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=1600&q=80&fit=crop",
  },
];

const AUTOPLAY_MS = 6000;
const TRANSITION = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";

export default function AdCarousel({ slides = DEFAULT_SLIDES }) {
  const count = slides.length;
  // Clone the last slide before the first, and the first after the last,
  // so stepping past either edge lands on a visual duplicate — that's
  // what makes the wraparound snap invisible.
  const extended = count > 1 ? [slides[count - 1], ...slides, slides[0]] : slides;

  const [realIndex, setRealIndex] = useState(count > 1 ? 1 : 0);
  const [transitionOn, setTransitionOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef(null);
  const rafRef = useRef(null);
  const clockStartRef = useRef(null);
  const elapsedRef = useRef(0);

  /* Guards against the bug where spamming an arrow made the whole
     carousel go blank: a CSS transition that gets interrupted by a new
     transform value never fires `transitionend` for the interrupted
     run, and `transitionend` is the only place `realIndex` gets clamped
     back onto a real slide when it lands on a clone. Without that
     clamp, each extra click nudged `realIndex` one further past the
     cloned array — eventually `translateX` pointed past the last
     slide entirely and the track rendered nothing. `isAnimatingRef`
     blocks new navigation while a transition is genuinely in flight,
     so it always runs to completion and always fires its event. The
     timeout is a defensive fallback only, in case some edge case (e.g.
     the tab losing focus mid-transition) ever eats the event. */
  const isAnimatingRef = useRef(false);
  const animationSafetyRef = useRef(null);

  const normalizedIndex = count > 1 ? (realIndex - 1 + count) % count : 0;

  /* Belt-and-suspenders: even with the click-lock above, `safeIndex` makes
     sure the track's transform can never point past its own children — if
     `realIndex` were ever somehow left out of [0, extended.length-1] by an
     edge case the lock doesn't anticipate, the previous bug was that the
     whole track just translated itself out of the clipped viewport and the
     carousel went blank (arrows/dots still rendered fine since they're
     absolutely positioned against the *outer* box, not the track — that's
     why only the slide content vanished). Wrapping the value used for the
     actual transform guarantees a valid slide is always on screen. */
  const safeIndex = ((realIndex % extended.length) + extended.length) % extended.length;

  const goToReal = useCallback((i) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    clearTimeout(animationSafetyRef.current);
    animationSafetyRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
    }, 700);
    setTransitionOn(true);
    setRealIndex(i);
  }, []);

  useEffect(() => () => clearTimeout(animationSafetyRef.current), []);

  const next = useCallback(() => goToReal(realIndex + 1), [goToReal, realIndex]);
  const prev = useCallback(() => goToReal(realIndex - 1), [goToReal, realIndex]);
  const goToDot = useCallback((i) => goToReal(i + 1), [goToReal]);

  /* Snap invisibly off the clone once the slide transition finishes.
     onTransitionEnd bubbles from ANY descendant's own CSS transition
     (the CTA button, the arrows, etc. all use transition-all) — guard
     to only the track's own transform, or hovering a button mid-slide
     would falsely trigger a clone-snap. */
  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    clearTimeout(animationSafetyRef.current);
    isAnimatingRef.current = false;
    if (realIndex === extended.length - 1) {
      setTransitionOn(false);
      setRealIndex(1);
    } else if (realIndex === 0) {
      setTransitionOn(false);
      setRealIndex(extended.length - 2);
    }
  };
  useEffect(() => {
    if (!transitionOn) {
      // Re-enable the transition on the next frame, after the snap above
      // has already painted without one.
      const id = requestAnimationFrame(() => setTransitionOn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [transitionOn]);

  /* rAF-driven autoplay clock — doubles as the progress-dot fill, and
     genuinely freezes (rather than resets) while paused. */
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
  }, [normalizedIndex]);

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    clockStartRef.current = performance.now() - elapsedRef.current;
    const tick = (now) => {
      const elapsed = now - clockStartRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        next();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, count, normalizedIndex]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (startX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    const THRESHOLD = 40;
    if (delta <= -THRESHOLD) next();
    else if (delta >= THRESHOLD) prev();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  if (!count) return null;

  return (
    <div
      className="relative mb-8 rounded-3xl overflow-hidden select-none h-[210px] sm:h-[260px] md:h-[300px] outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Track — real translateX, hardware accelerated, no opacity fade */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${safeIndex * 100}%)`,
          transition: transitionOn ? TRANSITION : "none",
          willChange: "transform",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extended.map((slide, i) => (
          <Slide key={i} slide={slide} />
        ))}
      </div>

      {/* Manual arrows — clear of the text thanks to the content's own left
          padding. Only render from md up, but still scale a step further
          at lg to match the slide getting taller (260 → 300px). */}
      {count > 1 && (
        <div className="hidden md:block">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 start-3 z-30 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 end-3 z-30 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
        </div>
      )}

      {/* Pagination — each dot fills as the autoplay clock runs */}
      {count > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 inset-x-0 z-30 flex items-center justify-center gap-1 sm:gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToDot(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative h-1 sm:h-1.5 w-4 sm:w-5 md:w-6 rounded-full bg-white/30 overflow-hidden"
            >
              {i === normalizedIndex && (
                <span
                  className="absolute inset-y-0 start-0 bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
              {i < normalizedIndex && <span className="absolute inset-0 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── One slide — themed colour wash + photo + floating accent blob ── */
function Slide({ slide }) {
  return (
    <div className="relative w-full h-full shrink-0" style={{ flex: "0 0 100%" }}>
      <img
        src={slide.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Themed scrim — solid on the left for text contrast, fading away
          by ~60% so the photo on the right reads clearly. Colour comes
          from the slide itself, not a flat black wash, so each offer
          keeps its own identity. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${slide.baseColor} 0%, ${slide.baseColor}e6 38%, ${slide.baseColor}66 60%, transparent 85%)`,
        }}
      />

      {/* Subtle floating decorative graphic — scales down on small screens
          instead of one fixed 192px blob overpowering a 210px-tall slide */}
      <div
        className="absolute -top-8 sm:-top-10 md:-top-12 end-[8%] w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: slide.accentColor }}
      />

      {/* Optional offer tag, over the image side */}
      {slide.offerTag && (
        <span
          className="absolute top-3 end-3 sm:top-4 sm:end-4 md:end-8 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white shadow-sm backdrop-blur-sm"
          style={{ background: `${slide.accentColor}cc` }}
        >
          {slide.offerTag}
        </span>
      )}

      {/* Content — normal card padding on mobile/tablet, where there are no
          arrows to clear (arrows are `hidden md:block` below); only widens
          to 96px/64px at md+ once the arrows actually exist. Every element
          below now steps up across the same breakpoints instead of one
          fixed size, so it scales with the slide's own height (210 → 260 →
          300px). */}
      <div className="relative z-10 h-full flex flex-col justify-center gap-1.5 sm:gap-2 ps-5 sm:ps-6 md:ps-24 pe-5 sm:pe-6 md:pe-16 max-w-xl">
        <span
          className="inline-block w-fit text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full"
          style={{ background: `${slide.accentColor}33`, color: "#fff", border: `1px solid ${slide.accentColor}66` }}
        >
          {slide.badgeLabel}
        </span>
        <h3 className="text-white font-bold text-base sm:text-xl md:text-2xl lg:text-[28px] leading-snug">
          {slide.headline}
        </h3>
        {/* Was `hidden` below sm — that made it vanish entirely on mobile
            instead of just shrinking. Now it always renders, just smaller,
            and clamps to 2 lines so it can't blow out the 210px mobile
            slide height. */}
        <p className="block text-white/70 text-[10px] sm:text-xs md:text-sm max-w-md line-clamp-2">
          {slide.description}
        </p>
        <button
          type="button"
          className="mt-1 w-fit px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg md:rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-sm hover:bg-white/25 active:scale-95 transition-all whitespace-nowrap"
        >
          {slide.cta}
        </button>
      </div>
    </div>
  );
}
