"use client";

import { usePathname } from "next/navigation";
import Navbar from "./home/components/Navbar";
import Footer from "./home/components/PremiumFooter";
import BottomMenu from "./home/components/BottomMenu";
import { DictionaryProvider } from "@/context/DictionaryContext";
import { DropdownProvider } from "@/context/DropdownContext";
import { UIProvider } from "@/context/UIContext";

export default function ClientLayout({ children, dict }) {
  const pathname = usePathname();

  const isVendorRoute = pathname.includes("/vendor");

  return (
    <DictionaryProvider dict={dict}> {/* ✅ FIX */}
      <UIProvider>
        <DropdownProvider>

          {!isVendorRoute && <Navbar />}

          {children}

          {!isVendorRoute && <BottomMenu />}
          {!isVendorRoute && <Footer />}

        </DropdownProvider>
      </UIProvider>
    </DictionaryProvider>
  );
}