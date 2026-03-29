"use client";

import Navbar from "./components/Navbar";
import BottomDock from "./components/BottomNav";
import MessageFAB from "./components/MessageFAB";
import StandardFooter from "./components/StandardFooter";
import { VendorUIProvider } from "@/context/VendorUIContext";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
<VendorUIProvider>
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 space-y-6">
        {children}
      </main>

      {/* FLOATING ELEMENTS (LOWER Z-INDEX THAN MODAL) */}
      <div className="relative z-40">
        <MessageFAB />
        <BottomDock />
      </div>

      {/* FOOTER */}
      <StandardFooter vendorType="STANDARD" />
</VendorUIProvider>
    </div>
  );
}