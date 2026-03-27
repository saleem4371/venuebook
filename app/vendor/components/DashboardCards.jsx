// DashboardChart.jsx
"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Book, AlertCircle } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardChart({ agingData, bookings }) {

  

  const data = {
    labels: agingData.map(d => d.label),
    datasets: [
      {
        label: "Percentage",
        data: agingData.map(d => d.percentage),
        backgroundColor: ["#7f77ff", "#6fcf97", "#f2994a", "#eb5757"],
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: "#fff" } },
      x: { ticks: { color: "#fff" } },
    },
  };

  return (
    <div className="">
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">

        {/* Aging Chart */}
        <div className="bg-white backdrop-blur-md border border-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-green-500 text-white px-4 py-1 rounded-full font-semibold text-sm">
              Aging Report
            </span>
            <span className="text-black text-sm">Based on Days</span>
          </div>
          <div className="h-full">
            <Bar data={data} options={options} />
          </div>
        </div>

        {/* Last Bookings */}
        <div className="bg-white  backdrop-blur-md border border-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 ">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-green-500 text-white px-4 py-1 rounded-full font-semibold text-sm">
              Bookings
            </span>
            <span className="text-black text-sm">Last 5 Bookings</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent hide-scrollbar">
            {bookings.map((booking, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl text-black backdrop-blur-sm hover:bg-green-50/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">{booking.name}</h3>
                    <p className="text-xs text-black">{booking.id} - {booking.date}</p>
                  </div>
                </div>
                <span className="text-green-500 font-semibold">
                  ₹{booking.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reservations */}
        <div className="bg-white  backdrop-blur-md border border-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
          {/* <span className="bg-red-600/90 text-white px-4 py-1 rounded-full font-semibold text-sm mb-4">
            Reservations
          </span> */}

          <div className="flex justify-between items-center mb-4">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full font-semibold text-sm">
              Reservations
            </span>
            <span className="text-black text-sm">Last 5 Reservations</span>
          </div>
          <div className="flex flex-col items-center h-full text-red-600 animate-pulse">
            <AlertCircle size={56} className="mb-2" />
            <p className="font-semibold text-lg">NO RESERVATIONS</p>
          </div>
          {/* <p className="text-black mt-2 text-sm">All Reserved</p> */}
        </div>

      </div>
    </div>
  );
}