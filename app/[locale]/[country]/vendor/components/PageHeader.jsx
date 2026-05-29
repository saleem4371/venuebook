"use client";

/**
 * PageHeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal page header — matches the Reservations page master reference.
 * Plain h1 + subtitle, no icon pill, no internal margin.
 * Spacing is handled by the parent wrapper (space-y-5 / space-y-6).
 *
 * Props:
 *   title       string     — primary heading
 *   subtitle    string     — secondary description line (optional)
 *   action      ReactNode  — optional right-side button/element
 *   badge       ReactNode  — small badge beside the title (e.g. unread count)
 */

export default function PageHeader({ title, subtitle, action, badge }) {
  return (
    <div className={action ? "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3" : undefined}>

      {/* Title + badge */}
      <div>
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 leading-tight">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right-side action (optional) */}
      {action && (
        <div className="shrink-0 self-start">
          {action}
        </div>
      )}

    </div>
  );
}
