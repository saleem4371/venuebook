"use client";

import { Instagram, Facebook, Youtube, Globe } from "lucide-react";

/**
 * Lucide's own "X" icon is just a plain thin cross — visually identical
 * to the letter "X" itself, so next to the "X" label it read as a
 * stuttered "X X". This is the actual (solid, angular) X/Twitter
 * wordmark glyph instead, which reads as a proper logo mark next to the
 * label rather than a duplicated letter.
 */
function XLogo({ size = 16, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: Instagram, color: "hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/20 dark:hover:text-pink-400" },
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20 dark:hover:text-blue-400" },
  { key: "youtube", label: "YouTube", Icon: Youtube, color: "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400" },
  { key: "twitter", label: "X", Icon: XLogo, color: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white" },
  { key: "website", label: "Website", Icon: Globe, color: "hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950/20 dark:hover:text-violet-400" },
];

export default function EstateSocialLinks({ estate }) {
  const social = estate.social || {};
  const links = PLATFORMS.filter(({ key }) => social[key]);

  if (links.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {links.map(({ key, label, Icon, color }) => (
          <a
            key={key}
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${color}`}
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
