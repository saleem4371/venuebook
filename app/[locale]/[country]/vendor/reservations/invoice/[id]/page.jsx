"use client";
import { useState,  useEffect } from "react";
import { useRouter , useParams } from "next/navigation";

import { reservation_invoice } from "@/services/booking.service";
export default function InvoicePage() {
 const router = useRouter();
  const params   = useParams();
  console.log(params.id)

 const [reserve,     setReserve]     = useState('');
    const load = async () => {
  try {
    const res = await reservation_invoice(params.id);

    console.log("API Response:", res);

    setReserve(res?.data);
  } catch (err) {
    console.error("Load reservations failed:", err);
    setReserve('');
  }
};
  
    useEffect(() => {
      (async () => {
        await load();
      })();
    }, []);


  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto">

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/60 shadow-xl rounded-2xl border border-white/40 p-6">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Proforma Invoice
              </h1>
              <p className="text-sm text-gray-500">
                Booking Invoice Details
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">
                Invoice No: <b>INV00012</b>
              </p>
              <p className="text-sm text-gray-600">
                Booking ID: <b>{reserve.refNo}</b>
              </p>
              <p className="text-sm text-gray-600">
                Date: <b>{reserve.orderDate}</b>
              </p>
            </div>
          </div>

          <hr className="my-5 border-white/40" />

          {/* Billing */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-gray-700">Bill From</h2>
              <p className="text-sm text-gray-600 mt-2">
                venuebook.in<br />
                support@venuebook.in<br />
                GST: 29ABCDE1234F1Z5
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700">Bill To</h2>
              <p className="text-sm text-gray-600 mt-2">
                {reserve.name}<br />
                Mangalore<br />
                {reserve.phone}<br />
                {reserve.email}
              </p>
            </div>
          </div>

          {/* Event */}
          <div className="mt-6 p-4 rounded-xl bg-white/50 border border-white/40">
            <p className="text-sm text-gray-700">
              <b>Event:</b> {reserve.eventType}<br />
              <b>Date:</b> {reserve.eventDate}<br />
              <b>Shift:</b> {reserve.shift}<br />
              <b>Time:</b> 12:00 PM - 6:00 PM
            </p>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/40">
            <table className="w-full text-sm">
              <thead className="bg-purple-100/60 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Particular</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody className="bg-white/50">
                <tr className="border-t border-white/40">
                  <td className="p-3"> Booking</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">₹{reserve.base_amt}</td>
                  <td className="p-3 text-right">₹{reserve.base_amt}</td>
                </tr>

                {/* <tr className="border-t border-white/40">
                  <td className="p-3">Add-ons</td>
                  <td className="p-3 text-center">2</td>
                  <td className="p-3 text-center">₹2,500</td>
                  <td className="p-3 text-right">₹5,000</td>
                </tr> */}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-80 bg-white/60 border border-white/40 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>₹{reserve.base_amt}</span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span>GST (18%)</span>
                <span>₹{reserve.amount -  reserve.base_amt}</span>
              </div>

              <hr className="my-3 border-white/40" />

              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span>₹{reserve.amount}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <button className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
              Download PDF
            </button>

            <button className="px-4 py-2 rounded-lg border border-purple-500 text-purple-600">
              Email Invoice
            </button>

            <button className="px-4 py-2 rounded-lg bg-red-600 text-white">
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}