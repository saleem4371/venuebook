"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Building2, ChevronRight, Users, UtensilsCrossed, BedDouble, Bath, Star, Heart, Bookmark, Share2, Flag } from "lucide-react";

import Breadcrumb from "../../../components/Breadcrumb";
import Gallery from "../components/listing/Gallery";
import BookingCard from "../components/listing/BookingCard";
import HeroHighlights from "../components/listing/HeroHighlights";
import ExperienceBlock from "../components/listing/ExperienceBlock";
import PremiumCalendar from "../components/listing/PremiumCalendar";
import SocialProofHub from "../components/listing/SocialProofHub";
import NearbyAttractions from "../components/listing/NearbyAttractions";
import AmenitiesGrid from "../components/listing/AmenitiesGrid";
import StayInformation, { FarmstayQuickFacts } from "../components/listing/StayInformation";
import ApproximateLocationMap from "../components/listing/ApproximateLocationMap";
import PropertyDetailSkeleton from "../components/listing/PropertyDetailSkeleton";
import PhotoTourOverlay from "../components/listing/PhotoTourOverlay";
import WishlistPopup from "../components/WishlistPopup";
import ReportListingModal from "../components/ReportListingModal";
import { getCategoryColors, normalizeCategory } from "../utils/categoryConfig";

import { useAuth } from "@/context/AuthContext";
import { useUI }  from "@/context/UIContext";
import {
  loadVenues,
} from "@/services/venue_details.service";
import {
  likedProperty,
  addLikedProperty,
  UserWishlist,
  UserWishlistCategory,
} from "@/services/venues.service";

