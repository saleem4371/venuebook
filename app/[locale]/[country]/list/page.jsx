"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import venueImg      from "@/assets/Properties/Venue.png";
import farmstayImg   from "@/assets/Properties/Farmstay.png";
import studioImg     from "@/assets/Properties/Studio.png";
import workspaceImg  from "@/assets/Properties/Workspace.png";
import rentalImg     from "@/assets/Properties/Rental.png";
import experienceImg from "@/assets/Properties/Experience.png";

import { useAuth } from "@/context/AuthContext";
import LoginModal   from "@/app/[locale]/[country]/home/components/LoginModal";

/* ─────────────────────────────────────────────────────────────────── */
/*  Data                                                                */
/* ─────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { id: "venue",      image: venueImg,      stat: { hosts: "1,200+", time: "~25 min", guests: "12,000+" } },
  { id: "farmstay",   image: farmstayImg,   stat: { hosts: "800+",   time: "~20 min", guests: "8,000+"  } },
  { id: "studio",     image: studioImg,     stat: { hosts: "600+",   time: "~15 min", guests: "5,000+"  } },
  { id: "workspace",  image: workspaceImg,  stat: { hosts: "400+",   time: "~10 min", guests: "4,000+"  } },
  { id: "rental",     image: rentalImg,     stat: { hosts: "900+",   time: "~18 min", guests: "9,000+"  } },
  { id: "experience", image: experienceImg, stat: { hosts: "350+",   time: "~12 min", guests: "6,000+"  } },
];

const STAT_KEYS = ["earning", "hosts", "time", "guests"];

/* ─────────────────────────────────────────────────────────────────── */
/*  Page                                                                */
/* ─────────────────────────────────────────────────────────────────── */

export default function ListYourPropertyPage() {
  const t = useTranslations("listing");

  const [selected, setSelected] = useState("venue");
  const params  = useParams();
  const router  = useRouter();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const region       = country.toUpperCase();
  const category     = CATEGORIES.find((c) => c.id === selected);
  const isComingSoon = selected === "experience";
  const ctaHref      = `/${locale}/${country}/start-listing/${selected}`;

  // Auth gate
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Click handler for the CTA button
  const handleCtaClick = () => {
    if (isComingSoon) return;
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    router.push(ctaHref);
  };

  // After successful login → navigate to the listing flow
  const handleLoginSuccess = () => {
    setShowLogin(false);
    router.push(ctaHref);
  };

  return (
    <main className="bg-white dark:bg-gray-950">
      {/* Login modal — shown when unauthenticated user clicks CTA */}
      <LoginModal
        open={showLogin}
        setOpen={setShowLogin}
        onSuccess={handleLoginSuccess}
      />

      <section className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-72px)] pt-[64px] md:pt-[72px] w-full lg:max-w-[1400px] lg:mx-auto">

        {/* ── RIGHT: illustration ── */}
        <div className={[
          "order-first lg:order-last",
          "lg:w-1/2 lg:flex-shrink-0",
          "lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]",
          "flex items-center justify-center lg:justify-start",
          "bg-white dark:bg-gray-950",
        ].join(" ")}>
          <div className="w-full h-[62vw] min-h-[240px] max-h-[440px] lg:w-auto lg:max-w-full lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={selected}
                src={category.image.src}
                alt={t(`category.${selected}.label`)}
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

        {/* ── LEFT: content ── */}
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
              className="block py-3"
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
            {t(`sub_copy.${region}`)}
          </p>

          {/* Category tabs */}
          <div className="mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              {t("what_listing")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active    = cat.id === selected;
                const soon      = cat.id === "experience";
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => !soon && setSelected(cat.id)}
                    disabled={soon}
                    className={[
                      "relative inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium ",
                      "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ",
                      soon
                        ? "border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-60"
                        : active
                        ? "bg-violet-600 border-violet-600 text-white shadow-sm scale-[1.03] "
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer",
                    ].join(" ")}
                  >
                    {t(`category.${cat.id}.label`)}
                    {soon && (
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
                {t(`category.${selected}.desc.${region}`)}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            {isComingSoon ? (
              <div className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed shrink-0 border border-gray-200 dark:border-gray-800">
                {t(`cta_button.${selected}`)}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCtaClick}
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
                    {t(`cta_button.${selected}`)}
                    <ArrowRightIcon />
                  </motion.span>
                </AnimatePresence>
              </button>
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
                    {key === "earning" ? t(`earning.${region}`) : category.stat[key]}
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
