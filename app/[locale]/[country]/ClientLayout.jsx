"use client";

import { usePathname } from "next/navigation";
import Navbar           from "./home/components/Navbar";
import Footer           from "./home/components/PremiumFooter";
import BottomMenu       from "./home/components/BottomMenu";
import CategoryNavigator from "./home/components/CategoryNavigator";

import { RegionProvider }    from "@/context/RegionContext";
import { DropdownProvider }  from "@/context/DropdownContext";
import { UIProvider }        from "@/context/UIContext";
import { AuthProvider }      from "@/context/AuthContext";
import { CategoryProvider }  from "@/context/CategoryContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isVendorRoute       = pathname.includes("/vendor");
  const isStartListingRoute = pathname.includes("/start-listing");
  const hideChrome          = isVendorRoute || isStartListingRoute;

  return (
    <RegionProvider>
      <AuthProvider>
        <UIProvider>
          <DropdownProvider>
            <CategoryProvider>

              {!hideChrome && <Navbar />}
              {!hideChrome && <CategoryNavigator />}

              {children}

              {!hideChrome && <BottomMenu />}
              {!hideChrome && <Footer />}

            </CategoryProvider>
          </DropdownProvider>
        </UIProvider>
      </AuthProvider>
    </RegionProvider>
  );
}
