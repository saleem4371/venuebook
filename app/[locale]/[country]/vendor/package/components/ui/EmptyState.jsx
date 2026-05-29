"use client";

/**
 * EmptyState — premium zero-state placeholder.
 * Gradient icon container, subtle mesh background, polished CTA.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 py-20 px-6 text-center dark:border-white/[0.06]">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/[0.04] blur-2xl dark:bg-violet-500/[0.07]" />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-sky-500/[0.04] blur-2xl dark:bg-sky-500/[0.06]" />
      </div>

      <div className="relative">
        {/* Icon with gradient container */}
        <div className="relative mx-auto mb-5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg,#a44bf3/15,#499ce8/15)", backgroundColor: "rgba(164,75,243,0.08)" }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{ background: "linear-gradient(135deg,#a44bf3,#499ce8)" }}
            />
            {Icon && (
              <Icon
                size={26}
                className="relative text-violet-500 dark:text-violet-400"
                strokeWidth={1.5}
              />
            )}
          </div>
          {/* Glow behind icon */}
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-20"
            style={{ background: "linear-gradient(135deg,#a44bf3,#499ce8)" }} />
        </div>

        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
          {title}
        </h3>
        <p className="mb-7 max-w-xs text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          >
            {action.icon && <action.icon size={15} />}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
