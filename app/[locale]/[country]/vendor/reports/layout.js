"use client";

import TopBar from "../components/Top/topNavBar";

export default function ReportLayout({ children }) {
  return (
    <div className="">

      <TopBar />

      <div className="">
        {children}
      </div>

    </div>
  );
}