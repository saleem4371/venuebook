"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useDropdown } from "@/context/DropdownContext";
import { useAuth }     from "@/context/AuthContext";
import { useUI }       from "@/context/UIContext";
import LogoutConfirmationModal from "@/components/shared/LogoutConfirmationModal";
import LogoutOverlay           from "@/components/shared/LogoutOverlay";

/* ─────────────────────────────────────────────────────────────────────
   MEMBERSHIP — Static demo UI  (swap DEMO_MEMBERSHIP for API data later)
───────────────────────────────────────────────────────────────────── */
const DEMO_MEMBERSHIP = {
  tier:           "gold",   // bronze | silver | gold | platinum | diamond
  points:         2450,
  nextTier:       "Platinum",
  nextTierPoints: 3000,
  benefits: [
    "benefit_priority_support",
    "benefit_faster_refunds",
    "benefit_exclusive_offers",
  ],
};

const TIER_CONFIG = {
  bronze: {
    label:    "Bronze",
    gradient: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
    text:     "text-amber-800 dark:text-amber-400",
    bg:       "bg-amber-50 dark:bg-amber-950/25",
    border:   "border-amber-200/70 dark:border-amber-700/30",
    icon:     "🥉",
  },
  silver: {
    label:    "Silver",
    gradient: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
    text:     "text-gray-600 dark:text-gray-300",
    bg:       "bg-gray-50 dark:bg-gray-800/40",
    border:   "border-gray-200/70 dark:border-gray-700/30",
    icon:     "🥈",
  },
  gold: {
    label:    "Gold",
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
    text:     "text-amber-600 dark:text-amber-400",
    bg:       "bg-amber-50/80 dark:bg-amber-950/20",
    border:   "border-amber-200/70 dark:border-amber-700/30",
    icon:     "✦",
  },
  platinum: {
    label:    "Platinum",
    gradient: "linear-gradient(135deg, #6d28d9 0%, #818cf8 100%)",
    text:     "text-purple-600 dark:text-purple-400",
    bg:       "bg-purple-50 dark:bg-purple-950/20",
    border:   "border-purple-200/70 dark:border-purple-700/30",
    icon:     "◆",
  },
  diamond: {
    label:    "Diamond",
    gradient: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    text:     "text-cyan-600 dark:text-cyan-400",
    bg:       "bg-cyan-50 dark:bg-cyan-950/20",
    border:   "border-cyan-200/70 dark:border-cyan-700/30",
    icon:     "◈",
  },
};

/* ─────────────────────────────────────────────────────────────────────
   AVATAR PALETTE
───────────────────────────────────────────────────────────────────── */
const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500",
  "bg-rose-500",  "bg-cyan-500",  "bg-amber-500",   "bg-pink-500",
  "bg-teal-500",  "bg-indigo-500",
];

function getAvatarBg(name) {
  if (!name) return "bg-violet-500";
  return AVATAR_PALETTE[Math.max(0, (name.trim().toUpperCase().charCodeAt(0) - 65) % AVATAR_PALETTE.length)];
}

/* ─────────────────────────────────────────────────────────────────────
   MEMBERSHIP WIDGET
   ─ Visible at ALL breakpoints — never hidden, never displaced.
   ─ Compresses gracefully at smaller widths. Theme/Globe/Avatar are
     always shown; this badge shrinks first.

   Breakpoint behaviour (single-line, no flex-col):
     <sm  <640px      [icon] Gold             (compact padding)
     sm   640–767px   [icon] Gold
     md   768–1023px  [icon] Gold
     lg   1024–1279px [icon] Gold
     xl   1280–1535px [icon] Gold Member
     2xl  1536px+     [icon] Gold Member      (wider padding only)
───────────────────────────────────────────────────────────────────── */

