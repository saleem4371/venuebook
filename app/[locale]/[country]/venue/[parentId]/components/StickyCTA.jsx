"use client";

import { Phone, MessageCircle, CalendarCheck, BadgeCheck } from "lucide-react";

/**
 * Desktop: sticky bar. Mobile: fixed bottom bar.
 * z-40 mirrors the mobile-bottom-bar convention already used on the
 * child listing page (search/[type]/[id]/page.jsx z-index reference).
 */
export default function StickyCTA({ estate, onViewAvailability }) {
  const whatsapp = estate.social?.whatsapp?.replace(/[^\d]/g, "");

  return (
    <>
      {/* Desktop — fixed floating cluster, bottom-right, so it never collides with
          the sticky unified search bar under the header */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-[35] items-center gap-4 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {estate.logoInitial}
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{estate.name}</p>
          {estate.verified && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {estate.contact?.estateOffice && (
            <a href={`tel:${estate.contact.estateOffice}`} className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
              <Phone size={13} /> Call
            </a>
          )}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors">
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
          <button
            onClick={onViewAvailability}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
          >
            <CalendarCheck size={13} /> View Availability
          </button>
          <button
            onClick={onViewAvailability}
            className="h-9 px-5 rounded-xl text-xs font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)] hover:brightness-110 shadow-sm transition-all"
          >
            Book
          </button>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[40] flex items-stretch bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {estate.contact?.estateOffice && (
          <a href={`tel:${estate.contact.estateOffice}`} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-gray-600 dark:text-gray-300">
            <Phone size={16} />
            <span className="text-[10px] font-medium">Call</span>
          </a>
        )}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-emerald-600 dark:text-emerald-400">
            <MessageCircle size={16} />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>
        )}
        <button onClick={onViewAvailability} className="flex-[1.6] flex items-center justify-center gap-1.5 m-2 rounded-xl text-sm font-semibold text-white bg-[linear-gradient(242deg,#a44bf3,#499ce8)]">
          <CalendarCheck size={15} /> Book
        </button>
      </div>
    </>
  );
}
