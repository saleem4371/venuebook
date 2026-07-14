"use client";

/**
 * /app/[locale]/[country]/profile/components/ProfileHeader.jsx
 *
 * Hero profile card. Reads real fields from useAuth().user (name, email,
 * avatar are the only fields the /auth/me response is confirmed to return
 * anywhere else in this app — see UserDropdown.jsx / vendor Navbar.jsx).
 * Phone, verification status and join date are NOT confirmed on the user
 * object, so they render conditionally and never fall back to fake values —
 * their absence instead drives the Profile Completion suggestions, which is
 * the honest behavior until the backend adds those fields.
 */

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Camera, Pencil, Phone, Mail, Sparkles } from "lucide-react";

import { ProgressBar } from "./shared/ui";
import { MOCK_BOOKINGS, CATEGORY_COLORS } from "../data/mockProfileData";

function initialsOf(name) {
  if (!name) return "VB";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase() || "VB";
}

function avatarTone(name) {
  const palette = ["#7C3AED", "#2563EB", "#16A34A", "#DB2777", "#EA580C", "#0EA5E9"];
  if (!name) return palette[0];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function mostRecentBooking() {
  return [...MOCK_BOOKINGS].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function preferredCategory() {
  const counts = {};
  MOCK_BOOKINGS.forEach((b) => {
    counts[b.category] = (counts[b.category] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top?.[0];
}

export default function ProfileHeader({ user }) {
  const t = useTranslations("profile.header");
  const tCat = useTranslations("card.badge");
  const [hovering, setHovering] = useState(false);

  const hasAvatar = Boolean(user?.avatar);
  const hasPhone = Boolean(user?.phone);
  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);
  const joinedRaw = user?.createdAt || user?.created_at || user?.joinedAt;
  const joinedYear = joinedRaw && !Number.isNaN(new Date(joinedRaw).getTime())
    ? new Date(joinedRaw).getFullYear()
    : null;

  const lastBooking = useMemo(() => mostRecentBooking(), []);
  const topCategory = useMemo(() => preferredCategory(), []);

  const completion = useMemo(() => {
    const checks = [Boolean(user?.name), Boolean(user?.email), hasAvatar, hasPhone, isVerified];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [user, hasAvatar, hasPhone, isVerified]);

  const suggestions = [
    !hasPhone && { key: "addPhone", Icon: Phone },
    !isVerified && { key: "verifyEmail", Icon: Mail },
    !hasAvatar && { key: "addPhoto", Icon: Camera },
  ].filter(Boolean);

  const tone = avatarTone(user?.name);

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* IDENTITY */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="relative shrink-0 group"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {hasAvatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white dark:border-gray-800 shadow-md"
                style={{ backgroundColor: tone }}
              >
                {initialsOf(user?.name)}
              </div>
            )}

            {/* Edit overlay on hover — micro-interaction from spec */}
            <a
              href="#personal-information"
              className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                hovering ? "opacity-100" : "opacity-0"
              }`}
              aria-label={t("editProfile")}
            >
              <Pencil size={20} className="text-white" />
            </a>

            {isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                <CheckCircle2 size={15} className="text-violet-600 fill-violet-100 dark:fill-violet-900/40" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[17px] sm:text-[19px] font-bold text-gray-900 dark:text-gray-50 truncate">
                {user?.name || "—"}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10.5px] font-semibold">
                  <CheckCircle2 size={11} />
                  {t("verified")}
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user?.email}</p>
            {hasPhone && (
              <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5">{user.phone}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              {joinedYear && <span>{t("customerSince", { year: joinedYear })}</span>}
              {lastBooking && (
                <span>
                  {t("lastBooking", {
                    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                      new Date(lastBooking.date),
                    ),
                  })}
                </span>
              )}
              {topCategory && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[topCategory] }}
                  />
                  {t("preferredCategory", { category: tCat(topCategory.replace(/s$/, "")) })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* EDIT CTA */}
        <a
          href="#personal-information"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[12.5px] font-semibold shadow-sm transition-all duration-200 active:scale-[0.97] shrink-0"
        >
          <Pencil size={13} />
          {t("editProfile")}
        </a>
      </div>

      {/* PROFILE COMPLETION */}
      <div className="mt-3.5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1.5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-gray-700 dark:text-gray-300">
            <Sparkles size={12} className="text-violet-600" />
            {t("completionTitle")}
          </p>
          <span className="text-[11.5px] font-bold text-violet-600">{t("completion", { percent: completion })}</span>
        </div>
        <ProgressBar percent={completion} height="h-1.5" />

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {suggestions.map(({ key, Icon }) => (
              <a
                key={key}
                href="#personal-information"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-[11px] font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
              >
                <Icon size={12} />
                {t(`suggestions.${key}`)}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