/** Compact number formatter: 2450 → "2.4k", 950 → "950" */
function fmtK(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function MembershipWidget({ tier, points, nextTier, nextTierPoints, benefits, isOpen, setIsOpen }) {
  const t   = useTranslations("membership");
  const ref = useRef(null);
  const cfg = TIER_CONFIG[tier];

  /* Close popover on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setIsOpen]);

  if (!cfg) return null;

  const progress  = Math.min(100, Math.round((points / nextTierPoints) * 100));
  const remaining = nextTierPoints - points;

  return (
    <div ref={ref} className="relative inline-flex shrink-0">

      {/* ── Header trigger — always single-line, progressively wider ── */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-label={t("membership_badge_aria", { tier: cfg.label })}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={[
          "inline-flex items-center gap-1.5 cursor-pointer shrink-0",
          "rounded-full border",
          /* Padding: compact on mobile, scales up with available space */
          "px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-2.5 xl:px-3",
          "transition-all duration-150 hover:shadow-sm",
          cfg.bg, cfg.border,
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
        ].join(" ")}
      >
        {/* Tier icon circle — always visible */}
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold leading-none shadow-sm"
          style={{ background: cfg.gradient }}
          aria-hidden="true"
        >
          {cfg.icon}
        </span>

        {/* ── Tier label ───────────────────────────────────────────
            md–xl:  "Gold"
            xl+:    "Gold Member"
        ─────────────────────────────────────────────────────────── */}
        <span className={`text-xs font-semibold leading-none shrink-0 ${cfg.text}`}>
          <span className="xl:hidden">{cfg.label}</span>
          <span className="hidden xl:inline">
            {t("member_label", { tier: cfg.label })}
          </span>
        </span>

      </motion.button>

      {/* ── Membership popover ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Membership status"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.95, y: -6  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute end-0 top-full mt-5 md:mt-6 z-50 w-72",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-xl shadow-gray-300/40 dark:shadow-black/50",
            ].join(" ")}
          >
            {/* Tier header */}
            <div
              className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800"
              style={{ background: `${cfg.gradient.replace(")", ", 0.08)")
                .replace("linear-gradient(", "linear-gradient(")
                .replace("135deg,", "135deg,")}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-base font-bold leading-none shadow-md"
                  style={{ background: cfg.gradient }}
                  aria-hidden="true"
                >
                  {cfg.icon}
                </span>
                <div>
                  <p className={`text-sm font-bold ${cfg.text}`}>
                    {t("member_label", { tier: cfg.label })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("points_label", { points: points.toLocaleString() })}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {nextTier}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {points.toLocaleString()} / {nextTierPoints.toLocaleString()}
                </p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: cfg.gradient }}
                  role="progressbar"
                  aria-valuenow={points}
                  aria-valuemin={0}
                  aria-valuemax={nextTierPoints}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                {t("next_tier_label", {
                  points: remaining.toLocaleString(),
                  tier:   nextTier,
                })}
              </p>
            </div>

            {/* Benefits */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-2">
                {t("benefits_title")}
              </p>
              <ul className="space-y-1.5">
                {benefits.map((key) => (
                  <li key={key} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span
                      className={`text-[11px] font-bold shrink-0 ${cfg.text}`}
                      aria-hidden="true"
                    >✓</span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   USER DROPDOWN
───────────────────────────────────────────────────────────────────── */
export default function UserDropdown({ onOpenRegionModal }) {
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();
  const { user, isLoggedIn, isListed, logout }     = useAuth();
  const { setLoginOpen }                           = useUI();
  const params                                     = useParams();
  const router                                     = useRouter();
  const wrapRef                                    = useRef(null);

  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const isProfileOpen = openDropdown === "user";

  /* Membership widget open state — independent of profile dropdown */
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [confirmLogout,  setConfirmLogout]  = useState(false);
  const [loggingOut,     setLoggingOut]     = useState(false);

  /* Close on outside click (covers both widget + avatar) */
  useEffect(() => {
    if (!isProfileOpen && !membershipOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        closeAll();
        setMembershipOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isProfileOpen, membershipOpen, closeAll]);

  /* Avatar initials */
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* Handlers */
  const handleLogin  = () => { closeAll(); setLoginOpen(true); };
  const handleVendor = () => {
    closeAll();
    // Check pending subscription FIRST — is_vendor can be set to 1 at listing
    // creation time, so we cannot rely on isListed to gate this check.
    try {
      const pendingCat = localStorage.getItem("vb_pending_category");
      if (pendingCat) {
        router.push(`/${locale}/${country}/start-listing/${pendingCat}/payment`);
        return;
      }
    } catch (_) {}
    router.push(
      isLoggedIn && isListed
        ? `/${locale}/${country}/vendor/dashboard`
        : `/${locale}/${country}/list`
    );
  };
  const handleRegion      = () => { closeAll(); onOpenRegionModal?.(); };
  const handleLogoutClick = () => { closeAll(); setConfirmLogout(true); };
  const confirmLogoutAction = async () => {
    setConfirmLogout(false);
    // Auto-save any in-progress listing draft before logging out (item 11)
    try { window.__vb_save_draft?.(); } catch (_) {}
    setLoggingOut(true);                                    // show overlay immediately

    await new Promise((r) => setTimeout(r, 80));            // let overlay render
    await logout();                                         // clear user + server session
    window.location.href = `/${locale}/${country}/home`;
  };

  return (
    <div className="relative flex items-center gap-2" ref={wrapRef}>

      {/* ── Membership widget — desktop + tablet, logged-in only ── */}
      {isLoggedIn && (
        <MembershipWidget
          tier={DEMO_MEMBERSHIP.tier}
          points={DEMO_MEMBERSHIP.points}
          nextTier={DEMO_MEMBERSHIP.nextTier}
          nextTierPoints={DEMO_MEMBERSHIP.nextTierPoints}
          benefits={DEMO_MEMBERSHIP.benefits}
          isOpen={membershipOpen}
          setIsOpen={(val) => {
            setMembershipOpen(val);
            if (val) closeAll(); /* close profile dropdown when opening membership */
          }}
        />
      )}

      {/* ── Avatar trigger ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          setMembershipOpen(false); /* close membership when opening profile */
          toggleDropdown("user");
        }}
        aria-label="Open account menu"
        aria-expanded={isProfileOpen}
        aria-haspopup="menu"
        className={[
          "relative flex h-10 w-10 shrink-0 items-center justify-center",
          "rounded-full overflow-hidden cursor-pointer",
          "transition hover:opacity-80",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          isLoggedIn
            ? (user?.avatar ? "" : getAvatarBg(user?.name))
            : "bg-gray-100 dark:bg-gray-800",
        ].join(" ")}
      >
        {isLoggedIn ? (
          user?.avatar ? (
            <img src={user.avatar} alt={user.name ?? "Profile"} className="h-full w-full object-cover" />
          ) : (
            <span className="select-none text-sm font-semibold text-white" aria-hidden="true">
              {initials}
            </span>
          )
        ) : (
          <PersonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* ── Profile dropdown ───────────────────────────────────── */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.95, y: -6  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute end-0 top-full mt-5 md:mt-6 w-64",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-xl shadow-gray-300/40 dark:shadow-black/50",
              "z-50 will-change-transform",
            ].join(" ")}
          >
            {isLoggedIn ? (
              <LoggedInMenu
                user={user}
                isListed={isListed}
                locale={locale}
                country={country}
                onClose={closeAll}
                onLogout={handleLogoutClick}
                onVendor={handleVendor}
                onRegion={handleRegion}
              />
            ) : (
              <LoggedOutMenu
                onLogin={handleLogin}
                onVendor={handleVendor}
                onRegion={handleRegion}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutConfirmationModal
        open={confirmLogout}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={confirmLogoutAction}
      />

      {/* Full-screen overlay — covers everything while logout processes */}
      <LogoutOverlay open={loggingOut} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   GUEST MENU
───────────────────────────────────────────────────────────────────── */
function LoggedOutMenu({ onLogin, onVendor, onRegion }) {
  const t = useTranslations("header");
  return (
    <nav aria-label="Guest menu">
      <ul className="py-1.5" role="none">
        <li role="none">
          <MenuItem icon={<BuildingIcon />} label={t("list_property")} onClick={onVendor} />
        </li>
        <li role="none">
          <MenuItem icon={<GlobeIcon />} label={t("region_language")} onClick={onRegion} />
        </li>
        <Divider />
        <li role="none">
          <MenuItem icon={<LoginIcon />} label={t("login_signup")} onClick={onLogin} variant="accent" />
        </li>
      </ul>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   LOGGED-IN MENU
   Account actions only. Membership is handled by MembershipWidget in
   the header (visible at all breakpoints — no duplicate needed here).
───────────────────────────────────────────────────────────────────── */
function LoggedInMenu({ user, isListed, locale, country, onClose, onLogout, onVendor, onRegion }) {
  const t    = useTranslations("header");
  const base = `/${locale}/${country}`;

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav aria-label="User menu">
      {/* User header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              "text-sm font-semibold text-white select-none",
              getAvatarBg(user?.name),
            ].join(" ")}
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <ul className="py-1.5" role="none">
        {/* Vendor / Listing */}
        <li role="none">
          <MenuItem
            icon={isListed ? <StoreIcon /> : <BuildingIcon />}
            label={isListed ? t("switch_to_vendor") : t("list_property")}
            onClick={onVendor}
            variant="accent"
          />
        </li>

        <Divider />

        <li role="none">
          <MenuItem icon={<UserIcon />}     label={t("profile")}       href={`${base}/profile`}       onClick={onClose} />
        </li>
        <li role="none">
          <MenuItem icon={<FolderIcon />}   label={t("collections")}   href={`${base}/collections`}   onClick={onClose} />
        </li>
        <li role="none">
          <MenuItem icon={<CompareIcon />}  label={t("compare")}       href={`${base}/compare`}       onClick={onClose} />
        </li>
        <li role="none">
          <MenuItem icon={<CalendarIcon />} label={t("bookings")}      href={`${base}/bookings`}      onClick={onClose} />
        </li>
        <li role="none">
          <MenuItem icon={<BellIcon />}     label={t("notifications")} href={`${base}/notifications`} onClick={onClose} />
        </li>
        <li role="none">
          <MenuItem icon={<MessageIcon />}  label={t("messages")}      href={`${base}/messages`}      onClick={onClose} />
        </li>

        <Divider />

        <li role="none">
          <MenuItem icon={<GlobeIcon />}  label={t("region_language")} onClick={onRegion} />
        </li>

        <Divider />

        <li role="none">
          <MenuItem icon={<LogoutIcon />} label={t("logout")} onClick={onLogout} variant="danger" />
        </li>
      </ul>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MENU PRIMITIVES
───────────────────────────────────────────────────────────────────── */
function MenuItem({ icon, label, href, onClick, variant }) {
  const variantClasses = {
    default: "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60",
    accent:  "text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-50/60 dark:hover:bg-violet-950/30",
    danger:  "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
  };
  const iconVariant = {
    default: "shrink-0 text-gray-400 dark:text-gray-500",
    accent:  "shrink-0 text-violet-500 dark:text-violet-400",
    danger:  "shrink-0 text-red-500 dark:text-red-400",
  };

  const cls = [
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500",
    variantClasses[variant ?? "default"],
  ].join(" ");

  const content = (
    <>
      <span className={iconVariant[variant ?? "default"]} aria-hidden="true">{icon}</span>
      {label}
    </>
  );

  return href ? (
    <Link href={href} role="menuitem" onClick={onClick} className={cls}>{content}</Link>
  ) : (
    <button type="button" role="menuitem" onClick={onClick} className={cls}>{content}</button>
  );
}

function Divider() {
  return <li role="none" className="my-1.5 h-px bg-gray-100 dark:bg-gray-800 mx-3" aria-hidden="true" />;
}

/* ─────────────────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────────────────── */
const iconProps = {
  width: "16", height: "16", viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
  "aria-hidden": "true",
};

function BuildingIcon() {
  return <svg {...iconProps}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
}
function StoreIcon() {
  return <svg {...iconProps}><path d="M3 9l1-5h16l1 5" /><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" /><path d="M5 21V11" /><path d="M19 21V11" /><rect x="9" y="14" width="6" height="7" /></svg>;
}
function GlobeIcon() {
  return <svg {...iconProps}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
function LoginIcon() {
  return <svg {...iconProps}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
}
// Matches lucide-react's "Folder" glyph — same icon used for Collections
// throughout the /collections page (tabs, overview card, empty state), so
// the nav entry that links there carries the same visual language instead
// of the leftover heart icon from when this was "Wishlist".
function FolderIcon() {
  return <svg {...iconProps}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
}
function CompareIcon() {
  return <svg {...iconProps}><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><line x1="12" y1="3" x2="12" y2="21" /></svg>;
}
function CalendarIcon() {
  return <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function BellIcon() {
  return <svg {...iconProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function MessageIcon() {
  return <svg {...iconProps}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
}
function UserIcon() {
  return <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function LogoutIcon() {
  return <svg {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function PersonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
