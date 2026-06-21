"use client";

/* ══════════════════════════════════════════════════════════════════
   FILTERED LIST WORKSPACE
   Shared by Save Draft / Quotation / Historical tabs.

   Props:
     workflowState — DRAFT | QUOTATION | HISTORICAL
     emptyTabKey   — key into t("tabs.*") and t("empty.*")
══════════════════════════════════════════════════════════════════ */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, X, LayoutGrid, AlignJustify } from "lucide-react";
import GlobalModal from "../../components/GlobalModal";
import { MOCK } from "../_data";
import {
  ReservationCard,
  CompactTable,
  EmptyState,
  Pagination,
  DetailModal,
  defaultActionHandler,
} from "../_components";

import HistoricalUploadModal from "../HistoricalUploadModal";
import {
  all_other_reserve,
  historical_reserve,
  historical_upload,
 
} from "@/services/booking.service";

const ITEMS_PER_PAGE = 9;

export default function FilteredListWorkspace({ workflowState, emptyTabKey }) {
  const t = useTranslations("vendor.reservations");
  const tA = useTranslations("vendor.reservations.actions");

  const [search, setSearch] = useState("");
  const [view, setView] = useState("compact");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [reserve, setReserve] = useState([]);

  const [otherreserve, setOtherReserve] = useState([]);

  const [uploadOpen, setUploadOpen] = useState(false);

  const handleView = useCallback((item) => setDetail(item), []);
  const handleAction = useCallback(
    (item, key) => defaultActionHandler(item, key),
    [],
  );

  /* Filter by workflowState first, then apply search */
  const allItems = useMemo(() => {
    if (workflowState === "HISTORICAL") {
      return otherreserve;
    }

    return otherreserve.filter((item) => item.workflowState === workflowState);
  }, [otherreserve, workflowState]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.trim().toLowerCase();
    return allItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.venue.toLowerCase().includes(q) ||
        i.refNo.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const viewOptions = [
    { key: "compact", Icon: AlignJustify, label: t("views.compact") },
    { key: "grid", Icon: LayoutGrid, label: t("views.card") },
  ];

  const handleUpload = async (data) => {
const d = JSON.stringify({ data })
   const res =  await historical_upload(d);
    // const res = await fetch("/api/historical/upload", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ data }),
    // });

    return res.json();
  };

  const load = async () => {
    try {
      let res;

      switch (workflowState) {
        case "HISTORICAL":
          res = await historical_reserve();
          break;

        default:
          res = await all_other_reserve();
          break;
      }

      console.log("API Response:", res);

      const bookings = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      setOtherReserve(bookings);

     
    } catch (err) {
      console.error("Load reservations failed:", err);
      setOtherReserve([]);
    }
  };
  useEffect(() => {
    load();
  }, [workflowState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      {/* ── Workspace header ──────────────────────────────── */}
      <div className="pb-1 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {t(`tabs.${emptyTabKey}`)}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {allItems.length} {t("results")}
            </p>
          </div>
          {/* Record badge */}
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* ── Toolbar — matches Team Management style ────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X
                size={13}
                className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
              />
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-[12px] text-gray-400 dark:text-gray-500 hidden sm:block shrink-0">
          {t("showing")} {paginatedItems.length} {t("of")} {filtered.length}{" "}
          {t("results")}
        </p>

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

      {workflowState === "HISTORICAL" && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Historical Reservations</h2>
            <p className="text-sm text-gray-500">
              Import historical bookings from Excel.
            </p>
          </div>

          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
          >
            Upload Excel
          </button>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {paginatedItems.length === 0 ? (
          <EmptyState key="empty" t={t} tabKey={emptyTabKey} />
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
              <ReservationCard
                key={item.id}
                item={item}
                t={t}
                tA={tA}
                onView={handleView}
                onAction={handleAction}
              />
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
            <CompactTable
              items={paginatedItems}
              t={t}
              tA={tA}
              onView={handleView}
              onAction={handleAction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Detail Modal */}
      <GlobalModal open={!!detail} onClose={() => setDetail(null)}>
        <DetailModal item={detail} t={t} onClose={() => setDetail(null)} />
      </GlobalModal>

      <HistoricalUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </motion.div>
  );
}
