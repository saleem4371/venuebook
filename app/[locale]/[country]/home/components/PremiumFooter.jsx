"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe2,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static config                                                      */
/* ------------------------------------------------------------------ */
const NAV_GROUPS = [
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Cancellation Policy", href: "#" },
      { label: "Safety Information", href: "#" },
      { label: "Report a Concern", href: "#" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Wedding Venues", href: "#" },
      { label: "Banquet Halls", href: "#" },
      { label: "Farmstays", href: "#" },
      { label: "Corporate Events", href: "#" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "List Your Venue", href: "#" },
      { label: "Host Resources", href: "#" },
      { label: "Responsible Hosting", href: "#" },
      { label: "How it Works", href: "#" },
    ],
  },
  {
    heading: "VenueBook",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Sitemap", href: "#" },
  { label: "Cookie Settings", href: "#" },
];

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
export default function PremiumFooter() {
  const params = useParams();
  const locale = params?.locale || "en";
  const country = params?.country || "in";

  const localeLabel =
    locale === "hi" ? "हिन्दी (IN)" : "English (US)";
  const countryLabel = country?.toUpperCase();

  return (
    <footer
      className="bg-gray-50 border-t border-gray-200 text-gray-700 "
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Newsletter band */}
      <NewsletterBand />

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand block — full width on mobile */}
          <BrandBlock className="col-span-2 md:col-span-4 lg:col-span-1" />

          {NAV_GROUPS.map((group) => (
            <FooterGroup key={group.heading} {...group} />
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-gray-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      
            <span>© {new Date().getFullYear()} VenueBook, Inc.</span>
            <span aria-hidden="true">·</span>
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.label} className="flex items-center gap-2">
                <Link
                  href={l.href}
                  className="rounded transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  {l.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full font-medium text-gray-800 transition hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              aria-label="Change language and region"
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span>{localeLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{countryLabel}</span>
            </button>

            <ul className="flex items-center gap-1" aria-label="Social media">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Hook up to real API later
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="max-w-xl"
        >
          <h3
            id="newsletter-heading"
            className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl"
          >
            Get inspired for your next event
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Hand-picked venues, exclusive offers, and planning tips —
            straight to your inbox.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md items-center gap-2 md:w-auto"
          aria-describedby="newsletter-status"
        >
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <div className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-1 py-1 transition focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
            <input
              id="footer-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        <p
          id="newsletter-status"
          aria-live="polite"
          className="sr-only"
        >
          {status === "success"
            ? "You are subscribed. Thanks!"
            : ""}
        </p>
      </div>

      {status === "success" && (
        <p className="mx-auto -mt-6 mb-4 max-w-7xl px-4 text-xs text-emerald-700 sm:px-6 lg:px-8">
          Thanks — you’re on the list.
        </p>
      )}
    </section>
  );
}

function BrandBlock({ className = "" }) {
  return (
    <div className={className}>
      <Link
        href="#"
        className="inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        aria-label="VenueBook home"
      >
        <span className="text-xl font-semibold tracking-tight text-gray-900">
          venuebook<span className="text-purple-600">.in</span>
        </span>
      </Link>

      <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
        Discover and book amazing venues for weddings, corporate events,
        and unforgettable celebrations.
      </p>

      <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
        <li className="flex items-start gap-2.5">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
          <a
            href="tel:+917338684444"
            className="rounded transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            +91 733 868 4444
          </a>
        </li>
        <li className="flex items-start gap-2.5">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
          <a
            href="mailto:hello@venuebook.in"
            className="rounded transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            hello@venuebook.in
          </a>
        </li>
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
          <span>Mon – Sat · 9:30 AM – 6:30 PM</span>
        </li>
      </ul>
    </div>
  );
}

function FooterGroup({ heading, links }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{heading}</h3>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="rounded text-gray-600 transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
