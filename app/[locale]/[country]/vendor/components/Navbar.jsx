"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

import { each_kyc_status , suscription_detail } from "@/services/kyc.service";


import { useVendorCategory } from "@/context/VendorCategoryContext";


import { useTranslations } from "next-intl";
import RegionLanguageModal from "../../home/components/RegionLanguageModal";
import { useAuth } from "@/context/AuthContext";
import KycStatusChip from "./KycStatusChip";
import KYCModal from "./KYCModal";
import LogoutConfirmationModal from "@/components/shared/LogoutConfirmationModal";
import LogoutOverlay           from "@/components/shared/LogoutOverlay";

import { useSocket } from "@/context/SocketContext";


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
  const unread = notifications?.notifications?.length;

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
             <ul className="py-1.5" role="none">
  {(notifications?.notifications ?? []).map((n, i) => (
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
            {n.message}
          </span>
          <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {n.created_at}
          </span>
        </span>
      </Link>
    </li>
  ))}
</ul>
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
  const [logoutLoading,   setLogoutLoading]   = useState(false);
  const [kycStatus,       setKycStatus]       = useState("pending"); // wire to API/session later
  const [kycOpen,         setKycOpen]         = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [switchLoading,   setSwitchLoading]   = useState(false);
  const [subscriptionData,   setSubscriptionData]   = useState({});

    const { activeCategory } = useVendorCategory();


  //const [status, setStatus] = useState(null);

  const [kycData, setKycData] = useState(null);
  const [notification, setNotification] = useState(null);

// const { status } = useSocket();


const { status } = useSocket();


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

  // const notifications = [
  //   { text: "New lead received", time: "2 min ago" },
  //   { text: "Booking confirmed", time: "15 min ago" },
  //   { text: "Payment received", time: "1 hr ago" },
  // ];

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
    notifications: notification,   // ← was `notification,` — key must match AvatarArea's prop name
    onRegion: () => {
      setShowProfile(false);
      setRegionOpen(true);
    },
    onLogout: () => { setShowProfile(false); setShowLogoutModal(true); },
    onSwitchToCustomer: goCustomer,
};


useEffect(() => {
  if (!open) return;
  const fetchKycStatus = async () => {
    try {
      const res = await each_kyc_status();
      setKycData(res?.data || null);
    } catch (err) {
      console.error(err);
      setKycData(null);
    }
  };
  fetchKycStatus();
}, [open]);


useEffect(() => {
  SUbsStatus();
}, [activeCategory]);

  const SUbsStatus = async () => {
    try {
      const subscription = await suscription_detail();
setSubscriptionData(subscription.data[0])
    } catch (err) {
      console.error(err);
      setSubscriptionData(null);
    }
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
            <PlanBadge plan={subscriptionData?.plan_name || "-"} base={base} subscriptionData={subscriptionData}/>

            {/* Avatar + profile dropdown + notif panel */}
            <AvatarArea profileRef={profileRefD} {...sharedAreaProps} logout={logout} /> 
          </div>
        </nav>
  
  <RealtimeStatusToast status={status} />

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
            <PlanBadge plan={subscriptionData?.plan_name || "-"} base={base} subscriptionData={subscriptionData} />  

            {/* Avatar + profile dropdown (Switch to Customer lives inside here on mobile) */}
            <AvatarArea profileRef={profileRefM} {...sharedAreaProps} logout={logout} />
          </div>
     
        </nav>
      </header>

      <RegionLanguageModal
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
      />

      <KYCModal open={kycOpen} setOpen={setKycOpen}  kycData={kycData} />

      {/* Shared logout confirmation modal */}
      <LogoutConfirmationModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setShowLogoutModal(false);
          // Auto-save any in-progress listing draft before logging out (item 11)
          try { window.__vb_save_draft?.(); } catch (_) {}
          setLogoutLoading(true);                                   // show overlay immediately

          await new Promise((r) => setTimeout(r, 80));               // let overlay render
          await logout();                                           // clear user + server session
          window.location.href = `/${locale}/${country}/home`;
        }}
      />

      {/* Full-screen overlay — covers everything while logout processes */}
      <LogoutOverlay open={logoutLoading} />
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

/* Demo subscription data — replace with real API call */
const DEMO_SUBSCRIPTION = {
  cycle:      "Monthly",
  nextRenewal: "Jul 9, 2026",
};

/* ═══════════════════════════════════════════════════════════════
   PLAN CONFIG — module-level so both PremiumNavbar and PlanBadge
   can read it. Keys match getPlanName()'s return values exactly.
═══════════════════════════════════════════════════════════════ */
// function getPlanName(subscription = {}) {
//   const min = Number(subscription.min_venue || 0);
//   const max = Number(subscription.max_venue || 0);

