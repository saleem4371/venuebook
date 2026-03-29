"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import ResponsiveSummaryCards from "../components/ResponsiveSummaryCards";
import RemindersScroll from "../components/RemindersScroll";
import DashboardCards from "../components/DashboardCards";
import KYCModal from "../components/KYCModal";
import { UserCheck, Home } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";

export default function Dashboard() {
  const [openKYC, setOpenKYC] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

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

 const backtoDashboard = () => {


  if (!params?.locale || !params?.country) return; // safety check
  // Replace /locale with /country in the path
  const newPath = pathname.replace(`/${params.country}`, `/${params.locale}`);

  router.push(newPath);
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        {/* Left Button */}
        <button
          onClick={() => setOpenKYC(true)}
          className="cursor-pointer flex items-center justify-center px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg 
               hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          {/* Mobile Icon */}
          <UserCheck className="w-5 h-5 md:hidden" />
          {/* Desktop Text */}
          <span className="hidden md:block">Verification Pending</span>
        </button>

        <h2 className="md:hidden"> WELCOME TO APP </h2>

        {/* Right Button */}
        <button
          onClick={() => backtoDashboard()}
          className="cursor-pointer flex items-center justify-center px-5 py-2 rounded-lg bg-white/20 backdrop-blur-lg border border-white/30 text-gray-800 font-semibold shadow-md 
               hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          {/* Mobile Icon */}
          <Home className="w-5 h-5 md:hidden" />
          {/* Desktop Text */}
          <span className="hidden md:block">Switch to Dashboard</span>
        </button>
      </div>

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

      <DashboardCards agingData={agingData} bookings={bookings} />

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
