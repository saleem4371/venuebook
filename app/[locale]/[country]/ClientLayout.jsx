"use client";

import { usePathname } from "next/navigation";
import Navbar    from "./home/components/Navbar";
import Footer    from "./home/components/PremiumFooter";
import BottomMenu from "./home/components/BottomMenu";

import { RegionProvider }   from "@/context/RegionContext";
import { DropdownProvider } from "@/context/DropdownContext";
import { UIProvider }       from "@/context/UIContext";
import { AuthProvider }     from "@/context/AuthContext";

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

            {!hideChrome && <Navbar />}

            {children}

            {!hideChrome && <BottomMenu />}
            {!hideChrome && <Footer />}

          </DropdownProvider>
        </UIProvider>
      </AuthProvider>
    </RegionProvider>
  );
}