//   if (min === 0 && max === 0) return subscription?.plan_name;
//   if (min === 1 && max === 1) return "Starter";
//   if (min >= 2 && max <= 4) return "Premium";
//   if (min >= 5) return "Standard";
//   return "Normal";
// }
function getPlanName(subscription = {}) {
  const min = Number(subscription?.min_venue ?? 0);
  const max = Number(subscription?.max_venue ?? 0);

  // No venue restriction -> use original plan name
  if (min === 0 && max === 0) {
    return subscription?.plan_name || "Normal";
  }

  // 1 venue
  if (min === 1 && max === 1) {
    return "Starter";
  }

  // 2-4 venues
  if (min >= 2 && max >= 2 && max <= 4) {
    return "Premium";
  }

  // 5 or more venues
  if (min >= 5) {
    return "Standard";
  }

  return subscription?.plan_name || "Normal";
}

const PLAN_CONFIG = {
  normal: {
    label: "Normal",
    labelFull: "Normal Plan",
    text: "text-white",
      bg: "",
    border: "border-transparent",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
    glow: "shadow-[0_2px_12px_-2px_rgba(168,85,247,0.55)]",
    icon: <StarIcon />,
  },
  starter: {
    label: "Starter",
    labelFull: "Starter Plan",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/25",
    border: "border-amber-200/60 dark:border-amber-700/30",
    icon: <ZapIcon />,
  },
  premium: {
    label: "Premium",
    labelFull: "Premium Plan",
    text: "text-white",
    bg: "",
    border: "border-transparent",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
    glow: "shadow-[0_2px_12px_-2px_rgba(168,85,247,0.55)]",
    icon: <StarIcon />,
  },
  standard: {
    label: "Standard",
    labelFull: "Standard Plan",
    text: "text-white",
    bg: "",
    border: "border-transparent",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #4f46e5 100%)",
    glow: "shadow-[0_2px_12px_-2px_rgba(99,102,241,0.55)]",
    icon: <ZapIcon />,
  },
};

