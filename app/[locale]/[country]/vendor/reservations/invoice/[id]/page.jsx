"use client";
import { useState,  useEffect } from "react";
import { useRouter , useParams } from "next/navigation";

import { 
   reservation_invoice,
   download_invoice,
   send_invoice


 } from "@/services/booking.service";

 import { formatPrice } from "@/lib/currency_format";
export default function InvoicePage() {
 const router = useRouter();
  const params   = useParams();
  console.log(params.id)

const [reserve, setReserve] = useState({});

 const [emailModal, setEmailModal] = useState(false);
const [email, setEmail] = useState("");
const [sending, setSending] = useState(false);

const downloadPdf = async () => {
 // const res = await download_invoice(params.id);

 window.open(
  `${process.env.NEXT_PUBLIC_API_URL}/invoice/download/${params.id}`,
  "_blank"
);
};
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

const sendEmail = async () => {
  try {
    setSending(true);

     await send_invoice(params.id,email);// here pass params.id and email

    // await fetch(`/invoice/email/${params.id}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ email }),
    // });

    alert("Invoice sent successfully");
    setEmailModal(false);
    setEmail("");
  } catch (err) {
    console.error(err);
    alert("Failed to send email");
  } finally {
    setSending(false);
  }
};
  
    useEffect(() => {
      (async () => {
        await load();
      })();
    }, []);


    const subtotal =
  Number(reserve.base_amt || 0) + Number(reserve.addon_total || 0);

const gst = subtotal * 0.18;

const grandTotal = subtotal + gst;

const baseUrl = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

const booking_type =
  reserve?.booking_type === "booked"
    ? "Proforma"
    : "Reserve";

const addonTotal = reserve?.charges
  ?.filter((c) => c.charge_type === "addon")
  .reduce((sum, c) => sum + Number(c.total_price), 0);

  const total = reserve?.charges?.reduce(
  (sum, charge) => sum + Number(charge.total_price || 0),
  0
);

const addons = reserve?.charges?.filter(
  (c) => c.charge_type === "addon"
) || [];


  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto">

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/60 shadow-xl rounded-2xl border border-white/40 p-6">

          {/* Header */}
          {/* Header */}
<div className="flex justify-between items-start">
  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">
    {reserve?.logo && (
      <img
        src={`${baseUrl}/${reserve.logo}`}
        alt="Logo"
        className="h-12 w-auto object-contain"
      />
    )}

    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        {booking_type} Invoice
      </h1>
      <p className="text-sm text-gray-500">
        Booking Invoice Details
      </p>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="text-right">
    <p className="text-sm text-gray-600">
      Invoice No: <b>{reserve.invoice_number}</b>
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
                 {reserve?.venue_name}<br />
                 {reserve?.venue_address}<br />
                 {reserve?.venue_city} {reserve?.venue_city}<br />
                 {reserve?.email} {reserve?.phone}
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700">Bill To</h2>
              <p className="text-sm text-gray-600 mt-2">
                {reserve?.customer?.name}<br />
                {/* Mangalore<br /> */}
                {reserve?.customer?.phone}<br />
                {reserve?.customer?.email}
              </p>
            </div>
          </div>

          {/* Event */}
          <div className="mt-6 p-4 rounded-xl bg-white/50 border border-white/40">
            <p className="text-sm text-gray-700">
              <b>Event:</b> {reserve.eventType}<br />
              <b>Date:</b> {reserve.fromDate}<br />
              <b>Shift:</b> {reserve.shift}<br />
              <b>Time:</b> 12:00 PM - 6:00 PM
            </p>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/40">
            <table className="w-full text-sm">
              <thead className="bg-purple-100/60 text-gray-700">
                <tr>
                    <th className="p-3 text-left">Serial no.</th>
                  <th className="p-3 ">Particular</th>
                
                  {/* <th className="p-3">Rate</th> */}
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              {/* <tbody className="bg-white/50">
           {reserve?.charges?.map((step, i) => (
  <tr key={step.id || i} className="border-t border-white/40">
    <td className="p-3">{i + 1}</td>
    <td className="p-3 text-center">{step.title}</td>
    <td className="p-3 text-right">
      {formatPrice(step.total_price)}
    </td>
  </tr>
))}

               
              </tbody> */}
              <tbody>
  {reserve?.charges
    ?.filter((c) => c.charge_type !== "addon")
    .map((charge, index) => (
      <tr key={charge.id} className="border-t border-white/40">
        <td className="p-3">{index + 1}</td>
        <td className="p-3 text-center">{charge.title}</td>
        <td className="p-3 text-right">
          {formatPrice(charge.total_price)}
        </td>
      </tr>
    ))}

  {addonTotal > 0 && (
    <tr className="border-t border-white/40">
      <td className="p-3">
        {reserve.charges.filter(c => c.charge_type !== "addon").length + 1}
      </td>
      <td className="p-3 text-center">Addons</td>
      <td className="p-3 text-right">
        {formatPrice(addonTotal)}
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-80 bg-white/60 border border-white/40 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
 {reserve?.taxes?.map((step, i) => (
              <div className="flex justify-between text-sm mt-2" key={step.id || i}>
  <span>{step.tax_name} ({step.tax_percent}%)</span>
  <span>{formatPrice(step.tax_amount)}</span>
</div>
 ))}
<hr className="my-3 border-white/40" />

<div className="flex justify-between font-bold text-lg">
  <span>Grand Total</span>
  <span>{formatPrice(Number(reserve.amount))}</span>
</div>

            </div>
          </div>
        {addons.length > 0 && (
  <>
   <table className="w-full text-sm">
    <thead>
      <tr>
        <th className="p-3">#</th>
        <th className="p-3">Addon</th>
        <th className="p-3 text-center">Unit Price</th>
        <th className="p-3 text-center">Quantity</th>
        <th className="p-3 text-right">Total</th>
      </tr>
    </thead>

    <tbody>
      {addons.map((charge, index) => (
        <tr key={charge.id} className="border-t border-white/40">
          <td className="p-3">{index + 1}</td>
          <td className="p-3">{charge.title}</td>
          <td className="p-3 text-center">
            {formatPrice(charge.unit_price)}
          </td>
          <td className="p-3 text-center">
            {charge.quantity}
          </td>
          <td className="p-3 text-right">
            {formatPrice(charge.total_price)}
          </td>
        </tr>
      ))}
    </tbody>
    </table>
  </>
)}

    {reserve?.pax_item_snapshot?.length > 0 && (
  <>
   <table className="w-full text-sm">
    <thead>
      <tr>
        <th className="p-3">#</th>
        <th className="p-3">Item</th>
        <th className="p-3 text-right">Price</th>
      </tr>
    </thead>

    <tbody>
      {reserve.pax_item_snapshot.map((item, index) => (
        <tr key={item.id} className="border-t border-white/40">
          <td className="p-3">{index + 1}</td>
          <td className="p-3">{item.item_name}</td>
          <td className="p-3 text-right">
            #
          </td>
        </tr>
      ))}
    </tbody>
    </table>
  </>
)}


          {/* Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
  onClick={downloadPdf}
  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
>
  Download PDF
</button>

<button
  onClick={() => setEmailModal(true)}
  className="px-4 py-2 rounded-lg border border-purple-500 text-purple-600"
>
  Email Invoice
</button>
            <button
  onClick={() => router.back()}
  className="px-4 py-2 rounded-lg bg-red-600 text-white"
>
  Close
</button>
          </div>

        </div>
      </div>

      {emailModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-96">

      <h2 className="text-lg font-bold mb-4">Send Invoice Email</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEmailModal(false)}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={sendEmail}
          disabled={sending}
          className="px-3 py-1 bg-purple-600 text-white rounded"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
//invoice/download/1802e183-1d7a-4343-9e5c-08bf5814f5f9