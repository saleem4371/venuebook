"use client";
import { useEffect, useState } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import Navbar            from "./home/components/Navbar";
import Footer            from "./home/components/PremiumFooter";
import BottomMenu        from "./home/components/BottomMenu";
import CategoryNavigator from "./home/components/CategoryNavigator";
import MobileReels       from "./search/[type]/components/MobileReels";

import { RegionProvider }        from "@/context/RegionContext";
import { DropdownProvider }      from "@/context/DropdownContext";
import { UIProvider }            from "@/context/UIContext";
import { useUI }                 from "@/context/UIContext";
import { useAuth }               from "@/context/AuthContext";
import { CategoryProvider }      from "@/context/CategoryContext";
import { useCategory }           from "@/context/CategoryContext";
import { MobileReelsProvider, useMobileReels } from "@/context/MobileReelsContext";

import { country_of_category } from "@/services/global.service";
import { connectSocket }        from "@/lib/socket";

/**
 * GlobalMobileReels — renders the MobileReels overlay driven by MobileReelsContext.
 * Mounted once at the app level so any page can open the reels viewer via
 * useMobileReels().openReels({ venues, category, locale, country, ... }).
 */
function GlobalMobileReels() {
  const { reelsState, closeReels } = useMobileReels();
  if (!reelsState) return null;
  return (
    <MobileReels
      open={true}
      onClose={(activeIdx) => closeReels(activeIdx, reelsState.category)}
      venues={reelsState.venues ?? []}
      category={reelsState.category}
      locale={reelsState.locale}
      country={reelsState.country}
      wishlist={reelsState.wishlist ?? []}
      compares={reelsState.compares ?? []}
      onWishlist={reelsState.onWishlist}
      onCompare={reelsState.onCompare}
      startIndex={reelsState.startIndex ?? 0}
    />
  );
}

/**
 * GlobalReelsBridge — watches UIContext showReels (set by BottomMenu's Reels tab).
 *
 * When showReels fires:
 *   • If a page has called registerSource(), pull its venue list and openReels().
 *   • If no source is registered (e.g. on the home page), navigate to the search
 *     page for the active category with ?openReels=1, which auto-opens reels once
 *     the venue list has loaded.
 *
 * This completely decouples the BottomMenu → Reels flow from the search page.
 * Any page can become a reels source simply by calling registerSource().
 */
function GlobalReelsBridge() {
  const { showReels, setShowReels } = useUI();
  const { openReels, getActiveSource } = useMobileReels();
  const { activeCategory } = useCategory();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!showReels) return;

    // Consume the signal immediately so it doesn't fire twice
    setShowReels(false);

    const source = getActiveSource();
    if (source) {
      // A page has registered its venues — open reels directly
      openReels(source);
    } else {
      // No source (e.g. home page) — navigate to search with auto-open flag
      const { locale, country } = params;
      const cat = activeCategory || "venues";
      router.push(`/${locale}/${country}/search/${cat}?openReels=1`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReels]);
}

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isVendorRoute       = pathname.includes("/vendor");
  const isStartListingRoute = pathname.includes("/start-listing");
  const hideChrome          = isVendorRoute || isStartListingRoute;

  // Hide footer on the search LIST page (/search/[type]) but show it on
  // listing DETAIL pages (/search/[type]/[id]) which have an extra segment.
  const isSearchListPage = /\/search\/[^/]+\/?$/.test(pathname);

  // Listing detail page: /search/[type]/[id] — has two segments after /search/
  const isListingDetailPage = /\/search\/[^/]+\/[^/]+/.test(pathname);

  // Estate/Destination page: /venue/[parentId] — its own hero owns this
  // space, so the floating category pill/FAB shouldn't overlay it.
  const isVenueParentPage = /\/venue\/[^/]+\/?$/.test(pathname);

  /*
   * fabBreakpoint controls when CategoryNavigator switches from the
   * desktop pill to the floating circular FAB + bottom-sheet:
   *   Search page -> 1024px  (tablet & mobile both get the FAB)
   *   All others  ->  768px  (only mobile gets the FAB)
   */
  const isSearchPage  = pathname.includes("/search/");
  const fabBreakpoint = isSearchPage ? 1024 : 768;

  const [loadData, setLoadData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) connectSocket(user.id);
  }, [user?.id]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await country_of_category();
      const raw = res?.data?.data ?? res?.data;
      setLoadData(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RegionProvider>
      <UIProvider>
        <DropdownProvider>
          <CategoryProvider>
            <MobileReelsProvider>

              {!hideChrome && <Navbar />}
              {!hideChrome && !isListingDetailPage && !isVenueParentPage && (
                <CategoryNavigator
                  loadData={loadData}
                  fabBreakpoint={fabBreakpoint}
                />
              )}

              {children}

              {!hideChrome && <BottomMenu />}
              {!hideChrome && !isSearchListPage && <Footer />}

              {/* Consumes showReels signal from BottomMenu — works on every page */}
              <GlobalReelsBridge />

              {/* Global mobile reels overlay — renders the viewer when openReels() is called */}
              <GlobalMobileReels />

            </MobileReelsProvider>
          </CategoryProvider>
        </DropdownProvider>
      </UIProvider>
    </RegionProvider>
  );
}