/* ═══════════════════════════════════════════════════════════════
   PLAN BADGE
═══════════════════════════════════════════════════════════════ */
function PlanBadge({ plan, base = "", subscriptionData = {} }) {
  const t = useTranslations("header");

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  // const planTitle = getPlanName(subscriptionData);
  // const key = planTitle.toLowerCase();
  // const cfg = PLAN_CONFIG[key] ?? PLAN_CONFIG.normal;
  const planTitle = getPlanName(subscriptionData);
const key =
  subscriptionData?.min_venue === 0 &&
  subscriptionData?.max_venue === 0
    ? "normal"
    : planTitle.toLowerCase();

const cfg = {
  ...PLAN_CONFIG[key],
  label:
    key === "normal"
      ? subscriptionData?.plan_name || "Normal"
      : PLAN_CONFIG[key].label,
  labelFull:
    key === "normal"
      ? `${subscriptionData?.plan_name || "Normal"} Plan`
      : PLAN_CONFIG[key].labelFull,
};

  const billingCycle = "Monthly";

  const renewalDate = subscriptionData?.next_billing_date
    ? new Date(subscriptionData.next_billing_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const status = Number(subscriptionData?.status) === 1 ? "Active" : "Inactive";

  return (
    <div className="relative" ref={ref}>
      {/* ── Badge trigger ── */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Current plan: ${cfg.label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={[
          "inline-flex items-center gap-1.5 cursor-pointer",
          "rounded-full border",
          "px-2.5 py-1 sm:px-3 sm:py-1.5",
          "text-xs font-semibold leading-none tracking-tight",
          "transition-all duration-150",
          cfg.glow ? `hover:brightness-110 ${cfg.glow}` : "hover:shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
          cfg.text,
          cfg.bg,
          cfg.border,
        ].join(" ")}
        style={cfg.gradient ? { background: cfg.gradient } : undefined}
      >
        <span className={cfg.gradient ? "opacity-90" : "opacity-70"} aria-hidden="true">
          {cfg.icon}
        </span>
        {/* Tablet + Mobile (<1024px): short label */}
        <span className="lg:hidden">{cfg.label}</span>
        {/* Desktop (1024px+): full label */}
        <span className="hidden lg:inline">{cfg.labelFull}</span>
      </motion.button>

      {/* ── Subscription dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Subscription details"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute end-0 top-full mt-5 md:mt-6 z-50 w-72 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-300/40 dark:shadow-black/50"
          >
            {/* Header */}
            <div
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden"
              style={cfg.gradient ? { background: cfg.gradient } : undefined}
            >
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={`text-sm font-bold ${cfg.gradient ? "text-white" : cfg.text}`}>
                    {planTitle} Plan
                  </p>
                  <span
                    className={[
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      "text-[10px] font-semibold uppercase tracking-wide",
                      status === "Active"
                        ? cfg.gradient
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : cfg.gradient
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        status === "Active" ? (cfg.gradient ? "bg-white" : "bg-emerald-500") : (cfg.gradient ? "bg-white/70" : "bg-gray-400"),
                      ].join(" ")}
                    />
                    {status}
                  </span>
                </div>
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    cfg.gradient ? "bg-white/15 text-white" : `${cfg.bg} ${cfg.text}`,
                  ].join(" ")}
                >
                  {cfg.icon}
                </span>
              </div>
            </div>

            {/* Billing info */}
            <div className="px-5 py-4 space-y-3 text-xs border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Billing Cycle</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{billingCycle}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Next Renewal</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{renewalDate}</span>
              </div>

              {subscriptionData?.offer_amount != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{subscriptionData.offer_amount}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <ul className="py-2" role="none">
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

function RealtimeStatusToast({ status }) {
  const [visible, setVisible] = useState(false);
  const [entry, setEntry] = useState(null); // { message, type, timestamp, isRepeat }
  const lastMessageRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!status) return;

    const isRepeat = lastMessageRef.current === status.message;
    lastMessageRef.current = status.message;

    setEntry({
      message: status.message,
      type: status.type,
      timestamp: new Date(),
      isRepeat,
    });
    setVisible(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 10000);

    return () => clearTimeout(timerRef.current);
  }, [status]);

  const STYLES = {
    connected: {
      ring: "ring-emerald-500/20",
      glow: "shadow-[0_20px_50px_-12px_rgba(16,185,129,0.35)]",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconRing: "ring-emerald-500/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      bar: "from-emerald-500 via-teal-400 to-emerald-500",
      pulse: false,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    disconnected: {
      ring: "ring-amber-500/20",
      glow: "shadow-[0_20px_50px_-12px_rgba(245,158,11,0.35)]",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconRing: "ring-amber-500/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      bar: "from-amber-500 via-orange-400 to-amber-500",
      pulse: true,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" /><path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      ),
    },
    reconnecting: {
      ring: "ring-amber-500/20",
      glow: "shadow-[0_20px_50px_-12px_rgba(245,158,11,0.35)]",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconRing: "ring-amber-500/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      bar: "from-amber-500 via-orange-400 to-amber-500",
      pulse: true,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" />
        </svg>
      ),
    },
    error: {
      ring: "ring-red-500/20",
      glow: "shadow-[0_20px_50px_-12px_rgba(239,68,68,0.35)]",
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconRing: "ring-red-500/30",
      iconColor: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      bar: "from-red-500 via-rose-400 to-red-500",
      pulse: true,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };
  const cfg = STYLES[entry?.type] || STYLES.connected;

  const timeLabel = entry?.timestamp
    ? entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  return (
    <div className="fixed top-[84px] right-4 sm:right-6 z-[9999] w-full max-w-sm pointer-events-none flex justify-end">
      <AnimatePresence>
        {visible && entry && (
          <motion.div
            layout
            initial={{ x: 80, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 80, opacity: 0, scale: 0.92, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.9 }}
            className={[
              "pointer-events-auto relative overflow-hidden rounded-[20px]",
              "ring-1", cfg.ring,
              "bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl backdrop-saturate-150",
              "border border-white/60 dark:border-white/5",
              cfg.glow,
            ].join(" ")}
          >
            {/* Ambient top sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

            <AnimatePresence mode="popLayout">
              {entry.isRepeat ? (
                /* ── REPEAT: compact, refined pill ── */
                <motion.div
                  key="time-only"
                  initial={{ opacity: 0, filter: "blur(2px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    {cfg.pulse && (
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-60`} />
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
                  </span>

                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Status confirmed
                  </span>

                  <span className="ml-auto flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-gray-400 tabular-nums">
                    {timeLabel}
                  </span>

                  <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Dismiss"
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:text-gray-600 dark:hover:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                /* ── FIRST TIME / NEW MESSAGE: full premium card ── */
                <motion.div
                  key="message"
                  initial={{ opacity: 0, filter: "blur(2px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.22 }}
                  className="flex items-start gap-3.5 px-4 py-3.5"
                >
                  <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${cfg.iconBg} ${cfg.iconRing} ${cfg.iconColor}`}>
                    {cfg.pulse && (
                      <span className={`absolute inset-0 rounded-xl ${cfg.dot} opacity-20 animate-ping`} />
                    )}
                    {cfg.icon}
                  </span>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-gray-100 leading-snug tracking-[-0.01em]">
                      {entry.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-gray-600">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 tabular-nums">{timeLabel}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Dismiss"
                    className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:text-gray-600 dark:hover:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-dismiss countdown — refined, thinner, glowing */}
            <div className="relative h-[3px] w-full bg-slate-100/60 dark:bg-white/5">
              <motion.div
                key={`bar-${entry.timestamp?.getTime()}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 10, ease: "linear" }}
                style={{ transformOrigin: "right" }}
                className={`h-full w-full bg-gradient-to-r ${cfg.bar}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
