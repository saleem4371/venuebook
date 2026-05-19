"use client";

import Navbar             from "./components/Navbar";
import VendorNavTabs      from "./components/VendorNavTabs";
import BottomDock         from "./components/BottomNav";
import MessageFAB         from "./components/MessageFAB";
// import StandardFooter     from "./components/StandardFooter";
import VerificationBanner from "./components/VerificationBanner";
import ScrollToTop        from "./components/ScrollToTop";
import { VendorUIProvider }        from "@/context/VendorUIContext";
import { VendorCategoryProvider }  from "@/context/VendorCategoryContext";
import VendorCategoryNavigator     from "./components/VendorCategoryNavigator";

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR ENABLED CATEGORIES
// Replace with API/session data once auth is wired.
// • 1 entry  → navigator hidden automatically (single-category vendor)
// • 2+ entries → floating navigator shown, active category shared via context
// ─────────────────────────────────────────────────────────────────────────────
const VENDOR_CATEGORIES = ["venues", "farmstays", "studios"];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <VendorCategoryProvider vendorCategories={VENDOR_CATEGORIES}>
        <VendorUIProvider>
          {/* PRIMARY HEADER */}
          <Navbar />

          {/* SECONDARY NAV BAR — desktop only, fixed at top-[72px] */}
          <VendorNavTabs />

          {/* FLOATING CATEGORY NAVIGATOR
              Fixed position, outside main flow.
              Hidden automatically when VENDOR_CATEGORIES has ≤ 1 entry.
              Desktop: insetInlineEnd 40px, top 128px
              Mobile:  insetInlineEnd 16px, top calc(80px + safe-area-inset-top) */}
          <VendorCategoryNavigator />

          {/* SCROLL TO TOP — fires on every route change */}
          <ScrollToTop />

          {/* VERIFICATION BANNER
              Floating pill — fixed, pointer-events-none outer, does NOT push layout.
              mobile: anchored at top-[64px]
              desktop: anchored at top-[116px] (below header 72 + secondary 44) */}
          <VerificationBanner />

          {/* MAIN CONTENT
              Banner is floating (out of flow), so pt only covers fixed headers.
              mobile:  header 64 + 16 gutter = pt-[80px]
              desktop: header 72 + secondary 44 + 16 gutter = pt-[132px] */}
          <main className=" px-4 sm:px-6 md:px-8 lg:px-10 pt-[120px] md:pt-[140px] pb-24 space-y-6">
            {children}
          </main>

          {/* FLOATING ELEMENTS */}
          <div className="relative z-40">
            <MessageFAB />
            <BottomDock />
          </div>

          {/* FOOTER */}
          {/* <StandardFooter vendorType="STANDARD" /> */}
        </VendorUIProvider>
      </VendorCategoryProvider>
    </div>
  );
}