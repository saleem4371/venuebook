"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MobileSearchSheet from "./components/MobileSearchSheet";
import BottomMenu from "./components/BottomMenu";

export default function Home() {
  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    document.body.style.overflow = openSearch ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [openSearch]);

  return (
    <>
      <Navbar />
      <HeroSection setOpenSearch={setOpenSearch} />
      <MobileSearchSheet open={openSearch} setOpen={setOpenSearch} />
      <BottomMenu/>
    </>
  );
}
