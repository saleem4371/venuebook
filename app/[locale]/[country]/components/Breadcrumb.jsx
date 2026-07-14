"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb
 *
 * Reusable trail used on the estate (parent) public page and on child
 * listing pages so a visitor can always retrace: Home → Category →
 * Estate → Listing.
 *
 * items: [{ label, href }]  — href omitted (or null) on the last/current
 * crumb since it isn't a link.
 */
export default function Breadcrumb({ items = [], className = "" }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs sm:text-sm ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5 shrink-0">
            {i === 0 ? (
              <Home size={12} className="text-gray-400 dark:text-gray-500 shrink-0" strokeWidth={2} />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-semibold text-gray-900 dark:text-white"
                    : "font-medium text-gray-500 dark:text-gray-400"
                }
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight size={12} className="text-gray-300 dark:text-gray-700 shrink-0" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
