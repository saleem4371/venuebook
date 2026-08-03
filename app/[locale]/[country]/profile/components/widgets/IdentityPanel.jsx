"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/IdentityPanel.jsx
 *
 * Desktop-only now (lg+, 1024px and up) — page.jsx's mobile branch no
 * longer renders this component at all: below 1024px it used to show
 * just a settings pill (avatar/name/email/tier badge were already
 * dropped in earlier passes), which duplicated the "Account settings"
 * pill GreetingBar's own action row now carries. One pill there replaces
 * both, so there's nothing left for this component to do on mobile.
 * Since page.jsx's isDesktop check already gates which tree renders at
 * all, this no longer needs its own internal responsive split either.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Settings } from "lucide-react";

import { getAvatarColor, getInitials } from "@/lib/avatar";

export default function IdentityPanel({
  user,
  walletPoints = 0,
  onOpenSettings,
  onOpenRewards,
  flat = false,
  bookingCurrent
}) {
  const tIdentity = useTranslations("profile.identity");

  const [hovering, setHovering] = useState(false);

  const hasAvatar = Boolean(user?.avatar);
  const tone = getAvatarColor(user?.name);

  return (
    <div
      className={
        flat
          ? "p-4"
          : "rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4"
      }
    >
      <div className="relative">
        <button
          onClick={onOpenSettings}
          title={tIdentity("settingsTooltip")}
          className="absolute top-0 right-0 w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
        >
          <Settings size={14} />
        </button>

        <div className="flex flex-col items-center pt-1 pb-1">
          <div
            className="relative shrink-0 group"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {hasAvatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-[3px] border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-[26px] font-bold border-[3px] border-white dark:border-gray-800 shadow-md"
                style={{ backgroundColor: tone }}
              >
                {getInitials(user?.name, "VB")}
              </div>
            )}
            <button
              onClick={onOpenSettings}
              title={tIdentity("editTooltip")}
              className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                hovering ? "opacity-100" : "opacity-0"
              }`}
            >
              <Pencil size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
