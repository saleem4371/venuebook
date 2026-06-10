"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

import { useTranslations } from "next-intl";
import RegionLanguageModal from "../../home/components/RegionLanguageModal";
import { useAuth } from "@/context/AuthContext";
import KycStatusChip from "./KycStatusChip";
import KYCModal from "./KYCModal";
import LogoutConfirmationModal from "@/components/shared/LogoutConfirmationModal";


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
function MenuItem({ icon, label, href, onClick, variant = "default", badge, adminBadge }) {
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
      {adminBadge && (
        <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[9px] font-bold leading-none tracking-wide uppercase">
          Admin
        </span>
      )}
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
  onSwitchToCustomer,
  notifications,
  logout
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
                  <Link
                    href={`${base}/notifications`}
                    onClick={() => setShowNotif(false)}
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
                  </Link>
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

            {/* Items list */}
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
                  href={`${base}/notifications`}
                  onClick={() => setShowProfile(false)}
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

              {/* ── Switch to Customer — tablet + mobile only (<1024px)
                  Desktop: visible as a standalone button in the header.
                  Positioned after Settings, before Team Management. */}
              <div className="lg:hidden">
                <Divider />
                <li role="none">
                  <MenuItem
                    icon={<HomeIcon className="h-4 w-4" />}
                    label="Switch to Customer"
                    onClick={() => { setShowProfile(false); onSwitchToCustomer?.(); }}
                    variant="accent"
                  />
                </li>
              </div>

              <Divider />
              <li role="none">
                <MenuItem
                  icon={<TeamIcon />}
                  label="Team Management"
                  href={`${base}/teams`}
                  onClick={() => setShowProfile(false)}
                  variant="accent"
                  adminBadge
                />
              </li>
              <Divider />
              <li role="none">
                <MenuItem
                  icon={<LogoutIcon />}
                  label="Logout"
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
  const { user, isLoggedIn,logout } = useAuth();

  const userName = user?.name || "Vendor";
  const userEmail = user?.email || "vendor@venuebook.in";

  // subscribe_status is now rendered inside KycStatusChip (DEMO_PLAN)

  const [showNotif,       setShowNotif]       = useState(false);
  const [showProfile,     setShowProfile]     = useState(false);
  const [regionOpen,      setRegionOpen]      = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [kycStatus,       setKycStatus]       = useState("pending"); // wire to API/session later
  const [kycOpen,         setKycOpen]         = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [switchLoading,   setSwitchLoading]   = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* Separate refs for desktop + mobile (both rendered but only one visible) */
  const profileRefD = useRef(null);
  const profileRefM = useRef(null);

  const closeArea = useCallback(() => {
    setShowNotif(false);
    setShowProfile(false);
  }, []);
  useClickOutside(profileRefD, closeArea);
  useClickOutside(profileRefM, closeArea);

  const goCustomer = useCallback(() => {
    if (switchLoading) return;
    setSwitchLoading(true);
    /* Same timing as customer's handleVendorClick (650ms) for identical feel */
    setTimeout(() => {
      setSwitchLoading(false);
      router.push(`/${locale}/${country}/home`);
    }, 650);
  }, [switchLoading, router, locale, country]);

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
    onLogout: () => { setShowProfile(false); setShowLogoutModal(true); },
    onSwitchToCustomer: goCustomer,
  };

  return (
    <>
      {/* Keyframe shared by desktop + mobile Switch buttons */}
      <style>{`
        @keyframes vb-border-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <header
        suppressHydrationWarning
        className={[
          "fixed inset-x-0 top-0 z-[100] w-full",
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

          <div className="flex items-center gap-1.5 lg:gap-2">
            {/* ── KYC status (independent badge) ─────────────────── */}
            <KycStatusChip onClick={() => setKycOpen(true)} />

            {/* ── Switch to Customer — only visible on desktop (1024px+)
                At tablet (768–1024px) it moves into the profile dropdown ── */}
            <span
              className={[
                "relative inline-flex rounded-full overflow-hidden",
                "hidden lg:inline-flex",
                switchLoading ? "p-[1.5px]" : "",
              ].join(" ")}
            >
              {/* Spinning conic-gradient border — only active while loading */}
              {switchLoading && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[-200%]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, #a44bf3 20%, #499ce8 45%, transparent 70%)",
                    animation: "vb-border-spin 1.4s linear infinite",
                  }}
                />
              )}
              <button
                type="button"
                onClick={goCustomer}
                disabled={switchLoading}
                className={[
                  "relative inline-flex items-center gap-2 rounded-full",
                  "px-4 py-2 text-sm font-medium",
                  "bg-white dark:bg-gray-950",
                  "text-gray-800 dark:text-gray-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  switchLoading
                    ? "cursor-not-allowed"
                    : "border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600",
                ].join(" ")}
              >
                <HomeIcon className="h-4 w-4 shrink-0" />
                <span>Switch to customer</span>
              </button>
            </span>

            {/* Separator — desktop: between Switch to Customer and Theme
                           tablet: between KYC and Theme (Switch is hidden) */}
            <span className="mx-0.5 h-5 w-px bg-gray-200 dark:bg-gray-700 inline-block" aria-hidden="true" />

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={mounted && isDark ? "Light mode" : "Dark mode"}
              className={IBTN}
            >
              {mounted && isDark ? (
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

            {/* Plan badge — separate from KYC, between Globe and avatar */}
            <PlanBadge plan={user?.plan || "starter"} base={base} />

            {/* Avatar + profile dropdown + notif panel */}
            <AvatarArea profileRef={profileRefD} {...sharedAreaProps} logout={logout} />
          </div>
        </nav>

        {/* ── Mobile: Logo + Avatar only ── */}
        <nav
          aria-label="Mobile vendor header"
          className="flex md:hidden h-[64px] w-full items-center justify-between px-5 sm:px-6"
        >
          <Brandlogo href={`${base}/dashboard`} isDark={isDark} />

          {/*
            Mobile header order: [KYC] [Theme] [Globe] [Plan] [Profile]
            "Switch to Customer" is moved into the Profile dropdown (md:hidden item).
            This keeps the header on exactly one row even on 320px phones.
          */}
          <div className="flex items-center gap-1 flex-nowrap min-w-0">
            {/* KYC chip — compact on xs (icon only), adds "KYC" from sm */}
            <KycStatusChip onClick={() => setKycOpen(true)} />

            {/* Theme toggle */}
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

            {/* Globe — hidden on xs (<640px) to preserve one-row on tiny phones */}
            <button
              type="button"
              onClick={() => {
                setShowProfile(false);
                setShowNotif(false);
                setRegionOpen(true);
              }}
              aria-label="Region and language"
              className={[IBTN, "hidden sm:inline-flex"].join(" ")}
            >
              <GlobeIcon className="h-[18px] w-[18px]" />
            </button>

            {/* Subscription / plan badge — stays beside profile, same as desktop */}
            <PlanBadge plan={user?.plan || "starter"} base={base} />

            {/* Avatar + profile dropdown (Switch to Customer lives inside here on mobile) */}
            <AvatarArea profileRef={profileRefM} {...sharedAreaProps} logout={logout} />
          </div>
        </nav>
      </header>

      <RegionLanguageModal
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
      />

      <KYCModal open={kycOpen} setOpen={setKycOpen} />

      {/* Shared logout confirmation modal — redirects to home on confirm */}
      <LogoutConfirmationModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setShowLogoutModal(false);
          await logout();
          // replace() removes the vendor page from back-history after logout.
          // refresh() flushes the Next.js router cache so server components
          // re-run and the navbar re-renders as guest immediately.
          router.replace(`/${locale}/${country}/home`);
          router.refresh();
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLAN BADGE
   Separate from KYC — shows current subscription tier.
   Clicking opens a subscription details dropdown.
   Replace DEMO_SUBSCRIPTION + `user?.plan` with real API data
   when subscription backend is wired up.
═══════════════════════════════════════════════════════════════ */
const PLAN_CONFIG = {
  starter: {
    label:     "Starter",
    labelFull: "Starter Plan",
    text:      "text-amber-700 dark:text-amber-400",
    bg:        "bg-amber-50 dark:bg-amber-950/25",
    border:    "border-amber-200/60 dark:border-amber-700/30",
  },
  professional: {
    label:     "Professional",
    labelFull: "Professional Plan",
    text:      "text-blue-700 dark:text-blue-400",
    bg:        "bg-blue-50 dark:bg-blue-950/25",
    border:    "border-blue-200/60 dark:border-blue-700/30",
  },
  business: {
    label:     "Business",
    labelFull: "Business Plan",
    text:      "text-purple-700 dark:text-purple-400",
    bg:        "bg-purple-50 dark:bg-purple-950/25",
    border:    "border-purple-200/60 dark:border-purple-700/30",
  },
  enterprise: {
    label:     "Enterprise",
    labelFull: "Enterprise Plan",
    text:      "text-white",
    bg:        "",          /* gradient via inline style */
    border:    "border-transparent",
    gradient:  "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)",
  },
};

/* Demo subscription data — replace with real API call */
const DEMO_SUBSCRIPTION = {
  cycle:      "Monthly",
  nextRenewal: "Jul 9, 2026",
};

function PlanBadge({ plan = "starter", base = "" }) {
  const t   = useTranslations("header");
  const key = (plan || "starter").toLowerCase();
  const cfg = PLAN_CONFIG[key] ?? PLAN_CONFIG.starter;

  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      {/* ── Badge trigger ── */}
      <motion.button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={`Current plan: ${cfg.label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={[
          "inline-flex items-center cursor-pointer",
          "rounded-full border",
          "px-2.5 py-1 sm:px-3 sm:py-1.5",
          "text-xs font-semibold leading-none",
          "transition-all duration-150 hover:shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
          cfg.text, cfg.bg, cfg.border,
        ].join(" ")}
        style={cfg.gradient ? { background: cfg.gradient } : undefined}
      >
        {/* Tablet + Mobile (<1024px): short label e.g. "Starter" */}
        <span className="lg:hidden">{cfg.label}</span>
        {/* Desktop (1024px+): full label e.g. "Starter Plan" */}
        <span className="hidden lg:inline">{cfg.labelFull}</span>
      </motion.button>

      {/* ── Subscription dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Subscription details"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.95, y: -6  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute end-0 top-full mt-5 md:mt-6 z-50 w-64",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-xl shadow-gray-300/40 dark:shadow-black/50",
            ].join(" ")}
          >
            {/* Plan + billing info */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <p className={`text-sm font-bold ${cfg.text}`}>
                {t("vendor_plan_label", { plan: cfg.label })}
              </p>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("vendor_billing_cycle")}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {DEMO_SUBSCRIPTION.cycle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("vendor_next_renewal")}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {DEMO_SUBSCRIPTION.nextRenewal}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <ul className="py-1.5" role="none">
              <li role="none">
                <MenuItem
                  icon={<ZapIcon />}
                  label={t("vendor_upgrade_plan")}
                  href={`${base}/subscription/upgrade`}
                  onClick={() => setOpen(false)}
                  variant="accent"
                />
              </li>
              <li role="none">
                <MenuItem
                  icon={<StarIcon />}
                  label={t("vendor_plan_benefits")}
                  href={`${base}/subscription#benefits`}
                  onClick={() => setOpen(false)}
                />
              </li>
              <li role="none">
                <MenuItem
                  icon={<SettingsIcon />}
                  label={t("vendor_manage_subscription")}
                  href={`${base}/subscription`}
                  onClick={() => setOpen(false)}
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
  /* Avoid SSR/client src mismatch — always render light logo on server,
     swap to dark logo on client after mount when theme is known. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const logoSrc = mounted && isDark
    ? (darkLogo.src ?? darkLogo)
    : (lightLogo.src ?? lightLogo);

  return (
    <Link
      href={href}
      aria-label="VenueBook Vendor"
      className="shrink-0 inline-flex items-center rounded-md transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
    >
      <img
        src={logoSrc}
        alt="VenueBook"
        width={140}
        height={28}
        loading="eager"
        decoding="async"
        className="h-7 w-auto md:h-8"
        suppressHydrationWarning
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
function TeamIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="16" height="16" {...P}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

