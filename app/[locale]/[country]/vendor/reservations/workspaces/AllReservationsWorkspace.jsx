"use client";

/* ══════════════════════════════════════════════════════════════════
   ALL RESERVATIONS WORKSPACE
   Stats · 6 status tabs · Team-style toolbar (search / reactive
   filter panel / view toggle) · 4-col grid · compact list
══════════════════════════════════════════════════════════════════ */

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Search, X, Filter, LayoutGrid, List, Calendar,
  Inbox, Sparkles, Clock, CheckCircle2, Bookmark,
  XCircle, Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import GlobalModal from "../../components/GlobalModal";
import ScrollableTabBar from "../../components/ScrollableTabBar";
import { MOCK } from "../_data";
import {
  StatCard, ReservationCard, CompactTable,
  EmptyState, Pagination,
  DetailModal, defaultActionHandler,
} from "../_components";

/* ═══════════════════════════════════════════════════════════════
   DATE FILTER PILL — custom-styled, no browser chrome
   Clicking anywhere on the pill opens the native date picker.
═══════════════════════════════════════════════════════════════ */
function DateFilterPill({ label, value, onChange }) {
  const ref = useRef(null);
  const formatted = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.showPicker?.()}
      onKeyDown={(e) => e.key === "Enter" && ref.current?.showPicker?.()}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shadow-sm cursor-pointer select-none",
        value
          ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/40"
          : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10",
      ].join(" ")}
    >
      <Calendar
        size={12}
        className={`shrink-0 ${value ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-medium whitespace-nowrap ${value ? "text-violet-700 dark:text-violet-300" : "text-gray-500 dark:text-gray-400"}`}>
        {formatted ?? label}
      </span>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          className="ml-0.5 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
          aria-label="Clear date"
        >
          <X size={10} />
        </button>
      )}
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-label={label}
      />
    </div>
  );
}

const ITEMS_PER_PAGE = 12;

/* ── Unique option helpers ─────────────────────────────────── */
const VENUES      = [...new Set(MOCK.map((i) => i.venue))].sort();
const EVENT_TYPES = [...new Set(MOCK.map((i) => i.eventType))].sort();
const SOURCES     = [...new Set(MOCK.map((i) => i.source))].sort();
const STAFF_LIST  = [...new Set(MOCK.map((i) => i.assignedStaff).filter(Boolean))].sort();

/* ── Empty filter state ────────────────────────────────────── */
const EMPTY_FILTERS = {
  payment: "", eventType: "", venue: "", source: "", staff: "",
  bookedDate: "", eventDate: "",
};

/* ── Tab config ─────────────────────────────────────────────── */
function buildTabs(t, items) {
  const c = (fn) => items.filter(fn).length;
  return [
    { key: "all",       label: t("tabs.all"),       icon: Inbox,        count: items.length },
    { key: "leads",     label: t("tabs.leads"),     icon: Sparkles,     count: c((i) => i.type === "lead") },
    { key: "pending",   label: t("tabs.pending"),   icon: Clock,        count: c((i) => i.workflowState === "PENDING" || i.workflowState === "IN_PROGRESS") },
    { key: "confirmed", label: t("tabs.confirmed"), icon: CheckCircle2, count: c((i) => i.workflowState === "CONFIRMED") },
    { key: "reserved",  label: t("tabs.reserved"),  icon: Bookmark,     count: c((i) => i.workflowState === "RESERVED") },
    { key: "cancelled", label: t("tabs.cancelled"), icon: XCircle,      count: c((i) => i.workflowState === "CANCELLED") },
  ];
}

