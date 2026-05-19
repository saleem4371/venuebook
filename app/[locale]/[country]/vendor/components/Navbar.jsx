"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

import RegionLanguageModal from "../../home/components/RegionLanguageModal";
import { useAuth } from "@/context/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */
function useScrollHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return { scrolled };
}

function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    if (!dark) localStorage.setItem("theme", "light");
  }, []);
  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);
  return { isDark, toggle };
}

/* ═══════════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════════ */
const PALETTE = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
];
function avatarBg(name) {
  if (!name) return "bg-violet-500";
  return PALETTE[
    Math.max(0, (name.trim().toUpperCase().charCodeAt(0) - 65) % PALETTE.length)
  ];
}
function initials(name) {
  if (!name) return "V";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const DD = {
  initial: { opacity: 0, scale: 0.95, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -6 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
};

const PANEL = [
  "absolute end-0 mt-5 md:mt-6 z-50 will-change-transform",
  "rounded-2xl overflow-hidden",
  "bg-white dark:bg-gray-900",
  "border border-gray-100 dark:border-gray-800",
  "shadow-xl shadow-gray-300/40 dark:shadow-black/50",
].join(" ");

const IBTN = [
  "inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer",
  "text-gray-600 dark:text-gray-400",
  "transition hover:bg-gray-100 dark:hover:bg-gray-800/70",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
].join(" ");

/* ═══════════════════════════════════════════════════════════════
   MENU PRIMITIVES
═══════════════════════════════════════════════════════════════ */
function MenuItem({ icon, label, href, onClick, variant = "default", badge }) {
  const base =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500";
  const varCls = {
    default:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60",
    accent:
      "text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-50/60 dark:hover:bg-violet-950/30",
    danger:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
  };
  const icoVar = {
    default: "shrink-0 text-gray-400 dark:text-gray-500",
    accent: "shrink-0 text-violet-500 dark:text-violet-400",
    danger: "shrink-0 text-red-500 dark:text-red-400",
  };
  const cls = `${base} ${varCls[variant]}`;
  const body = (
    <>
      <span className={icoVar[variant]} aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="ml-auto inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {badge}
        </span>
      )}
    </>
  );
  return href ? (
    <Link href={href} role="menuitem" onClick={onClick} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" role="menuitem" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

function Divider() {
  return (
    <div
      role="separator"
      className="my-1.5 h-px bg-gray-100 dark:bg-gray-800 mx-3"
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   AVATAR AREA (shared between desktop + mobile)
   — wraps notif panel, profile dropdown, avatar trigger
═══════════════════════════════════════════════════════════════ */
function AvatarArea({
  profileRef,
  showProfile,
  showNotif,
  setShowProfile,
  setShowNotif,
  userName,
  userEmail,
  isLoggedIn,
  user,
  base,
  onRegion,
  onLogout,
  notifications,
}) {
  const unread = notifications.length;

  return (
    <div ref={profileRef} className="relative">
      {/* ── Notifications panel — shown from profile dropdown ── */}
      <AnimatePresence>
        {showNotif && (
          <motion.div {...DD} className={`${PANEL} w-72`}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </p>
              <button
                type="button"
                onClick={() => setShowNotif(false)}
                className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            </div>
            <ul className="py-1.5" role="none">
              {notifications.map((n, i) => (
                <li key={i} role="none">
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-gray-800 dark:text-gray-200 leading-snug">
                        {n.text}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {n.time}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar trigger ── */}
      <button
        type="button"
        onClick={() => {
          setShowProfile((p) => !p);
          setShowNotif(false);
        }}
        aria-label="Account menu"
        aria-expanded={showProfile}
        aria-haspopup="menu"
        className={[
          "relative flex h-10 w-10 shrink-0 items-center justify-center",
          "rounded-full overflow-hidden cursor-pointer",
          "transition hover:opacity-80",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          isLoggedIn && user?.avatar ? "" : avatarBg(userName),
        ].join(" ")}
      >
        {isLoggedIn && user?.avatar ? (
          <img
            src={user.avatar}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="select-none text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {initials(userName)}
          </span>
        )}
      </button>

      {/* ── Profile dropdown ── */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            {...DD}
            role="menu"
            aria-label="Account menu"
            className={`${PANEL} w-64`}
          >
            {/* User header */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white select-none ${avatarBg(userName)}`}
                  aria-hidden="true"
                >
                  {initials(userName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Items: Account, Region, Notifications, Settings, Logout */}
            <ul className="py-1.5" role="none">
              <li role="none">
                <MenuItem
                  icon={<UserIcon />}
                  label="Account"
                  href={`${base}/account`}
                  onClick={() => setShowProfile(false)}
                />
              </li>
              <li role="none">
                <MenuItem
                  icon={<GlobeIcon className="h-4 w-4" />}
                  label="Region & Language"
                  onClick={onRegion}
                />
              </li>
              <li role="none">
                <MenuItem
                  icon={<BellIcon className="h-4 w-4" />}
                  label="Notifications"
                  badge={unread}
                  onClick={() => {
                    setShowProfile(false);
                    setShowNotif(true);
                  }}
                />
              </li>
              <li role="none">
                <MenuItem
                  icon={<SettingsIcon />}
                  label="Settings"
                  href={`${base}/settings`}
                  onClick={() => setShowProfile(false)}
                />
              </li>
              <Divider />
              <li role="none">
                <MenuItem
                  icon={<LogoutIcon />}
                  label="Logout"
                  href="/logout"
                  onClick={onLogout}
                  variant="danger"
                />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function PremiumNavbar() {
  const params = useParams();
  const router = useRouter();

  const locale = params?.locale || "en";
  const country = params?.country || "in";
  const base = `/${locale}/${country}/vendor`;

  const { scrolled } = useScrollHeader();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const userName = user?.name || "Vendor";
  const userEmail = user?.email || "vendor@venuebook.in";

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  /* Separate refs for desktop + mobile (both rendered but only one visible) */
  const profileRefD = useRef(null);
  const profileRefM = useRef(null);

  const closeArea = useCallback(() => {
    setShowNotif(false);
    setShowProfile(false);
  }, []);
  useClickOutside(profileRefD, closeArea);
  useClickOutside(profileRefM, closeArea);

  const goCustomer = useCallback(
    () => router.push(`/${locale}/${country}/home`),
    [router, locale, country],
  );

  const notifications = [
    { text: "New lead received", time: "2 min ago" },
    { text: "Booking confirmed", time: "15 min ago" },
    { text: "Payment received", time: "1 hr ago" },
  ];

  const sharedAreaProps = {
    showProfile,
    showNotif,
    setShowProfile,
    setShowNotif,
    userName,
    userEmail,
    isLoggedIn,
    user,
    base,
    notifications,
    onRegion: () => {
      setShowProfile(false);
      setRegionOpen(true);
    },
    onLogout: () => setShowProfile(false),
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 w-full",
          "transition-[background-color,border-color,box-shadow] duration-200",
          scrolled
            ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80"
            : "bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/60",
        ].join(" ")}
      >
        {/* ── Desktop: Logo + right cluster only (tabs live in secondary bar) ── */}
        <nav
          aria-label="Vendor header"
          className="hidden md:flex h-[72px] w-full items-center justify-between px-8 lg:px-10"
        >
          <Brandlogo href={`${base}/dashboard`} isDark={isDark} />

          <div className="flex items-center gap-1">
            {/* Switch to Customer */}
            <button
              type="button"
              onClick={goCustomer}
              className={[
                "inline-flex items-center gap-2 rounded-full cursor-pointer",
                "px-4 py-2 text-sm font-medium",
                "bg-white dark:bg-gray-950",
                "text-gray-800 dark:text-gray-200",
                "border border-gray-200 dark:border-gray-700",
                "transition hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
              ].join(" ")}
            >
              <HomeIcon className="h-4 w-4 shrink-0" />
              <span>Switch to Customer</span>
            </button>

            <span
              className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            />

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Light mode" : "Dark mode"}
              className={IBTN}
            >
              {isDark ? (
                <SunIcon className="h-[18px] w-[18px]" />
              ) : (
                <MoonIcon className="h-[18px] w-[18px]" />
              )}
            </button>

            {/* Globe */}
            <button
              type="button"
              onClick={() => {
                setShowProfile(false);
                setShowNotif(false);
                setRegionOpen(true);
              }}
              aria-label="Region and language"
              className={IBTN}
            >
              <GlobeIcon className="h-[18px] w-[18px]" />
            </button>

            {/* Avatar + profile dropdown + notif panel */}
            <AvatarArea profileRef={profileRefD} {...sharedAreaProps} />
          </div>
        </nav>

        {/* ── Mobile: Logo + Avatar only ── */}
        <nav
          aria-label="Mobile vendor header"
          className="flex md:hidden h-[64px] w-full items-center justify-between px-5 sm:px-6"
        >
          <Brandlogo href={`${base}/dashboard`} isDark={isDark} />

         <div className="flex items-center gap-1">
          {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Light mode" : "Dark mode"}
              className={IBTN}
            >
              {isDark ? (
                <SunIcon className="h-[18px] w-[18px]" />
              ) : (
                <MoonIcon className="h-[18px] w-[18px]" />
              )}
            </button>

            {/* Globe */}
            <button
              type="button"
              onClick={() => {
                setShowProfile(false);
                setShowNotif(false);
                setRegionOpen(true);
              }}
              aria-label="Region and language"
              className={IBTN}
            >
              <GlobeIcon className="h-[18px] w-[18px]" />
            </button>
          <AvatarArea profileRef={profileRefM} {...sharedAreaProps} />
          </div>
        </nav>
      </header>

      <RegionLanguageModal
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════ */
const P = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function Brandlogo({ href, isDark }) {
  return (
    <Link
      href={href}
      aria-label="VenueBook Vendor"
      className="shrink-0 inline-flex items-center rounded-md transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
    >
      <img
        src={isDark ? (darkLogo.src ?? darkLogo) : (lightLogo.src ?? lightLogo)}
        alt="VenueBook"
        width={140}
        height={28}
        loading="eager"
        decoding="async"
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}
function HomeIcon({ className }) {
  return (
    <svg className={className} {...P}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function GlobeIcon({ className }) {
  return (
    <svg className={className} {...P}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function BellIcon({ className }) {
  return (
    <svg className={className} {...P}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function MoonIcon({ className }) {
  return (
    <svg className={className} {...P}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon({ className }) {
  return (
    <svg className={className} {...P}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
