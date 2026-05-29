"use client";

/**
 * PremiumFooter
 *
 * Props
 *   variant  "full" (default) | "minimal"
 *
 * Full    — newsletter · brand · nav columns · contact · bottom bar
 * Minimal — logo · copyright · localization pill (auth / flow pages)
 *
 * Architecture
 *   · All text via useTranslations("footer")           — no hardcoded strings
 *   · Region content via useRegion() + getFooterConfig() — no duplicated JSX
 *   · Currency display via useCurrency()
 *   · Logo switches light/dark via CSS dark: classes   — no JS theme read needed
 *   · Mobile nav = accordion (CSS toggle, no Framer needed)
 *   · Localization pill opens the shared RegionLanguageModal — no duplicate logic
 *   · RTL — no hardcoded directional classes; grid/flex flip naturally
 *   · Dark mode — full Tailwind dark: surface palette
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Phone,
  Mail,
  Clock,
  Globe2,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";
import { useRegion } from "@/hooks/useRegion";
import { useCurrency } from "@/hooks/useCurrency";
import { getFooterConfig } from "@/config/footerConfig";
import RegionLanguageModal from "./RegionLanguageModal";

/* ─────────────────────────────────────────────────────────────────────
   X (formerly Twitter) inline SVG icon
   Using official X logo mark — lucide Twitter is the legacy bird
   ───────────────────────────────────────────────────────────────────── */

function XIcon({ className, "aria-hidden": ariaHidden }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Static region-agnostic data
   ───────────────────────────────────────────────────────────────────── */

const SOCIAL_LINKS = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "X", Icon: XIcon },
  { label: "LinkedIn", Icon: Linkedin },
];

const LEGAL_KEYS = [
  { tKey: "legal.privacy" },
  { tKey: "legal.terms" },
  { tKey: "legal.sitemap" },
  { tKey: "legal.cookies" },
];

/* Resolve StaticImport → plain URL string */
const lightSrc =
  typeof lightLogo === "object" ? (lightLogo.src ?? lightLogo) : lightLogo;
const darkSrc =
  typeof darkLogo === "object" ? (darkLogo.src ?? darkLogo) : darkLogo;

/* ─────────────────────────────────────────────────────────────────────
   Shared atoms
   ───────────────────────────────────────────────────────────────────── */

/**
 * Logo — switches between SVG (light) and PNG (dark) using Tailwind
 * dark: visibility classes. No JS theme read required; the inline
 * script in app/layout.jsx sets the `dark` class before first paint.
 */
function FooterLogo({ ariaLabel }) {
  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className="inline-block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
    >
      <Image
        src={lightSrc}
        alt="VenueBook"
        width={130}
        height={30}
        priority
        className="block dark:hidden"
        style={{ width: "auto", height: "30px" }}
      />
      <Image
        src={darkSrc}
        alt="VenueBook"
        width={130}
        height={30}
        priority
        className="hidden dark:block"
        style={{ width: "auto", height: "30px" }}
      />
    </Link>
  );
}

/**
 * Localization pill — shows Language (Region) · Currency.
 * Clicking opens the shared RegionLanguageModal (same as header).
 * Format example: "English (IN) · INR" or "العربية (UAE) · AED"
 */
function LocalizationPill({ t, region, currency, onOpenModal }) {
  return (
    <button
      type="button"
      onClick={onOpenModal}
      aria-label={t("localization.change_region_sr")}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full text-sm font-medium
                 text-gray-600 dark:text-gray-300
                 transition-colors duration-200
                 hover:text-gray-900 dark:hover:text-white
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                 focus-visible:ring-offset-2"
    >
      <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t(`localization.${region}`)}</span>
      <span aria-hidden="true">·</span>
      <span>{currency}</span>
    </button>
  );
}

/** Inline copyright + legal link strip */
function LegalStrip({ t }) {
  const year = new Date().getFullYear();
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm
                    text-gray-500 dark:text-gray-400"
    >
      <span>{t("legal.copyright", { year })}</span>
      <span aria-hidden="true">·</span>
      {LEGAL_KEYS.map(({ tKey }, i) => (
        <span key={tKey} className="inline-flex items-center gap-2">
          <Link
            href="#"
            className="rounded transition-colors duration-200
                       hover:text-gray-900 dark:hover:text-gray-100
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                       focus-visible:ring-offset-2"
          >
            {t(tKey)}
          </Link>
          {i < LEGAL_KEYS.length - 1 && <span aria-hidden="true">·</span>}
        </span>
      ))}
    </div>
  );
}

