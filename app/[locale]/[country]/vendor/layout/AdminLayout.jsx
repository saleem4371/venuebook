"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


import { useState } from "react";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Navbar setOpen={setOpen} />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}