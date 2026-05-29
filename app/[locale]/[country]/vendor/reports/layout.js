"use client";

import TopBar from "./components/topNavBar";

export default function ReportLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#030712]">
      <TopBar />
      <div className="pt-5">
        {children}
      </div>
    </div>
  );
}