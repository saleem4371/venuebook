"use client";
import Navbar from "./components/Navbar";
import BottomDock from "./components/BottomNav";
import MessageFAB from "./components/MessageFAB";


export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6 pb-24 space-y-6">
        {children}
      </main>
      <MessageFAB />
      <BottomDock />
    </div>
  );
}