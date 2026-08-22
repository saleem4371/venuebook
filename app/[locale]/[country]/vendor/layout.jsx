"use client";
import { useState, useEffect, useRef } from "react";

import { usePathname, useParams, useRouter } from "next/navigation";
import { motion }                from "framer-motion";
import Navbar                    from "./components/Navbar";
import VendorSidebar             from "./components/VendorSidebar";
import BottomDock                from "./components/BottomNav";
import MessageFAB                from "./components/MessageFAB";
import ScrollToTop               from "./components/ScrollToTop";
import { VendorUIProvider }      from "@/context/VendorUIContext";
import { VendorCategoryProvider, useVendorCategory } from "@/context/VendorCategoryContext";
import VendorCategoryNavigator   from "./components/VendorCategoryNavigator";
import KycReminderCard           from "./components/KycReminderCard";
import CategoryTransitionOverlay from "./components/CategoryTransitionOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PropertyTypeModalProvider, usePropertyTypeModal } from "@/context/PropertyTypeModalContext";
import PropertyTypeModal from "./listing/components/PropertyTypeModal";

import { vendor_category } from "@/services/home.service";
import { listing_sub_check } from "@/services/listing.service";

import { SocketProvider } from "@/context/SocketContext";


// ─────────────────────────────────────────────────────────────────────────────
// VENDOR ENABLED CATEGORIES
// Replace with API/session data once auth is wired.
// ─────────────────────────────────────────────────────────────────────────────
const VENDOR_CATEGORIES = ["venues", "farmstays", "studios"];

/* ─────────────────────────────────────────────────────────────────────────────
   VendorAuthGuard  (Rules 6, 7 & 8)
   Renders inside AuthProvider so useAuth() is available.
   - Not logged in                        → redirect to home
   - Logged in, listing created, no sub   → redirect to payment (Scenario 8)
   - Logged in, is_vendor = 0, no pending → redirect to list-your-property
   All vendor pages are protected by this single guard.
───────────────────────────────────────────────────────────────────────────── */
function VendorAuthGuard({ children }) {
  const { isLoggedIn, isListed, loading ,user } = useAuth();
  const router  = useRouter();
  const params  = useParams();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";


    const [bIllId, setBIllId] = useState('');
    // localStorage isn't available during SSR — reading it at render time
    // (rather than inside useEffect) crashed with "localStorage is not
    // defined" on the server. Read it client-side only, into state.
    const [pendingCat, setPendingCat] = useState(null);

      useEffect(() => {
        const cat = localStorage.getItem("vb_pending_category");
        setPendingCat(cat);

        const load = async () => {
          try {
            const bills = await listing_sub_check(cat);
            setBIllId(bills?.data);
          } catch (err) {
            console.error("bills load error:", err);
          }
        };
        load();
      }, []);


  useEffect(() => {
    if (loading) return; // auth still resolving
    if (!isLoggedIn) {
      router.replace(`/${locale}/${country}/home`);
      return;
    }
    // Check pending subscription FIRST — is_vendor can be set to 1 at listing
    // creation time on some flows, so we cannot rely on !isListed to gate this.
    // vb_pending_category is set by WizardShell after listing_create and removed
    // by subscription-success once payment is confirmed.
    try {
    //   const pendingCat = localStorage.getItem("vb_pending_category");
    //   if (pendingCat) {
    //     router.replace(`/${locale}/${country}/start-listing/${pendingCat}/payment`);
    //     return;
    //   }
    // } catch (_) {}

     if (bIllId && user.subscribe_status==0) {
        dest = `/${locale}/${country}/start-listing/${pendingCat}/payment`;
      }
      } catch (_) {}

    // if (!isListed) {
    //   router.replace(`/${locale}/${country}/list`);
    // }
  }, [loading, isLoggedIn, isListed, locale, country, router]);

  if (loading) return null;
  if (!isLoggedIn) return null;

  return children;
}

