"use client";
import {  useEffect , useState} from "react";
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

import { country_of_category } from "@/services/global.service";

import { connectSocket } from "@/lib/socket";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isVendorRoute       = pathname.includes("/vendor");
  const isStartListingRoute = pathname.includes("/start-listing");
  const hideChrome          = isVendorRoute || isStartListingRoute;

  const [loadData, setLoadData] = useState([]);

    const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
      load();
    }, []);

    const load = async () => {
      try {
        const res = await country_of_category();
        const raw = res?.data?.data ?? res?.data;
        setLoadData(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error(err);
      } finally {
        // setLoading(false);
      }
    };

  return (
    <RegionProvider>
      <AuthProvider>
        <UIProvider>
          <DropdownProvider>
            <CategoryProvider>

              {!hideChrome && <Navbar />}
              {!hideChrome && <CategoryNavigator loadData={loadData} />}

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