/* ── Filter logic ───────────────────────────────────────────── */
function applyFilters(items, { tab, search, payment, eventType, venue, source, staff, bookedDate, eventDate }) {
  let r = items;
  if (tab === "leads")     r = r.filter((i) => i.type === "lead");
  if (tab === "pending")   r = r.filter((i) => i.workflowState === "PENDING" || i.workflowState === "IN_PROGRESS");
  if (tab === "confirmed") r = r.filter((i) => i.workflowState === "CONFIRMED");
  if (tab === "reserved")  r = r.filter((i) => i.workflowState === "RESERVED");
  if (tab === "cancelled") r = r.filter((i) => i.workflowState === "CANCELLED");
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    r = r.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.venue.toLowerCase().includes(q) ||
      i.refNo.toLowerCase().includes(q) ||
      i.phone.includes(q)
    );
  }
  if (payment)    r = r.filter((i) => i.paymentStatus === payment);
  if (eventType)  r = r.filter((i) => i.eventType === eventType);
  if (venue)      r = r.filter((i) => i.venue === venue);
  if (source)     r = r.filter((i) => i.source === source);
  if (staff)      r = r.filter((i) => i.assignedStaff === staff);
  if (bookedDate) r = r.filter((i) => new Date(i.orderDate) >= new Date(bookedDate));
  if (eventDate)  r = r.filter((i) => new Date(i.eventDate) >= new Date(eventDate));
  return r;
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export default function AllReservationsWorkspace() {
  const t  = useTranslations("vendor.reservations");
  const tA = useTranslations("vendor.reservations.actions");

  const [activeTab,   setActiveTab]   = useState("all");
  const [search,      setSearch]      = useState("");
  const [view,        setView]        = useState("grid");
  const [page,        setPage]        = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailItem,  setDetailItem]  = useState(null);
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);

  /* Reactive filter setter — auto-resets page on change */
  const setFilter = useCallback((k, v) => {
    setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const handleTab    = useCallback((k) => { setActiveTab(k); setPage(1); }, []);
  const handleView   = useCallback((item) => setDetailItem(item), []);
  const handleAction = useCallback((item, key) => defaultActionHandler(item, key), []);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const tabs  = useMemo(() => buildTabs(t, MOCK), [t]);
  const items = useMemo(
    () => applyFilters(MOCK, { tab: activeTab, search, ...filters }),
    [activeTab, search, filters],
  );

  const totalPages     = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const confirmed = MOCK.filter((i) => i.workflowState === "CONFIRMED");
    const revenue   = confirmed.reduce((s, i) => s + i.amountNum, 0);
    const revStr    = revenue >= 10000000 ? `${(revenue / 10000000).toFixed(2)} Cr` : `${(revenue / 100000).toFixed(1)} L`;
    return {
      total:     MOCK.length,
      leads:     MOCK.filter((i) => i.type === "lead").length,
      pending:   MOCK.filter((i) => ["PENDING", "IN_PROGRESS"].includes(i.workflowState)).length,
      confirmed: confirmed.length,
      reserved:  MOCK.filter((i) => i.workflowState === "RESERVED").length,
      revenue:   `₹${revStr}`,
    };
  }, []);

  const viewOptions = [
    { key: "grid",    Icon: LayoutGrid,    label: t("views.card")    },
    { key: "compact", Icon: List,  label: t("views.compact") },
  ];

  /* Select pill shared class */
  const selectCls = "px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 focus:outline-none shadow-sm focus:ring-2 focus:ring-violet-500/20 transition-all";

  return (
    <div className="space-y-5">

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={t("stats.total")}     value={stats.total}     icon={Inbox}        color="purple"  />
        <StatCard label={t("stats.newLeads")}  value={stats.leads}     icon={Sparkles}     color="blue"    />
        <StatCard label={t("stats.pending")}   value={stats.pending}   icon={Clock}        color="amber"   />
        <StatCard label={t("stats.confirmed")} value={stats.confirmed} icon={CheckCircle2} color="emerald" />
        <StatCard label={t("stats.reserved")}  value={stats.reserved}  icon={Bookmark}     color="slate"   />
        <StatCard label={t("stats.revenue")}   value={stats.revenue}   icon={Banknote}     color="rose"    />
      </div>

      {/* ── Status tabs — scrollable with overflow indicators ── */}
      <ScrollableTabBar
        tabs={tabs}
        active={activeTab}
        onChange={handleTab}
      />

      {/* ── Toolbar ────────────────────────────────────────── */}
      {/*
        Mobile:  Row 1 = [Search ────────────── ×]
                 Row 2 = [Filters ▾ ●] [Grid|Compact]
        sm+:     Single row: [Search ──────── ×] [Filters ▾ ●] [Grid|Compact]
      */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">

        {/* Row 1: Search */}
        <div className="flex items-center flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors" />
              </button>
            )}
          </div>

          {/* Filters + View toggle — inline with search on mobile */}
          <div className="flex items-center gap-2 shrink-0 sm:hidden">
            {/* Filters button */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all",
                filtersOpen
                  ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300"
                  : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200",
              ].join(" ")}
              aria-label={t("filters.advanced")}
            >
              <Filter size={14} aria-hidden="true" />
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-violet-500" />}
            </button>

            {/* View toggle */}
            <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
              {viewOptions.map(({ key, Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  title={label}
                  className={[
                    "p-2 rounded-lg transition-colors",
                    view === key
                      ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                  ].join(" ")}
                >
                  <Icon size={14} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* sm+: Filters + View toggle follow search */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Filters button */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={[
              "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all",
              filtersOpen
                ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300"
                : "bg-white dark:bg-gray-900/80 border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-200",
            ].join(" ")}
          >
            <Filter size={14} aria-hidden="true" />
            {t("filters.advanced")}
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-violet-500" />}
          </button>

          {/* View toggle */}
          <div className="inline-flex items-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900/80 shadow-sm p-1 gap-0.5">
            {viewOptions.map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                title={label}
                className={[
                  "p-2 rounded-lg transition-colors",
                  view === key
                    ? "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                ].join(" ")}
              >
                <Icon size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Advanced Filter Panel — Teams-style reactive ─────── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-1 pb-1">

              {/* Event type */}
              <select value={filters.eventType} onChange={(e) => setFilter("eventType", e.target.value)} className={selectCls}>
                <option value="">{t("filters.eventAll")}</option>
                {EVENT_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
              </select>

              {/* Payment status */}
              <select value={filters.payment} onChange={(e) => setFilter("payment", e.target.value)} className={selectCls}>
                <option value="">{t("filters.paymentAll")}</option>
                {["Paid", "Partial", "Pending", "Refunded"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Venue */}
              <select value={filters.venue} onChange={(e) => setFilter("venue", e.target.value)} className={selectCls}>
                <option value="">{t("filters.venueAll")}</option>
                {VENUES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>

              {/* Source */}
              <select value={filters.source} onChange={(e) => setFilter("source", e.target.value)} className={selectCls}>
                <option value="">{t("filters.sourceAll")}</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Staff */}
              <select value={filters.staff} onChange={(e) => setFilter("staff", e.target.value)} className={selectCls}>
                <option value="">{t("filters.staffAll")}</option>
                {STAFF_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Booked Date — custom pill */}
              <DateFilterPill
                label={t("filters.bookedDate")}
                value={filters.bookedDate}
                onChange={(v) => setFilter("bookedDate", v)}
              />

              {/* Event Date — custom pill */}
              <DateFilterPill
                label={t("filters.eventDate")}
                value={filters.eventDate}
                onChange={(v) => setFilter("eventDate", v)}
              />

              {/* Clear — only when filters active */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/40"
                >
                  <X size={10} aria-hidden="true" />
                  {t("filters.clear")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {paginatedItems.length === 0 ? (
          <EmptyState key="empty" t={t} tabKey={activeTab} />
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {paginatedItems.map((item) => (
              <ReservationCard key={item.id} item={item} t={t} tA={tA} onView={handleView} onAction={handleAction} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CompactTable items={paginatedItems} t={t} tA={tA} onView={handleView} onAction={handleAction} />
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Detail Modal */}
      <GlobalModal open={!!detailItem} onClose={() => setDetailItem(null)}>
        <DetailModal item={detailItem} t={t} onClose={() => setDetailItem(null)} />
      </GlobalModal>
    </div>
  );
}