/* ── Animation config ─────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1];

const shrinkVariants = {
  idle: {
    scale:   1,
    opacity: 1,
    filter:  "blur(0px)",
    transition: { duration: 0.44, ease: EASE_OUT },
  },
  shrinking: {
    scale:   0.982,        /* very gentle recede — cinematic, not dramatic    */
    opacity: 0.65,
    filter:  "blur(3px)",  /* page contextually blurs; overlay does the rest  */
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
  loading: {
    scale:   0.982,
    opacity: 0.65,
    filter:  "blur(3px)",
    transition: { duration: 0.01 }, /* hold frozen until idle */
  },
};

/**
 * PageMainWrapper
 * ───────────────
 * Inner component (lives inside VendorCategoryProvider) that reads
 * the transition phase and applies the scale-down / blur effect to
 * the main content area while the overlay is active.
 *
 * Header clearance (mt) and sidebar clearance (ms) are NOT this
 * component's job for normal routes — AdminLayout wraps this element
 * and KycReminderCard together in one shared outer box that carries
 * that margin ONCE (see AdminLayout below). That's what makes the KYC
 * card's disappear-when-verified behavior free: the outer margin is
 * static and unconditional, so nothing needs to coordinate with
 * whether the card is currently rendering anything. This component
 * only ever owns its own padding.
 *
 * The listing editor branch (isListingEditor) is the one exception —
 * it renders standalone, with no shared outer box and no
 * KycReminderCard. Within that branch, isVenueEditor further
 * distinguishes the true per-venue editor (no global Navbar, so zero
 * header-clearance margin — it owns the full viewport) from its
 * sibling parent_details page (Navbar still shown, so it keeps the
 * standard clearance).
 */
