"use client";
import { useState, useEffect, useRef } from "react";

import { usePathname, useParams, useRouter } from "next/navigation";
import { motion }                from "framer-motion";
import Navbar                    from "./components/Navbar";
import VendorNavTabs             from "./components/VendorNavTabs";
import BottomDock                from "./components/BottomNav";
import MessageFAB                from "./components/MessageFAB";
import ScrollToTop               from "./components/ScrollToTop";
import { VendorUIProvider }      from "@/context/VendorUIContext";
import { VendorCategoryProvider, useVendorCategory } from "@/context/VendorCategoryContext";
import VendorCategoryNavigator   from "./components/VendorCategoryNavigator";
import CategoryTransitionOverlay from "./components/CategoryTransitionOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PropertyTypeModalProvider, usePropertyTypeModal } from "@/context/PropertyTypeModalContext";
import PropertyTypeModal from "./listing/components/PropertyTypeModal";

import { vendor_category } from "@/services/home.service";


// ─────────────────────────────────────────────────────────────────────────────
// VENDOR ENABLED CATEGORIES
// Replace with API/session data once auth is wired.
// ─────────────────────────────────────────────────────────────────────────────
const VENDOR_CATEGORIES = ["venues", "farmstays", "studios"];

/* ─────────────────────────────────────────────────────────────────────────────
   VendorAuthGuard  (Rules 6 & 7)
   Renders inside AuthProvider so useAuth() is available.
   - Not logged in -> redirect to home
   - Logged in but is_vendor = 0 -> redirect to list-your-property
   All vendor pages are protected by this single guard.
───────────────────────────────────────────────────────────────────────────── */
function VendorAuthGuard({ children }) {
  const { isLoggedIn, isListed, user } = useAuth();
  const router  = useRouter();
  const params  = useParams();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  useEffect(() => {
    if (user === undefined) return; // auth still resolving
    if (!isLoggedIn) {
      router.replace(`/${locale}/${country}/home`);
      return;
    }
    if (!isListed) {
      router.replace(`/${locale}/${country}/list`);
    }
  }, [user, isLoggedIn, isListed, locale, country, router]);

  if (user === undefined || !isLoggedIn || !isListed) return null;

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
 */
function PageMainWrapper({ isListingEditor, isFullBleedPage, isFullBleedPage1, children }) {
  const { phase } = useVendorCategory();

  return (
    <motion.main
      variants={shrinkVariants}
      animate={phase}
      initial="idle"
      className={[
        isFullBleedPage || isFullBleedPage1
          ? ""
          : "px-4 sm:px-6 md:px-8 lg:px-10 pb-24 space-y-6",
        isListingEditor
          ? "pt-[64px] md:pt-[72px]"
          : "pt-[120px] md:pt-[140px]",
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
  const isFullBleedPage  = /\/vendor\/package/.test(pathname);
  const isFullBleedPage1 = /\/vendor\/teams|\/vendor\/addons/.test(pathname);
  /* Messages page owns its own padding/layout for the split-pane viewport fill */
  const isMessagesPage   = /\/vendor\/messages/.test(pathname);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" suppressHydrationWarning>
      <VendorCategoryProvider vendorCategories={vendorCategorie}>
        <AuthProvider>
        <VendorAuthGuard>
        <VendorUIProvider>
        <PropertyTypeModalProvider>

          {/* PRIMARY HEADER */}
          <Navbar />

          {/* SECONDARY NAV BAR — hidden inside listing editor */}
          {!isListingEditor && <VendorNavTabs />}

          {/* FLOATING CATEGORY NAVIGATOR — hidden inside listing editor */}
          {!isListingEditor && <VendorCategoryNavigator />}

          {/* SCROLL TO TOP */}
          <ScrollToTop />

          {/*
            MAIN CONTENT
            PageMainWrapper reads phase from context and applies the
            cinematic scale-down during category transitions.

            Full-bleed pages (package): component manages its own spacing.
            Listing editor: exact navbar height, no gutter.
              mobile:  pt-[64px]
              desktop: pt-[72px]
            All other pages: full offset including secondary nav tabs.
              mobile:  pt-[120px]
              desktop: pt-[140px]
          */}
          <PageMainWrapper
            isListingEditor={isListingEditor}
            isFullBleedPage={isFullBleedPage || isMessagesPage}
            isFullBleedPage1={isFullBleedPage1}
          >
            {children}
          </PageMainWrapper>

          {/* CINEMATIC CATEGORY TRANSITION OVERLAY -- portal to document.body */}
          <CategoryTransitionOverlay />

          {/* FLOATING ELEMENTS */}
          <div className="relative z-40">
            <MessageFAB />
            {!isListingEditor && <BottomDock />}
          </div>

          {/* PROPERTY TYPE MODAL -- rendered here, outside PageMainWrapper transforms */}
          <PropertyModalRenderer />

        </PropertyTypeModalProvider>
        </VendorUIProvider>
        </VendorAuthGuard>
        </AuthProvider>
      </VendorCategoryProvider>
    </div>
  );
}
