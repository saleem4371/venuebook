"use client";
import {  useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar           from "./home/components/Navbar";
import Footer           from "./home/components/PremiumFooter";
import BottomMenu       from "./home/components/BottomMenu";
import CategoryNavigator from "./home/components/CategoryNavigator";

import { RegionProvider }    from "@/context/RegionContext";
import { DropdownProvider }  from "@/context/DropdownContext";
import { UIProvider }        from "@/context/UIContext";
import { AuthProvider , useAuth }      from "@/context/AuthContext";
import { CategoryProvider }  from "@/context/CategoryContext";

import { connectSocket } from "@/lib/socket";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isVendorRoute       = pathname.includes("/vendor");
  const isStartListingRoute = pathname.includes("/start-listing");
  const hideChrome          = isVendorRoute || isStartListingRoute;

    const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id);
    }
  }, [user?.id]);

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