function PageMainWrapper({ isListingEditor, isVenueEditor, isFullBleedPage, isFullBleedPage1, isMessagesPage, children }) {
  const { phase } = useVendorCategory();
  const isFullBleed = isFullBleedPage || isFullBleedPage1;

  return (
    <motion.main
      variants={shrinkVariants}
      animate={phase}
      initial="idle"
      className={[
        /* pb-24 clears BottomNav (fixed, md:hidden — mobile only). Desktop
           uses VendorSidebar instead, so that 96px has nothing to clear
           there; left unconditional it was pure dead padding at the
           bottom of every desktop page, letting short pages (e.g. one
           listing card) scroll a few px with nothing new to reveal. */
        isFullBleed
          ? ""
          : "px-4 sm:px-5 md:px-6 lg:px-8 pb-24 md:pb-8 space-y-6",
        /* Header clearance: the venue editor has no global Navbar to
           clear — zero margin, it owns the full viewport. Its sibling
           parent_details still shows the Navbar, so it keeps the usual
           clearance. Every other route gets this from AdminLayout's
           shared outer box instead. */
        isListingEditor ? (isVenueEditor ? "" : "mt-[64px] md:mt-[72px]") : "",
        /* Breathing room — one consistent value at every breakpoint. This
           used to be pt-[56px] md:pt-[24px] (more padding on mobile than
           desktop, backwards for "breathing room"); checked whether that
           56px on mobile was reserved clearance for VendorCategoryNavigator's
           floating FAB — it isn't, that FAB is bottom-anchored (`bottom:`
           inline style), not top, so there was no real dependency, just an
           unexplained asymmetry that made the gap below the KYC row read
           differently page to page. The listing editor and full-bleed
           routes (package/teams/addons/messages) render nothing here since
           they manage their own top spacing. */
        isListingEditor || isFullBleed ? "" : "pt-4",
        /* Messages only: AdminLayout's outer box is a fixed-height flex
           column for this route (see layout.jsx comment), so this fills
           whatever's left after the KYC row. The page underneath gives
           itself its own explicit h-[calc(100dvh-Npx)] (same value this
           box's own pt- reserves) instead of trusting h-full/flex-1 to
           propagate through this container — so this container's own
           sizing model doesn't actually matter to it anymore.
           (Settings briefly used this same branch too — reverted: it put
           KycReminderCard, whose sticky-while-the-page-scrolls design
           assumes normal scroll, inside a non-scrolling shell for the
           first time ever. That combination broke rendering.) */
        isMessagesPage ? "flex-1 min-h-0 flex flex-col" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transformOrigin: "center top" }}
    >

  {children}

    </motion.main>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VENDOR LAYOUT
══════════════════════════════════════════════════════════════════════ */
/* Renders the modal at layout level — outside PageMainWrapper's transforms */
function PropertyModalRenderer() {
  const { state, closePropertyModal } = usePropertyTypeModal();
  return (
    <PropertyTypeModal
      open={state.open}
      onClose={closePropertyModal}
      onContinue={(type) => {
        closePropertyModal();
        state.onContinue?.(type);
      }}
      accentFrom={state.accentFrom}
      accentTo={state.accentTo}
      category={state.category}
    />
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const isListingEditor  = /\/vendor\/listing\/.+/.test(pathname);
  /* Narrower than isListingEditor: matches the actual per-venue editor
     (/vendor/listing/<id>[...]) but NOT /vendor/listing/parent_details,
     which is a sibling full-immersion page that still shows the global
     Navbar. Only this flag hides the Navbar / removes its header-
     clearance margin — isListingEditor keeps its existing (broader)
     meaning for sidebar / bottom-dock / category-navigator hiding,
     which parent_details also relies on unchanged. */
  const isVenueEditor    = /\/vendor\/listing\/(?!parent_details(?:\/|$))[^/]+/.test(pathname);
  const isFullBleedPage  = /\/vendor\/package/.test(pathname);
  const isFullBleedPage1 = /\/vendor\/teams|\/vendor\/addons/.test(pathname);
  /* Messages page owns its own padding/layout for the split-pane viewport fill */
  const isMessagesPage   = /\/vendor\/messages/.test(pathname);

   const { user } = useAuth();

  const loadCategory = async () => {
    try {
      const addons = await vendor_category();
      setVendorCategorie(addons?.data);

    } catch (err) {
      console.error("Addons load error:", err);
    }
  };


  const [vendorCategorie, setVendorCategorie] = useState([]);

  useEffect(() => {
    loadCategory();
  }, []);

  if (vendorCategorie === null) {
    return null; // or loading spinner
  }

  /* flow-root below — establishes a new block-formatting context so the
     first in-flow child's mt-[64px]/mt-[72px] (navbar clearance, set below
     on AdminLayout's shared content box) can't margin-collapse through this
     wrapper. Without it, that top margin escapes and pushes this whole div
     down past the viewport instead of being consumed inside it —
     min-h-screen still renders 100vh tall, so the page ends up
     100vh + 64/72px total, letting every route scroll that extra sliver
     even when its own content doesn't need to. (Navbar/VendorSidebar are
     position:fixed, so they're not in normal flow and don't trigger this
     themselves — the content box below them is the first in-flow child.)
     flow-root has no clipping side effects, unlike overflow-hidden. */
  return (
    <div className="min-h-screen flow-root bg-white dark:bg-gray-950" suppressHydrationWarning>
      <VendorCategoryProvider vendorCategories={vendorCategorie}>
        <AuthProvider>
        <VendorAuthGuard>
        <VendorUIProvider>
        <PropertyTypeModalProvider>
<SocketProvider userId={user?.id}>
          {/* PRIMARY HEADER — hidden inside the venue editor specifically
              (not parent_details), which renders its own standalone
              header (Back / title / Preview) and owns the full viewport
              itself. */}
          {!isVenueEditor && <Navbar />}

          {/* LEFT SIDEBAR NAV (desktop) — hidden inside listing editor */}
          {!isListingEditor && <VendorSidebar />}

          {/* FLOATING CATEGORY NAVIGATOR — hidden inside listing editor */}
          {!isListingEditor && <VendorCategoryNavigator />}

          {/* SCROLL TO TOP */}
          <ScrollToTop />

          {isListingEditor ? (
            /* Listing editor: no shared wrapper, no KYC card, no
               sidebar — PageMainWrapper supplies its own header
               clearance directly (see its isListingEditor branch). */
            <PageMainWrapper isListingEditor isVenueEditor={isVenueEditor}>
              {children}
            </PageMainWrapper>
          ) : (
            /*
              Every other route: ONE shared outer box owns BOTH the
              header-clearance margin (mt-[64px]/mt-[72px], the fixed
              Navbar's exact height) and the sidebar-clearance margin
              (md:ms-[88px], clears the fixed VendorSidebar rail — margin
              not padding, since PageMainWrapper also carries its own
              px-* physical padding utilities, and mixing physical px-
              with logical ps- on the same element is a known Tailwind
              cascade-order footgun where one silently wins).

              KycReminderCard and PageMainWrapper are plain siblings
              inside it, each owning only their own padding. That's what
              makes "disappears once verified" free: the outer margin
              is static, so KycReminderCard collapsing to nothing when
              it has no reminder just works — nothing needs to be told
              to fill the gap, because there never was a gap tied to it.

              Messages is the one exception: it's a fixed-viewport,
              internally-scrolling page — it was never meant to scroll at
              the document level. Two things it must NOT depend on: (1)
              calc() height arithmetic (h-[calc(100dvh-Npx)] silently
              breaks if the minus sign isn't spaced — see the fixed
              instance of this exact bug elsewhere in this file/repo),
              and (2) position:fixed for the box itself (tried that —
              taking it out of document flow broke horizontal alignment
              with the sidebar). So: stay in normal flow, keep the same
              md:ms-[88px] margin every other route uses for sidebar
              clearance (that's what "the width was perfect" — don't
              touch it), and get the fixed TOTAL height from box-sizing
              instead of calc(): `h-[100dvh]` sets the box's total height
              to exactly one viewport (Tailwind's border-box default
              means padding is subtracted from that automatically), and
              `pt-[64px]/72px` reserves the navbar clearance out of that
              same box — the browser does the subtraction natively, no
              arithmetic string to get wrong. PageMainWrapper (flex-1
              min-h-0) then fills that entire content box.

              Messages does NOT render KycReminderCard at all — vendor
              asked for it off this route specifically. That also means
              there's nothing whose height needs to be shared/measured
              here anymore; PageMainWrapper alone owns the full content
              box.

              (Settings briefly joined this branch too — reverted. See
              the PageMainWrapper comment above for why.)
            */
            <div
              className={
                isMessagesPage
                  ? "md:ms-[88px] h-[100dvh] pt-[64px] md:pt-[72px] flex flex-col overflow-hidden"
                  : "mt-[64px] md:mt-[72px] md:ms-[88px]"
              }
            >
              {!isMessagesPage && <KycReminderCard />}

              <PageMainWrapper
                isFullBleedPage={isFullBleedPage || isMessagesPage}
                isFullBleedPage1={isFullBleedPage1}
                isMessagesPage={isMessagesPage}
              >
                {children}
              </PageMainWrapper>
            </div>
          )}

          {/* CINEMATIC CATEGORY TRANSITION OVERLAY -- portal to document.body */}
          <CategoryTransitionOverlay />

          {/* FLOATING ELEMENTS */}
          <div className="relative z-40">
            {!isListingEditor && <MessageFAB />}
            {!isListingEditor && <BottomDock />}
          </div>

          {/* PROPERTY TYPE MODAL -- rendered here, outside PageMainWrapper transforms */}
          <PropertyModalRenderer />
</SocketProvider>
        </PropertyTypeModalProvider>
        </VendorUIProvider>
        </VendorAuthGuard>
        </AuthProvider>
      </VendorCategoryProvider>
    </div>
  );
}
