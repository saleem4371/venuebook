"use client";

import { useRef, useEffect , useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useDropdown } from "@/context/DropdownContext";
import { useAuth }     from "@/context/AuthContext";
import { useUI }       from "@/context/UIContext";
import LogoutConfirmationModal from "@/components/shared/LogoutConfirmationModal";

/* ------------------------------------------------------------------ */
/*  Avatar color palette — one stable color per first letter            */
/* ------------------------------------------------------------------ */

const AVATAR_PALETTE = [
  "bg-blue-500",    // A
  "bg-violet-500",  // B
  "bg-emerald-500", // C
  "bg-orange-500",  // D
  "bg-rose-500",    // E
  "bg-cyan-500",    // F
  "bg-amber-500",   // G
  "bg-pink-500",    // H
  "bg-teal-500",    // I
  "bg-indigo-500",  // J
];

function getAvatarBg(name) {
  if (!name) return "bg-violet-500";
  const code = name.trim().toUpperCase().charCodeAt(0);
  const idx = Math.max(0, (code - 65) % AVATAR_PALETTE.length);
  return AVATAR_PALETTE[idx];
}

/* ------------------------------------------------------------------ */
/*  UserDropdown                                                        */
/* ------------------------------------------------------------------ */

export default function UserDropdown({ onOpenRegionModal }) {
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();
  const { user, isLoggedIn, isListed, logout }     = useAuth();
  const { setLoginOpen }                           = useUI();
  const params                                     = useParams();
  const router                                     = useRouter();
  const wrapRef                                    = useRef(null);

  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  
  const isOpen  = openDropdown === "user";

  const [confirmLogout, setConfirmLogout] = useState(false);

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, closeAll]);

  /* ---------- Avatar initials ---------- */
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ---------- Handlers ---------- */
  const handleLogin = () => { closeAll(); setLoginOpen(true); };
  const handleLogout = () => { closeAll(); logout(); };
  const handleVendor = () => {
    closeAll();
    /* Logged-in hosts who are already listed → vendor dashboard
       Everyone else → the "List Your Property" landing page first  */
    const dest = isLoggedIn && isListed
      ? `/${locale}/${country}/vendor/dashboard`
      : `/${locale}/${country}/list`;
    router.push(dest);
  };
  const handleRegion = () => { closeAll(); onOpenRegionModal?.(); };

  const handleLogoutClick = () => {
  closeAll();
  setConfirmLogout(true);
};

const confirmLogoutAction = async () => {
  setConfirmLogout(false);
  await logout();
  // Replace so the current page isn't in back-history after logout,
  // then refresh to flush Next.js router cache and re-render server components.
  router.replace(`/${locale}/${country}/home`);
  router.refresh();
};

  return (
    <div className="relative" ref={wrapRef}>

      {/* ── Avatar trigger — 40×40, no border ───────────── */}
      <button
        type="button"
        onClick={() => toggleDropdown("user")}
        aria-label="Open account menu"
        aria-expanded={isOpen}
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
            <img
              src={user.avatar}
              alt={user.name ?? "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="select-none text-sm font-semibold text-white" aria-hidden="true">
              {initials}
            </span>
          )
        ) : (
          <PersonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* ── Dropdown panel ───────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: -6  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute end-0 mt-6 w-64",
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Before-login menu                                                   */
/* ------------------------------------------------------------------ */

function LoggedOutMenu({ onLogin, onVendor, onRegion }) {
  const t = useTranslations("header");

  return (
    <nav aria-label="Guest menu">
      <ul className="py-1.5" role="none">
        <li role="none">
          <MenuItem
            icon={<BuildingIcon />}
            label={t("list_property")}
            onClick={onVendor}
          />
        </li>
        <li role="none">
          <MenuItem
            icon={<GlobeIcon />}
            label={t("region_language")}
            onClick={onRegion}
          />
        </li>

        <Divider />

        <li role="none">
          <MenuItem
            icon={<LoginIcon />}
            label={t("login_signup")}
            onClick={onLogin}
            variant="accent"
          />
        </li>
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  After-login menu                                                    */
/* ------------------------------------------------------------------ */

function LoggedInMenu({ user, isListed, locale, country, onClose, onLogout, onVendor, onRegion }) {
  const t    = useTranslations("header");
  const base = `/${locale}/${country}`;

  /* Mini-avatar initials (same logic as trigger) */
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav aria-label="User menu">
      {/* ── Account header: mini avatar + name + email ── */}
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

        {/* Profile — first in nav links */}
        <li role="none">
          <MenuItem
            icon={<UserIcon />}
            label={t("profile")}
            href={`${base}/profile`}
            onClick={onClose}
          />
        </li>
        <li role="none">
          <MenuItem
            icon={<HeartIcon />}
            label={t("wishlist")}
            href={`${base}/wishlist`}
            onClick={onClose}
          />
        </li>
        <li role="none">
          <MenuItem
            icon={<CompareIcon />}
            label={t("compare")}
            href={`${base}/compare`}
            onClick={onClose}
          />
        </li>
        <li role="none">
          <MenuItem
            icon={<CalendarIcon />}
            label={t("bookings")}
            href={`${base}/bookings`}
            onClick={onClose}
          />
        </li>
        <li role="none">
          <MenuItem
            icon={<BellIcon />}
            label={t("notifications")}
            href={`${base}/notifications`}
            onClick={onClose}
          />
        </li>

        <Divider />

        {/* Region & Language */}
        <li role="none">
          <MenuItem
            icon={<GlobeIcon />}
            label={t("region_language")}
            onClick={onRegion}
          />
        </li>

        <Divider />

        <li role="none">
          <MenuItem
            icon={<LogoutIcon />}
            label={t("logout")}
            onClick={onLogout}
            variant="danger"
          />
        </li>
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared menu primitives                                              */
/* ------------------------------------------------------------------ */

function MenuItem({ icon, label, href, onClick, variant }) {
  const base = [
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500",
  ];

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

  const cls = [...base, variantClasses[variant ?? "default"]].join(" ");
  const ico = iconVariant[variant ?? "default"];

  const content = (
    <>
      <span className={ico} aria-hidden="true">{icon}</span>
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" onClick={onClick} className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

function Divider() {
  return (
    <li role="none" className="my-1.5 h-px bg-gray-100 dark:bg-gray-800 mx-3" aria-hidden="true" />
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                    */
/* ------------------------------------------------------------------ */

const iconProps = {
  width: "16", height: "16", viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
  "aria-hidden": "true",
};

function BuildingIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" />
      <path d="M5 21V11" />
      <path d="M19 21V11" />
      <rect x="9" y="14" width="6" height="7" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg {...iconProps}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function PersonIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
