"use client";

import PageHeader           from "../components/PageHeader";
import KpiCards             from "../components/dashboard/KpiCards";
import OccupancyHeatmap     from "../components/dashboard/OccupancyHeatmap";
import PerformanceAnalytics from "../components/dashboard/PerformanceAnalytics";
import ActionRequired       from "../components/dashboard/ActionRequired";
import OnlineOfflineSummary from "../components/dashboard/OnlineOfflineSummary";
import WalletFinance        from "../components/dashboard/WalletFinance";
import LeadsTracker         from "../components/dashboard/LeadsTracker";

export default function Dashboard() {
  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's your venue performance overview."
      />

      {/* ── Section 1 · KPI Cards ────────────────────────────────────────── */}
      <KpiCards />

      {/* ── Section 2 · 14-day Occupancy Heatmap ────────────────────────── */}
      <OccupancyHeatmap />

      {/* ── Section 3 + 5 · Analytics (2/3) | Action Required (1/3) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PerformanceAnalytics />
        </div>
        <ActionRequired />
      </div>

      {/* ── Section 4 + 6 · Online/Offline (1/2) | Wallet (1/2) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OnlineOfflineSummary />
        <WalletFinance />
      </div>

      {/* ── Section 7 · Leads Pipeline ──────────────────────────────────── */}
      <LeadsTracker />

    </div>
  );
}