/**
 * Row of social icon-only buttons.
 * Light: text-gray-500 → hover:text-gray-800
 * Dark:  text-gray-400 → hover:text-gray-100
 * No background change on hover — clean, minimal premium feel.
 */
function SocialRow({ t }) {
  return (
    <ul className="flex items-center gap-4" aria-label={t("social.aria_label")}>
      {SOCIAL_LINKS.map(({ label, Icon }) => (
        <li key={label}>
          <a
            href="#"
            aria-label={label}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex cursor-pointer items-center justify-center rounded
                       text-gray-500 dark:text-gray-400
                       transition-colors duration-200
                       hover:text-gray-800 dark:hover:text-gray-100
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                       focus-visible:ring-offset-2"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Full-footer sub-components
   ───────────────────────────────────────────────────────────────────── */

/** Newsletter band — region-aware heading and subtext */
function NewsletterBand({ t, region }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3500);
  }

  return (
    <section
      aria-labelledby="footer-nl-heading"
      className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div
        className="mx-auto flex lg:max-w-[1400px] flex-col items-start justify-between gap-6
                      px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8"
      >
        <div className="max-w-md">
          <h3
            id="footer-nl-heading"
            className="text-xl font-semibold tracking-tight
                       text-gray-900 dark:text-gray-50 md:text-2xl"
          >
            {t(`newsletter.${region}.heading`)}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t(`newsletter.${region}.subtext`)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-describedby="footer-nl-status"
          className="w-full max-w-sm md:w-auto"
        >
          <label htmlFor="footer-nl-email" className="sr-only">
            {t("newsletter.email_placeholder")}
          </label>
          <div
            className="flex items-center gap-1.5 rounded-full border
                          border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-800 px-1 py-1
                          transition-shadow duration-200
                          focus-within:border-purple-400
                          focus-within:ring-2 focus-within:ring-purple-400/25"
          >
            <input
              id="footer-nl-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.email_placeholder")}
              className="min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm
                         text-gray-900 dark:text-gray-100
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center rounded-full
                         bg-gray-900 dark:bg-gray-100 px-5 py-2 text-sm font-medium
                         text-white dark:text-gray-900
                         transition-colors duration-200
                         hover:bg-gray-700 dark:hover:bg-gray-200
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              {t("newsletter.subscribe")}
            </button>
          </div>
          <p id="footer-nl-status" aria-live="polite" className="sr-only">
            {status === "success" ? t("newsletter.success_sr") : ""}
          </p>
        </form>
      </div>

      {status === "success" && (
        <p
          className="mx-auto -mt-4 mb-5 lg:max-w-[1400px] px-4 text-xs
                      text-emerald-600 dark:text-emerald-400 sm:px-6 lg:px-8"
        >
          {t("newsletter.success_msg")}
        </p>
      )}
    </section>
  );
}

/** Brand block: logo, region description, contact details */
function BrandBlock({ t, region, config }) {
  return (
    <div className="py-8 md:py-0">
      <FooterLogo ariaLabel={t("brand.sr_home")} />

      <p
        className="mt-4 max-w-[17rem] text-sm leading-relaxed
                    text-gray-500 dark:text-gray-400"
      >
        {t(`brand.${region}.description`)}
      </p>

      <ul className="mt-5 space-y-2.5 text-sm">
        <li className="flex items-start gap-2.5">
          <Phone
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <a
            href={config.contact.phone.href}
            className="text-gray-500 dark:text-gray-400 rounded transition-colors duration-200
                       hover:text-gray-900 dark:hover:text-gray-100
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            {t(`contact.${region}.phone`)}
          </a>
        </li>
        <li className="flex items-start gap-2.5">
          <Mail
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <a
            href={config.contact.email.href}
            className="text-gray-500 dark:text-gray-400 rounded transition-colors duration-200
                       hover:text-gray-900 dark:hover:text-gray-100
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            {t(`contact.${region}.email`)}
          </a>
        </li>
        <li className="flex items-start gap-2.5">
          <Clock
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <span className="text-gray-500 dark:text-gray-400">
            {t(`contact.${region}.hours`)}
          </span>
        </li>
      </ul>
    </div>
  );
}

/**
 * Nav column — accordion on mobile, static column on desktop.
 *
 * Mobile  — heading is a toggle button with ChevronDown; links collapse
 * Desktop — heading is a plain h3; links always visible
 */
function NavGroup({ group, t }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-gray-100 dark:border-gray-800/60
                    last:border-b-0 md:border-none"
    >
      {/* Mobile accordion toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-start
                   focus:outline-none md:hidden"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t(group.headingKey)}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform
                      duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desktop static heading */}
      <h3
        className="hidden text-sm font-semibold
                     text-gray-900 dark:text-gray-100 md:block"
      >
        {t(group.headingKey)}
      </h3>

      {/* Links — hidden on mobile unless open; always shown on md+ */}
      <ul
        className={`space-y-3 text-sm pb-4 md:mt-4 md:pb-0
                    ${open ? "block" : "hidden md:block"}`}
      >
        {group.links.map(({ tKey, href }) => (
          <li key={tKey}>
            <Link
              href={href}
              className="rounded text-gray-500 dark:text-gray-400
                         transition-colors duration-200
                         hover:text-gray-900 dark:hover:text-gray-100
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              {t(tKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Variant layouts
   ───────────────────────────────────────────────────────────────────── */

function FullFooter({ t, region, currency, config, onOpenModal }) {
  return (
    <footer
      className="bg-gray-50 dark:bg-gray-950
                 border-t border-gray-100 dark:border-gray-800"
      aria-labelledby="footer-full-label"
    >
      <h2 id="footer-full-label" className="sr-only">
        {t("sr_label")}
      </h2>

      <NewsletterBand t={t} region={region} />

      <div className="mx-auto lg:max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1
                        md:grid-cols-2 md:gap-x-8 md:py-12
                        lg:grid-cols-4"
        >
          <BrandBlock t={t} region={region} config={config} />

          {config.navGroups.map((group) => (
            <NavGroup key={group.headingKey} group={group} t={t} />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <div
          className="mx-auto flex lg:max-w-[1400px] flex-col gap-4
                        px-4 py-6 sm:px-6
                        lg:flex-row lg:items-center lg:justify-between lg:px-8"
        >
          <LegalStrip t={t} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <LocalizationPill
              t={t}
              region={region}
              currency={currency}
              onOpenModal={onOpenModal}
            />
            <SocialRow t={t} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function MinimalFooter({ t, region, currency, onOpenModal }) {
  return (
    <footer
      className="border-t border-gray-100 dark:border-gray-800
                 bg-white dark:bg-gray-950"
      aria-labelledby="footer-minimal-label"
    >
      <h2 id="footer-minimal-label" className="sr-only">
        {t("sr_label")}
      </h2>

      <div
        className="mx-auto flex lg:max-w-[1400px] flex-col items-center gap-4
                      px-4 py-5 sm:px-6
                      sm:flex-row sm:justify-between lg:px-8"
      >
        <FooterLogo ariaLabel={t("brand.sr_home")} />

        <span className="hidden text-sm text-gray-400 dark:text-gray-500 sm:block">
          {t("legal.copyright", { year: new Date().getFullYear() })}
        </span>

        <LocalizationPill
          t={t}
          region={region}
          currency={currency}
          onOpenModal={onOpenModal}
        />
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Public export
   ───────────────────────────────────────────────────────────────────── */

/**
 * @param {{ variant?: "full" | "minimal" }} props
 */
export default function PremiumFooter({ variant = "full" }) {
  const t = useTranslations("footer");
  const { region } = useRegion();
  const { currency } = useCurrency();
  const config = getFooterConfig(region);

  const [modalOpen, setModalOpen] = useState(false);

  const onOpenModal = () => setModalOpen(true);
  const onCloseModal = () => setModalOpen(false);

  return (
    <>
      {variant === "minimal" ? (
        <MinimalFooter
          t={t}
          region={region}
          currency={currency}
          onOpenModal={onOpenModal}
        />
      ) : (
        <FullFooter
          t={t}
          region={region}
          currency={currency}
          config={config}
          onOpenModal={onOpenModal}
        />
      )}

      {/* Shared modal — same instance used by header; no duplicate logic */}
      <RegionLanguageModal open={modalOpen} onClose={onCloseModal} />
    </>
  );
}
