"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { MapPin, Building2, ChevronRight, Users, UtensilsCrossed, BedDouble, Bath, Star } from "lucide-react";

import Breadcrumb from "../../../components/Breadcrumb";
import Gallery from "../components/listing/Gallery";
import BookingCard from "../components/listing/BookingCard";
import HeroHighlights from "../components/listing/HeroHighlights";
import ExperienceBlock from "../components/listing/ExperienceBlock";
import PremiumCalendar from "../components/listing/PremiumCalendar";
import SocialProofHub from "../components/listing/SocialProofHub";
import NearbyAttractions from "../components/listing/NearbyAttractions";
import AmenitiesGrid from "../components/listing/AmenitiesGrid";
import StayInformation from "../components/listing/StayInformation";
import PhotoTourOverlay from "../components/listing/PhotoTourOverlay";
import { getCategoryColors, normalizeCategory } from "../utils/categoryConfig";

import {
  loadVenues,
} from "@/services/venue_details.service";

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
  const category = params?.type ?? "venues";
  const locale = params?.locale ?? "en";
  const country = params?.country ?? "in";

  const listingId = params?.id ?? null; //ID GET
  
  
  const catKey = normalizeCategory(category);
  const colors = getCategoryColors(category);

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

  
  // Section tab IDs — in render order
  const sections = catKey === "farmstays"
    ? ["photos", "highlights", "calendar", "amenities", "sleeping", "rules", "arrival", "facilities", "reviews", "location"]
    : ["photos", "highlights", "calendar", "amenities", "reviews", "location"];

  const TAB_LABELS = {
    photos:     "Photos",
    highlights: catKey === "venues" ? "Facilities" : "Highlights",
    calendar:   catKey === "venues" ? "Availability" : "Dates",
    amenities:  "Amenities",
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
      // setIsPageLoading(true);
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
        // if (!cancelled) setIsPageLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [listingId]);

  const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

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
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-6 overflow-x-auto text-sm py-3" style={{ scrollbarWidth: "none" }}>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full md:pt-6 lg:pt-6 xl:pt-6">

        {/* ── BREADCRUMB ── */}
        <Breadcrumb
          className="pt-3 pb-1"
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
          <Gallery images={images} openTour={() => setOpenTour(true)}  galleyCategory = { galleyCategory }/>
        </div>

        {/* ── 65 / 35 SPLIT LAYOUT ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 mt-4 md:mt-6">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="min-w-0 space-y-0">

            {/* Title block — two-column from md: left=info, right=parent identity */}
            <div className="pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              {/* ── LEFT: core property info ── */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
                  {/* {catKey === "venues" ? "Monappa Heritage Convention Hall" : "Riverside Farmstay — Deenapani Estate"} */}
                  {venueData.child_venue_name}
                  
                </h1>

                {/* Category-specific attribute row */}
                <PropertyMeta category={category} venueData = {venueData} />

                {/* Location */}
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin size={13} className={`${colors.accent} flex-none`} strokeWidth={2} />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {/* {catKey === "venues" ? "Kadri, Mangalore, Karnataka, India" : "Kaikamba, Mangalore, Karnataka, India"}
                     */}

                     {venueData.venue_address}   {venueData.venue_state}  {venueData.venue_pincode}
                  </span> 
                </div>

                {/* Starting price — below location, both categories */}
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {/* {catKey === "venues" ? ( */}
                    <>Starting from{" "}<span className="font-semibold text-gray-900 dark:text-white"> { venueData.minPrice} </span></>
                  {/* ) : (
                    <>Starting from{" "}<span className="font-semibold text-gray-900 dark:text-white">₹19,181</span>
                    <span className="text-gray-400 dark:text-gray-500"> / night</span></>
                  )} */}
                </p>

                {/* Rating + reviews */}
                <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                     {venueData.rating}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <button
                    onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-500 dark:text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                     {venueData.user_ratings_total} reviews 
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Parent Property Identity Block ── */}
              <Link
                href={`/${locale}/${country}/venue/${venueData.parent_venue_id}?from=${catKey}`}
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
    M
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

            {/* Description */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-6 sm:leading-7">
              {/* {catKey === "venues"
                ? "A heritage convention hall nestled in the heart of Mangalore. With colonial-era architecture, modern AV infrastructure, and an experienced catering team, this venue has hosted over 2,000 events ranging from intimate corporate dinners to grand weddings of 1,000+ guests."
                : "A beautifully maintained estate nestled in the hills of Deenapani. Wake up to sunrise views, sip fresh coffee from the plantation, and unwind by the pool. Perfect for families, friends, and couples looking for a quiet, nature-immersive escape just hours from the city."
              } */}
              { venueData.more_info}
            </div>

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
          <div className="hidden lg:block">
            {/* top = measured header height + 44px section nav + 12px breathing room */}
            <div className="sticky" style={{ top: `${headerH + 44 + 12}px` }}>
              <BookingCard
                venueData={venueData}
                category={category}
                propertyName={venueData.child_venue_name}
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
            </div>
          </div>

        </div>

        {/* ════════════ FULL-WIDTH SECTIONS (below 65/35 grid) ════════════ */}

        {/* Stay Information — farmstay only; between calendar/amenities and reviews */}
        <StayInformation category={category} />

        {/* Reviews — full width, above map */}
        <div id="reviews" className="mt-8">
          <SocialProofHub category={category} venueData={venueData}/>
        </div>

        {/* Nearby */}
        <NearbyAttractions category={category} />

        {/* Map */}
        <div id="location" className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-2 mb-12">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Location</h2>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={14} className={`${colors.accent} flex-none`} strokeWidth={2} />
              <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                {/* {catKey === "venues" ? "Kadri, Mangalore, Karnataka, India" : "Kaikamba, Mangalore, Karnataka, India"}
                 */}
                 {venueData.venue_address}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 ml-[22px]">
              {/* Exact address shared after booking confirmation. */}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-full h-[200px] sm:h-[280px] md:h-[380px]">
              <iframe
                src={`https://maps.google.com/maps?q=${venueData.venue_city}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
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

      {/* Photo tour overlay */}
      <AnimatePresence>
        {openTour && (
          <PhotoTourOverlay key="photo-tour" images={images} category={category} onClose={() => setOpenTour(false)}  galleyCategory = { galleyCategory }/>
        )}
      </AnimatePresence>
    </div>
  );
}
