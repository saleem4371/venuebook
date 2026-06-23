"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar            from "./home/components/Navbar";
import Footer            from "./home/components/PremiumFooter";
import BottomMenu        from "./home/components/BottomMenu";
import CategoryNavigator from "./home/components/CategoryNavigator";

import { RegionProvider }        from "@/context/RegionContext";
import { DropdownProvider }      from "@/context/DropdownContext";
import { UIProvider }            from "@/context/UIContext";
import { useAuth }               from "@/context/AuthContext";
import { CategoryProvider }      from "@/context/CategoryContext";

import { country_of_category } from "@/services/global.service";
import { connectSocket }        from "@/lib/socket";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isVendorRoute       = pathname.includes("/vendor");
  const isStartListingRoute = pathname.includes("/start-listing");
  const isSearchRoute       = pathname.includes("/search/");
  const hideChrome          = isVendorRoute || isStartListingRoute;

  // Hide footer on the search LIST page (/search/[type]) but show it on
  // listing DETAIL pages (/search/[type]/[id]) which have an extra segment.
  const isSearchListPage = /\/search\/[^/]+\/?$/.test(pathname);

  // Listing detail page: /search/[type]/[id] — has two segments after /search/
  const isListingDetailPage = /\/search\/[^/]+\/[^/]+/.test(pathname);

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

            {!hideChrome && <Navbar />}
            {!hideChrome && !isListingDetailPage && (
              <CategoryNavigator
                loadData={loadData}
                fabBreakpoint={fabBreakpoint}
              />
            )}

            {children}

            {!hideChrome && <BottomMenu />}
            {!hideChrome && !isSearchListPage && <Footer />}

          </CategoryProvider>
        </DropdownProvider>
      </UIProvider>
    </RegionProvider>
  );
}
