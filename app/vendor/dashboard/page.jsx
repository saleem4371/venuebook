"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import ResponsiveSummaryCards from "../components/ResponsiveSummaryCards";
import RemindersScroll from "../components/RemindersScroll";
import DashboardCards from "../components/DashboardCards";
import KYCModal from "../components/KYCModal";

export default function Dashboard() {

    const [openKYC, setOpenKYC] = useState(false);

  const data = [
    { category: "Bookings", offline: 21, online: 19, total: 40 },
    { category: "Events", offline: 40, online: 40, total: 80 },
    { category: "Security (Hold)", offline: 7, online: 10, total: 17 },
    { category: "Security (Refunded)", offline: 1, online: 1, total: 2 },
    { category: "Reserved", offline: 0, online: 0, total: 0 },
    { category: "Leads", offline: 80, online: 0, total: 80 },
  ];

  const reminders = [
  {
    title: "Event at Swarnagiri Mantap Indoors -4050",
    date: "31-March-2026",
    time: "6:00 PM",
  },
  {
    title: "Event at Swarnagiri Mantap Indoor -2484",
    date: "31-March-2026",
    time: "12:00 PM",
  },
  {
    title: "Event at Swarnagiri Mantap Indoor -2082",
    date: "01-April-2026",
    time: "12:00 PM",
  },
];


const agingData = [
  { label: "Over-Due", percentage: 80 },
  { label: "1-10", percentage: 0 },
  { label: "11-20", percentage: 8 },
  { label: "20+", percentage: 12 },
];

const bookings = [
  { name: "Sylvester", id: 6706, date: "10 Apr 2026", amount: 39616 },
  { name: "Sylvester", id: 2484, date: "31 Mar 2026", amount: 35517 },
  { name: "Sylvester", id: 4050, date: "31 Mar 2026", amount: 39616 },
  { name: "Sylvester", id: 3059, date: "20 Mar 2026", amount: 39616 },
  { name: "Sylvester Miranda", id: 4111, date: "15 Apr 2026", amount: 20478 },
];


  return (
    <div className="space-y-6">
      <button onClick={() => setOpenKYC(true)}>
  Verification Pending
</button>

<KYCModal open={openKYC} setOpen={setOpenKYC} />
      {/* Top Cards */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
        {[
          "Revenue",
          "Users",
          "Bookings",
          "Recognised",
          "Advance",
          "Total Views",
          "Enquiry Clicks",
          "Venues Listed",
        ].map((title, idx) => (
          <Card
            key={idx}
            title={title}
            value={
              title === "Revenue"
                ? "₹1,20,000"
                : title === "Users"
                  ? "1,240"
                  : "320"
            }
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
        <ResponsiveSummaryCards data={data} />
        <RemindersScroll reminders={reminders} />
      </div>

      <DashboardCards  agingData= { agingData } bookings = { bookings }/>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/30 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-md p-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Recent Activity
        </h2>
        <p className="text-gray-700">No recent data</p>
      </motion.div>
    </div>
  );
}