// ─── Category-specific property meta ─────────────────────────────────────────
function PropertyMeta({ category , venueData }) {
  const key = normalizeCategory(category);

  const dot = <span className="text-gray-300 dark:text-gray-700 select-none">·</span>;

  if (key === "venues") {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
        <span className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
          {venueData.guest_rooms} Guests
        </span>
        {dot}
        { venueData.venue_mode !=='venue' &&(
 <span className="flex items-center gap-1.5">
          <UtensilsCrossed size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
          In-house Catering
        </span>
        )}

       

      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
      <span className="flex items-center gap-1.5">
        <BedDouble size={12} strokeWidth={1.6} className="text-gray-400 flex-none" />
        {venueData.banquet_round} bedrooms
      </span>
      {dot}
      <span>{venueData.cocktail_round} beds</span>
      {dot}
      <span className="flex items-center gap-1.5">
        <Bath size={13} strokeWidth={1.6} className="text-gray-400 flex-none" />
        3 bathrooms
      </span>
      {dot}
      <span>Up to  {venueData.guest_rooms} guests</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
// Demo estate this listing belongs to — see the estate public page's own
// data file (app/[locale]/[country]/venue/[parentId]/data/estateData.js)
// for why this is a hardcoded id rather than a live parentId: every public
// page in this app (this one included) is still demo-data-only, no
// backend endpoint exists yet to resolve a listing's real parent estate.
const DEMO_PARENT_ID = "monappa-estates";
const PARENT_ESTATE_NAME = "Monappa Estates";


export default function ListingPage() {
  const params = useParams();
  const { format } = useCurrency();
  const category = params?.type ?? "venues";
  const locale = params?.locale ?? "en";
  const country = params?.country ?? "in";

  const listingId = params?.id ?? null; //ID GET
  
  
  const catKey = normalizeCategory(category);
  const colors = getCategoryColors(category);

  const { user }          = useAuth();
  const { setLoginOpen }  = useUI();

  // ── Like / Save / Share state ────────────────────────────────────────────
  const [isLiked,        setIsLiked]        = useState(false);
  const [likeCount,      setLikeCount]      = useState(0);
  const [likeLoading,    setLikeLoading]    = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [reportOpen,     setReportOpen]     = useState(false);
  const [aboutOpen,      setAboutOpen]      = useState(false);
  const [isClamped,      setIsClamped]      = useState(false);
  const descRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // ── Sticky nav CTA — IntersectionObserver on the booking card CTA sentinel ───
  const bookingCardRef   = useRef(null); // right-column wrapper — scroll target only
  const ctaSentinelRef   = useRef(null); // inside card, after CTA buttons — observer target
  const [cardVisible,    setCardVisible]    = useState(true); // true = CTA in view → hide nav CTA
  const [navCTAInfo,     setNavCTAInfo]     = useState({      // set by BookingCard via onCTAChange
    badge: null,
    price: 0,
    priceLabel: "Starting price",
    actions: [],  // [{ key, label, variant, onClick }] — mirrors booking card exactly
  });
  const [wishlist,       setWishlist]       = useState([]);
  const [wishvenue,      setWishvenue]      = useState([]);

  const [openTour, setOpenTour] = useState(false);
  const [active, setActive] = useState("photos");
  const [showTabs, setShowTabs] = useState(false);

  // ── Actual header height (measured at runtime, updated on resize) ──────────
  // Avoids hardcoding an offset that drifts across screen sizes / content changes.
  const [headerH, setHeaderH] = useState(57);
  // Ref keeps the scroll handler up-to-date without re-adding the listener.
  const scrollOffsetRef = useRef(57 + 44 + 8); // header + section-nav + gap
  // Keep a ref to sections so the scroll handler always reads the latest array
  // (avoids stale-closure issues when sections changes based on catKey)
  const sectionsRef = useRef([]);
  const [calendarRange, setCalendarRange] = useState({ start: null, end: null });
  const [venueSelection, setVenueSelection] = useState({ date: null, shift: null, shiftLabel: null, shiftTime: null , shiftAmount: null });
  const [calendarResetKey,    setCalendarResetKey]    = useState(0);
  const [calendarResetShiftKey, setCalendarResetShiftKey] = useState(0);
  const [calendarResetEndKey,  setCalendarResetEndKey]  = useState(0);
  
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [images,  SetImages]  = useState([]);
  const [galleyCategory,  SetGalleryCategory]  = useState([]);
  const [venueData,  SetVenueData]  = useState({});
  const [venueshifts,  SetVenueshifts]  = useState([]);
  const [bookingData,  SetBookingData]  = useState([]);
  const [bookingFull,  SetBookingFull]  = useState([]);
  const [bookingParial,  SetBookingParial]  = useState([]);
  const [amenities,  SetAmenities]  = useState([]); 
  const [amenitiesgroup,  SetAmenitiesgroup]  = useState([]); 
  const [venueEvents,  SetVenueEvents]  = useState([]); 
  const [venueSettings,  SetvenueSettings]  = useState([]); 

  const propertyName = catKey === "venues"
    ? "Monappa Heritage Convention Hall"
    : catKey === "farmstays"
    ? "Deenapani Valley Farmstay"
    : undefined;

  // Event Date X — clears date + shift
  const clearVenueSelection = () => {
    setVenueSelection({ date: null, shift: null, shiftLabel: null, shiftTime: null });
    setCalendarResetKey((k) => k + 1);
  };
  // Time Slot X — clears shift only, keeps date
  const clearShift = () => {
    setVenueSelection((prev) => ({ ...prev, shift: null, shiftLabel: null, shiftTime: null }));
    setCalendarResetShiftKey((k) => k + 1);
  };
  // Check-in X — clears both dates
  const clearCalendarRange = () => {
    setCalendarRange({ start: null, end: null });
    setCalendarResetKey((k) => k + 1);
  };
  // Checkout X — clears end only, keeps start
  const clearCheckout = () => {
    setCalendarRange((prev) => ({ ...prev, end: null }));
    setCalendarResetEndKey((k) => k + 1);
  };

  
  // Section tab IDs — must match DOM render order exactly
  // Venue: ExperienceBlock (events) renders before AmenitiesGrid (amenities)
  const venueBaseSections = ["photos", "highlights", "calendar"];
  if (venueEvents?.length) venueBaseSections.push("events");
  venueBaseSections.push("amenities", "reviews", "location");

  // Farmstay: EstateFacilitiesSection (id="facilities") was removed from StayInformation —
  // keep the tab array in sync so the scroll detection doesn't break
  const sections = catKey === "farmstays"
    ? ["photos", "highlights", "calendar", "amenities", "sleeping", "rules", "arrival", "reviews", "location"]
    : venueBaseSections;

  const TAB_LABELS = {
    photos:     "Photos",
    highlights: catKey === "venues" ? "Facilities" : "Highlights",
    calendar:   catKey === "venues" ? "Availability" : "Dates",
    amenities:  "Amenities",
    events:     "Events",
    sleeping:   "Rooms",
    rules:      "Rules",
    arrival:    "Arrival",
    facilities: "Facilities",
    reviews:    "Reviews",
    location:   "Location",
  };

  // Sync ref on every render so the scroll handler always sees the current list
  sectionsRef.current = sections;

  // ── Measure actual header height; update offset ref whenever it changes ─────
  useEffect(() => {
    const NAV_H = 44; // section-nav inner height (py-3 × 2 + text ≈ 44px)
    const GAP   = 8;  // breathing room so headings aren't flush with the nav
    const measure = () => {
      const hdr = document.querySelector("header");
      if (!hdr) return;
      const h = hdr.offsetHeight;
      setHeaderH(h);
      scrollOffsetRef.current = h + NAV_H + GAP;
    };
    measure();
    const ro = new ResizeObserver(measure);
    const hdr = document.querySelector("header");
    if (hdr) ro.observe(hdr);
    return () => ro.disconnect();
  }, []);

  // ── Tab scroll arrow visibility ──────────────────────────────────────────────
  const updateTabArrows = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    updateTabArrows();
    el.addEventListener("scroll", updateTabArrows, { passive: true });
    const ro2 = new ResizeObserver(updateTabArrows);
    ro2.observe(el);
    return () => { el.removeEventListener("scroll", updateTabArrows); ro2.disconnect(); };
  }, [updateTabArrows, sections]);

  // ── Observe the CTA sentinel inside the booking card ────────────────────────
  // The sentinel sits right after the CTA buttons (placed by VenueCard/ReserveCard).
  // rootMargin crops the top of the viewport by the sticky nav height so the
  // observer fires the INSTANT the CTA scrolls behind the nav — not when it
  // reaches the raw viewport edge.
  // Effect re-runs when headerH changes so rootMargin stays accurate.
  // Only active on lg+ (sentinel is inside the `hidden lg:block` right column).
  useEffect(() => {
    const el = ctaSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setCardVisible(entry.isIntersecting),
      {
        threshold: 0,
        rootMargin: `-${headerH + 44}px 0px 0px 0px`,
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [headerH]); // recreate whenever the sticky nav height changes

  // ── Venue: smooth-scroll to shift panel after a date is picked ──────────────
  // Fires only on null→date transition (not on shift changes) so it doesn't
  // fight the user once they've already found the panel.
  const venueDateStr = venueSelection?.date?.toISOString().split("T")[0] ?? null;
  useEffect(() => {
    if (!venueDateStr || venueSelection?.shiftLabel) return; // no date, or shift already done
    const t = setTimeout(() => {
      const el = document.getElementById("shift-panel");
      if (!el) return;
      const hdr = document.querySelector("header");
      const nav = document.getElementById("section-nav");
      const OFFSET = (hdr?.offsetHeight ?? 57) + (nav?.offsetHeight ?? 44) + 8;
      const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }, 200); // brief delay lets the shift panel animate in first
    return () => clearTimeout(t);
  }, [venueDateStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll: show/hide tabs + track active section ─────────────────────────
  // Both scrollOffsetRef and sectionsRef are used so the handler never closes
  // over stale values — safe to keep deps array empty.
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setShowTabs(scrollY > 150);

      const offset = scrollOffsetRef.current;
      const list   = sectionsRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const el = document.getElementById(list[i]);
        if (el && el.getBoundingClientRect().top <= offset + 20) {
          setActive(list[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;

    const load = async () => {
      setIsPageLoading(true);
      try {
        const [res] = await Promise.all([
            loadVenues(listingId),
          // getGalleryCategory(listingId),
        ]);
        if (cancelled) return;
        if (res?.data) SetImages(res.data.gallery);
        if (res?.data) SetGalleryCategory(res.data.category);
        if (res?.data) SetVenueData(res.data.venues);
        if (res?.data) SetVenueshifts(res.data.shifts);
        if (res?.data) SetBookingData(res.data.SHIFT_STATUS);
        if (res?.data) SetBookingFull(res.data.fullyBookedDates); 
        if (res?.data) SetBookingParial(res.data.partiallyBookedDates);

        if (res?.data) SetAmenities(res.data.Amenities);
        if (res?.data) SetAmenitiesgroup(res.data.Amenitiesgroup);

        if (res?.data) SetVenueEvents(res.data.events);
        if (res?.data) SetvenueSettings(res.data.venue_settings);
        // if (resCt?.data) setCategory(resCt.data);
      } catch (err) {
        if (!cancelled) console.error("Listing load error:", err);
      } finally {
        if (!cancelled) setIsPageLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [listingId]);

  // ── Check if description text is actually clamped (overflows 4 lines) ──
  useEffect(() => {
    if (!descRef.current || !venueData.more_info) return;
    // rAF ensures the browser has painted the clamped layout before we measure
    const raf = requestAnimationFrame(() => {
      const el = descRef.current;
      if (el) setIsClamped(el.scrollHeight > el.clientHeight + 2);
    });
    return () => cancelAnimationFrame(raf);
  }, [venueData.more_info]);

  // ── Seed like count from venueData when it loads ────────────────────────
  useEffect(() => {
    const count = venueData?.likes_count ?? venueData?.total_likes ?? venueData?.likes ?? 0;
    setLikeCount(Number(count) || 0);
  }, [venueData?.likes_count, venueData?.total_likes, venueData?.likes]);

  // ── Load liked status for this property ─────────────────────────────────
  useEffect(() => {
    if (!user || !listingId) return;
    likedProperty()
      .then(res => {
        const liked = res?.data ?? [];
        setIsLiked(liked.some(item => String(item.venue_id) === String(listingId)));
      })
      .catch(() => {});
  }, [user, listingId]);

  // ── Load wishlist + collections for Save to Collection ───────────────────
  useEffect(() => {
    if (!user) return;
    Promise.all([UserWishlistCategory(), UserWishlist()])
      .then(([wCat, wList]) => {
        setWishvenue(wCat?.data ?? []);
        setWishlist(wList?.data ?? []);
      })
      .catch(() => {});
  }, [user]);

  // ── Like toggle ──────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!user) { setLoginOpen(true); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await addLikedProperty({ venue_id: listingId });
      setIsLiked(v => {
        setLikeCount(c => v ? Math.max(0, c - 1) : c + 1);
        return !v;
      });
    } catch (err) { console.error(err); }
    finally { setLikeLoading(false); }
  }, [user, listingId, likeLoading, setLoginOpen]);

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url   = typeof window !== "undefined" ? window.location.href : "";
    const title = venueData.child_venue_name || "VenueBook Property";
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }, [venueData.child_venue_name]);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

  // ── Nav CTA click — scrolls to the booking card so the user can act ──────────
  // Single source of truth: label + badge come from BookingCard via onCTAChange.
  // We never derive them here. Just scroll to the card.
  // Fallback for null-onClick actions (e.g. "Check Availability" — scrolls to card)
  const handleScrollToCard = () => {
    if (bookingCardRef.current) {
      const top = bookingCardRef.current.getBoundingClientRect().top + window.scrollY - scrollOffsetRef.current;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // ── Full-page skeleton — shown until the API call resolves ─────────────────
  if (isPageLoading || !venueData?.child_venue_name) {
    return <PropertyDetailSkeleton catKey={catKey} />;
  }

  return (
    <div className="flex flex-col relative bg-white dark:bg-gray-950 min-h-screen">

      {/*
        ── STICKY SECTION TABS ────────────────────────────────────────────────
        Z-INDEX LAYER REFERENCE (do not use arbitrary values elsewhere):
          z-[201]  Modal panels   (EnquiryModal, AmenitiesGrid)
          z-[200]  Modal backdrops
          z-[190]  Fullscreen overlays (PhotoTourOverlay)
          z-[150]  Global header  (fixed)
          z-[101]  Mobile booking sheet panel
          z-[100]  Mobile booking sheet backdrop
          z-[40]   Mobile bottom booking bar
          z-[30]   Sticky section navigation  ← this element
          z-auto   Page content
        ──────────────────────────────────────────────────────────────────────
        top is set from the measured header height so the nav always sits flush
        below the header regardless of viewport / content changes.
      */}
      <div
        id="section-nav"
        style={{ top: `${headerH}px` }}
        className={`sticky z-[30] border-b transition-all duration-300 ${
          showTabs
            ? "opacity-100 pointer-events-auto bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-gray-100 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            : "opacity-0 pointer-events-none bg-white dark:bg-gray-950 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-2">

          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => tabsScrollRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
              className="flex-none w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Scroll tabs left"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}

          {/* Scrollable tabs with fade masks */}
          <div className="relative flex-1 min-w-0">
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/90 dark:from-gray-950/90 to-transparent pointer-events-none z-10" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/90 dark:from-gray-950/90 to-transparent pointer-events-none z-10" />
            )}
            <div
              ref={tabsScrollRef}
              className="flex gap-6 overflow-x-auto text-sm py-3"
              style={{ scrollbarWidth: "none" }}
            >
              {sections.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActive(tab);
                    const el = document.getElementById(tab);
                    if (!el) return;
                    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffsetRef.current;
                    window.scrollTo({ top, behavior: "smooth" });
                  }}
                  className={`pb-1 whitespace-nowrap transition-colors duration-150 focus:outline-none flex-none ${
                    active === tab
                      ? `font-semibold ${colors.tabTextActive} border-b-2 ${colors.tabBorderColor}`
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => tabsScrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
              className="flex-none w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Scroll tabs right"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}

          {/* ── Sticky nav CTA group ──────────────────────────────────────────────
               Mirrors the EXACT same actions as the booking card — same labels,
               same handlers, same variants. BookingCard is the sole source of
               truth via onCTAChange; nothing is hardcoded here.
               Desktop only (lg+). Animates in/out when the booking card's CTA
               sentinel crosses behind the sticky nav. */}
          <AnimatePresence>
            {!cardVisible && navCTAInfo.actions.length > 0 && (
              <motion.div
                key="nav-booking-cta"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="hidden lg:flex items-center gap-2.5 flex-none"
              >
                {/* Left: price — mirrors whatever the booking card currently shows */}
                {navCTAInfo.price > 0 && (
                  <div className="text-right leading-none">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{format(navCTAInfo.price)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{navCTAInfo.priceLabel}</p>
                  </div>
                )}

                {/* Availability badge */}
                {navCTAInfo.badge && (
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-none ${navCTAInfo.badge.bg}`}>
                    {navCTAInfo.badge.label}
                  </span>
                )}

                {/* Action buttons — same group as the booking card, compact nav styling */}
                <div className="flex items-center gap-1.5">
                  {navCTAInfo.actions.map((action) => {
                    const base = "flex-none text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-opacity hover:opacity-90 active:scale-[0.97]";
                    let cls;
                    switch (action.variant) {
                      case "primary":   cls = `${base} bg-gradient-to-r ${colors.gradient} text-white shadow-sm`; break;
                      case "secondary": cls = `${base} ${colors.pill}`; break;
                      case "ghost":     cls = `${base} border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300`; break;
                      default:          cls = `${base} ${colors.selBg} text-white`;
                    }
                    return (
                      <button
                        key={action.key}
                        onClick={action.onClick ?? handleScrollToCard}
                        className={cls}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full md:pt-6 lg:pt-6 xl:pt-6">

        {/* ── BREADCRUMB — hidden on mobile, visible md+ ── */}
        <Breadcrumb
          className="hidden md:flex pt-3 pb-1"
          items={[
            { label: "Home", href: `/${locale}/${country}/home` },
            { label: catKey === "venues" ? "Venues" : "Farmstays", href: `/${locale}/${country}/search/${category}` },
            { label: venueData.venue_name, href: `/${locale}/${country}/venue/${venueData.venue_name}?from=${catKey}` },
            { label:  venueData.child_venue_name },
          ]}
        />

        {/* ── GALLERY ── */}
        {/* On mobile: pad by the measured header height so gallery starts flush below it.
            On md+: Tailwind md:pt-4 is overridden by inline style (57px ≈ pt-4 difference is fine). */}
        <div
          id="photos"
          className="pb-2"
          style={{ paddingTop: "14px" }}
        >
          <Gallery
            images={images}
            openTour={() => setOpenTour(true)}
            galleyCategory={galleyCategory}
            overlay={
              /* Like · Save · Share — dark glassmorphism pills */
              <div className="flex items-center gap-2.5">

                {/* ── Like ── */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className="flex items-center justify-center gap-1.5 h-11 min-w-[44px] sm:h-9 sm:min-w-0 px-3 sm:px-3 rounded-full text-[12px] font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 select-none"
                  style={{
                    background: "rgba(8,8,8,0.50)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart
                    size={14}
                    strokeWidth={2}
                    className={`flex-none transition-all duration-300 ${
                      isLiked ? "fill-rose-400 text-rose-400 scale-110" : "text-white/85"
                    }`}
                  />
                  <span className={`hidden sm:inline transition-colors duration-200 ${isLiked ? "text-rose-400" : "text-white/85"}`}>
                    {likeCount > 0 ? likeCount : isLiked ? "Liked" : "Like"}
                  </span>
                </button>

                {/* ── Save ── */}
                <button
                  onClick={() => setCollectionOpen(true)}
                  className="flex items-center justify-center gap-1.5 h-11 min-w-[44px] sm:h-9 sm:min-w-0 px-3 sm:px-3 rounded-full text-[12px] font-semibold text-white/85 transition-all duration-200 active:scale-95 select-none"
                  style={{
                    background: "rgba(8,8,8,0.50)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                  aria-label="Save to collection"
                >
                  <Bookmark size={14} strokeWidth={2} className="text-white/85 flex-none" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                {/* ── Share ── */}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 h-11 min-w-[44px] sm:h-9 sm:min-w-0 px-3 sm:px-3 rounded-full text-[12px] font-semibold text-white/85 transition-all duration-200 active:scale-95 select-none"
                  style={{
                    background: "rgba(8,8,8,0.50)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                  aria-label="Share property"
                >
                  <Share2 size={14} strokeWidth={2} className="text-white/85 flex-none" />
                  <span className="hidden sm:inline">Share</span>
                </button>

              </div>
            }
          />
        </div>

        {/* ── 65 / 35 SPLIT LAYOUT ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 mt-4">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="min-w-0 space-y-0">

            {/* Title block — two-column from md: left=info, right=parent identity */}
            <div className="pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              {/* ── LEFT: core property info ── */}
              <div className="flex-1 min-w-0">

                <h1 className="text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
                  {venueData.child_venue_name}
                </h1>
                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold tracking-wide mt-1.5 ${colors.pill}`}>
                  {venueData.venue_type || venueData.venueType || venueData.subcategory || venueData.propertyType || venueData.property_type
                    || (catKey === "farmstays" ? "Luxury Resort" : "Banquet Hall")}
                </span>

                {/* Category-specific attribute row */}
                <PropertyMeta category={category} venueData = {venueData} />

                {/* Location — farmstays show approximate area only, never the exact address */}
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin size={13} className={`${colors.accent} flex-none`} strokeWidth={2} />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {catKey === "farmstays"
                      ? (() => {
                          const area = venueData.venue_area || venueData.venue_locality;
                          return area
                            ? `Near ${area}, ${venueData.venue_city || venueData.venue_state || ""}`
                            : `Near ${[venueData.venue_city, venueData.venue_state].filter(Boolean).join(", ")}`;
                        })()
                      : `${venueData.venue_address}   ${venueData.venue_state}  ${venueData.venue_pincode}`
                    }
                  </span>
                </div>

                {/* Starting price — below location, both categories */}
                {(() => {
                  const paxSettings = venueSettings
                    .filter(item => item.group === "pax")
                    .reduce((acc, item) => { acc[item.key] = item.value; return acc; }, {});
                  const packAmt = Number(paxSettings.pack_amt) || 0;
                  return (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Starting from{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">{format(venueData.minPrice)}</span>
                        {catKey === "farmstays" && (
                          <span className="font-normal text-gray-400 dark:text-gray-500"> / night</span>
                        )}
                      </p>
                      {packAmt > 0 && (
                        <>
                          <span className="text-gray-300 dark:text-gray-700 select-none">·</span>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Starting Package{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">{format(packAmt)}</span>
                          </p>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Rating + reviews */}
                {venueData.rating > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 flex-none" aria-hidden>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">Based on Google Reviews</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                      <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        {venueData.rating}
                      </span>
                      <span className="w-px h-3.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                      <button
                        onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                        className="text-gray-500 dark:text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        {venueData.user_ratings_total} reviews
                      </button>
                    </div>
                  </div>
                )}


              </div>

              {/* ── RIGHT: Parent Property Identity Block ── */}
              <Link
                href={`/${locale}/${country}/venue/${venueData.parent_venue_id}?from=${catKey}&id=${venueData.created_by}`}
                className="flex-none flex items-center md:flex-col md:items-center gap-3 md:gap-3 px-5 py-4 md:px-4 md:py-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 w-full md:w-52 lg:w-48 xl:w-52 group"
              >
                {/* Logo */}
{venueData?.logo ? (
  <img
    src={`${BASE_URL}/${venueData.logo}`}
    alt={venueData.venue_name || "Venue Logo"}
    className="w-12 h-12 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl object-cover flex-none shadow-sm"
  />
) : (
  <div
    className={`w-12 h-12 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl ${colors.iconBg} flex items-center justify-center text-white text-xl font-bold flex-none shadow-sm`}
  >
    {(venueData.venue_name?.[0] ?? "V").toUpperCase()}
  </div>
)}
               
                <div className="min-w-0 md:text-center md:w-full">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 font-medium">
                    Part of
                  </p>
                  <p className="font-semibold text-[11px] sm:text-xs md:text-sm text-gray-900 dark:text-white leading-snug">
                    {venueData.venue_name}
                  </p>
                  <p className={`text-[11px] sm:text-xs mt-2 flex items-center md:justify-center gap-0.5 font-medium ${colors.accent} group-hover:gap-1.5 transition-all`}>
                    View Parent Property <ChevronRight size={11} />
                  </p>
                </div>
              </Link>

            </div>

            {/* Signature Highlights */}
            <HeroHighlights category={category} />

            {/* Property at a glance — desktop only; mobile version renders inside Stay Information */}
            {catKey === "farmstays" && (
              <div className="hidden md:block">
                <FarmstayQuickFacts />
              </div>
            )}

            {/* Calendar — moved directly after highlights */}
            <div id="calendar" className="border-t border-gray-100 dark:border-gray-800 py-4">
              <PremiumCalendar
                venueshifts={venueshifts}
                bookingData={bookingData} 
                bookingFull={bookingFull}
                bookingParial={bookingParial}
                category={category}
                isMember={true}
                onSelectionChange={setVenueSelection}
                onRangeChange={setCalendarRange}
                resetKey={calendarResetKey}
                resetShiftKey={calendarResetShiftKey}
                resetEndKey={calendarResetEndKey}
              />
            </div>

            {/* ── About this Venue / Farmstay ── */}
            {venueData.more_info && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {catKey === "farmstays" ? "About this Farmstay" : "About this Venue"}
                </h2>

                {/* Truncated preview — 4 lines */}
                <p
                  ref={descRef}
                  className="text-sm text-gray-600 dark:text-gray-300 leading-6 sm:leading-7 line-clamp-4"
                >
                  {venueData.more_info}
                </p>

                {/* Read more — only when text actually overflows 4 lines */}
                {isClamped && (
                  <button
                    onClick={() => setAboutOpen(true)}
                    className="mt-3 flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Read more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-px">
                      <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Host — moved below description */}
            {/* <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center text-white font-bold text-lg flex-none`}>
                G
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Hosted by {venueData.conatct_person}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Superhost · 4 years · 98% response rate</p>
              </div>
            </div> */}

            {/* Experience / Event block */}
            <ExperienceBlock category={category}  venueEvents = {venueEvents }/>

            {/* Amenities — premium icon grid */}
            <AmenitiesGrid category={category} amenities={amenities} amenitiesgroup={amenitiesgroup} />

          </div>

          {/* ════════════ RIGHT COLUMN ════════════ */}
          {/* bookingCardRef is observed by IntersectionObserver to control nav CTA */}
          <div ref={bookingCardRef} className="hidden lg:block">
            {/* top = measured header height + 44px section nav + 12px breathing room */}
            <div className="sticky" style={{ top: `${headerH + 44 + 12}px` }}>
              <BookingCard
                venueData={venueData}
                category={category}
                propertyName={venueData.child_venue_name}
                coverImage={images?.[0] ?? ""}
                capacity={venueData.guest_rooms}
                calendarRange={calendarRange}
                venueSelection={venueSelection}
                venueEvents={venueEvents}
                onClearVenueSelection={clearVenueSelection}
                onClearShift={clearShift}
                onClearCalendarRange={clearCalendarRange}
                onClearCheckout={clearCheckout}
                shiftAmount={venueSelection.shiftAmount}
                venue_settings={venueSettings}
                ctaSentinelRef={ctaSentinelRef}
                onCTAChange={setNavCTAInfo}
              />

              {/* Report this listing — below the card, Airbnb-style */}
              <div className="mt-5 pb-6 flex justify-center">
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <Flag size={12} strokeWidth={1.8} />
                  <span className="underline underline-offset-2">Report this listing</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* ════════════ FULL-WIDTH SECTIONS (below 65/35 grid) ════════════ */}

        {/* Stay Information — farmstay only; between calendar/amenities and reviews */}
        <StayInformation category={category} onViewAlbum={() => setOpenTour(true)} />

        {/* Reviews — full width, above map */}
        <SocialProofHub category={category} venueData={venueData}/>

        {/* Nearby — venues only */}
        {catKey !== "farmstays" && <NearbyAttractions category={category} />}

        {/* Map */}
        <div id="location" className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6 mt-2 mb-12">
          {(() => {
            // "approximate" → farmstays (JS API map: Circle + custom marker anchored to coords)
            // "exact"       → all others (iframe with red pin)
            // Add future categories here without touching any other code.
            const LOCATION_PRIVACY = { farmstays: "approximate" };
            const locationPrivacy  = LOCATION_PRIVACY[catKey] ?? "exact";
            const isApproximate    = locationPrivacy === "approximate";

            const rawLat    = parseFloat(venueData.lat  || venueData.latitude)  || 0;
            const rawLng    = parseFloat(venueData.lng  || venueData.longitude) || 0;
            const hasCoords = rawLat !== 0 && rawLng !== 0;

            // Exact mode only — build the iframe URL
            const exactSrc = hasCoords
              ? `https://maps.google.com/maps?q=${rawLat},${rawLng}&z=16&output=embed`
              : `https://maps.google.com/maps?q=${encodeURIComponent(
                  [(venueData.venue_address || ""), (venueData.venue_city || "")].filter(Boolean).join(" ")
                )}&z=15&output=embed`;

            // Address label for approximate mode
            const area        = venueData.venue_area || venueData.venue_locality;
            const approxLabel = area
              ? `Near ${area}, ${venueData.venue_city || venueData.venue_state || ""}`
              : `Near ${[venueData.venue_city, venueData.venue_state].filter(Boolean).join(", ")}`;

            return (
              <>
                {/* ── Header ────────────────────────────────────────────── */}
                <div className="mb-5">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Location</h2>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin size={14} className={`${colors.accent} flex-none mt-0.5`} strokeWidth={2} />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                        {isApproximate ? approxLabel : venueData.venue_address}
                      </p>
                      {isApproximate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Exact address shared after booking confirmation.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Map ───────────────────────────────────────────────── */}
                {isApproximate ? (
                  /*
                    Google Maps JS API — Circle and marker are real map overlays.
                    They stay anchored to their coordinates as the user zooms and pans.
                    No CSS overlay. No iframe. The exact property location is never exposed.
                  */
                  <div className="w-full h-[280px] md:h-[420px]">
                    <ApproximateLocationMap
                      rawLat={rawLat}
                      rawLng={rawLng}
                      listingId={listingId}
                    />
                  </div>
                ) : (
                  /* Standard iframe for exact listings */
                  <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-full h-[200px] sm:h-[280px] md:h-[380px]">
                      <iframe
                        src={exactSrc}
                        className="w-full h-full border-0 block"
                        loading="lazy"
                        title="Property location"
                      />
                    </div>
                  </div>
                )}

                {/* ── Privacy notice (approximate only) ─────────────────── */}
                {isApproximate && (
                  <div className="mt-4 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-none mt-0.5 shrink-0 bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Approximate location</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        For the privacy of our host, the exact location will be shared after your booking is confirmed or your enquiry is accepted.
                      </p>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

      </div>

      {/* Mobile bottom bar */}
      {/*
        Mobile bottom bar — receives the exact same calendar state as the
        desktop card so there is a single source of truth for dates, range,
        nights, and pricing across both layouts.
      */}
      <BookingCard
        venueData={venueData}
        category={category}
        mobileOnly
        propertyName={venueData.child_venue_name}
        coverImage={images?.[0] ?? ""}
        capacity={venueData.guest_rooms}
        calendarRange={calendarRange}
        venueSelection={venueSelection}
        venueEvents={venueEvents}
        onClearVenueSelection={clearVenueSelection}
        onClearShift={clearShift}
        onClearCalendarRange={clearCalendarRange}
        onClearCheckout={clearCheckout}
        shiftAmount={venueSelection.shiftAmount}
        venue_settings={venueSettings}
      />

      {/* About this Venue/Farmstay — full text modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAboutOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl z-10 max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-none">
              <button
                onClick={() => setAboutOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-6 py-6 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-5">
                {catKey === "farmstays" ? "About this Farmstay" : "About this Venue"}
              </h2>
              <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-7 whitespace-pre-line">
                {venueData.more_info}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Report listing modal */}
      <ReportListingModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        venueName={venueData.child_venue_name}
      />

      {/* Save to Collection modal */}
      <WishlistPopup
        wishvenue={wishvenue}
        wishlist={wishlist}
        venue={{ ...venueData, childVenueId: listingId }}
        open={collectionOpen}
        user={user}
        onClose={() => setCollectionOpen(false)}
      />

      {/* Photo tour overlay */}
      <AnimatePresence>
        {openTour && (
          <PhotoTourOverlay key="photo-tour" images={images} category={category} onClose={() => setOpenTour(false)}  galleyCategory = { galleyCategory }/>
        )}
      </AnimatePresence>
    </div>
  );
}
