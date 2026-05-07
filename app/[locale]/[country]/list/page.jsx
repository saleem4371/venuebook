"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import venueImg      from "@/assets/Properties/Venue.png";
import farmstayImg   from "@/assets/Properties/Farmstay.png";
import studioImg     from "@/assets/Properties/Studio.png";
import workspaceImg  from "@/assets/Properties/Workspace.png";
import rentalImg     from "@/assets/Properties/Rental.png";
import experienceImg from "@/assets/Properties/Experience.png";

/* ─────────────────────────────────────────────────────────────────── */
/*  Data                                                                */
/* ─────────────────────────────────────────────────────────────────── */

/* label + desc removed — sourced from listing.category.{id}.{label|desc} translations */
const CATEGORIES = [
  { id: "venue",      image: venueImg,      stat: { earning: "₹85K/mo", hosts: "1,200+", time: "~25 min", guests: "12,000+" } },
  { id: "farmstay",   image: farmstayImg,   stat: { earning: "₹52K/mo", hosts: "800+",   time: "~20 min", guests: "8,000+"  } },
  { id: "studio",     image: studioImg,     stat: { earning: "₹38K/mo", hosts: "600+",   time: "~15 min", guests: "5,000+"  } },
  { id: "workspace",  image: workspaceImg,  stat: { earning: "₹28K/mo", hosts: "400+",   time: "~10 min", guests: "4,000+"  } },
  { id: "rental",     image: rentalImg,     stat: { earning: "₹45K/mo", hosts: "900+",   time: "~18 min", guests: "9,000+"  } },
  { id: "experience", image: experienceImg, stat: { earning: "₹22K/mo", hosts: "350+",   time: "~12 min", guests: "6,000+"  } },
];

/* label removed — sourced from listing.stat.{key} translations */
const STAT_KEYS = ["earning", "hosts", "time", "guests"];

/* ─────────────────────────────────────────────────────────────────── */
/*  Page                                                                */
/* ─────────────────────────────────────────────────────────────────── */

export default function ListYourPropertyPage() {
  const t = useTranslations("listing");

  const [selected, setSelected] = useState("venue");
  const params  = useParams();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const category = CATEGORIES.find((c) => c.id === selected);
  const isComingSoon = selected === "experience";
  const ctaHref  = `/${locale}/${country}/start-listing/${selected}`;

  return (
    <main className="bg-white dark:bg-gray-950">
      {/*
        Desktop: exact remaining viewport height so the split-screen fills
        the window without overflow or content hiding under the navbar.
        Navbar is sticky (h-[64px] / md:h-[72px]), so the section starts
        naturally below it — no padding-top needed.

        Mobile: flex-col (stacked), height is auto so all content is reachable.
      */}
      {/*
        lg: flex-row split — image column is sticky so it stays pinned
        exactly below the navbar (top-[72px]) and is never obscured by it.
        Content column scrolls normally beside it.
        Mobile: flex-col, image on top with auto height.
      */}
      {/* pt-[64px]/md:pt-[72px] guarantees the section starts below the sticky
          navbar on every screen size regardless of scroll state or browser quirks.
          lg: the sticky image column also pins at top-[72px] so the two values align. */}
      <section className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-72px)] pt-[64px] md:pt-[72px] w-full lg:max-w-[1400px] lg:mx-auto">

        {/* ── RIGHT: illustration — top on mobile, sticky-right on desktop ── */}
        <div className={[
          "order-first lg:order-last",
          "lg:w-1/2 lg:flex-shrink-0",
          /* Sticky: section already offset by pt-[72px], so sticky top
             stays at 72px to pin flush with the navbar bottom on scroll */
          "lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]",
          "flex items-center justify-center lg:justify-start",
          /* Clean background — no grey box */
          "bg-white dark:bg-gray-950",
        ].join(" ")}>

          {/* Mobile: proportional height, no overflow
              Desktop: fills sticky column — reduced left padding closes center gap */}
          <div className="w-full h-[62vw] min-h-[240px] max-h-[440px] lg:w-auto lg:max-w-full lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={selected}
                src={category.image.src}
                alt={t(`category.${selected}.label`)}
                /* object-contain: full image always visible, no cropping */
                className="w-full h-full object-contain drop-shadow-md"
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{   opacity: 0, y: -6,  scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                draggable="false"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* ── LEFT: content — below image on mobile, left on desktop ── */}
        {/*
          overflow-y-auto on desktop: if content ever overflows the exact
          column height it scrolls inside the column, not the page.
        */}
        {/* pr reduced on desktop to close the center gap toward the image */}
        <div className="order-last lg:order-first lg:w-1/2 flex flex-col justify-center lg:overflow-y-auto px-5 sm:px-8 lg:pl-10 lg:pr-6 xl:pl-16 xl:pr-8 py-10 lg:py-12">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1.5 mb-6 self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              {t("eyebrow")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight text-gray-900 dark:text-white mb-4">
            {t("headline_1")}{" "}
            <span
              className="block"
              style={{
                background: "linear-gradient(242deg, #a44bf3, #499ce8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("headline_2")}
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-7 max-w-[460px]">
            {t("sub_copy")}
          </p>

          {/* Category tabs */}
          <div className="mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              {t("what_listing")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active    = cat.id === selected;
                const isComingSoon = cat.id === "experience";
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => !isComingSoon && setSelected(cat.id)}
                    disabled={isComingSoon}
                    className={[
                      "relative rounded-full border px-4 py-2 text-sm font-medium ",
                      "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ",
                      isComingSoon
                        ? "border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-60"
                        : active
                        ? "bg-violet-600 border-violet-600 text-white shadow-sm scale-[1.03] "
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer",
                    ].join(" ")}
                  >
                    {t(`category.${cat.id}.label`)}
                    {isComingSoon && (
                      <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-600">
                        {t("coming_soon_badge")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={selected}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-2.5 text-sm text-gray-400 dark:text-gray-500"
              >
                {t(`category.${selected}.desc`)}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            {isComingSoon ? (
              <div className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed shrink-0 border border-gray-200 dark:border-gray-800">
                {t("coming_soon_cta")}
              </div>
            ) : (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 shrink-0"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selected}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2.5"
                  >
                    {t("cta_button", { category: t(`category.${selected}.label`) })}
                    <ArrowRightIcon />
                  </motion.span>
                </AnimatePresence>
              </Link>
            )}

          </div>

          {/* Stats */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-5">
            <AnimatePresence mode="wait">
              {STAT_KEYS.map((key) => (
                <motion.div
                  key={`${selected}-${key}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    {t(`stat.${key}`)}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.stat[key]}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Icon                                                                */
/* ─────────────────────────────────────────────────────────────────── */

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
