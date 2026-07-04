"use client";

import { Award } from "lucide-react";

export default function AboutEstate({ estate }) {
  const about = estate.about || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">About {estate.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{about.story}</p>
        {about.vision && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            <span className="font-semibold text-gray-800 dark:text-gray-100">Our vision — </span>
            {about.vision}
          </p>
        )}
      </div>

      {about.timeline?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">History & Milestones</h3>
          <div className="relative pl-5 space-y-5 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-gray-200 dark:before:bg-white/10">
            {about.timeline.map((t) => (
              <div key={t.year} className="relative">
                <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-violet-600" />
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{t.year}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {estate.awards?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
            <Award size={14} /> Awards & Recognition
          </h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {estate.awards.map((a) => (
              <div key={a.title} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <Award size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{a.org} · {a.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {estate.certifications?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {estate.certifications.map((c) => (
            <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
