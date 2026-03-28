"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const bookingsData = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@mail.com`,
  phone: `98765432${i + 1}`,
  venue: `Venue ${i % 5 + 1}`,
  date: `2026-03-${(i % 28) + 1}`,
  status: ["CONFIRMED", "PENDING", "CANCELLED"][i % 3],
}));

export default function BookingList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [view, setView] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);

  const itemsPerPage = 9;

  const filteredBookings = useMemo(() => {
    return bookingsData.filter((b) => {
      const matchesStatus =
        statusFilter === "ALL" || b.status === statusFilter;

      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginatedBookings = filteredBookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">

      <Toaster position="top-right" />

      {/* HEADER */}
     <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar">

  {/* SEARCH */}
  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border min-w-[180px]">
    <Search size={16} className="text-gray-400" />
    <input
      className="w-full outline-none text-sm"
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* FILTER */}
  <>
  <div className="flex  bg-gray-100 p-1 rounded-xl shrink-0">
    {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
      <button
        key={status}
        onClick={() => setStatusFilter(status)}
        className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition ${
          statusFilter === status
            ? "bg-white shadow text-indigo-600"
            : "text-gray-500"
        }`}
      >
        {status}
      </button>
    ))}
  </div>

  {/* VIEW TOGGLE */}
  <div className="flex bg-gray-200 p-1 rounded-xl shrink-0">
    <button
      onClick={() => setView("grid")}
      className={`p-2 rounded-lg ${
        view === "grid" ? "bg-white shadow" : ""
      }`}
    >
      <LayoutGrid size={16} />
    </button>

    <button
      onClick={() => setView("list")}
      className={`p-2 rounded-lg ${
        view === "list" ? "bg-white shadow" : ""
      }`}
    >
      <List size={16} />
    </button>
  </div>
  </>

</div>

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

          {paginatedBookings.map((booking) => (
            <motion.div
              key={booking.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition p-5"
            >
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold">{booking.name}</h3>
                <StatusBadge status={booking.status} />
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>{booking.email}</p>
                <p>{booking.phone}</p>
                <p>{booking.venue}</p>
                <p>{booking.date}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toast.success("Edit clicked")}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => toast.error("Deleted")}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {paginatedBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-b-gray-200 hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <h3 className="font-medium">{booking.name}</h3>
                <p className="text-sm text-gray-500">
                  {booking.email} • {booking.phone}
                </p>
              </div>

              <div className="flex-1 text-sm text-gray-500">
                {booking.venue}
              </div>

              <div className="flex-1 text-sm text-gray-500">
                {booking.date}
              </div>

              <div className="flex items-center gap-3 mt-2 md:mt-0">
                <StatusBadge status={booking.status} />

                <button onClick={() => toast.success("Edit")}>
                  <Edit size={16} />
                </button>

                <button onClick={() => toast.error("Delete")}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-2">

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              page === i + 1
                ? "bg-indigo-600 text-white"
                : "bg-white border"
            }`}
          >
            {i + 1}
          </button>
        ))}

      </div>
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: "bg-green-100 text-green-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}